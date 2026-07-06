package com.sisvet.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter
public class ClienteRequestDTO {
    @NotNull(message = "El tipo de documento es obligatorio")
    private Integer idTipoDocumento;
    @NotBlank(message = "El número de documento es obligatorio")
    @Size(min = 8, max = 20, message = "El documento debe tener entre 8 y 20 caracteres")
    private String numeroDocumento;
    @NotBlank(message = "Los nombres son obligatorios")
    @Size(max = 100)
    private String nombres;
    @NotBlank(message = "El apellido paterno es obligatorio")
    @Size(max = 100)
    private String apellidoPaterno;
    @NotBlank(message = "El apellido materno es obligatorio")
    @Size(max = 100)
    private String apellidoMaterno;
    @Size(max = 20)
    private String telefono;
    @Email(message = "El correo no tiene formato válido")
    @Size(max = 150)
    private String correo;
    @Size(max = 250)
    private String direccion;
}
