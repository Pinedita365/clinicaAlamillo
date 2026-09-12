package com.clinicaalamillo.repository;

import com.clinicaalamillo.model.PatientInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientInvitationRepository extends JpaRepository<PatientInvitation, Long> {
    Optional<PatientInvitation> findByToken(String token);
    boolean existsByEmailAndUsedFalse(String email);
}
