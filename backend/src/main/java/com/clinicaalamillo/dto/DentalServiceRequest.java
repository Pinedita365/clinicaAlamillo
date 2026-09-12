package com.clinicaalamillo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DentalServiceRequest {

    @NotBlank(message = "El nombre del servicio es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String name;

    @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
    private String description;

    @Size(max = 50)
    private String duration;

    @Size(max = 50)
    private String priceRange;

    @Size(max = 50)
    private String iconKey;

    private boolean active = true;
}
