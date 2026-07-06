package com.sisvet.service;

import com.sisvet.dto.request.PagoRequestDTO;
import com.sisvet.dto.response.PagoResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PagoService {
    Page<PagoResponseDTO> listar(Pageable pageable);
    PagoResponseDTO buscarPorId(Long id);
    PagoResponseDTO registrar(PagoRequestDTO dto);
    void eliminar(Long id);
}
