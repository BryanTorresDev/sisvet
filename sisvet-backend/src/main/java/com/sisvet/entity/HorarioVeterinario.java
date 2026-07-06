package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "horario_veterinario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HorarioVeterinario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_horario") private Long idHorario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_veterinario", nullable = false)
    private Veterinario veterinario;

    @Column(name = "dia_semana", nullable = false, length = 15) private String diaSemana;
    @Column(name = "hora_inicio", nullable = false) private LocalTime horaInicio;
    @Column(name = "hora_fin", nullable = false) private LocalTime horaFin;
    @Column(name = "estado", nullable = false) private Boolean estado = true;
}
