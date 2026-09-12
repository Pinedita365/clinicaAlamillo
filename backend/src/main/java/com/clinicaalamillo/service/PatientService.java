package com.clinicaalamillo.service;

import com.clinicaalamillo.audit.Audited;
import com.clinicaalamillo.dto.clinical.ToothRecordResponse;
import com.clinicaalamillo.dto.clinical.TreatmentResponse;
import com.clinicaalamillo.dto.patient.PatientProfileResponse;
import com.clinicaalamillo.dto.patient.UpdateProfileRequest;
import com.clinicaalamillo.model.User;
import com.clinicaalamillo.repository.ToothRecordRepository;
import com.clinicaalamillo.repository.TreatmentRepository;
import com.clinicaalamillo.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final UserRepository userRepository;
    private final ToothRecordRepository toothRecordRepository;
    private final TreatmentRepository treatmentRepository;

    @Audited(action = "READ", entity = "User")
    @Transactional(readOnly = true)
    public PatientProfileResponse getProfile(Long userId) {
        return PatientProfileResponse.from(requireUser(userId));
    }

    @Audited(action = "UPDATE", entity = "User")
    @Transactional
    public PatientProfileResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User user = requireUser(userId);
        user.setFullName(req.fullName());
        user.setPhone(req.phone());
        user.setBirthDate(req.birthDate());
        return PatientProfileResponse.from(userRepository.save(user));
    }

    @Audited(action = "READ", entity = "ToothRecord")
    @Transactional(readOnly = true)
    public List<ToothRecordResponse> getMyOdontogram(Long userId) {
        return toothRecordRepository
                .findByPatientIdOrderByToothNumberAsc(userId)
                .stream().map(ToothRecordResponse::from).toList();
    }

    @Audited(action = "READ", entity = "Treatment")
    @Transactional(readOnly = true)
    public List<TreatmentResponse> getMyTreatments(Long userId) {
        return treatmentRepository
                .findByPatientIdOrderByCreatedAtDesc(userId)
                .stream().map(TreatmentResponse::from).toList();
    }

    private User requireUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + id));
    }
}
