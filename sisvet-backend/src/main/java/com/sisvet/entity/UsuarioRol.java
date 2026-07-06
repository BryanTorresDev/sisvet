package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario_rol")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UsuarioRol {
    @Builder.Default
    @EmbeddedId private UsuarioRolId id = new UsuarioRolId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idUsuario")
    @JoinColumn(name = "id_usuario") private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("idRol")
    @JoinColumn(name = "id_rol") private Rol rol;

    @Builder.Default
    @Column(name = "fecha_asignacion", nullable = false) private LocalDateTime fechaAsignacion = LocalDateTime.now();
}
