package com.sisvet.controller;

import com.sisvet.dto.request.HistorialClinicoRequestDTO;
import com.sisvet.dto.response.HistorialClinicoResponseDTO;
import com.sisvet.service.HistorialClinicoService;
import com.sisvet.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/historial-clinico")
@Tag(name = "Historial Clínico", description = "Gestión de las historias clínicas de las mascotas")
@SecurityRequirement(name = "Bearer Auth")
@RequiredArgsConstructor
public class HistorialClinicoController {

    private final HistorialClinicoService historialClinicoService;

    @GetMapping("/mascota/{idMascota}")
    @Operation(summary = "Listar historias clínicas por ID de Mascota")
    public ResponseEntity<ApiResponse<Page<HistorialClinicoResponseDTO>>> listarPorMascota(
            @PathVariable Long idMascota, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Listado de historial obtenido", 
                historialClinicoService.listarPorMascota(idMascota, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar historia clínica por ID")
    public ResponseEntity<ApiResponse<HistorialClinicoResponseDTO>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Historial clínico encontrado", 
                historialClinicoService.buscarPorId(id)));
    }

    @PostMapping
    @Operation(summary = "Registrar nueva historia clínica")
    public ResponseEntity<ApiResponse<HistorialClinicoResponseDTO>> registrar(
            @Valid @RequestBody HistorialClinicoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Historial clínico registrado correctamente", 
                        historialClinicoService.registrar(dto)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar historia clínica por ID")
    public ResponseEntity<ApiResponse<HistorialClinicoResponseDTO>> actualizar(
            @PathVariable Long id, @Valid @RequestBody HistorialClinicoRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok("Historial clínico actualizado correctamente", 
                historialClinicoService.actualizar(id, dto)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar (desactivar) historia clínica por ID")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        historialClinicoService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Historial clínico eliminado correctamente", null));
    }

    @PostMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir archivo adjunto a una historia clínica")
    public ResponseEntity<ApiResponse<String>> subirArchivo(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo) {
        String nuevoNombre = historialClinicoService.subirArchivo(id, archivo);
        return ResponseEntity.ok(ApiResponse.ok("Archivo adjunto subido correctamente", nuevoNombre));
    }
}
