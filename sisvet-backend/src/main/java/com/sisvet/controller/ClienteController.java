package com.sisvet.controller;

import com.sisvet.dto.request.ClienteRequestDTO;
import com.sisvet.dto.response.ClienteResponseDTO;
import com.sisvet.service.ClienteService;
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
@RequestMapping("/api/clientes")
@Tag(name = "Clientes", description = "Gestión de clientes del sistema veterinario")
@SecurityRequirement(name = "Bearer Auth")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    @Operation(summary = "Listar clientes activos con paginación")
    public ResponseEntity<ApiResponse<Page<ClienteResponseDTO>>> listar(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Listado de clientes", clienteService.listar(pageable)));
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar clientes por nombre o documento")
    public ResponseEntity<ApiResponse<Page<ClienteResponseDTO>>> buscar(@RequestParam String q, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Resultado de búsqueda", clienteService.buscar(q, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener cliente por ID")
    public ResponseEntity<ApiResponse<ClienteResponseDTO>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Cliente encontrado", clienteService.buscarPorId(id)));
    }

    @GetMapping("/documento/{documento}")
    @Operation(summary = "Buscar cliente por número de documento")
    public ResponseEntity<ApiResponse<ClienteResponseDTO>> buscarPorDocumento(@PathVariable String documento) {
        return ResponseEntity.ok(ApiResponse.ok("Cliente encontrado", clienteService.buscarPorDocumento(documento)));
    }

    @PostMapping
    @Operation(summary = "Registrar nuevo cliente")
    public ResponseEntity<ApiResponse<ClienteResponseDTO>> registrar(@Valid @RequestBody ClienteRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Cliente registrado correctamente", clienteService.registrar(dto)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos de cliente")
    public ResponseEntity<ApiResponse<ClienteResponseDTO>> actualizar(@PathVariable Long id, @Valid @RequestBody ClienteRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok("Cliente actualizado correctamente", clienteService.actualizar(id, dto)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar cliente (borrado lógico)")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        clienteService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Cliente desactivado correctamente"));
    }
}
