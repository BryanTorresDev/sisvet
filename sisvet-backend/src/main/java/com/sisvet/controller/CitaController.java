package com.sisvet.controller;

import com.sisvet.dto.request.CitaRequestDTO;
import com.sisvet.dto.response.CitaResponseDTO;
import com.sisvet.service.CitaService;
import com.sisvet.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/citas")
@Tag(name = "Citas", description = "Gestión de citas médicas")
@SecurityRequirement(name = "Bearer Auth")
@RequiredArgsConstructor
public class CitaController {

    private final CitaService citaService;

    @GetMapping
    @Operation(summary = "Listar todas las citas")
    public ResponseEntity<ApiResponse<Page<CitaResponseDTO>>> listar(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Listado de citas", citaService.listar(pageable)));
    }

    @GetMapping("/mascota/{id}")
    @Operation(summary = "Citas de una mascota")
    public ResponseEntity<ApiResponse<Page<CitaResponseDTO>>> porMascota(@PathVariable Long id, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Citas de la mascota", citaService.listarPorMascota(id, pageable)));
    }

    @GetMapping("/veterinario/{id}")
    @Operation(summary = "Citas de un veterinario")
    public ResponseEntity<ApiResponse<Page<CitaResponseDTO>>> porVeterinario(@PathVariable Long id, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Citas del veterinario", citaService.listarPorVeterinario(id, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener cita por ID")
    public ResponseEntity<ApiResponse<CitaResponseDTO>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Cita encontrada", citaService.buscarPorId(id)));
    }

    @PostMapping
    @Operation(summary = "Registrar nueva cita")
    public ResponseEntity<ApiResponse<CitaResponseDTO>> registrar(@Valid @RequestBody CitaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Cita registrada", citaService.registrar(dto)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar cita")
    public ResponseEntity<ApiResponse<CitaResponseDTO>> actualizar(@PathVariable Long id, @Valid @RequestBody CitaRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok("Cita actualizada", citaService.actualizar(id, dto)));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado de la cita")
    public ResponseEntity<ApiResponse<CitaResponseDTO>> cambiarEstado(
            @PathVariable Long id,
            @RequestParam Integer idEstado,
            @RequestParam(required = false) String observacion) {
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado", citaService.cambiarEstado(id, idEstado, observacion)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancelar cita")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        citaService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Cita cancelada"));
    }
}
