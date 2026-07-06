package com.sisvet.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class UsuarioResponseDTO {
    private Long idUsuario;
    private String username;
    private String email;
    private Boolean estado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime ultimoLogin;
    private List<String> roles;
}
