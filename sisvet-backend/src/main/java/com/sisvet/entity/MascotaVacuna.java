package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "mascota_vacuna")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MascotaVacuna {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mascota_vacuna") private Long idMascotaVacuna;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_mascota", nullable = false) private Mascota mascota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vacuna", nullable = false) private Vacuna vacuna;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_veterinario", nullable = false) private Veterinario veterinario;

    @Column(name = "fecha_aplicacion", nullable = false) private LocalDate fechaAplicacion;
    @Column(name = "proxima_dosis") private LocalDate proximaDosis;
    @Column(name = "lote", length = 100) private String lote;
    @Column(name = "observaciones", length = 500) private String observaciones;
    @Builder.Default
    @Column(name = "fecha_registro", nullable = false, updatable = false) private LocalDateTime fechaRegistro = LocalDateTime.now();
}
