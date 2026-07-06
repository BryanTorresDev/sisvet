package com.sisvet.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
public class MascotaRequestDTO {
    @NotNull(message = "El cliente es obligatorio")
    private Long idCliente;
    @NotNull(message = "La raza es obligatoria")
    private Integer idRaza;
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    private String nombre;
    @NotNull(message = "El sexo es obligatorio")
    @Pattern(regexp = "[MF]", message = "El sexo debe ser M o F")
    private String sexo;
    @Size(max = 50)
    private String color;
    @DecimalMin(value = "0.0", inclusive = false, message = "El peso debe ser mayor a 0")
    private BigDecimal peso;
    private LocalDate fechaNacimiento;
    @Size(max = 500)
    private String observaciones;
}
