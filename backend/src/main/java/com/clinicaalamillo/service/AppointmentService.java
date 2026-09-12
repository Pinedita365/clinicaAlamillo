package com.clinicaalamillo.service;

import com.clinicaalamillo.dto.AppointmentRequest;
import com.clinicaalamillo.dto.AppointmentResponse;
import com.clinicaalamillo.model.Appointment;
import com.clinicaalamillo.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private static final List<String> ALL_SLOTS = List.of(
            "09:00","09:30","10:00","10:30","11:00","11:30",
            "12:00","12:30","16:00","16:30","17:00","17:30",
            "18:00","18:30","19:00","19:30"
    );

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;

    @Transactional
    public AppointmentResponse create(AppointmentRequest req) {
        LocalTime time = LocalTime.parse(req.getTime(), DateTimeFormatter.ofPattern("HH:mm"));

        if (appointmentRepository.existsByDateAndTimeAndStatusNot(req.getDate(), time, Appointment.AppointmentStatus.CANCELLED)) {
            throw new IllegalArgumentException("El horario " + req.getTime() + " del " + req.getDate() + " ya esta reservado.");
        }

        Appointment appt = Appointment.builder()
                .patientName(req.getPatientName())
                .phone(req.getPhone())
                .email(req.getEmail())
                .service(req.getService())
                .date(req.getDate())
                .time(time)
                .notes(req.getNotes())
                .build();

        appt = appointmentRepository.save(appt);
        emailService.sendConfirmation(appt);
        return toResponse(appt, "Cita registrada correctamente. Te confirmaremos por email.");
    }

    @Transactional(readOnly = true)
    public List<String> getAvailableSlots(LocalDate date) {
        List<LocalTime> booked = appointmentRepository.findBookedTimesByDate(date);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm");
        return ALL_SLOTS.stream()
                .filter(slot -> booked.stream().noneMatch(t -> t.format(fmt).equals(slot)))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> findAll() {
        return appointmentRepository.findAll().stream()
                .map(a -> toResponse(a, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> findByRange(LocalDate from, LocalDate to) {
        return appointmentRepository.findByDateRangeOrdered(from, to).stream()
                .map(a -> toResponse(a, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> findByEmail(String email) {
        return appointmentRepository.findByEmailOrderByDateDescTimeDesc(email).stream()
                .map(a -> toResponse(a, null))
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, Appointment.AppointmentStatus status) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Cita no encontrada: " + id));
        appt.setStatus(status);
        appt = appointmentRepository.save(appt);
        if (status == Appointment.AppointmentStatus.CANCELLED) {
            emailService.sendCancellation(appt);
        }
        return toResponse(appt, "Estado actualizado.");
    }

    private AppointmentResponse toResponse(Appointment a, String msg) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .patientName(a.getPatientName())
                .phone(a.getPhone())
                .email(a.getEmail())
                .service(a.getService())
                .date(a.getDate())
                .time(a.getTime())
                .notes(a.getNotes())
                .status(a.getStatus())
                .createdAt(a.getCreatedAt())
                .message(msg)
                .build();
    }
}
