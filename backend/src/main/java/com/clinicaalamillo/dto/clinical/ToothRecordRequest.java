package com.clinicaalamillo.dto.clinical;

import com.clinicaalamillo.model.ToothRecord.Surface;
import com.clinicaalamillo.model.ToothRecord.ToothCondition;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ToothRecordRequest(
        @NotNull @Min(11) @Max(85) Integer toothNumber,
        Surface surface,
        @NotNull ToothCondition condition,
        String notes
) {}
