package com.sisvet.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PagoResponseDTO {
    private Long idPago;
    private Long idCita;
    private BigDecimal monto;
    private String metodoPago;
    private LocalDateTime fechaPago;
    private String numeroOperacion;
    private String observaciones;
    private String estado;
}
