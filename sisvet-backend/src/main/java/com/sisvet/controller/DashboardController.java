package com.sisvet.controller;

import com.sisvet.dto.response.DashboardResponseDTO;
import com.sisvet.service.DashboardService;
import com.sisvet.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Indicadores y estadísticas del sistema")
@SecurityRequirement(name = "Bearer Auth")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Obtener resumen general del sistema")
    public ResponseEntity<ApiResponse<DashboardResponseDTO>> resumen() {
        return ResponseEntity.ok(ApiResponse.ok("Resumen del sistema", dashboardService.obtenerResumen()));
    }
}
