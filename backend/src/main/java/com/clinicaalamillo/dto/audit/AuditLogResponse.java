package com.clinicaalamillo.dto.audit;

import com.clinicaalamillo.model.AuditLog;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        String actorEmail,
        String actorRole,
        String action,
        String entityType,
        String entityId,
        String ipAddress,
        String detail,
        LocalDateTime eventTime
) {
    public static AuditLogResponse from(AuditLog a) {
        return new AuditLogResponse(
                a.getId(),
                a.getActorEmail(),
                a.getActorRole(),
                a.getAction(),
                a.getEntityType(),
                a.getEntityId(),
                a.getIpAddress(),
                a.getDetail(),
                a.getTimestamp()
        );
    }
}
