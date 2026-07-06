package com.sisvet.service;

import com.sisvet.dto.request.ClienteRequestDTO;
import com.sisvet.dto.response.ClienteResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ClienteService {
    Page<ClienteResponseDTO> listar(Pageable pageable);
    Page<ClienteResponseDTO> buscar(String q, Pageable pageable);
    ClienteResponseDTO buscarPorId(Long id);
    ClienteResponseDTO buscarPorDocumento(String documento);
    ClienteResponseDTO registrar(ClienteRequestDTO dto);
    ClienteResponseDTO actualizar(Long id, ClienteRequestDTO dto);
    void eliminar(Long id);
}
