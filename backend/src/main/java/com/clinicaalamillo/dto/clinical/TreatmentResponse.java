package com.clinicaalamillo.dto.clinical;

import com.clinicaalamillo.model.Treatment;
import com.clinicaalamillo.model.Treatment.TreatmentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TreatmentResponse(
        Long id,
        Long patientId,
        String patientName,
        String dentistName,
        String name,
        String description,
        BigDecimal cost,
        TreatmentStatus status,
        Long toothRecordId,
        Integer toothNumber,
        LocalDate performedAt,
        LocalDateTime createdAt
) {
    public static TreatmentResponse from(Treatment t) {
        return new TreatmentResponse(
                t.getId(),
                t.getPatient() != null ? t.getPatient().getId() : null,
                t.getPatient() != null ? t.getPatient().getFullName() : null,
                t.getDentist() != null ? t.getDentist().getFullName() : null,
                t.getName(),
                t.getDescription(),
                t.getCost(),
                t.getStatus(),
                t.getToothRecord() != null ? t.getToothRecord().getId() : null,
                t.getToothRecord() != null ? t.getToothRecord().getToothNumber() : null,
                t.getPerformedAt(),
                t.getCreatedAt()
        );
    }
}
