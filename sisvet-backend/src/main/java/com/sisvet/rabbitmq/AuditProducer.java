package com.sisvet.rabbitmq;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${sisvet.rabbitmq.exchange}")
    private String exchange;

    @Value("${sisvet.rabbitmq.routing-key}")
    private String routingKey;

    public void publicar(AuditMessage message) {
        try {
            rabbitTemplate.convertAndSend(exchange, routingKey, message);
        } catch (Exception e) {
            // Log error pero no interrumpir flujo principal
        }
    }
}
