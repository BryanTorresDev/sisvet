package com.sisvet.service.impl;

import com.sisvet.dto.request.MascotaVacunaRequestDTO;
import com.sisvet.dto.response.MascotaVacunaResponseDTO;
import com.sisvet.entity.Mascota;
import com.sisvet.entity.MascotaVacuna;
import com.sisvet.entity.Vacuna;
import com.sisvet.entity.Veterinario;
import com.sisvet.exception.EntityNotFoundException;
import com.sisvet.mapper.MascotaVacunaMapper;
import com.sisvet.rabbitmq.AuditMessage;
import com.sisvet.rabbitmq.AuditProducer;
import com.sisvet.repository.MascotaRepository;
import com.sisvet.repository.MascotaVacunaRepository;
import com.sisvet.repository.VacunaRepository;
import com.sisvet.repository.VeterinarioRepository;
import com.sisvet.service.MascotaVacunaService;
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
public class MascotaVacunaServiceImpl implements MascotaVacunaService {

    private final MascotaVacunaRepository mascotaVacunaRepository;
    private final MascotaRepository mascotaRepository;
    private final VacunaRepository vacunaRepository;
    private final VeterinarioRepository veterinarioRepository;
    private final MascotaVacunaMapper mascotaVacunaMapper;
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
    public Page<MascotaVacunaResponseDTO> listarTodos(Pageable pageable) {
        return mascotaVacunaRepository.findAll(pageable)
                .map(mascotaVacunaMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MascotaVacunaResponseDTO> listarPorMascota(Long idMascota, Pageable pageable) {
        return mascotaVacunaRepository.findByMascota_IdMascota(idMascota, pageable)
                .map(mascotaVacunaMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public MascotaVacunaResponseDTO buscarPorId(Long id) {
        return mascotaVacunaRepository.findById(id)
                .map(mascotaVacunaMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Registro de vacuna para mascota no encontrado con id: " + id));
    }

    @Override
    public MascotaVacunaResponseDTO registrar(MascotaVacunaRequestDTO dto) {
        Mascota mascota = mascotaRepository.findById(dto.getIdMascota())
                .orElseThrow(() -> new EntityNotFoundException("Mascota no encontrada con id: " + dto.getIdMascota()));

        Vacuna vacuna = vacunaRepository.findById(dto.getIdVacuna())
                .orElseThrow(() -> new EntityNotFoundException("Vacuna no encontrada con id: " + dto.getIdVacuna()));

        Veterinario veterinario = veterinarioRepository.findById(dto.getIdVeterinario())
                .orElseThrow(() -> new EntityNotFoundException("Veterinario no encontrado con id: " + dto.getIdVeterinario()));

        MascotaVacuna mv = MascotaVacuna.builder()
                .mascota(mascota)
                .vacuna(vacuna)
                .veterinario(veterinario)
                .fechaAplicacion(dto.getFechaAplicacion())
                .proximaDosis(dto.getProximaDosis())
                .lote(dto.getLote())
                .observaciones(dto.getObservaciones())
                .fechaRegistro(LocalDateTime.now())
                .build();

        MascotaVacuna guardado = mascotaVacunaRepository.save(mv);

        auditProducer.publicar(AuditMessage.builder()
                .usuario(getUsuarioActual())
                .modulo("MASCOTA_VACUNAS")
                .accion("CREATE")
                .descripcion("Vacunación registrada. Mascota: " + mascota.getNombre() + ", Vacuna: " + vacuna.getNombre())
                .build());

        return mascotaVacunaMapper.toResponse(guardado);
    }

    @Override
    public void eliminar(Long id) {
        MascotaVacuna mv = mascotaVacunaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Registro de vacuna para mascota no encontrado con id: " + id));

        mascotaVacunaRepository.delete(mv);

        auditProducer.publicar(AuditMessage.builder()
                .usuario(getUsuarioActual())
                .modulo("MASCOTA_VACUNAS")
                .accion("DELETE")
                .descripcion("Eliminado registro de vacuna id: " + id)
                .build());
    }
}
