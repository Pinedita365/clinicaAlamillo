package com.clinicaalamillo.controller;

import com.clinicaalamillo.dto.AppointmentRequest;
import com.clinicaalamillo.dto.AppointmentResponse;
import com.clinicaalamillo.model.Appointment.AppointmentStatus;
import com.clinicaalamillo.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Citas", description = "Gestión de citas dentales")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @Operation(
        summary = "Crear una nueva cita",
        description = "Registra la solicitud de cita de un paciente. Devuelve confirmación con ID.",
        responses = {
            @ApiResponse(responseCode = "201", description = "Cita creada correctamente",
                content = @Content(schema = @Schema(implementation = AppointmentResponse.class))),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o horario ya ocupado"),
            @ApiResponse(responseCode = "409", description = "Conflicto: horario no disponible")
        }
    )
    public ResponseEntity<AppointmentResponse> create(@Valid @RequestBody AppointmentRequest request) {
        AppointmentResponse response = appointmentService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/availability")
    @Operation(
        summary = "Consultar disponibilidad horaria",
        description = "Devuelve los slots libres (HH:mm) para una fecha concreta.",
        parameters = @Parameter(name = "date", description = "Fecha en formato YYYY-MM-DD", required = true, example = "2026-07-15")
    )
    public ResponseEntity<Map<String, Object>> getAvailability(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<String> slots = appointmentService.getAvailableSlots(date);
        return ResponseEntity.ok(Map.of("date", date.toString(), "availableSlots", slots));
    }

    @GetMapping
    @Operation(summary = "Listar todas las citas", description = "Endpoint administrativo. Requiere autenticación en producción.")
    public ResponseEntity<List<AppointmentResponse>> findAll() {
        return ResponseEntity.ok(appointmentService.findAll());
    }

    @GetMapping("/range")
    @Operation(summary = "Citas en rango de fechas", description = "Para la agenda Kanban. Solo dentistas y admins.")
    public ResponseEntity<List<AppointmentResponse>> findByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(appointmentService.findByRange(from, to));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Actualizar estado de una cita", description = "Confirma, cancela o marca como completada una cita.")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, status));
    }

    @GetMapping("/by-email")
    @Operation(summary = "Citas de un paciente por email", description = "Devuelve las citas asociadas a un email. Solo dentistas y admins.")
    public ResponseEntity<List<AppointmentResponse>> findByEmail(@RequestParam String email) {
        return ResponseEntity.ok(appointmentService.findByEmail(email));
    }
}
