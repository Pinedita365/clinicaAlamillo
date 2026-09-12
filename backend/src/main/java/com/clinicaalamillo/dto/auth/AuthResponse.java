package com.clinicaalamillo.dto.auth;

/** Respuesta de autenticación: token JWT + datos públicos del usuario. */
public record AuthResponse(
        String token,
        String tokenType,
        long expiresInMs,
        String email,
        String fullName,
        String role
) {
    public static AuthResponse of(String token, long expiresInMs, String email, String fullName, String role) {
        return new AuthResponse(token, "Bearer", expiresInMs, email, fullName, role);
    }
}
