package com.sisvet.service;

import com.sisvet.dto.request.VeterinarioRequestDTO;
import com.sisvet.dto.response.VeterinarioResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface VeterinarioService {
    Page<VeterinarioResponseDTO> listar(Pageable pageable);
    VeterinarioResponseDTO buscarPorId(Long id);
    VeterinarioResponseDTO registrar(VeterinarioRequestDTO dto);
    VeterinarioResponseDTO actualizar(Long id, VeterinarioRequestDTO dto);
    void eliminar(Long id);
}
