package com.sisvet.controller;

import com.sisvet.dto.request.VeterinarioRequestDTO;
import com.sisvet.dto.response.VeterinarioResponseDTO;
import com.sisvet.service.VeterinarioService;
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
@RequestMapping("/api/veterinarios")
@Tag(name = "Veterinarios", description = "Gestión de veterinarios y especialidades")
@SecurityRequirement(name = "Bearer Auth")
@RequiredArgsConstructor
public class VeterinarioController {

    private final VeterinarioService veterinarioService;

    @GetMapping
    @Operation(summary = "Listar veterinarios")
    public ResponseEntity<ApiResponse<Page<VeterinarioResponseDTO>>> listar(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Listado de veterinarios", veterinarioService.listar(pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener veterinario por ID")
    public ResponseEntity<ApiResponse<VeterinarioResponseDTO>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Veterinario encontrado", veterinarioService.buscarPorId(id)));
    }

    @PostMapping
    @Operation(summary = "Registrar veterinario")
    public ResponseEntity<ApiResponse<VeterinarioResponseDTO>> registrar(@Valid @RequestBody VeterinarioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Veterinario registrado", veterinarioService.registrar(dto)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar veterinario")
    public ResponseEntity<ApiResponse<VeterinarioResponseDTO>> actualizar(@PathVariable Long id, @Valid @RequestBody VeterinarioRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok("Veterinario actualizado", veterinarioService.actualizar(id, dto)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar veterinario")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        veterinarioService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Veterinario desactivado"));
    }
}
