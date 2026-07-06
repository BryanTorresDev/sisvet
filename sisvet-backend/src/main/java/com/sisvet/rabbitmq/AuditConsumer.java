package com.sisvet.rabbitmq;

import com.sisvet.entity.LogAuditoria;
import com.sisvet.repository.LogAuditoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditConsumer {

    private final LogAuditoriaRepository logAuditoriaRepository;

    @RabbitListener(queues = "${sisvet.rabbitmq.queue}")
    public void consumir(AuditMessage message) {
        LogAuditoria log = LogAuditoria.builder()
                .usuario(message.getUsuario() != null ? message.getUsuario() : "SISTEMA")
                .modulo(message.getModulo())
                .accion(message.getAccion())
                .descripcion(message.getDescripcion())
                .ipCliente(message.getIpCliente())
                .fechaEvento(message.getFechaEvento())
                .estado(message.getEstado() != null ? message.getEstado() : "EXITOSO")
                .build();
        logAuditoriaRepository.save(log);
    }
}
