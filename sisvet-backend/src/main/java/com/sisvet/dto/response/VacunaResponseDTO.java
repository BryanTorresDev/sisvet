package com.sisvet.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class VacunaResponseDTO {
    private Integer idVacuna;
    private String nombre;
    private String descripcion;
    private String fabricante;
    private String dosisRecomendada;
    private Boolean estado;
    private LocalDateTime fechaCreacion;
}
