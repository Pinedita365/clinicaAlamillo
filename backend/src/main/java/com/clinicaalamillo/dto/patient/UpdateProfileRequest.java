package com.clinicaalamillo.dto.patient;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateProfileRequest(
        @NotBlank @Size(max = 120) String fullName,
        @Pattern(regexp = "^[+\\d\\s\\-()]{7,20}$", message = "Teléfono no válido") String phone,
        LocalDate birthDate
) {}
