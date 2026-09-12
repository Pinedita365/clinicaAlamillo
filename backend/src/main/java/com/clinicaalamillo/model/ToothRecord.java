package com.clinicaalamillo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Registro de una pieza dental dentro del <b>odontograma</b> de un paciente.
 *
 * <p>Cada paciente tiene N filas (una por pieza registrada). La pieza se identifica
 * con la <b>notación FDI</b> de dos dígitos:</p>
 * <ul>
 *   <li>Permanentes: cuadrantes 1–4 → dientes 11–48.</li>
 *   <li>Temporales (dentición infantil): cuadrantes 5–8 → dientes 51–85.</li>
 * </ul>
 *
 * <p>La combinación (paciente, pieza, superficie) es única: un mismo diente puede
 * tener varios registros si se anota por superficie (mesial, oclusal, etc.).</p>
 */
@Entity
@Table(name = "tooth_records", uniqueConstraints = {
        @UniqueConstraint(name = "uk_tooth_patient_piece_surface",
                columnNames = {"patient_id", "toothNumber", "surface"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ToothRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Paciente propietario del odontograma. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    /** Número de pieza en notación FDI (11–48 permanentes, 51–85 temporales). */
    @Column(nullable = false)
    private Integer toothNumber;

    /** Superficie afectada. {@code WHOLE} = pieza completa. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    @Builder.Default
    private Surface surface = Surface.WHOLE;

    /** Patología o estado registrado sobre la pieza/superficie. */
    @Enumerated(EnumType.STRING)
    // 'condition' es palabra reservada en MariaDB/MySQL → columna renombrada.
    @Column(name = "tooth_condition", nullable = false, length = 20)
    @Builder.Default
    private ToothCondition condition = ToothCondition.HEALTHY;

    /** Observación clínica libre. Cifrada en reposo (dato de salud). */
    @Convert(converter = com.clinicaalamillo.security.crypto.EncryptedStringConverter.class)
    @Column(columnDefinition = "TEXT")
    private String notes;

    /** Dentista que realizó la última anotación (trazabilidad clínica). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dentist_id")
    private User dentist;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate @PrePersist
    void touch() {
        this.updatedAt = LocalDateTime.now();
    }

    /** Superficies dentales (nomenclatura estándar). */
    public enum Surface {
        WHOLE, MESIAL, DISTAL, OCLUSAL, VESTIBULAR, LINGUAL, PALATINO
    }

    /**
     * Estados/patologías registrables. Cada valor mapea a un color en el
     * componente {@code OdontogramView} del frontend.
     */
    public enum ToothCondition {
        HEALTHY,      // sano
        CARIES,       // caries
        FILLED,       // obturado / empaste
        CROWN,        // corona
        IMPLANT,      // implante
        EXTRACTED,    // ausente / extraído
        ROOT_CANAL,   // endodoncia
        SEALANT,      // sellador
        FRACTURE      // fractura
    }
}
