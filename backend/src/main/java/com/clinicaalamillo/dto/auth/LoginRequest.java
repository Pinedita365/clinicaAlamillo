package com.clinicaalamillo.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Credenciales para iniciar sesión. */
public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
) {}
