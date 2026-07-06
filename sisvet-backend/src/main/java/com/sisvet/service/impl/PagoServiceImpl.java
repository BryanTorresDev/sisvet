package com.sisvet.service.impl;

import com.sisvet.dto.request.PagoRequestDTO;
import com.sisvet.dto.response.PagoResponseDTO;
import com.sisvet.entity.Cita;
import com.sisvet.entity.Pago;
import com.sisvet.exception.EntityNotFoundException;
import com.sisvet.mapper.PagoMapper;
import com.sisvet.rabbitmq.AuditMessage;
import com.sisvet.rabbitmq.AuditProducer;
import com.sisvet.repository.CitaRepository;
import com.sisvet.repository.PagoRepository;
import com.sisvet.service.PagoService;
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
public class PagoServiceImpl implements PagoService {

    private final PagoRepository pagoRepository;
    private final CitaRepository citaRepository;
    private final PagoMapper pagoMapper;
    private final AuditProducer auditProducer;

    private String getUsuarioActual() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "SISTEMA";
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PagoResponseDTO> listar(Pageable pageable) {
        return pagoRepository.findAll(pageable).map(pagoMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PagoResponseDTO buscarPorId(Long id) {
        return pagoRepository.findById(id)
                .map(pagoMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Pago no encontrado con id: " + id));
    }

    @Override
    public PagoResponseDTO registrar(PagoRequestDTO dto) {
        Cita cita = citaRepository.findById(dto.getIdCita())
                .orElseThrow(() -> new EntityNotFoundException("Cita no encontrada con id: " + dto.getIdCita()));

        Pago pago = Pago.builder()
                .cita(cita)
                .monto(dto.getMonto())
                .metodoPago(dto.getMetodoPago())
                .fechaPago(LocalDateTime.now())
                .numeroOperacion(dto.getNumeroOperacion())
                .observaciones(dto.getObservaciones())
                .estado("PAGADO")
                .build();

        Pago guardado = pagoRepository.save(pago);

        auditProducer.publicar(AuditMessage.builder()
                .usuario(getUsuarioActual())
                .modulo("PAGOS")
                .accion("CREATE")
                .descripcion("Pago registrado por un monto de " + guardado.getMonto() + " para la cita id: " + cita.getIdCita())
                .build());

        return pagoMapper.toResponse(guardado);
    }

    @Override
    public void eliminar(Long id) {
        Pago pago = pagoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pago no encontrado con id: " + id));

        pagoRepository.delete(pago);

        auditProducer.publicar(AuditMessage.builder()
                .usuario(getUsuarioActual())
                .modulo("PAGOS")
                .accion("DELETE")
                .descripcion("Eliminado pago id: " + id)
                .build());
    }
}
