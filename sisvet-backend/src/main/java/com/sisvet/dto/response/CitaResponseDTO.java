package com.sisvet.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CitaResponseDTO {
    private Long idCita;
    private Long idMascota;
    private String nombreMascota;
    private Long idVeterinario;
    private String nombreVeterinario;
    private Integer idServicio;
    private String nombreServicio;
    private String estadoCita;
    private LocalDateTime fechaHora;
    private String motivo;
    private String observaciones;
    private LocalDateTime fechaRegistro;
}
