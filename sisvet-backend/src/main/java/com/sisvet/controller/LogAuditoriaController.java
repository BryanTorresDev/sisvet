package com.sisvet.controller;

import com.sisvet.entity.LogAuditoria;
import com.sisvet.repository.LogAuditoriaRepository;
import com.sisvet.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auditoria")
@Tag(name = "Auditoria", description = "Logs de auditoría del sistema (vía RabbitMQ)")
@SecurityRequirement(name = "Bearer Auth")
@RequiredArgsConstructor
public class LogAuditoriaController {

    private final LogAuditoriaRepository logAuditoriaRepository;

    @GetMapping
    @Operation(summary = "Listar logs de auditoría con paginación")
    public ResponseEntity<ApiResponse<Page<LogAuditoria>>> listar(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Listado de auditoría obtenido", 
                logAuditoriaRepository.findAll(pageable)));
    }
}
