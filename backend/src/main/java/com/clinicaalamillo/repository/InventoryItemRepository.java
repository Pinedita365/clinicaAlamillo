package com.clinicaalamillo.repository;

import com.clinicaalamillo.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    /** Artículos cuya cantidad ha caído al umbral de aviso o por debajo. */
    @Query("SELECT i FROM InventoryItem i WHERE i.quantity <= i.lowStockThreshold")
    List<InventoryItem> findLowStock();
}
