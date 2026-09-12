package com.clinicaalamillo.service;

import com.clinicaalamillo.dto.auth.AcceptInviteRequest;
import com.clinicaalamillo.dto.auth.InviteValidateResponse;
import com.clinicaalamillo.model.PatientInvitation;
import com.clinicaalamillo.model.Role;
import com.clinicaalamillo.model.User;
import com.clinicaalamillo.repository.PatientInvitationRepository;
import com.clinicaalamillo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final PatientInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Transactional
    public void createInvitation(String email, String fullName) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Ya existe un paciente registrado con ese email.");
        }
        String token = UUID.randomUUID().toString().replace("-", "");
        PatientInvitation invitation = PatientInvitation.builder()
                .email(email)
                .fullName(fullName)
                .token(token)
                .expiresAt(LocalDateTime.now().plusHours(48))
                .used(false)
                .build();
        invitationRepository.save(invitation);
        String activationUrl = frontendUrl + "/activar-cuenta?token=" + token;
        emailService.sendInvitation(email, fullName, activationUrl);
    }

    @Transactional(readOnly = true)
    public InviteValidateResponse validate(String token) {
        PatientInvitation inv = invitationRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Enlace de invitación no válido."));
        if (inv.isUsed()) {
            throw new IllegalArgumentException("Este enlace ya fue utilizado.");
        }
        if (inv.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("El enlace de invitación ha caducado (48 h).");
        }
        return new InviteValidateResponse(inv.getEmail(), inv.getFullName());
    }

    @Transactional
    public void accept(AcceptInviteRequest req) {
        PatientInvitation inv = invitationRepository.findByToken(req.token())
                .orElseThrow(() -> new IllegalArgumentException("Enlace de invitación no válido."));
        if (inv.isUsed()) {
            throw new IllegalArgumentException("Este enlace ya fue utilizado.");
        }
        if (inv.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("El enlace de invitación ha caducado.");
        }
        if (userRepository.existsByEmail(inv.getEmail())) {
            throw new IllegalArgumentException("Ya existe una cuenta con ese email.");
        }
        User user = User.builder()
                .email(inv.getEmail())
                .fullName(inv.getFullName())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(Role.PATIENT)
                .enabled(true)
                .build();
        userRepository.save(user);
        inv.setUsed(true);
        invitationRepository.save(inv);
    }
}
