package com.sisvet.service.impl;

import com.sisvet.dto.request.HistorialClinicoRequestDTO;
import com.sisvet.dto.response.HistorialClinicoResponseDTO;
import com.sisvet.entity.*;
import com.sisvet.exception.BusinessException;
import com.sisvet.exception.EntityNotFoundException;
import com.sisvet.mapper.HistorialClinicoMapper;
import com.sisvet.rabbitmq.AuditMessage;
import com.sisvet.rabbitmq.AuditProducer;
import com.sisvet.repository.*;
import com.sisvet.service.HistorialClinicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class HistorialClinicoServiceImpl implements HistorialClinicoService {

    private final HistorialClinicoRepository historialClinicoRepository;
    private final MascotaRepository mascotaRepository;
    private final VeterinarioRepository veterinarioRepository;
    private final CitaRepository citaRepository;
    private final ArchivoClinicoRepository archivoClinicoRepository;
    private final HistorialClinicoMapper historialClinicoMapper;
    private final AuditProducer auditProducer;

    @Value("${sisvet.upload.path:./uploads/clinico/}")
    private String uploadPath;

    private String getUsuarioActual() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "SISTEMA";
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HistorialClinicoResponseDTO> listarPorMascota(Long idMascota, Pageable pageable) {
        return historialClinicoRepository.findByMascota_IdMascotaAndEstadoTrue(idMascota, pageable)
                .map(historialClinicoMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public HistorialClinicoResponseDTO buscarPorId(Long id) {
        return historialClinicoRepository.findById(id)
                .map(historialClinicoMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Historial clínico no encontrado con id: " + id));
    }

    @Override
    public HistorialClinicoResponseDTO registrar(HistorialClinicoRequestDTO dto) {
        Mascota mascota = mascotaRepository.findById(dto.getIdMascota())
                .orElseThrow(() -> new EntityNotFoundException("Mascota no encontrada con id: " + dto.getIdMascota()));
        
        Veterinario veterinario = veterinarioRepository.findById(dto.getIdVeterinario())
                .orElseThrow(() -> new EntityNotFoundException("Veterinario no encontrado con id: " + dto.getIdVeterinario()));

        Cita cita = null;
        if (dto.getIdCita() != null) {
            cita = citaRepository.findById(dto.getIdCita())
                    .orElseThrow(() -> new EntityNotFoundException("Cita no encontrada con id: " + dto.getIdCita()));
        }

        HistorialClinico historial = HistorialClinico.builder()
                .mascota(mascota)
                .veterinario(veterinario)
                .cita(cita)
                .fechaAtencion(LocalDateTime.now())
                .temperatura(dto.getTemperatura())
                .peso(dto.getPeso())
                .diagnostico(dto.getDiagnostico())
                .tratamiento(dto.getTratamiento())
                .observaciones(dto.getObservaciones())
                .estado(true)
                .fechaRegistro(LocalDateTime.now())
                .build();

        HistorialClinico guardado = historialClinicoRepository.save(historial);

        auditProducer.publicar(AuditMessage.builder()
                .usuario(getUsuarioActual())
                .modulo("HISTORIAL_CLINICO")
                .accion("CREATE")
                .descripcion("Historial clínico registrado para la mascota: " + mascota.getNombre())
                .build());

        return historialClinicoMapper.toResponse(guardado);
    }

    @Override
    public HistorialClinicoResponseDTO actualizar(Long id, HistorialClinicoRequestDTO dto) {
        HistorialClinico historial = historialClinicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Historial clínico no encontrado con id: " + id));

        Mascota mascota = mascotaRepository.findById(dto.getIdMascota())
                .orElseThrow(() -> new EntityNotFoundException("Mascota no encontrada con id: " + dto.getIdMascota()));

        Veterinario veterinario = veterinarioRepository.findById(dto.getIdVeterinario())
                .orElseThrow(() -> new EntityNotFoundException("Veterinario no encontrado con id: " + dto.getIdVeterinario()));

        Cita cita = null;
        if (dto.getIdCita() != null) {
            cita = citaRepository.findById(dto.getIdCita())
                    .orElseThrow(() -> new EntityNotFoundException("Cita no encontrada con id: " + dto.getIdCita()));
        }

        historial.setMascota(mascota);
        historial.setVeterinario(veterinario);
        historial.setCita(cita);
        historial.setTemperatura(dto.getTemperatura());
        historial.setPeso(dto.getPeso());
        historial.setDiagnostico(dto.getDiagnostico());
        historial.setTratamiento(dto.getTratamiento());
        historial.setObservaciones(dto.getObservaciones());

        HistorialClinico guardado = historialClinicoRepository.save(historial);

        auditProducer.publicar(AuditMessage.builder()
                .usuario(getUsuarioActual())
                .modulo("HISTORIAL_CLINICO")
                .accion("UPDATE")
                .descripcion("Historial clínico actualizado para la mascota: " + mascota.getNombre())
                .build());

        return historialClinicoMapper.toResponse(guardado);
    }

    @Override
    public void eliminar(Long id) {
        HistorialClinico historial = historialClinicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Historial clínico no encontrado con id: " + id));

        historial.setEstado(false);
        historialClinicoRepository.save(historial);

        auditProducer.publicar(AuditMessage.builder()
                .usuario(getUsuarioActual())
                .modulo("HISTORIAL_CLINICO")
                .accion("DELETE")
                .descripcion("Historial clínico desactivado con id: " + id)
                .build());
    }

    @Override
    public String subirArchivo(Long idHistorial, MultipartFile archivo) {
        HistorialClinico historial = historialClinicoRepository.findById(idHistorial)
                .orElseThrow(() -> new EntityNotFoundException("Historial clínico no encontrado con id: " + idHistorial));

        if (archivo.isEmpty()) {
            throw new BusinessException("El archivo no puede estar vacío");
        }

        try {
            String nombreOriginal = archivo.getOriginalFilename();
            if (nombreOriginal == null) {
                nombreOriginal = "archivo_clinico";
            }
            String extension = "";
            int dotIndex = nombreOriginal.lastIndexOf(".");
            if (dotIndex >= 0) {
                extension = nombreOriginal.substring(dotIndex);
            }
            
            String nuevoNombre = UUID.randomUUID().toString() + extension;
            Path rootPath = Paths.get(uploadPath).toAbsolutePath().normalize();
            Files.createDirectories(rootPath);
            Path targetLocation = rootPath.resolve(nuevoNombre);
            Files.copy(archivo.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            ArchivoClinico ac = ArchivoClinico.builder()
                    .historialClinico(historial)
                    .nombreArchivo(nuevoNombre)
                    .nombreOriginal(nombreOriginal)
                    .rutaArchivo(uploadPath + nuevoNombre)
                    .extension(extension.replace(".", ""))
                    .tamanoKb(BigDecimal.valueOf(archivo.getSize() / 1024.0))
                    .estado(true)
                    .fechaSubida(LocalDateTime.now())
                    .build();

            archivoClinicoRepository.save(ac);

            auditProducer.publicar(AuditMessage.builder()
                    .usuario(getUsuarioActual())
                    .modulo("HISTORIAL_CLINICO")
                    .accion("UPLOAD_FILE")
                    .descripcion("Archivo subido para el historial: " + idHistorial + " - " + nombreOriginal)
                    .build());

            return nuevoNombre;

        } catch (IOException ex) {
            throw new BusinessException("Error al almacenar físicamente el archivo: " + ex.getMessage());
        }
    }
}
