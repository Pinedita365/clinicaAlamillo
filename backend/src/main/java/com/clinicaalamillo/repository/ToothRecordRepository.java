package com.clinicaalamillo.repository;

import com.clinicaalamillo.model.ToothRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ToothRecordRepository extends JpaRepository<ToothRecord, Long> {

    /** Odontograma completo de un paciente, ordenado por número de pieza. */
    List<ToothRecord> findByPatientIdOrderByToothNumberAsc(Long patientId);

    /** Busca un registro concreto para el upsert del odontograma. */
    java.util.Optional<ToothRecord> findByPatientIdAndToothNumberAndSurface(
            Long patientId, Integer toothNumber, ToothRecord.Surface surface);
}
