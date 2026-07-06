package com.sisvet.service;

import com.sisvet.dto.request.CitaRequestDTO;
import com.sisvet.dto.response.CitaResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CitaService {
    Page<CitaResponseDTO> listar(Pageable pageable);
    Page<CitaResponseDTO> listarPorMascota(Long idMascota, Pageable pageable);
    Page<CitaResponseDTO> listarPorVeterinario(Long idVeterinario, Pageable pageable);
    CitaResponseDTO buscarPorId(Long id);
    CitaResponseDTO registrar(CitaRequestDTO dto);
    CitaResponseDTO actualizar(Long id, CitaRequestDTO dto);
    CitaResponseDTO cambiarEstado(Long id, Integer idEstado, String observacion);
    void eliminar(Long id);
}
