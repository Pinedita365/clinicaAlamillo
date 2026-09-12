package com.clinicaalamillo.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AppointmentRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 120, message = "El nombre debe tener entre 2 y 120 caracteres")
    private String patientName;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^[6-9]\\d{8}$", message = "Teléfono no válido (9 dígitos, empieza por 6, 7, 8 o 9)")
    private String phone;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Email no válido")
    @Size(max = 150)
    private String email;

    @NotBlank(message = "El servicio es obligatorio")
    @Size(max = 80)
    private String service;

    @NotNull(message = "La fecha es obligatoria")
    @Future(message = "La fecha debe ser futura")
    private LocalDate date;

    @NotBlank(message = "La hora es obligatoria")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Formato de hora inválido (HH:mm)")
    private String time;

    @Size(max = 500, message = "Las notas no pueden superar los 500 caracteres")
    private String notes;
}
