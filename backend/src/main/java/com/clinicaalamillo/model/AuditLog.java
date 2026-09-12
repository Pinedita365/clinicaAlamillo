package com.clinicaalamillo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Registro de auditoría inmutable. Deja constancia de <b>quién</b> accedió o
 * modificó <b>qué</b> dato médico y <b>cuándo</b> (requisito de trazabilidad
 * LOPDGDD/RGPD art. 30 y medidas del ENS para datos de categoría especial).
 *
 * <p>Las filas nunca se actualizan ni se borran desde la aplicación; solo se
 * insertan (append-only). La retención se gestiona a nivel de base de datos.</p>
 */
@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_actor", columnList = "actorEmail"),
        @Index(name = "idx_audit_entity", columnList = "entityType,entityId"),
        @Index(name = "idx_audit_timestamp", columnList = "event_time")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Email del usuario autenticado que ejecutó la acción ({@code anonymous} si no lo hay). */
    @Column(nullable = false, length = 150)
    private String actorEmail;

    /** Rol del actor en el momento del acceso. */
    @Column(length = 20)
    private String actorRole;

    /** Verbo de la acción: READ, CREATE, UPDATE, DELETE, LOGIN, EXPORT… */
    @Column(nullable = false, length = 30)
    private String action;

    /** Tipo de recurso accedido (p.ej. {@code ToothRecord}, {@code User}). */
    @Column(length = 60)
    private String entityType;

    /** Identificador del recurso concreto, si aplica. */
    @Column(length = 60)
    private String entityId;

    /** IP de origen de la petición. */
    @Column(length = 45)
    private String ipAddress;

    /** Detalle adicional legible (método, endpoint, resultado). */
    @Column(length = 500)
    private String detail;

    // 'timestamp' es palabra reservada en MariaDB/MySQL → columna renombrada.
    @Column(name = "event_time", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
