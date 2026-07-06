package com.sisvet.service.impl;

import com.sisvet.dto.request.MascotaRequestDTO;
import com.sisvet.dto.response.MascotaResponseDTO;
import com.sisvet.entity.*;
import com.sisvet.exception.*;
import com.sisvet.mapper.MascotaMapper;
import com.sisvet.rabbitmq.*;
import com.sisvet.repository.*;
import com.sisvet.service.MascotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MascotaServiceImpl implements MascotaService {

    private final MascotaRepository mascotaRepository;
    private final ClienteRepository clienteRepository;
    private final RazaRepository razaRepository;
    private final MascotaMapper mascotaMapper;
    private final AuditProducer auditProducer;

    private String getUsuarioActual() {
        try { return SecurityContextHolder.getContext().getAuthentication().getName(); }
        catch (Exception e) { return "SISTEMA"; }
    }

    @Override @Transactional(readOnly = true)
    public Page<MascotaResponseDTO> listar(Pageable pageable) {
        return mascotaRepository.findByEstadoTrue(pageable).map(mascotaMapper::toResponse);
    }

    @Override @Transactional(readOnly = true)
    public Page<MascotaResponseDTO> listarPorCliente(Long idCliente, Pageable pageable) {
        return mascotaRepository.findByCliente_IdClienteAndEstadoTrue(idCliente, pageable).map(mascotaMapper::toResponse);
    }

    @Override @Transactional(readOnly = true)
    public MascotaResponseDTO buscarPorId(Long id) {
        return mascotaRepository.findById(id).map(mascotaMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Mascota no encontrada con id: " + id));
    }

    @Override
    public MascotaResponseDTO registrar(MascotaRequestDTO dto) {
        Cliente cliente = clienteRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado"));
        Raza raza = razaRepository.findById(dto.getIdRaza())
                .orElseThrow(() -> new EntityNotFoundException("Raza no encontrada"));

        Mascota mascota = Mascota.builder()
                .cliente(cliente).raza(raza)
                .nombre(dto.getNombre())
                .sexo(dto.getSexo() != null ? dto.getSexo().charAt(0) : null)
                .color(dto.getColor()).peso(dto.getPeso())
                .fechaNacimiento(dto.getFechaNacimiento())
                .observaciones(dto.getObservaciones())
                .estado(true).build();

        Mascota guardada = mascotaRepository.save(mascota);
        auditProducer.publicar(AuditMessage.builder().usuario(getUsuarioActual()).modulo("MASCOTAS").accion("CREATE").descripcion("Mascota registrada: " + guardada.getNombre()).build());
        return mascotaMapper.toResponse(guardada);
    }

    @Override
    public MascotaResponseDTO actualizar(Long id, MascotaRequestDTO dto) {
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Mascota no encontrada con id: " + id));
        Raza raza = razaRepository.findById(dto.getIdRaza())
                .orElseThrow(() -> new EntityNotFoundException("Raza no encontrada"));

        mascota.setRaza(raza);
        mascota.setNombre(dto.getNombre());
        mascota.setSexo(dto.getSexo() != null ? dto.getSexo().charAt(0) : null);
        mascota.setColor(dto.getColor());
        mascota.setPeso(dto.getPeso());
        mascota.setFechaNacimiento(dto.getFechaNacimiento());
        mascota.setObservaciones(dto.getObservaciones());

        Mascota actualizada = mascotaRepository.save(mascota);
        auditProducer.publicar(AuditMessage.builder().usuario(getUsuarioActual()).modulo("MASCOTAS").accion("UPDATE").descripcion("Mascota actualizada: " + actualizada.getNombre()).build());
        return mascotaMapper.toResponse(actualizada);
    }

    @Override
    public void eliminar(Long id) {
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Mascota no encontrada con id: " + id));
        mascota.setEstado(false);
        mascotaRepository.save(mascota);
        auditProducer.publicar(AuditMessage.builder().usuario(getUsuarioActual()).modulo("MASCOTAS").accion("DELETE").descripcion("Mascota desactivada: " + mascota.getNombre()).build());
    }
}
