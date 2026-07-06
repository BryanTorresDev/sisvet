package com.sisvet.controller;

import com.sisvet.dto.request.PagoRequestDTO;
import com.sisvet.dto.response.PagoResponseDTO;
import com.sisvet.service.PagoService;
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
@RequestMapping("/api/pagos")
@Tag(name = "Pagos", description = "Registro y gestión de pagos de citas")
@SecurityRequirement(name = "Bearer Auth")
@RequiredArgsConstructor
public class PagoController {

    private final PagoService pagoService;

    @GetMapping
    @Operation(summary = "Listar todos los pagos")
    public ResponseEntity<ApiResponse<Page<PagoResponseDTO>>> listar(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Listado de pagos", pagoService.listar(pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener pago por ID")
    public ResponseEntity<ApiResponse<PagoResponseDTO>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Pago encontrado", pagoService.buscarPorId(id)));
    }

    @PostMapping
    @Operation(summary = "Registrar pago de cita")
    public ResponseEntity<ApiResponse<PagoResponseDTO>> registrar(@Valid @RequestBody PagoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Pago registrado correctamente", pagoService.registrar(dto)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar pago")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        pagoService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Pago eliminado"));
    }
}
