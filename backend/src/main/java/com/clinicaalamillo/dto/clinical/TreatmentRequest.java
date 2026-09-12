package com.clinicaalamillo.dto.clinical;

import com.clinicaalamillo.model.Treatment.TreatmentStatus;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TreatmentRequest(
        @NotBlank String name,
        String description,
        BigDecimal cost,
        TreatmentStatus status,
        Long toothRecordId,
        LocalDate performedAt
) {}
