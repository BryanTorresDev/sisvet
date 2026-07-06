package com.sisvet.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardResponseDTO {
    private Long totalClientes;
    private Long totalMascotas;
    private Long totalVeterinarios;
    private Long citasProgramadas;
    private Long citasAtendidas;
    private Long citasCanceladas;
    private BigDecimal ingresosTotales;
}
