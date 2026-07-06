package com.sisvet.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter
public class MascotaVacunaRequestDTO {
    @NotNull private Long idMascota;
    @NotNull private Integer idVacuna;
    @NotNull private Long idVeterinario;
    @NotNull(message = "La fecha de aplicación es obligatoria")
    private LocalDate fechaAplicacion;
    private LocalDate proximaDosis;
    @Size(max = 100) private String lote;
    @Size(max = 500) private String observaciones;
}
