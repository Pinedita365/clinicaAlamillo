package com.clinicaalamillo.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Tratamiento clínico aplicado (o planificado) sobre un paciente.
 *
 * <p>Relaciona al paciente con el dentista responsable y, opcionalmente, con la
 * pieza del odontograma sobre la que se actúa. Es la base del historial clínico,
 * de los presupuestos y de la facturación (fases posteriores).</p>
 */
@Entity
@Table(name = "treatments", indexes = {
        @Index(name = "idx_treatments_patient", columnList = "patient_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Treatment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dentist_id")
    private User dentist;

    /** Pieza sobre la que se realiza el tratamiento (opcional). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tooth_record_id")
    private ToothRecord toothRecord;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Coste del tratamiento en euros. */
    @Column(precision = 10, scale = 2)
    private BigDecimal cost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TreatmentStatus status = TreatmentStatus.PLANNED;

    private LocalDate performedAt;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TreatmentStatus {
        PLANNED,      // presupuestado / planificado
        IN_PROGRESS,  // en curso
        COMPLETED,    // finalizado
        CANCELLED     // anulado
    }
}
