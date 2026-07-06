package com.sisvet.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class VeterinarioResponseDTO {
    private Long idVeterinario;
    private String especialidad;
    private String tipoDocumento;
    private String numeroDocumento;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String nombreCompleto;
    private String telefono;
    private String correo;
    private String numeroColegiatura;
    private String direccion;
    private Boolean estado;
    private LocalDateTime fechaRegistro;
}
