package com.clinicaalamillo.config;

import com.clinicaalamillo.model.Role;
import com.clinicaalamillo.model.User;
import com.clinicaalamillo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Siembra un usuario administrador la primera vez que arranca la aplicación
 * (cuando aún no existe ningún usuario). Idempotente: en arranques posteriores
 * no hace nada. Las credenciales se toman de configuración/variables de entorno,
 * nunca hardcodeadas.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.security.admin-email}")
    private String adminEmail;

    @Value("${app.security.admin-password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // ya hay usuarios: no sembramos
        }

        User admin = User.builder()
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .fullName("Administrador Clínica Alamillo")
                .role(Role.ADMIN)
                .enabled(true)
                .build();
        userRepository.save(admin);

        log.info("──────────────────────────────────────────────");
        log.info("Usuario ADMIN inicial creado: {}", adminEmail);
        log.info("Cambia la contraseña por defecto tras el primer acceso.");
        log.info("──────────────────────────────────────────────");
    }
}
