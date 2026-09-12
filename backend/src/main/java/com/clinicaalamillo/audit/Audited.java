package com.clinicaalamillo.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marca un método de servicio/controlador cuyo acceso a datos médicos debe
 * quedar registrado en {@link com.clinicaalamillo.model.AuditLog}.
 *
 * <p>Ejemplo:</p>
 * <pre>{@code
 *   @Audited(action = "READ", entity = "ToothRecord")
 *   public List<ToothRecord> getOdontogram(Long patientId) { ... }
 * }</pre>
 *
 * El {@link com.clinicaalamillo.audit.AuditAspect} intercepta la llamada y persiste
 * quién, qué y cuándo.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Audited {

    /** Verbo de la acción: READ, CREATE, UPDATE, DELETE, EXPORT… */
    String action();

    /** Tipo de recurso auditado (p.ej. {@code ToothRecord}, {@code Treatment}). */
    String entity();
}
