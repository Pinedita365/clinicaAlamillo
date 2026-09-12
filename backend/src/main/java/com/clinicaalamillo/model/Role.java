package com.clinicaalamillo.model;

/**
 * Roles del sistema. Se mapean 1:1 a las autoridades de Spring Security como
 * {@code ROLE_ADMIN}, {@code ROLE_DENTIST}, {@code ROLE_PATIENT}.
 *
 * <ul>
 *   <li>{@link #ADMIN}   – gestión total: usuarios, inventario, finanzas.</li>
 *   <li>{@link #DENTIST} – agenda clínica, odontograma, tratamientos.</li>
 *   <li>{@link #PATIENT} – área privada: sus citas, historial y facturas.</li>
 * </ul>
 */
public enum Role {
    ADMIN,
    DENTIST,
    PATIENT;

    /** Autoridad tal y como la espera Spring Security ({@code ROLE_} + nombre). */
    public String authority() {
        return "ROLE_" + name();
    }
}
