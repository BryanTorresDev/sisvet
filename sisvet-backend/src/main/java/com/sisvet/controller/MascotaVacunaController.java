package com.sisvet.controller;

import com.sisvet.dto.request.MascotaVacunaRequestDTO;
import com.sisvet.dto.response.MascotaVacunaResponseDTO;
import com.sisvet.service.MascotaVacunaService;
import com.sisvet.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mascotas-vacunas")
@Tag(name = "Mascotas Vacunas", description = "Control y registro de vacunas aplicadas a mascotas")
@SecurityRequirement(name = "Bearer Auth")
@RequiredArgsConstructor
public class MascotaVacunaController {

    private final MascotaVacunaService mascotaVacunaService;

    @GetMapping
    @Operation(summary = "Listar todas las vacunas aplicadas a mascotas")
    public ResponseEntity<ApiResponse<Page<MascotaVacunaResponseDTO>>> listarTodos(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Listado general de vacunas de mascotas obtenido", 
                mascotaVacunaService.listarTodos(pageable)));
    }

    @GetMapping("/mascota/{idMascota}")
    @Operation(summary = "Listar vacunas aplicadas a una mascota paginadas")
    public ResponseEntity<ApiResponse<Page<MascotaVacunaResponseDTO>>> listarPorMascota(
            @PathVariable Long idMascota, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Listado de vacunas de la mascota obtenido", 
                mascotaVacunaService.listarPorMascota(idMascota, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de vacunación por ID")
    public ResponseEntity<ApiResponse<MascotaVacunaResponseDTO>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Detalle de vacunación encontrado", 
                mascotaVacunaService.buscarPorId(id)));
    }

    @PostMapping
    @Operation(summary = "Registrar nueva aplicación de vacuna")
    public ResponseEntity<ApiResponse<MascotaVacunaResponseDTO>> registrar(
            @Valid @RequestBody MascotaVacunaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Vacuna registrada correctamente para la mascota", 
                        mascotaVacunaService.registrar(dto)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un registro de vacunación")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        mascotaVacunaService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Registro de vacunación eliminado correctamente", null));
    }
}
