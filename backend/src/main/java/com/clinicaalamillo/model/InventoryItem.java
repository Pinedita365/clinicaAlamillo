package com.clinicaalamillo.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Artículo de inventario/stock de la clínica (material fungible, instrumental…).
 *
 * <p>El campo {@link #lowStockThreshold} habilita las <b>alertas automáticas de
 * umbral bajo</b>: {@link #isLowStock()} es {@code true} cuando la cantidad cae
 * al umbral o por debajo.</p>
 */
@Entity
@Table(name = "inventory_items", indexes = {
        @Index(name = "idx_inventory_sku", columnList = "sku", unique = true)
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    /** Código de referencia único del artículo. */
    @Column(unique = true, length = 60)
    private String sku;

    @Column(length = 60)
    private String category;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    /** Unidad de medida (uds, cajas, ml…). */
    @Column(length = 20)
    @Builder.Default
    private String unit = "uds";

    /** Umbral por debajo del cual (inclusive) se dispara la alerta de stock bajo. */
    @Column(nullable = false)
    @Builder.Default
    private Integer lowStockThreshold = 5;

    @Column(precision = 10, scale = 2)
    private BigDecimal unitCost;

    @Column(length = 120)
    private String supplier;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate @PrePersist
    void touch() {
        this.updatedAt = LocalDateTime.now();
    }

    /** @return true si la cantidad actual está en el umbral de aviso o por debajo. */
    @Transient
    public boolean isLowStock() {
        return quantity != null && lowStockThreshold != null && quantity <= lowStockThreshold;
    }
}
