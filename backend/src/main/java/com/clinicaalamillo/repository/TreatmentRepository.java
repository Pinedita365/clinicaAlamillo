package com.clinicaalamillo.repository;

import com.clinicaalamillo.model.Treatment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TreatmentRepository extends JpaRepository<Treatment, Long> {

    List<Treatment> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
