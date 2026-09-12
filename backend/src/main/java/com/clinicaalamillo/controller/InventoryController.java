package com.clinicaalamillo.controller;

import com.clinicaalamillo.dto.inventory.InventoryRequest;
import com.clinicaalamillo.dto.inventory.InventoryResponse;
import com.clinicaalamillo.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventario", description = "Gestión de stock de material clínico — requiere rol DENTIST o ADMIN")
@SecurityRequirement(name = "bearerAuth")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DENTIST','ADMIN')")
    @Operation(summary = "Lista todos los artículos de inventario")
    public ResponseEntity<List<InventoryResponse>> findAll() {
        return ResponseEntity.ok(inventoryService.findAll());
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('DENTIST','ADMIN')")
    @Operation(summary = "Artículos en stock bajo (cantidad ≤ umbral)")
    public ResponseEntity<List<InventoryResponse>> lowStock() {
        return ResponseEntity.ok(inventoryService.findLowStock());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DENTIST','ADMIN')")
    @Operation(summary = "Crea un nuevo artículo de inventario")
    public ResponseEntity<InventoryResponse> create(@Valid @RequestBody InventoryRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DENTIST','ADMIN')")
    @Operation(summary = "Actualiza un artículo de inventario")
    public ResponseEntity<InventoryResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody InventoryRequest req) {
        return ResponseEntity.ok(inventoryService.update(id, req));
    }

    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('DENTIST','ADMIN')")
    @Operation(summary = "Ajusta la cantidad en stock (+/- delta). El mínimo resultante es 0.")
    public ResponseEntity<InventoryResponse> adjustStock(@PathVariable Long id,
                                                         @RequestParam int delta) {
        return ResponseEntity.ok(inventoryService.adjustStock(id, delta));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Elimina un artículo de inventario (solo ADMIN)")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        inventoryService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Artículo eliminado"));
    }
}
