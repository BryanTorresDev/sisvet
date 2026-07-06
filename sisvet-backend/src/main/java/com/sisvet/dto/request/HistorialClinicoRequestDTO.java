package com.sisvet.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
public class HistorialClinicoRequestDTO {
    @NotNull private Long idMascota;
    @NotNull private Long idVeterinario;
    private Long idCita;
    private BigDecimal temperatura;
    private BigDecimal peso;
    @NotBlank(message = "El diagnóstico es obligatorio")
    @Size(max = 5000)
    private String diagnostico;
    @Size(max = 5000)
    private String tratamiento;
    @Size(max = 5000)
    private String observaciones;
}
