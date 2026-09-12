package com.clinicaalamillo.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AcceptInviteRequest(
    @NotBlank String token,
    @NotBlank @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres") String password
) {}
