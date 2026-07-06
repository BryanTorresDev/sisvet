package com.sisvet.controller;

import com.sisvet.dto.request.MascotaRequestDTO;
import com.sisvet.dto.response.MascotaResponseDTO;
import com.sisvet.service.HistorialClinicoService;
import com.sisvet.service.MascotaService;
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
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/mascotas")
@Tag(name = "Mascotas", description = "Gestión de mascotas y sus registros clínicos")
@SecurityRequirement(name = "Bearer Auth")
@RequiredArgsConstructor
public class MascotaController {

    private final MascotaService mascotaService;
    private final HistorialClinicoService historialClinicoService;

    @GetMapping
    @Operation(summary = "Listar mascotas activas")
    public ResponseEntity<ApiResponse<Page<MascotaResponseDTO>>> listar(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Listado de mascotas", mascotaService.listar(pageable)));
    }

    @GetMapping("/cliente/{idCliente}")
    @Operation(summary = "Listar mascotas de un cliente")
    public ResponseEntity<ApiResponse<Page<MascotaResponseDTO>>> listarPorCliente(@PathVariable Long idCliente, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Mascotas del cliente", mascotaService.listarPorCliente(idCliente, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener mascota por ID")
    public ResponseEntity<ApiResponse<MascotaResponseDTO>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Mascota encontrada", mascotaService.buscarPorId(id)));
    }

    @PostMapping
    @Operation(summary = "Registrar nueva mascota")
    public ResponseEntity<ApiResponse<MascotaResponseDTO>> registrar(@Valid @RequestBody MascotaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Mascota registrada correctamente", mascotaService.registrar(dto)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos de mascota")
    public ResponseEntity<ApiResponse<MascotaResponseDTO>> actualizar(@PathVariable Long id, @Valid @RequestBody MascotaRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok("Mascota actualizada correctamente", mascotaService.actualizar(id, dto)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar mascota")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        mascotaService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Mascota desactivada correctamente"));
    }

    @PostMapping(value = "/{idHistorial}/archivos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir archivo clínico (PDF/JPG/PNG)")
    public ResponseEntity<ApiResponse<String>> subirArchivo(@PathVariable Long idHistorial, @RequestParam MultipartFile archivo) {
        return ResponseEntity.ok(ApiResponse.ok("Archivo subido correctamente", historialClinicoService.subirArchivo(idHistorial, archivo)));
    }
}
