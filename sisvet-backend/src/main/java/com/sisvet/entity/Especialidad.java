package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "especialidad")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Especialidad {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_especialidad") private Integer idEspecialidad;
    @Column(name = "nombre", nullable = false, unique = true, length = 100) private String nombre;
    @Column(name = "descripcion", length = 250) private String descripcion;
    @Builder.Default
    @Column(name = "estado", nullable = false) private Boolean estado = true;
    @Builder.Default
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private LocalDateTime fechaCreacion = LocalDateTime.now();
}
