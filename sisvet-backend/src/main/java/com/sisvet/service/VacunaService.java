package com.sisvet.service;

import com.sisvet.dto.request.VacunaRequestDTO;
import com.sisvet.dto.response.VacunaResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface VacunaService {
    Page<VacunaResponseDTO> listar(Pageable pageable);
    VacunaResponseDTO buscarPorId(Integer id);
    VacunaResponseDTO registrar(VacunaRequestDTO dto);
    VacunaResponseDTO actualizar(Integer id, VacunaRequestDTO dto);
    void eliminar(Integer id);
}
