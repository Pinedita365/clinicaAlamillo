package com.clinicaalamillo.controller;

import com.clinicaalamillo.dto.auth.InvitePatientRequest;
import com.clinicaalamillo.dto.clinical.ToothRecordRequest;
import com.clinicaalamillo.dto.clinical.ToothRecordResponse;
import com.clinicaalamillo.dto.clinical.TreatmentRequest;
import com.clinicaalamillo.dto.clinical.TreatmentResponse;
import com.clinicaalamillo.dto.patient.PatientProfileResponse;
import com.clinicaalamillo.model.Treatment.TreatmentStatus;
import com.clinicaalamillo.service.ClinicalService;
import com.clinicaalamillo.service.InvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clinical")
@RequiredArgsConstructor
@Tag(name = "Clínico", description = "Odontograma y tratamientos — requiere rol DENTIST o ADMIN")
@SecurityRequirement(name = "bearerAuth")
public class ClinicalController {

    private final ClinicalService clinicalService;
    private final InvitationService invitationService;

    // ── Lista de pacientes ─────────────────────────────────────────────────────

    @GetMapping("/patients")
    @PreAuthorize("hasAnyRole('DENTIST','ADMIN')")
    @Operation(summary = "Lista todos los pacientes registrados")
    public ResponseEntity<List<PatientProfileResponse>> listPatients() {
        return ResponseEntity.ok(clinicalService.listPatients());
    }

    // ── Invitación de nuevos pacientes ────────────────────────────────────────

    @PostMapping("/patients/invite")
    @PreAuthorize("hasAnyRole('DENTIST','ADMIN')")
    @Operation(summary = "Envía invitación por email para que el paciente active su cuenta")
    public ResponseEntity<Map<String, String>> invitePatient(@Valid @RequestBody InvitePatientRequest req) {
        invitationService.createInvitation(req.email(), req.fullName());
        return ResponseEntity.ok(Map.of("message", "Invitación enviada a " + req.email()));
    }

    // ── Odontograma ────────────────────────────────────────────────────────────

    @GetMapping("/patients/{patientId}/odontogram")
    @PreAuthorize("hasAnyRole('DENTIST','ADMIN')")
    @Operation(summary = "Obtiene el odontograma completo de un paciente")
    public ResponseEntity<List<ToothRecordResponse>> getOdontogram(@PathVariable Long patientId) {
        return ResponseEntity.ok(clinicalService.getOdontogram(patientId));
    }

    @PutMapping("/patients/{patientId}/odontogram")
    @PreAuthorize("hasAnyRole('DENTIST','ADMIN')")
    @Operation(summary = "Guarda o actualiza el estado de una pieza dental")
    public ResponseEntity<ToothRecordResponse> upsertToothRecord(
            @PathVariable Long patientId,
            @Valid @RequestBody ToothRecordRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(clinicalService.upsertToothRecord(patientId, req, principal.getUsername()));
    }

    @DeleteMapping("/tooth-records/{recordId}")
    @PreAuthorize("hasAnyRole('DENTIST','ADMIN')")
    @Operation(summary = "Elimina un registro dental del odontograma")
    public ResponseEntity<Void> deleteToothRecord(@PathVariable Long recordId) {
        clinicalService.deleteToothRecord(recordId);
        return ResponseEntity.noContent().build();
    }

    // ── Tratamientos ───────────────────────────────────────────────────────────

    @GetMapping("/patients/{patientId}/treatments")
    @PreAuthorize("hasAnyRole('DENTIST','ADMIN')")
    @Operation(summary = "Lista los tratamientos de un paciente, de más reciente a más antiguo")
    public ResponseEntity<List<TreatmentResponse>> getTreatments(@PathVariable Long patientId) {
        return ResponseEntity.ok(clinicalService.getTreatments(patientId));
    }

    @PostMapping("/patients/{patientId}/treatments")
    @PreAuthorize("hasAnyRole('DENTIST','ADMIN')")
    @Operation(summary = "Crea un tratamiento para un paciente")
    public ResponseEntity<TreatmentResponse> addTreatment(
            @PathVariable Long patientId,
            @Valid @RequestBody TreatmentRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clinicalService.addTreatment(patientId, req, principal.getUsername()));
    }

    @PatchMapping("/treatments/{treatmentId}/status")
    @PreAuthorize("hasAnyRole('DENTIST','ADMIN')")
    @Operation(summary = "Actualiza el estado de un tratamiento")
    public ResponseEntity<TreatmentResponse> updateStatus(
            @PathVariable Long treatmentId,
            @RequestParam TreatmentStatus status) {
        return ResponseEntity.ok(clinicalService.updateTreatmentStatus(treatmentId, status));
    }

    @DeleteMapping("/treatments/{treatmentId}")
    @PreAuthorize("hasAnyRole('DENTIST','ADMIN')")
    @Operation(summary = "Elimina un tratamiento")
    public ResponseEntity<Void> deleteTreatment(@PathVariable Long treatmentId) {
        clinicalService.deleteTreatment(treatmentId);
        return ResponseEntity.noContent().build();
    }
}
