package com.clinicaalamillo.repository;

import com.clinicaalamillo.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, String entityId);

    List<AuditLog> findByActorEmailOrderByTimestampDesc(String actorEmail);

    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);

    @Query("""
            SELECT a FROM AuditLog a
            WHERE (:actor IS NULL OR a.actorEmail LIKE %:actor%)
              AND (:entity IS NULL OR a.entityType = :entity)
              AND (:from IS NULL OR a.timestamp >= :from)
              AND (:to IS NULL OR a.timestamp <= :to)
            ORDER BY a.timestamp DESC
            """)
    Page<AuditLog> search(
            @Param("actor") String actor,
            @Param("entity") String entity,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable);
}
