package com.sisvet.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class MascotaResponseDTO {
    private Long idMascota;
    private Long idCliente;
    private String nombreCliente;
    private Integer idRaza;
    private String nombreRaza;
    private String nombreEspecie;
    private String nombre;
    private Character sexo;
    private String color;
    private BigDecimal peso;
    private LocalDate fechaNacimiento;
    private String observaciones;
    private Boolean estado;
    private LocalDateTime fechaRegistro;
}
