package com.sisvet.service;

import com.sisvet.dto.request.UsuarioRequestDTO;
import com.sisvet.dto.response.UsuarioResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UsuarioService {
    Page<UsuarioResponseDTO> listar(Pageable pageable);
    UsuarioResponseDTO buscarPorId(Long id);
    UsuarioResponseDTO registrar(UsuarioRequestDTO dto);
    UsuarioResponseDTO actualizar(Long id, UsuarioRequestDTO dto);
    void eliminar(Long id);
    void alternarEstado(Long id);
}
