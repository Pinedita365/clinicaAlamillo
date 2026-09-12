package com.clinicaalamillo.service;

import com.clinicaalamillo.dto.auth.AuthResponse;
import com.clinicaalamillo.dto.auth.LoginRequest;
import com.clinicaalamillo.dto.auth.RegisterRequest;
import com.clinicaalamillo.model.Role;
import com.clinicaalamillo.model.User;
import com.clinicaalamillo.repository.UserRepository;
import com.clinicaalamillo.security.CustomUserDetailsService;
import com.clinicaalamillo.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Casos de uso de autenticación: registro de paciente e inicio de sesión.
 * Delega el hashing en {@link PasswordEncoder} (BCrypt) y la emisión de tokens
 * en {@link JwtService}.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    /** Registro público → siempre rol PATIENT. */
    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese email.");
        }

        User user = User.builder()
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .phone(req.phone())
                .role(Role.PATIENT)
                .enabled(true)
                .build();
        userRepository.save(user);

        return buildToken(user.getEmail(), user.getFullName(), user.getRole().name());
    }

    /** Inicio de sesión: valida credenciales y emite JWT. */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        // Lanza BadCredentialsException (→ 401 vía handler) si no cuadran
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));

        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales no válidas."));

        return buildToken(user.getEmail(), user.getFullName(), user.getRole().name());
    }

    private AuthResponse buildToken(String email, String fullName, String role) {
        UserDetails details = userDetailsService.loadUserByUsername(email);
        String token = jwtService.generateToken(details, role);
        return AuthResponse.of(token, jwtService.getExpirationMs(), email, fullName, role);
    }
}
