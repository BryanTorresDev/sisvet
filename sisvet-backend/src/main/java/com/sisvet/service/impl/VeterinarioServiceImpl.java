package com.sisvet.service.impl;

import com.sisvet.dto.request.VeterinarioRequestDTO;
import com.sisvet.dto.response.VeterinarioResponseDTO;
import com.sisvet.entity.*;
import com.sisvet.exception.*;
import com.sisvet.mapper.VeterinarioMapper;
import com.sisvet.rabbitmq.*;
import com.sisvet.repository.*;
import com.sisvet.service.VeterinarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class VeterinarioServiceImpl implements VeterinarioService {

    private final VeterinarioRepository veterinarioRepository;
    private final EspecialidadRepository especialidadRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final VeterinarioMapper veterinarioMapper;
    private final AuditProducer auditProducer;

    private String getUsuarioActual() {
        try { return SecurityContextHolder.getContext().getAuthentication().getName(); } catch (Exception e) { return "SISTEMA"; }
    }

    @Override @Transactional(readOnly = true)
    public Page<VeterinarioResponseDTO> listar(Pageable pageable) {
        return veterinarioRepository.findByEstadoTrue(pageable).map(veterinarioMapper::toResponse);
    }

    @Override @Transactional(readOnly = true)
    public VeterinarioResponseDTO buscarPorId(Long id) {
        return veterinarioRepository.findById(id).map(veterinarioMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Veterinario no encontrado con id: " + id));
    }

    @Override
    public VeterinarioResponseDTO registrar(VeterinarioRequestDTO dto) {
        if (veterinarioRepository.existsByNumeroDocumento(dto.getNumeroDocumento()))
            throw new BusinessException("Ya existe un veterinario con el documento: " + dto.getNumeroDocumento());
        if (dto.getCorreo() != null && veterinarioRepository.existsByCorreo(dto.getCorreo()))
            throw new BusinessException("Ya existe un veterinario con el correo: " + dto.getCorreo());

        Especialidad esp = especialidadRepository.findById(dto.getIdEspecialidad())
                .orElseThrow(() -> new EntityNotFoundException("Especialidad no encontrada"));
        TipoDocumento tipo = tipoDocumentoRepository.findById(dto.getIdTipoDocumento())
                .orElseThrow(() -> new EntityNotFoundException("Tipo de documento no encontrado"));

        Veterinario vet = Veterinario.builder()
                .especialidad(esp).tipoDocumento(tipo)
                .numeroDocumento(dto.getNumeroDocumento())
                .nombres(dto.getNombres()).apellidoPaterno(dto.getApellidoPaterno())
                .apellidoMaterno(dto.getApellidoMaterno()).telefono(dto.getTelefono())
                .correo(dto.getCorreo()).numeroColegiatura(dto.getNumeroColegiatura())
                .direccion(dto.getDireccion()).estado(true).build();

        Veterinario guardado = veterinarioRepository.save(vet);
        auditProducer.publicar(AuditMessage.builder().usuario(getUsuarioActual()).modulo("VETERINARIOS").accion("CREATE").descripcion("Veterinario registrado: " + guardado.getNumeroDocumento()).build());
        return veterinarioMapper.toResponse(guardado);
    }

    @Override
    public VeterinarioResponseDTO actualizar(Long id, VeterinarioRequestDTO dto) {
        Veterinario vet = veterinarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Veterinario no encontrado con id: " + id));

        Especialidad esp = especialidadRepository.findById(dto.getIdEspecialidad())
                .orElseThrow(() -> new EntityNotFoundException("Especialidad no encontrada"));
        TipoDocumento tipo = tipoDocumentoRepository.findById(dto.getIdTipoDocumento())
                .orElseThrow(() -> new EntityNotFoundException("Tipo de documento no encontrado"));

        vet.setEspecialidad(esp); vet.setTipoDocumento(tipo);
        vet.setNombres(dto.getNombres()); vet.setApellidoPaterno(dto.getApellidoPaterno());
        vet.setApellidoMaterno(dto.getApellidoMaterno()); vet.setTelefono(dto.getTelefono());
        vet.setCorreo(dto.getCorreo()); vet.setNumeroColegiatura(dto.getNumeroColegiatura());
        vet.setDireccion(dto.getDireccion());

        Veterinario actualizado = veterinarioRepository.save(vet);
        auditProducer.publicar(AuditMessage.builder().usuario(getUsuarioActual()).modulo("VETERINARIOS").accion("UPDATE").descripcion("Veterinario actualizado: " + actualizado.getNumeroDocumento()).build());
        return veterinarioMapper.toResponse(actualizado);
    }

    @Override
    public void eliminar(Long id) {
        Veterinario vet = veterinarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Veterinario no encontrado con id: " + id));
        vet.setEstado(false);
        veterinarioRepository.save(vet);
        auditProducer.publicar(AuditMessage.builder().usuario(getUsuarioActual()).modulo("VETERINARIOS").accion("DELETE").descripcion("Veterinario desactivado: " + vet.getNumeroDocumento()).build());
    }
}
