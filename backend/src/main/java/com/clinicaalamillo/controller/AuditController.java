package com.clinicaalamillo.controller;

import com.clinicaalamillo.dto.audit.AuditLogResponse;
import com.clinicaalamillo.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Auditoría", description = "Trazas de acceso a datos médicos — solo ADMIN")
@SecurityRequirement(name = "bearerAuth")
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @Operation(summary = "Consulta el registro de auditoría con filtros opcionales y paginación",
               description = "Parámetros opcionales: actor (email parcial), entity (tipo exacto), from/to (fecha), page/size.")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam(required = false) String actor,
            @RequestParam(required = false) String entity,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        LocalDateTime fromDt = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDt   = to   != null ? to.atTime(LocalTime.MAX) : null;

        PageRequest pageable = PageRequest.of(page, Math.min(size, 200),
                Sort.by(Sort.Direction.DESC, "timestamp"));

        Page<AuditLogResponse> result = auditLogRepository
                .search(actor, entity, fromDt, toDt, pageable)
                .map(AuditLogResponse::from);

        return ResponseEntity.ok(Map.of(
                "content",       result.getContent(),
                "page",          result.getNumber(),
                "size",          result.getSize(),
                "totalElements", result.getTotalElements(),
                "totalPages",    result.getTotalPages()
        ));
    }
}
