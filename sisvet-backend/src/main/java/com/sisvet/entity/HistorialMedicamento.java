package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historial_medicamento")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HistorialMedicamento {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial_medicamento") private Long idHistorialMedicamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_historial", nullable = false) private HistorialClinico historialClinico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medicamento", nullable = false) private Medicamento medicamento;

    @Column(name = "dosis", nullable = false, length = 100) private String dosis;
    @Column(name = "frecuencia", nullable = false, length = 100) private String frecuencia;
    @Column(name = "duracion", length = 100) private String duracion;
    @Column(name = "observaciones", length = 500) private String observaciones;
    @Column(name = "fecha_registro", nullable = false, updatable = false) private LocalDateTime fechaRegistro = LocalDateTime.now();
}
