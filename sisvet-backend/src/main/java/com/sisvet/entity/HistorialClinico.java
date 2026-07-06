package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_clinico")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HistorialClinico {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial") private Long idHistorial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_mascota", nullable = false) private Mascota mascota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_veterinario", nullable = false) private Veterinario veterinario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cita") private Cita cita;

    @Column(name = "fecha_atencion", nullable = false) private LocalDateTime fechaAtencion = LocalDateTime.now();
    @Column(name = "temperatura", precision = 5, scale = 2) private BigDecimal temperatura;
    @Column(name = "peso", precision = 8, scale = 2) private BigDecimal peso;
    @Column(name = "diagnostico", nullable = false, length = 5000) private String diagnostico;
    @Column(name = "tratamiento", length = 5000) private String tratamiento;
    @Column(name = "observaciones", length = 5000) private String observaciones;
    @Column(name = "estado", nullable = false) private Boolean estado = true;
    @Column(name = "fecha_registro", nullable = false, updatable = false) private LocalDateTime fechaRegistro = LocalDateTime.now();
}
