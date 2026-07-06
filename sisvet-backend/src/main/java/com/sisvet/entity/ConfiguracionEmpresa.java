package com.sisvet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "configuracion_empresa")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConfiguracionEmpresa {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_configuracion") private Integer idConfiguracion;
    @Column(name = "razon_social", nullable = false, length = 200) private String razonSocial;
    @Column(name = "nombre_comercial", length = 200) private String nombreComercial;
    @Column(name = "ruc", length = 11) private String ruc;
    @Column(name = "direccion", length = 300) private String direccion;
    @Column(name = "telefono", length = 30) private String telefono;
    @Column(name = "correo", length = 150) private String correo;
    @Column(name = "sitio_web", length = 200) private String sitioWeb;
    @Column(name = "logo_url", length = 500) private String logoUrl;
    @Column(name = "moneda", nullable = false, length = 10) private String moneda = "PEN";
    @Column(name = "igv", nullable = false, precision = 5, scale = 2) private BigDecimal igv = new BigDecimal("18.00");
    @Column(name = "fecha_actualizacion", nullable = false) private LocalDateTime fechaActualizacion = LocalDateTime.now();
}
