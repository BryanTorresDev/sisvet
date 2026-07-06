package com.sisvet.service;

import com.sisvet.dto.request.MascotaVacunaRequestDTO;
import com.sisvet.dto.response.MascotaVacunaResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MascotaVacunaService {
    Page<MascotaVacunaResponseDTO> listarTodos(Pageable pageable);
    Page<MascotaVacunaResponseDTO> listarPorMascota(Long idMascota, Pageable pageable);
    MascotaVacunaResponseDTO buscarPorId(Long id);
    MascotaVacunaResponseDTO registrar(MascotaVacunaRequestDTO dto);
    void eliminar(Long id);
}
