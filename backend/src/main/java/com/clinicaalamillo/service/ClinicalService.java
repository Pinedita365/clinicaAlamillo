package com.clinicaalamillo.service;

import com.clinicaalamillo.audit.Audited;
import com.clinicaalamillo.dto.clinical.ToothRecordRequest;
import com.clinicaalamillo.dto.clinical.ToothRecordResponse;
import com.clinicaalamillo.dto.clinical.TreatmentRequest;
import com.clinicaalamillo.dto.clinical.TreatmentResponse;
import com.clinicaalamillo.model.ToothRecord;
import com.clinicaalamillo.model.ToothRecord.Surface;
import com.clinicaalamillo.model.Treatment;
import com.clinicaalamillo.model.Treatment.TreatmentStatus;
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
public class ClinicalService {

    private final UserRepository userRepository;
    private final ToothRecordRepository toothRecordRepository;
    private final TreatmentRepository treatmentRepository;

    // ── Odontograma ────────────────────────────────────────────────────────────

    @Audited(action = "READ", entity = "ToothRecord")
    @Transactional(readOnly = true)
    public List<ToothRecordResponse> getOdontogram(Long patientId) {
        requireUser(patientId);
        return toothRecordRepository
                .findByPatientIdOrderByToothNumberAsc(patientId)
                .stream().map(ToothRecordResponse::from).toList();
    }

    @Audited(action = "UPDATE", entity = "ToothRecord")
    @Transactional
    public ToothRecordResponse upsertToothRecord(Long patientId, ToothRecordRequest req, String dentistEmail) {
        User patient = requireUser(patientId);
        User dentist = userRepository.findByEmail(dentistEmail).orElse(null);

        Surface surface = req.surface() != null ? req.surface() : Surface.WHOLE;

        ToothRecord record = toothRecordRepository
                .findByPatientIdAndToothNumberAndSurface(patientId, req.toothNumber(), surface)
                .orElseGet(() -> ToothRecord.builder()
                        .patient(patient)
                        .toothNumber(req.toothNumber())
                        .surface(surface)
                        .build());

        record.setCondition(req.condition());
        record.setNotes(req.notes());
        record.setDentist(dentist);

        return ToothRecordResponse.from(toothRecordRepository.save(record));
    }

    @Audited(action = "DELETE", entity = "ToothRecord")
    @Transactional
    public void deleteToothRecord(Long recordId) {
        ToothRecord r = toothRecordRepository.findById(recordId)
                .orElseThrow(() -> new EntityNotFoundException("Registro dental no encontrado: " + recordId));
        toothRecordRepository.delete(r);
    }

    // ── Tratamientos ───────────────────────────────────────────────────────────

    @Audited(action = "READ", entity = "Treatment")
    @Transactional(readOnly = true)
    public List<TreatmentResponse> getTreatments(Long patientId) {
        requireUser(patientId);
        return treatmentRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream().map(TreatmentResponse::from).toList();
    }

    @Audited(action = "CREATE", entity = "Treatment")
    @Transactional
    public TreatmentResponse addTreatment(Long patientId, TreatmentRequest req, String dentistEmail) {
        User patient = requireUser(patientId);
        User dentist = userRepository.findByEmail(dentistEmail).orElse(null);

        ToothRecord toothRecord = req.toothRecordId() != null
                ? toothRecordRepository.findById(req.toothRecordId()).orElse(null)
                : null;

        Treatment t = Treatment.builder()
                .patient(patient)
                .dentist(dentist)
                .toothRecord(toothRecord)
                .name(req.name())
                .description(req.description())
                .cost(req.cost())
                .status(req.status() != null ? req.status() : TreatmentStatus.PLANNED)
                .performedAt(req.performedAt())
                .build();

        return TreatmentResponse.from(treatmentRepository.save(t));
    }

    @Audited(action = "UPDATE", entity = "Treatment")
    @Transactional
    public TreatmentResponse updateTreatmentStatus(Long treatmentId, TreatmentStatus status) {
        Treatment t = treatmentRepository.findById(treatmentId)
                .orElseThrow(() -> new EntityNotFoundException("Tratamiento no encontrado: " + treatmentId));
        t.setStatus(status);
        return TreatmentResponse.from(treatmentRepository.save(t));
    }

    @Audited(action = "DELETE", entity = "Treatment")
    @Transactional
    public void deleteTreatment(Long treatmentId) {
        Treatment t = treatmentRepository.findById(treatmentId)
                .orElseThrow(() -> new EntityNotFoundException("Tratamiento no encontrado: " + treatmentId));
        treatmentRepository.delete(t);
    }

    // ── Admin: lista de pacientes ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<com.clinicaalamillo.dto.patient.PatientProfileResponse> listPatients() {
        return userRepository.findByRole(com.clinicaalamillo.model.Role.PATIENT)
                .stream()
                .map(com.clinicaalamillo.dto.patient.PatientProfileResponse::from)
                .toList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User requireUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Paciente no encontrado: " + id));
    }
}
