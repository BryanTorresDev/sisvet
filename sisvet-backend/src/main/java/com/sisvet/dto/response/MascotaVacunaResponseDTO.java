package com.sisvet.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class MascotaVacunaResponseDTO {
    private Long idMascotaVacuna;
    private Long idMascota;
    private String nombreMascota;
    private String nombreVacuna;
    private String nombreVeterinario;
    private LocalDate fechaAplicacion;
    private LocalDate proximaDosis;
    private String lote;
    private String observaciones;
    private LocalDateTime fechaRegistro;
}
