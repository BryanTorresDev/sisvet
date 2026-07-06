package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cliente")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Cliente {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente") private Long idCliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_documento", nullable = false)
    private TipoDocumento tipoDocumento;

    @Column(name = "numero_documento", nullable = false, unique = true, length = 20) private String numeroDocumento;
    @Column(name = "nombres", nullable = false, length = 100) private String nombres;
    @Column(name = "apellido_paterno", nullable = false, length = 100) private String apellidoPaterno;
    @Column(name = "apellido_materno", nullable = false, length = 100) private String apellidoMaterno;
    @Column(name = "telefono", length = 20) private String telefono;
    @Column(name = "correo", length = 150) private String correo;
    @Column(name = "direccion", length = 250) private String direccion;
    @Builder.Default
    @Column(name = "fecha_registro", nullable = false, updatable = false) private LocalDateTime fechaRegistro = LocalDateTime.now();
    @Builder.Default
    @Column(name = "estado", nullable = false) private Boolean estado = true;
}
