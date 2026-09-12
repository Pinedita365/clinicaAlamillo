package com.clinicaalamillo.dto;

import com.clinicaalamillo.model.Appointment.AppointmentStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class AppointmentResponse {
    private Long id;
    private String patientName;
    private String phone;
    private String email;
    private String service;
    private LocalDate date;
    private LocalTime time;
    private String notes;
    private AppointmentStatus status;
    private LocalDateTime createdAt;
    private String message;
}
