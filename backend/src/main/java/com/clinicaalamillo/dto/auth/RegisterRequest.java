package com.clinicaalamillo.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Alta de un nuevo usuario. El registro público solo crea pacientes; la creación
 * de dentistas/administradores se hará desde el panel de admin (fase posterior).
 */
public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres") String password,
        @NotBlank String fullName,
        String phone
) {}
