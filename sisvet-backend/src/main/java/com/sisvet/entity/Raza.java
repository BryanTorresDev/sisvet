package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "raza")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Raza {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_raza") private Integer idRaza;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_especie", nullable = false)
    private Especie especie;

    @Column(name = "nombre", nullable = false, length = 100) private String nombre;
    @Column(name = "estado", nullable = false) private Boolean estado = true;
}
