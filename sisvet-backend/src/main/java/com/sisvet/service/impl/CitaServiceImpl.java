package com.sisvet.service.impl;

import com.sisvet.dto.request.CitaRequestDTO;
import com.sisvet.dto.response.CitaResponseDTO;
import com.sisvet.entity.*;
import com.sisvet.exception.*;
import com.sisvet.mapper.CitaMapper;
import com.sisvet.rabbitmq.*;
import com.sisvet.repository.*;
import com.sisvet.service.CitaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class CitaServiceImpl implements CitaService {

    private final CitaRepository citaRepository;
    private final CitaEstadoHistorialRepository historialRepository;
    private final MascotaRepository mascotaRepository;
    private final VeterinarioRepository veterinarioRepository;
    private final ServicioRepository servicioRepository;
    private final EstadoCitaRepository estadoCitaRepository;
    private final CitaMapper citaMapper;
    private final AuditProducer auditProducer;

    private String getUsuarioActual() {
        try { return SecurityContextHolder.getContext().getAuthentication().getName(); } catch (Exception e) { return "SISTEMA"; }
    }

    @Override @Transactional(readOnly = true)
    public Page<CitaResponseDTO> listar(Pageable pageable) {
        return citaRepository.findAll(pageable).map(citaMapper::toResponse);
    }

    @Override @Transactional(readOnly = true)
    public Page<CitaResponseDTO> listarPorMascota(Long idMascota, Pageable pageable) {
        return citaRepository.findByMascota_IdMascota(idMascota, pageable).map(citaMapper::toResponse);
    }

    @Override @Transactional(readOnly = true)
    public Page<CitaResponseDTO> listarPorVeterinario(Long idVeterinario, Pageable pageable) {
        return citaRepository.findByVeterinario_IdVeterinario(idVeterinario, pageable).map(citaMapper::toResponse);
    }

    @Override @Transactional(readOnly = true)
    public CitaResponseDTO buscarPorId(Long id) {
        return citaRepository.findById(id).map(citaMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Cita no encontrada con id: " + id));
    }

    @Override
    public CitaResponseDTO registrar(CitaRequestDTO dto) {
        Mascota mascota = mascotaRepository.findById(dto.getIdMascota())
                .orElseThrow(() -> new EntityNotFoundException("Mascota no encontrada"));
        Veterinario vet = veterinarioRepository.findById(dto.getIdVeterinario())
                .orElseThrow(() -> new EntityNotFoundException("Veterinario no encontrado"));
        Servicio servicio = servicioRepository.findById(dto.getIdServicio())
                .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrado"));
        EstadoCita estadoProgramada = estadoCitaRepository.findByNombre("PROGRAMADA")
                .orElseThrow(() -> new EntityNotFoundException("Estado PROGRAMADA no configurado"));

        Cita cita = Cita.builder()
                .mascota(mascota).veterinario(vet).servicio(servicio)
                .estadoCita(estadoProgramada).fechaHora(dto.getFechaHora())
                .motivo(dto.getMotivo()).observaciones(dto.getObservaciones())
                .fechaRegistro(LocalDateTime.now()).build();

        Cita guardada = citaRepository.save(cita);

        CitaEstadoHistorial hist = CitaEstadoHistorial.builder()
                .cita(guardada).estadoCita(estadoProgramada)
                .observacion("Cita creada").fechaCambio(LocalDateTime.now()).build();
        historialRepository.save(hist);

        auditProducer.publicar(AuditMessage.builder().usuario(getUsuarioActual()).modulo("CITAS").accion("CREAR_CITA").descripcion("Cita registrada id: " + guardada.getIdCita()).build());
        return citaMapper.toResponse(guardada);
    }

    @Override
    public CitaResponseDTO actualizar(Long id, CitaRequestDTO dto) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cita no encontrada con id: " + id));
        Veterinario vet = veterinarioRepository.findById(dto.getIdVeterinario())
                .orElseThrow(() -> new EntityNotFoundException("Veterinario no encontrado"));
        Servicio servicio = servicioRepository.findById(dto.getIdServicio())
                .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrado"));

        cita.setVeterinario(vet); cita.setServicio(servicio);
        cita.setFechaHora(dto.getFechaHora()); cita.setMotivo(dto.getMotivo());
        cita.setObservaciones(dto.getObservaciones());
        Cita actualizada = citaRepository.save(cita);
        auditProducer.publicar(AuditMessage.builder().usuario(getUsuarioActual()).modulo("CITAS").accion("UPDATE").descripcion("Cita actualizada id: " + id).build());
        return citaMapper.toResponse(actualizada);
    }

    @Override
    public CitaResponseDTO cambiarEstado(Long id, Integer idEstado, String observacion) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cita no encontrada con id: " + id));
        EstadoCita nuevoEstado = estadoCitaRepository.findById(idEstado)
                .orElseThrow(() -> new EntityNotFoundException("Estado no encontrado"));

        cita.setEstadoCita(nuevoEstado);
        Cita actualizada = citaRepository.save(cita);

        CitaEstadoHistorial hist = CitaEstadoHistorial.builder()
                .cita(actualizada).estadoCita(nuevoEstado)
                .observacion(observacion).fechaCambio(LocalDateTime.now()).build();
        historialRepository.save(hist);

        String accion = nuevoEstado.getNombre().equals("ATENDIDA") ? "ATENDER_CITA" : "UPDATE";
        auditProducer.publicar(AuditMessage.builder().usuario(getUsuarioActual()).modulo("CITAS").accion(accion).descripcion("Estado cita " + id + " -> " + nuevoEstado.getNombre()).build());
        return citaMapper.toResponse(actualizada);
    }

    @Override
    public void eliminar(Long id) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cita no encontrada con id: " + id));
        EstadoCita cancelada = estadoCitaRepository.findByNombre("CANCELADA")
                .orElseThrow(() -> new EntityNotFoundException("Estado CANCELADA no configurado"));
        cita.setEstadoCita(cancelada);
        citaRepository.save(cita);
        auditProducer.publicar(AuditMessage.builder().usuario(getUsuarioActual()).modulo("CITAS").accion("DELETE").descripcion("Cita cancelada id: " + id).build());
    }
}
