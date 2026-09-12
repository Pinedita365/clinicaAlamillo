package com.clinicaalamillo.dto.patient;

import com.clinicaalamillo.model.Role;
import com.clinicaalamillo.model.User;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PatientProfileResponse(
        Long id,
        String email,
        String fullName,
        String phone,
        Role role,
        LocalDate birthDate,
        LocalDateTime createdAt
) {
    public static PatientProfileResponse from(User u) {
        return new PatientProfileResponse(
                u.getId(),
                u.getEmail(),
                u.getFullName(),
                u.getPhone(),
                u.getRole(),
                u.getBirthDate(),
                u.getCreatedAt()
        );
    }
}
