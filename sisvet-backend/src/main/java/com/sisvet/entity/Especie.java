package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "especie")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Especie {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_especie") private Integer idEspecie;
    @Column(name = "nombre", nullable = false, unique = true, length = 50) private String nombre;
    @Builder.Default
    @Column(name = "estado", nullable = false) private Boolean estado = true;
}
