package com.clinicaalamillo.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Registro de facturas emitidas. El id auto-incremental sirve como base para
 * el numero de factura correlativo: FACT-{anyo}-{id con padding de 4 cifras}.
 */
@Entity
@Table(name = "invoices", indexes = {
        @Index(name = "idx_invoices_patient", columnList = "patient_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime generatedAt = LocalDateTime.now();

    @Column(precision = 10, scale = 2)
    private BigDecimal totalAmount;

    /** Año de la factura para el numero correlativo. */
    @Column(nullable = false)
    private int invoiceYear;

    /** Devuelve el numero de factura con formato FACT-{anyo}-{id padded}. */
    public String getInvoiceNumber() {
        return String.format("FACT-%d-%04d", invoiceYear, id);
    }
}
