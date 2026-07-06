package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "archivo_clinico")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ArchivoClinico {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_archivo") private Long idArchivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_historial", nullable = false) private HistorialClinico historialClinico;

    @Column(name = "nombre_archivo", nullable = false, length = 255) private String nombreArchivo;
    @Column(name = "nombre_original", nullable = false, length = 255) private String nombreOriginal;
    @Column(name = "ruta_archivo", nullable = false, length = 500) private String rutaArchivo;
    @Column(name = "extension", nullable = false, length = 20) private String extension;
    @Column(name = "tamano_kb", precision = 10, scale = 2) private BigDecimal tamanoKb;
    @Column(name = "fecha_subida", nullable = false, updatable = false) private LocalDateTime fechaSubida = LocalDateTime.now();
    @Column(name = "estado", nullable = false) private Boolean estado = true;
}
