package com.sisvet.service.impl;

import com.sisvet.dto.request.ClienteRequestDTO;
import com.sisvet.dto.response.ClienteResponseDTO;
import com.sisvet.entity.Cliente;
import com.sisvet.entity.TipoDocumento;
import com.sisvet.exception.BusinessException;
import com.sisvet.exception.EntityNotFoundException;
import com.sisvet.mapper.ClienteMapper;
import com.sisvet.rabbitmq.AuditMessage;
import com.sisvet.rabbitmq.AuditProducer;
import com.sisvet.repository.ClienteRepository;
import com.sisvet.repository.TipoDocumentoRepository;
import com.sisvet.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final ClienteMapper clienteMapper;
    private final AuditProducer auditProducer;

    private String getUsuarioActual() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) { return "SISTEMA"; }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ClienteResponseDTO> listar(Pageable pageable) {
        return clienteRepository.findByEstadoTrue(pageable).map(clienteMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ClienteResponseDTO> buscar(String q, Pageable pageable) {
        return clienteRepository.buscar(q, pageable).map(clienteMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDTO buscarPorId(Long id) {
        return clienteRepository.findById(id)
                .map(clienteMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado con id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDTO buscarPorDocumento(String documento) {
        return clienteRepository.findByNumeroDocumento(documento)
                .map(clienteMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado con documento: " + documento));
    }

    @Override
    public ClienteResponseDTO registrar(ClienteRequestDTO dto) {
        if (clienteRepository.existsByNumeroDocumento(dto.getNumeroDocumento())) {
            throw new BusinessException("Ya existe un cliente con el documento: " + dto.getNumeroDocumento());
        }
        TipoDocumento tipo = tipoDocumentoRepository.findById(dto.getIdTipoDocumento())
                .orElseThrow(() -> new EntityNotFoundException("Tipo de documento no encontrado"));

        Cliente cliente = Cliente.builder()
                .tipoDocumento(tipo)
                .numeroDocumento(dto.getNumeroDocumento())
                .nombres(dto.getNombres())
                .apellidoPaterno(dto.getApellidoPaterno())
                .apellidoMaterno(dto.getApellidoMaterno())
                .telefono(dto.getTelefono())
                .correo(dto.getCorreo())
                .direccion(dto.getDireccion())
                .estado(true)
                .fechaRegistro(LocalDateTime.now())
                .build();

        Cliente guardado = clienteRepository.save(cliente);
        auditProducer.publicar(AuditMessage.builder().usuario(getUsuarioActual()).modulo("CLIENTES").accion("CREATE").descripcion("Cliente registrado: " + guardado.getNumeroDocumento()).build());
        return clienteMapper.toResponse(guardado);
    }

    @Override
    public ClienteResponseDTO actualizar(Long id, ClienteRequestDTO dto) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado con id: " + id));

        if (!cliente.getNumeroDocumento().equals(dto.getNumeroDocumento()) &&
                clienteRepository.existsByNumeroDocumento(dto.getNumeroDocumento())) {
            throw new BusinessException("Ya existe otro cliente con el documento: " + dto.getNumeroDocumento());
        }

        TipoDocumento tipo = tipoDocumentoRepository.findById(dto.getIdTipoDocumento())
                .orElseThrow(() -> new EntityNotFoundException("Tipo de documento no encontrado"));

        cliente.setTipoDocumento(tipo);
        cliente.setNumeroDocumento(dto.getNumeroDocumento());
        cliente.setNombres(dto.getNombres());
        cliente.setApellidoPaterno(dto.getApellidoPaterno());
        cliente.setApellidoMaterno(dto.getApellidoMaterno());
        cliente.setTelefono(dto.getTelefono());
        cliente.setCorreo(dto.getCorreo());
        cliente.setDireccion(dto.getDireccion());

        Cliente actualizado = clienteRepository.save(cliente);
        auditProducer.publicar(AuditMessage.builder().usuario(getUsuarioActual()).modulo("CLIENTES").accion("UPDATE").descripcion("Cliente actualizado: " + actualizado.getNumeroDocumento()).build());
        return clienteMapper.toResponse(actualizado);
    }

    @Override
    public void eliminar(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado con id: " + id));
        cliente.setEstado(false);
        clienteRepository.save(cliente);
        auditProducer.publicar(AuditMessage.builder().usuario(getUsuarioActual()).modulo("CLIENTES").accion("DELETE").descripcion("Cliente desactivado: " + cliente.getNumeroDocumento()).build());
    }
}
