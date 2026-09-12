package com.clinicaalamillo.service;

import com.clinicaalamillo.dto.inventory.InventoryRequest;
import com.clinicaalamillo.dto.inventory.InventoryResponse;
import com.clinicaalamillo.model.InventoryItem;
import com.clinicaalamillo.repository.InventoryItemRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;

    @Transactional(readOnly = true)
    public List<InventoryResponse> findAll() {
        return inventoryItemRepository.findAll().stream()
                .map(InventoryResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> findLowStock() {
        return inventoryItemRepository.findLowStock().stream()
                .map(InventoryResponse::from).toList();
    }

    @Transactional
    public InventoryResponse create(InventoryRequest req) {
        InventoryItem item = InventoryItem.builder()
                .name(req.name())
                .sku(req.sku())
                .category(req.category())
                .quantity(req.quantity() != null ? req.quantity() : 0)
                .unit(req.unit() != null ? req.unit() : "uds")
                .lowStockThreshold(req.lowStockThreshold() != null ? req.lowStockThreshold() : 5)
                .unitCost(req.unitCost())
                .supplier(req.supplier())
                .build();
        return InventoryResponse.from(inventoryItemRepository.save(item));
    }

    @Transactional
    public InventoryResponse update(Long id, InventoryRequest req) {
        InventoryItem item = requireItem(id);
        item.setName(req.name());
        item.setSku(req.sku());
        item.setCategory(req.category());
        if (req.quantity() != null) item.setQuantity(req.quantity());
        if (req.unit() != null) item.setUnit(req.unit());
        if (req.lowStockThreshold() != null) item.setLowStockThreshold(req.lowStockThreshold());
        item.setUnitCost(req.unitCost());
        item.setSupplier(req.supplier());
        return InventoryResponse.from(inventoryItemRepository.save(item));
    }

    @Transactional
    public InventoryResponse adjustStock(Long id, int delta) {
        InventoryItem item = requireItem(id);
        int newQty = Math.max(0, item.getQuantity() + delta);
        item.setQuantity(newQty);
        return InventoryResponse.from(inventoryItemRepository.save(item));
    }

    @Transactional
    public void delete(Long id) {
        inventoryItemRepository.delete(requireItem(id));
    }

    private InventoryItem requireItem(Long id) {
        return inventoryItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Artículo no encontrado: " + id));
    }
}
