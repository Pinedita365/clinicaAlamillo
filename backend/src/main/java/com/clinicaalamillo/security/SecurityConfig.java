package com.clinicaalamillo.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configuración central de seguridad.
 *
 * <h3>Filosofía (Fase 1 – no romper lo existente)</h3>
 * <ul>
 *   <li>API <b>stateless</b> (sin sesión); la identidad viaja en el JWT.</li>
 *   <li>Se <b>permiten</b> los endpoints ya en producción (landing/citas/servicios
 *       y el panel actual basado en contraseña) para no interrumpir el servicio.</li>
 *   <li>Se <b>protege</b> por rol todo lo nuevo bajo {@code /api/clinical/**},
 *       {@code /api/inventory/**}, {@code /api/patient/**}, {@code /api/audit/**}.</li>
 *   <li>{@code @EnableMethodSecurity} habilita {@code @PreAuthorize} para control
 *       fino a nivel de método en fases posteriores.</li>
 * </ul>
 *
 * <p><b>Migración prevista (fase posterior):</b> mover el panel de gestión a JWT y
 * endurecer las reglas de {@code /api/appointments} y {@code /api/services} para
 * exigir {@code ROLE_ADMIN}/{@code ROLE_DENTIST}.</p>
 */
@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // API stateless con JWT: CSRF no aplica
            .cors(cors -> {}) // usa el CorsConfigurationSource/WebMvc CORS existente
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Preflight CORS: siempre permitido (no lleva credenciales).
                // Los headers CORS los inyecta el CorsFilter (config/CorsConfig).
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // ── Público ────────────────────────────────────────────────
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/appointments").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/appointments/availability").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/services", "/api/services/all").permitAll()
                // Documentación y salud
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/api-docs/**",
                                 "/v3/api-docs/**", "/actuator/health").permitAll()

                // ── Compatibilidad panel actual (se migrará a JWT) ─────────
                // El panel legacy usa contraseña en el frontend; mantenemos abiertos
                // sus endpoints hasta completar la migración a autenticación JWT.
                .requestMatchers("/api/appointments/**", "/api/services/**").permitAll()

                // ── Nuevo: protegido por rol ───────────────────────────────
                .requestMatchers("/api/patient/**").hasAnyRole("PATIENT", "DENTIST", "ADMIN")
                .requestMatchers("/api/clinical/**").hasAnyRole("DENTIST", "ADMIN")
                .requestMatchers("/api/inventory/**").hasAnyRole("DENTIST", "ADMIN")
                .requestMatchers("/api/audit/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // El resto requiere autenticación
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
