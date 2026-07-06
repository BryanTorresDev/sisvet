package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cita_estado_historial")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CitaEstadoHistorial {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial_estado") private Long idHistorialEstado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cita", nullable = false) private Cita cita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estado_cita", nullable = false) private EstadoCita estadoCita;

    @Column(name = "observacion", length = 500) private String observacion;
    @Builder.Default
    @Column(name = "fecha_cambio", nullable = false) private LocalDateTime fechaCambio = LocalDateTime.now();
}
