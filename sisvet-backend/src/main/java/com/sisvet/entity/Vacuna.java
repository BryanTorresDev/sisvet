package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vacuna")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Vacuna {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_vacuna") private Integer idVacuna;
    @Column(name = "nombre", nullable = false, unique = true, length = 150) private String nombre;
    @Column(name = "descripcion", length = 500) private String descripcion;
    @Column(name = "fabricante", length = 150) private String fabricante;
    @Column(name = "dosis_recomendada", length = 100) private String dosisRecomendada;
    @Builder.Default
    @Column(name = "estado", nullable = false) private Boolean estado = true;
    @Builder.Default
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private LocalDateTime fechaCreacion = LocalDateTime.now();
}
