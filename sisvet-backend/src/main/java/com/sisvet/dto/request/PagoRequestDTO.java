package com.sisvet.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
public class PagoRequestDTO {
    @NotNull(message = "La cita es obligatoria")
    private Long idCita;
    @NotNull @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal monto;
    @NotBlank(message = "El método de pago es obligatorio")
    @Pattern(regexp = "EFECTIVO|YAPE|PLIN|TARJETA|TRANSFERENCIA")
    private String metodoPago;
    @Size(max = 100)
    private String numeroOperacion;
    @Size(max = 500)
    private String observaciones;
}
