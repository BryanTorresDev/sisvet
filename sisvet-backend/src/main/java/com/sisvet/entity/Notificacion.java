package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificacion")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notificacion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notificacion") private Long idNotificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false) private Usuario usuario;

    @Column(name = "titulo", nullable = false, length = 200) private String titulo;
    @Column(name = "mensaje", nullable = false, length = 1000) private String mensaje;
    @Column(name = "tipo", nullable = false, length = 50) private String tipo;
    @Builder.Default
    @Column(name = "leido", nullable = false) private Boolean leido = false;
    @Builder.Default
    @Column(name = "fecha_creacion", nullable = false, updatable = false) private LocalDateTime fechaCreacion = LocalDateTime.now();
    @Column(name = "fecha_lectura") private LocalDateTime fechaLectura;
}
