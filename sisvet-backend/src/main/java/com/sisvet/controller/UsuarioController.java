package com.sisvet.controller;

import com.sisvet.dto.request.UsuarioRequestDTO;
import com.sisvet.dto.response.UsuarioResponseDTO;
import com.sisvet.service.UsuarioService;
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
@RequestMapping("/api/usuarios")
@Tag(name = "Usuarios", description = "Gestión de accesos y roles de usuarios de la clínica")
@SecurityRequirement(name = "Bearer Auth")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    @Operation(summary = "Listar todos los usuarios con paginación")
    public ResponseEntity<ApiResponse<Page<UsuarioResponseDTO>>> listar(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Listado de usuarios obtenido", 
                usuarioService.listar(pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID")
    public ResponseEntity<ApiResponse<UsuarioResponseDTO>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Usuario encontrado", 
                usuarioService.buscarPorId(id)));
    }

    @PostMapping
    @Operation(summary = "Registrar nuevo usuario")
    public ResponseEntity<ApiResponse<UsuarioResponseDTO>> registrar(@Valid @RequestBody UsuarioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Usuario registrado correctamente", 
                        usuarioService.registrar(dto)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar usuario por ID")
    public ResponseEntity<ApiResponse<UsuarioResponseDTO>> actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok("Usuario actualizado correctamente", 
                usuarioService.actualizar(id, dto)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar (desactivar) usuario por ID")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Usuario eliminado correctamente", null));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Alternar estado activo/inactivo del usuario")
    public ResponseEntity<ApiResponse<Void>> alternarEstado(@PathVariable Long id) {
        usuarioService.alternarEstado(id);
        return ResponseEntity.ok(ApiResponse.ok("Estado del usuario actualizado correctamente", null));
    }
}
