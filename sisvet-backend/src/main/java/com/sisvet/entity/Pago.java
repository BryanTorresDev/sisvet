package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pago")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Pago {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago") private Long idPago;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cita", nullable = false) private Cita cita;

    @Column(name = "monto", nullable = false, precision = 10, scale = 2) private BigDecimal monto;
    @Column(name = "metodo_pago", nullable = false, length = 30) private String metodoPago;
    @Column(name = "fecha_pago", nullable = false) private LocalDateTime fechaPago = LocalDateTime.now();
    @Column(name = "numero_operacion", length = 100) private String numeroOperacion;
    @Column(name = "observaciones", length = 500) private String observaciones;
    @Column(name = "estado", nullable = false, length = 30) private String estado = "PAGADO";
}
