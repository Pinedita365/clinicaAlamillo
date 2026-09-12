package com.clinicaalamillo.dto.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record InventoryRequest(
        @NotBlank String name,
        String sku,
        String category,
        @Min(0) Integer quantity,
        String unit,
        @Min(0) Integer lowStockThreshold,
        BigDecimal unitCost,
        String supplier
) {}
