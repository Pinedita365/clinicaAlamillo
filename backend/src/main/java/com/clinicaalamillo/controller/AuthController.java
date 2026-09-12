package com.clinicaalamillo.controller;

import com.clinicaalamillo.dto.auth.AcceptInviteRequest;
import com.clinicaalamillo.dto.auth.AuthResponse;
import com.clinicaalamillo.dto.auth.InviteValidateResponse;
import com.clinicaalamillo.dto.auth.LoginRequest;
import com.clinicaalamillo.dto.auth.RegisterRequest;
import com.clinicaalamillo.service.AuthService;
import com.clinicaalamillo.service.InvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Endpoints públicos de autenticación ({@code /api/auth/**}) y consulta de la
 * identidad actual ({@code /me}, requiere token).
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Registro, login JWT e identidad del usuario")
public class AuthController {

    private final AuthService authService;
    private final InvitationService invitationService;

    @PostMapping("/register")
    @Operation(summary = "Registro de paciente", description = "Crea una cuenta con rol PATIENT y devuelve un JWT.")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    @Operation(summary = "Inicio de sesión", description = "Valida credenciales y devuelve un JWT.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/invite/validate")
    @Operation(summary = "Valida un token de invitación y devuelve nombre y email del paciente")
    public ResponseEntity<InviteValidateResponse> validateInvite(@RequestParam String token) {
        return ResponseEntity.ok(invitationService.validate(token));
    }

    @PostMapping("/invite/accept")
    @Operation(summary = "Acepta la invitación: establece contraseña y crea la cuenta")
    public ResponseEntity<Map<String, String>> acceptInvite(@Valid @RequestBody AcceptInviteRequest req) {
        invitationService.accept(req);
        return ResponseEntity.ok(Map.of("message", "Cuenta activada correctamente. Ya puedes iniciar sesión."));
    }

    @GetMapping("/me")
    @Operation(summary = "Identidad actual", description = "Devuelve el email y roles del token presentado.")
    public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal UserDetails user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(Map.of(
                "email", user.getUsername(),
                "authorities", user.getAuthorities()
        ));
    }
}
