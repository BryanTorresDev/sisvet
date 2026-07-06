package com.sisvet.service;

import com.sisvet.dto.request.HistorialClinicoRequestDTO;
import com.sisvet.dto.response.HistorialClinicoResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface HistorialClinicoService {
    Page<HistorialClinicoResponseDTO> listarPorMascota(Long idMascota, Pageable pageable);
    HistorialClinicoResponseDTO buscarPorId(Long id);
    HistorialClinicoResponseDTO registrar(HistorialClinicoRequestDTO dto);
    HistorialClinicoResponseDTO actualizar(Long id, HistorialClinicoRequestDTO dto);
    void eliminar(Long id);
    String subirArchivo(Long idHistorial, MultipartFile archivo);
}
