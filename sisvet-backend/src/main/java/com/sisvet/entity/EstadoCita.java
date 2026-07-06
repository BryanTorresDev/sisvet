package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "estado_cita")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EstadoCita {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado_cita") private Integer idEstadoCita;
    @Column(name = "nombre", nullable = false, unique = true, length = 50) private String nombre;
    @Column(name = "descripcion", length = 250) private String descripcion;
}
