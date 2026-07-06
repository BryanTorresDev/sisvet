package com.sisvet.controller;

import com.sisvet.entity.*;
import com.sisvet.repository.*;
import com.sisvet.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/catalogos")
@Tag(name = "Catálogos", description = "Endpoints de catálogos y datos estáticos")
@SecurityRequirement(name = "Bearer Auth")
@RequiredArgsConstructor
public class CatalogController {

    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final EspecieRepository especieRepository;
    private final RazaRepository razaRepository;
    private final ServicioRepository servicioRepository;
    private final EspecialidadRepository especialidadRepository;

    @GetMapping("/tipos-documento")
    @Operation(summary = "Listar tipos de documento activos")
    public ResponseEntity<ApiResponse<List<TipoDocumento>>> listarTiposDocumento() {
        List<TipoDocumento> list = tipoDocumentoRepository.findAll().stream()
                .filter(t -> t.getEstado() != null && t.getEstado())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Tipos de documento", list));
    }

    @GetMapping("/especies")
    @Operation(summary = "Listar especies activas")
    public ResponseEntity<ApiResponse<List<Especie>>> listarEspecies() {
        List<Especie> list = especieRepository.findAll().stream()
                .filter(e -> e.getEstado() != null && e.getEstado())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Especies", list));
    }

    @GetMapping("/razas/{idEspecie}")
    @Operation(summary = "Listar razas activas de una especie")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listarRazas(@PathVariable Integer idEspecie) {
        List<Map<String, Object>> list = razaRepository.findByEspecie_IdEspecieAndEstadoTrue(idEspecie).stream()
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("idRaza", r.getIdRaza());
                    map.put("nombre", r.getNombre());
                    map.put("estado", r.getEstado());
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Razas de la especie", list));
    }

    @GetMapping("/servicios")
    @Operation(summary = "Listar servicios activos")
    public ResponseEntity<ApiResponse<List<Servicio>>> listarServicios() {
        List<Servicio> list = servicioRepository.findAll().stream()
                .filter(s -> s.getEstado() != null && s.getEstado())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Servicios", list));
    }

    @GetMapping("/especialidades")
    @Operation(summary = "Listar especialidades activas")
    public ResponseEntity<ApiResponse<List<Especialidad>>> listarEspecialidades() {
        List<Especialidad> list = especialidadRepository.findAll().stream()
                .filter(e -> e.getEstado() != null && e.getEstado())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Especialidades", list));
    }
}
