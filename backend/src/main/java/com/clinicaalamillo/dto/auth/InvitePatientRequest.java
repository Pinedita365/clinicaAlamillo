package com.clinicaalamillo.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record InvitePatientRequest(
    @NotBlank @Email String email,
    @NotBlank String fullName
) {}
