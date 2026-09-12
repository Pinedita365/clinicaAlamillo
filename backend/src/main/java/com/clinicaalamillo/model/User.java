package com.clinicaalamillo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Usuario del ecosistema (Admin, Dentista o Paciente).
 *
 * <p>Notas de seguridad/LOPDGDD:</p>
 * <ul>
 *   <li>La contraseña se almacena <b>siempre</b> como hash BCrypt en {@code passwordHash};
 *       nunca en claro.</li>
 *   <li>Los campos de salud sensibles del paciente ({@code medicalNotes}, alergias…) se
 *       cifran en reposo mediante {@link com.clinicaalamillo.security.crypto.EncryptedStringConverter}.</li>
 *   <li>El acceso a estos datos queda registrado en {@link AuditLog}.</li>
 * </ul>
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email", unique = true)
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /** Hash BCrypt de la contraseña. Nunca se expone en DTOs de respuesta. */
    @Column(nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false, length = 120)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.PATIENT;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    // ── Datos clínicos del paciente (cifrados en reposo) ─────────────────────
    /** DNI/NIE. Cifrado en reposo. */
    @Convert(converter = com.clinicaalamillo.security.crypto.EncryptedStringConverter.class)
    @Column(length = 512)
    private String nationalId;

    private LocalDate birthDate;

    /** Notas médicas generales / anamnesis resumida. Cifrado en reposo. */
    @Convert(converter = com.clinicaalamillo.security.crypto.EncryptedStringConverter.class)
    @Column(columnDefinition = "TEXT")
    private String medicalNotes;

    // ── Auditoría de fila ────────────────────────────────────────────────────
    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
