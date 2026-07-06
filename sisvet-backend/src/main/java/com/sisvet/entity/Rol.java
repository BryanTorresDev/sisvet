package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rol")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Rol {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol") private Integer idRol;
    @Column(name = "nombre", nullable = false, length = 50) private String nombre;
    @Column(name = "descripcion", length = 200) private String descripcion;
    @Column(name = "estado", nullable = false) private Boolean estado = true;
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private LocalDateTime fechaCreacion = LocalDateTime.now();
}
