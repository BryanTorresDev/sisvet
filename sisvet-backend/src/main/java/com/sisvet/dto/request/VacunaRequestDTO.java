package com.sisvet.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter
public class VacunaRequestDTO {
    @NotBlank @Size(max = 150)
    private String nombre;
    @Size(max = 500)
    private String descripcion;
    @Size(max = 150)
    private String fabricante;
    @Size(max = 100)
    private String dosisRecomendada;
}
