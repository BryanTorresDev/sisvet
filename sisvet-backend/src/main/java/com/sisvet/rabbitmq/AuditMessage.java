package com.sisvet.rabbitmq;

import lombok.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AuditMessage implements Serializable {
    private String usuario;
    private String modulo;
    private String accion;
    private String descripcion;
    private String ipCliente;
    @Builder.Default
    private LocalDateTime fechaEvento = LocalDateTime.now();
    @Builder.Default
    private String estado = "EXITOSO";
}
