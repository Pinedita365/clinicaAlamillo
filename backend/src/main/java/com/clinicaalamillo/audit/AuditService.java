package com.clinicaalamillo.audit;

import com.clinicaalamillo.model.AuditLog;
import com.clinicaalamillo.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Persiste entradas de auditoría. La escritura se hace en una transacción
 * independiente ({@code REQUIRES_NEW}) para que un fallo al auditar nunca
 * revierta la operación de negocio, y de forma asíncrona para no penalizar la
 * latencia de la petición.
 */
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository repository;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(AuditLog entry) {
        repository.save(entry);
    }
}
