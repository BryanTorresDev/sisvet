package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "mascota")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Mascota {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mascota") private Long idMascota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_raza", nullable = false)
    private Raza raza;

    @Column(name = "nombre", nullable = false, length = 100) private String nombre;
    @Column(name = "sexo", nullable = false, length = 1) private Character sexo;
    @Column(name = "color", length = 50) private String color;
    @Column(name = "peso", precision = 8, scale = 2) private BigDecimal peso;
    @Column(name = "fecha_nacimiento") private LocalDate fechaNacimiento;
    @Column(name = "observaciones", length = 500) private String observaciones;
    @Builder.Default
    @Column(name = "estado", nullable = false) private Boolean estado = true;

    @Builder.Default
    @Column(name = "fecha_registro", nullable = false, updatable = false) private LocalDateTime fechaRegistro = LocalDateTime.now();
}
