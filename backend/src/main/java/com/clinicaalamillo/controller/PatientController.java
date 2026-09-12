package com.clinicaalamillo.controller;

import com.clinicaalamillo.dto.AppointmentResponse;
import com.clinicaalamillo.dto.clinical.ToothRecordResponse;
import com.clinicaalamillo.dto.clinical.TreatmentResponse;
import com.clinicaalamillo.dto.patient.PatientProfileResponse;
import com.clinicaalamillo.dto.patient.UpdateProfileRequest;
import com.clinicaalamillo.model.User;
import com.clinicaalamillo.repository.UserRepository;
import com.clinicaalamillo.service.AppointmentService;
import com.clinicaalamillo.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
@Tag(name = "Área de Paciente", description = "Datos propios del paciente autenticado")
@SecurityRequirement(name = "bearerAuth")
public class PatientController {

    private final PatientService patientService;
    private final UserRepository userRepository;
    private final AppointmentService appointmentService;

    @GetMapping("/me")
    @Operation(summary = "Perfil del paciente autenticado")
    public ResponseEntity<PatientProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(patientService.getProfile(resolveId(principal)));
    }

    @PutMapping("/me")
    @Operation(summary = "Actualiza nombre, teléfono y fecha de nacimiento propios")
    public ResponseEntity<PatientProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(patientService.updateProfile(resolveId(principal), req));
    }

    @GetMapping("/me/odontogram")
    @Operation(summary = "Odontograma propio (solo lectura)")
    public ResponseEntity<List<ToothRecordResponse>> getMyOdontogram(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(patientService.getMyOdontogram(resolveId(principal)));
    }

    @GetMapping("/me/treatments")
    @Operation(summary = "Historial de tratamientos propio")
    public ResponseEntity<List<TreatmentResponse>> getMyTreatments(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(patientService.getMyTreatments(resolveId(principal)));
    }

    @GetMapping("/me/appointments")
    @Operation(summary = "Mis citas (propias del paciente autenticado)")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(appointmentService.findByEmail(principal.getUsername()));
    }

    private Long resolveId(UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        return user.getId();
    }
}
