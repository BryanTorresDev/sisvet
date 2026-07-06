package com.sisvet.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ClienteResponseDTO {
    private Long idCliente;
    private String tipoDocumento;
    private String numeroDocumento;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String nombreCompleto;
    private String telefono;
    private String correo;
    private String direccion;
    private Boolean estado;
    private LocalDateTime fechaRegistro;
}
