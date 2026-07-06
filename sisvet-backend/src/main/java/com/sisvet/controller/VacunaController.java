package com.sisvet.controller;

import com.sisvet.dto.request.MascotaVacunaRequestDTO;
import com.sisvet.dto.request.VacunaRequestDTO;
import com.sisvet.dto.response.MascotaVacunaResponseDTO;
import com.sisvet.dto.response.VacunaResponseDTO;
import com.sisvet.service.MascotaVacunaService;
import com.sisvet.service.VacunaService;
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
@RequestMapping("/api/vacunas")
@Tag(name = "Vacunas", description = "Gestión de vacunas y registro de vacunación")
@SecurityRequirement(name = "Bearer Auth")
@RequiredArgsConstructor
public class VacunaController {

    private final VacunaService vacunaService;
    private final MascotaVacunaService mascotaVacunaService;

    @GetMapping
    @Operation(summary = "Listar vacunas")
    public ResponseEntity<ApiResponse<Page<VacunaResponseDTO>>> listar(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Listado de vacunas", vacunaService.listar(pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener vacuna por ID")
    public ResponseEntity<ApiResponse<VacunaResponseDTO>> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok("Vacuna encontrada", vacunaService.buscarPorId(id)));
    }

    @PostMapping
    @Operation(summary = "Registrar vacuna")
    public ResponseEntity<ApiResponse<VacunaResponseDTO>> registrar(@Valid @RequestBody VacunaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Vacuna registrada", vacunaService.registrar(dto)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar vacuna")
    public ResponseEntity<ApiResponse<VacunaResponseDTO>> actualizar(@PathVariable Integer id, @Valid @RequestBody VacunaRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok("Vacuna actualizada", vacunaService.actualizar(id, dto)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar vacuna")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Integer id) {
        vacunaService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Vacuna desactivada"));
    }

    // --- Vacunación de mascotas ---
    @GetMapping("/mascota/{idMascota}")
    @Operation(summary = "Historial de vacunación de una mascota")
    public ResponseEntity<ApiResponse<Page<MascotaVacunaResponseDTO>>> historialMascota(@PathVariable Long idMascota, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Historial de vacunación", mascotaVacunaService.listarPorMascota(idMascota, pageable)));
    }

    @PostMapping("/aplicar")
    @Operation(summary = "Registrar vacuna aplicada a mascota")
    public ResponseEntity<ApiResponse<MascotaVacunaResponseDTO>> aplicar(@Valid @RequestBody MascotaVacunaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Vacuna aplicada registrada", mascotaVacunaService.registrar(dto)));
    }
}
