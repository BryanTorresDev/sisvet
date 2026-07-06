package com.sisvet.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter
public class VeterinarioRequestDTO {
    @NotNull(message = "La especialidad es obligatoria")
    private Integer idEspecialidad;
    @NotNull(message = "El tipo de documento es obligatorio")
    private Integer idTipoDocumento;
    @NotBlank @Size(min = 8, max = 20)
    private String numeroDocumento;
    @NotBlank @Size(max = 100)
    private String nombres;
    @NotBlank @Size(max = 100)
    private String apellidoPaterno;
    @NotBlank @Size(max = 100)
    private String apellidoMaterno;
    @Size(max = 20)
    private String telefono;
    @Email @Size(max = 150)
    private String correo;
    @Size(max = 50)
    private String numeroColegiatura;
    @Size(max = 250)
    private String direccion;
}
