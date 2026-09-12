package com.clinicaalamillo.dto.clinical;

import com.clinicaalamillo.model.ToothRecord;
import com.clinicaalamillo.model.ToothRecord.Surface;
import com.clinicaalamillo.model.ToothRecord.ToothCondition;

import java.time.LocalDateTime;

public record ToothRecordResponse(
        Long id,
        Long patientId,
        Integer toothNumber,
        Surface surface,
        ToothCondition condition,
        String notes,
        String dentistName,
        LocalDateTime updatedAt
) {
    public static ToothRecordResponse from(ToothRecord r) {
        return new ToothRecordResponse(
                r.getId(),
                r.getPatient() != null ? r.getPatient().getId() : null,
                r.getToothNumber(),
                r.getSurface(),
                r.getCondition(),
                r.getNotes(),
                r.getDentist() != null ? r.getDentist().getFullName() : null,
                r.getUpdatedAt()
        );
    }
}
