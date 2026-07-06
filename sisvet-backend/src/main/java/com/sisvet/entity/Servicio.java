package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "servicio")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Servicio {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servicio") private Integer idServicio;
    @Column(name = "nombre", nullable = false, unique = true, length = 100) private String nombre;
    @Column(name = "descripcion", length = 500) private String descripcion;
    @Column(name = "precio", nullable = false, precision = 10, scale = 2) private BigDecimal precio;
    @Column(name = "duracion_minutos", nullable = false) private Integer duracionMinutos;
    @Builder.Default
    @Column(name = "estado", nullable = false) private Boolean estado = true;
    @Builder.Default
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private LocalDateTime fechaCreacion = LocalDateTime.now();
}
