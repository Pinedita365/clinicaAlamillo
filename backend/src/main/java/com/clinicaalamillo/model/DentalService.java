package com.clinicaalamillo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dental_services")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DentalService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String duration;

    @Column(length = 50)
    private String priceRange;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(length = 50)
    private String iconKey;
}
