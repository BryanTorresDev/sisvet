package com.sisvet.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
public class CitaRequestDTO {
    @NotNull(message = "La mascota es obligatoria")
    private Long idMascota;
    @NotNull(message = "El veterinario es obligatorio")
    private Long idVeterinario;
    @NotNull(message = "El servicio es obligatorio")
    private Integer idServicio;
    @NotNull(message = "La fecha y hora son obligatorias")
    private LocalDateTime fechaHora;
    @Size(max = 500)
    private String motivo;
    @Size(max = 500)
    private String observaciones;
}
