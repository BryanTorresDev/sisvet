package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tipo_documento")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TipoDocumento {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_documento") private Integer idTipoDocumento;
    @Column(name = "nombre", nullable = false, unique = true, length = 50) private String nombre;
    @Column(name = "longitud", nullable = false) private Integer longitud;
    @Builder.Default
    @Column(name = "estado", nullable = false) private Boolean estado = true;
}
