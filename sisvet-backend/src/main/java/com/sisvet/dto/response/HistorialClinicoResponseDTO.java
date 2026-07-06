package com.sisvet.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class HistorialClinicoResponseDTO {
    private Long idHistorial;
    private Long idMascota;
    private String nombreMascota;
    private Long idVeterinario;
    private String nombreVeterinario;
    private Long idCita;
    private LocalDateTime fechaAtencion;
    private BigDecimal temperatura;
    private BigDecimal peso;
    private String diagnostico;
    private String tratamiento;
    private String observaciones;
    private Boolean estado;
    private LocalDateTime fechaRegistro;
}
