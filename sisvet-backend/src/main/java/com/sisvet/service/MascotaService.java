package com.sisvet.service;

import com.sisvet.dto.request.MascotaRequestDTO;
import com.sisvet.dto.response.MascotaResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MascotaService {
    Page<MascotaResponseDTO> listar(Pageable pageable);
    Page<MascotaResponseDTO> listarPorCliente(Long idCliente, Pageable pageable);
    MascotaResponseDTO buscarPorId(Long id);
    MascotaResponseDTO registrar(MascotaRequestDTO dto);
    MascotaResponseDTO actualizar(Long id, MascotaRequestDTO dto);
    void eliminar(Long id);
}
