package com.sisvet.controller;

import com.sisvet.feign.dto.ReniecResponseDTO;
import com.sisvet.service.IntegracionService;
import com.sisvet.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/integraciones")
@Tag(name = "Integraciones", description = "Consultas a servicios externos (RENIEC/APISPERU)")
@SecurityRequirement(name = "Bearer Auth")
@RequiredArgsConstructor
public class IntegracionController {

    private final IntegracionService integracionService;

    @GetMapping("/dni/{dni}")
    @Operation(summary = "Consultar datos de persona por DNI")
    public ResponseEntity<ApiResponse<ReniecResponseDTO>> consultarDni(
            @PathVariable String dni,
            HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Consulta exitosa",
                integracionService.consultarDni(dni, request.getRemoteAddr())));
    }
}
