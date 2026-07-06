package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "log_auditoria")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LogAuditoria {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_log") private Long idLog;
    @Column(name = "usuario", nullable = false, length = 100) private String usuario;
    @Column(name = "modulo", nullable = false, length = 100) private String modulo;
    @Column(name = "accion", nullable = false, length = 100) private String accion;
    @Column(name = "descripcion", length = 1000) private String descripcion;
    @Column(name = "ip_cliente", length = 50) private String ipCliente;
    @Column(name = "fecha_evento", nullable = false) private LocalDateTime fechaEvento = LocalDateTime.now();
    @Column(name = "estado", nullable = false, length = 50) private String estado = "EXITOSO";
}
