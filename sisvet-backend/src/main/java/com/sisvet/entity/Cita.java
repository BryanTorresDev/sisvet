package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cita")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Cita {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cita") private Long idCita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_mascota", nullable = false) private Mascota mascota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_veterinario", nullable = false) private Veterinario veterinario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio", nullable = false) private Servicio servicio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estado_cita", nullable = false) private EstadoCita estadoCita;

    @Column(name = "fecha_hora", nullable = false) private LocalDateTime fechaHora;
    @Column(name = "motivo", length = 500) private String motivo;
    @Column(name = "observaciones", length = 500) private String observaciones;
    @Builder.Default
    @Column(name = "fecha_registro", nullable = false, updatable = false) private LocalDateTime fechaRegistro = LocalDateTime.now();
}
