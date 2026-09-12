package com.clinicaalamillo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync // habilita la escritura asíncrona de auditoría (AuditService)
public class ClinicaAlamillo {
    public static void main(String[] args) {
        SpringApplication.run(ClinicaAlamillo.class, args);
    }
}
