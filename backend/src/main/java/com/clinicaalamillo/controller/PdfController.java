package com.clinicaalamillo.controller;

import com.clinicaalamillo.model.User;
import com.clinicaalamillo.repository.UserRepository;
import com.clinicaalamillo.service.PdfService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PdfController {

    private final PdfService pdfService;
    private final UserRepository userRepository;

    /** Presupuesto de un paciente — solo dentistas y admins */
    @GetMapping(value = "/clinical/patients/{patientId}/pdf/budget",
                produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('DENTIST', 'ADMIN')")
    public ResponseEntity<byte[]> getPatientBudgetPdf(@PathVariable Long patientId) {
        byte[] pdf = pdfService.generateBudget(patientId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"presupuesto-paciente-" + patientId + ".pdf\"")
                .body(pdf);
    }

    /** El paciente descarga su propio presupuesto */
    @GetMapping(value = "/patient/me/pdf/budget",
                produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('PATIENT', 'DENTIST', 'ADMIN')")
    public ResponseEntity<byte[]> getMyBudgetPdf(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        byte[] pdf = pdfService.generateBudget(user.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"presupuesto.pdf\"")
                .body(pdf);
    }

    // ── Facturas ─────────────────────────────────────────────────────────────

    /** El dentista/admin genera la factura de un paciente */
    @GetMapping(value = "/clinical/patients/{patientId}/pdf/invoice",
                produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('DENTIST', 'ADMIN')")
    public ResponseEntity<byte[]> getPatientInvoicePdf(@PathVariable Long patientId) {
        byte[] pdf = pdfService.generateInvoice(patientId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"factura-paciente-" + patientId + ".pdf\"")
                .body(pdf);
    }

    /** El paciente genera su propia factura */
    @GetMapping(value = "/patient/me/pdf/invoice",
                produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('PATIENT', 'DENTIST', 'ADMIN')")
    public ResponseEntity<byte[]> getMyInvoicePdf(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        byte[] pdf = pdfService.generateInvoice(user.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"factura.pdf\"")
                .body(pdf);
    }
}
