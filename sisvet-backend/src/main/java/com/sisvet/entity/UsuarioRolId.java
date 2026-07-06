package com.sisvet.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class UsuarioRolId implements Serializable {
    @Column(name = "id_usuario") private Long idUsuario;
    @Column(name = "id_rol") private Integer idRol;
}
