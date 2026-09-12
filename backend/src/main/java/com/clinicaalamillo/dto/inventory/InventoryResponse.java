package com.clinicaalamillo.dto.inventory;

import com.clinicaalamillo.model.InventoryItem;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InventoryResponse(
        Long id,
        String name,
        String sku,
        String category,
        Integer quantity,
        String unit,
        Integer lowStockThreshold,
        boolean lowStock,
        BigDecimal unitCost,
        String supplier,
        LocalDateTime updatedAt
) {
    public static InventoryResponse from(InventoryItem i) {
        return new InventoryResponse(
                i.getId(),
                i.getName(),
                i.getSku(),
                i.getCategory(),
                i.getQuantity(),
                i.getUnit(),
                i.getLowStockThreshold(),
                i.isLowStock(),
                i.getUnitCost(),
                i.getSupplier(),
                i.getUpdatedAt()
        );
    }
}
