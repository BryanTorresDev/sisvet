package com.sisvet.service.impl;

import com.sisvet.dto.request.VacunaRequestDTO;
import com.sisvet.dto.response.VacunaResponseDTO;
import com.sisvet.entity.Vacuna;
import com.sisvet.exception.BusinessException;
import com.sisvet.exception.EntityNotFoundException;
import com.sisvet.mapper.VacunaMapper;
import com.sisvet.rabbitmq.AuditMessage;
import com.sisvet.rabbitmq.AuditProducer;
import com.sisvet.repository.VacunaRepository;
import com.sisvet.service.VacunaService;
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
public class VacunaServiceImpl implements VacunaService {

    private final VacunaRepository vacunaRepository;
    private final VacunaMapper vacunaMapper;
    private final AuditProducer auditProducer;

    private String getUsuarioActual() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "SISTEMA";
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VacunaResponseDTO> listar(Pageable pageable) {
        return vacunaRepository.findByEstadoTrue(pageable).map(vacunaMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public VacunaResponseDTO buscarPorId(Integer id) {
        return vacunaRepository.findById(id)
                .map(vacunaMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Vacuna no encontrada con id: " + id));
    }

    @Override
    public VacunaResponseDTO registrar(VacunaRequestDTO dto) {
        if (vacunaRepository.existsByNombre(dto.getNombre())) {
            throw new BusinessException("Ya existe una vacuna registrada con el nombre: " + dto.getNombre());
        }

        Vacuna vacuna = Vacuna.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .fabricante(dto.getFabricante())
                .dosisRecomendada(dto.getDosisRecomendada())
                .estado(true)
                .fechaCreacion(LocalDateTime.now())
                .build();

        Vacuna guardada = vacunaRepository.save(vacuna);

        auditProducer.publicar(AuditMessage.builder()
                .usuario(getUsuarioActual())
                .modulo("VACUNAS")
                .accion("CREATE")
                .descripcion("Registrada vacuna: " + guardada.getNombre())
                .build());

        return vacunaMapper.toResponse(guardada);
    }

    @Override
    public VacunaResponseDTO actualizar(Integer id, VacunaRequestDTO dto) {
        Vacuna vacuna = vacunaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vacuna no encontrada con id: " + id));

        if (!vacuna.getNombre().equals(dto.getNombre()) && vacunaRepository.existsByNombre(dto.getNombre())) {
            throw new BusinessException("Ya existe otra vacuna registrada con el nombre: " + dto.getNombre());
        }

        vacuna.setNombre(dto.getNombre());
        vacuna.setDescripcion(dto.getDescripcion());
        vacuna.setFabricante(dto.getFabricante());
        vacuna.setDosisRecomendada(dto.getDosisRecomendada());

        Vacuna guardada = vacunaRepository.save(vacuna);

        auditProducer.publicar(AuditMessage.builder()
                .usuario(getUsuarioActual())
                .modulo("VACUNAS")
                .accion("UPDATE")
                .descripcion("Actualizada vacuna: " + guardada.getNombre())
                .build());

        return vacunaMapper.toResponse(guardada);
    }

    @Override
    public void eliminar(Integer id) {
        Vacuna vacuna = vacunaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vacuna no encontrada con id: " + id));

        vacuna.setEstado(false);
        vacunaRepository.save(vacuna);

        auditProducer.publicar(AuditMessage.builder()
                .usuario(getUsuarioActual())
                .modulo("VACUNAS")
                .accion("DELETE")
                .descripcion("Desactivada vacuna id: " + id)
                .build());
    }
}
