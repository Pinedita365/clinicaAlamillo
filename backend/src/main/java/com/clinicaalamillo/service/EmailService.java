package com.clinicaalamillo.service;

import com.clinicaalamillo.model.Appointment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Envío de notificaciones email relacionadas con citas.
 *
 * <p>Las llamadas son asíncronas ({@code @Async}): un fallo de email nunca
 * bloquea ni revierte la operación de negocio. Deshabilitado por defecto
 * ({@code app.mail.enabled=false}) para entornos sin SMTP configurado.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.mail.enabled:false}")
    private boolean enabled;

    @Value("${app.clinic.name:Clínica Dental Alamillo}")
    private String clinicName;

    @Value("${app.clinic.phone:622 92 69 03}")
    private String clinicPhone;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("EEEE, d 'de' MMMM 'de' yyyy", Locale.of("es", "ES"));
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    // ── Confirmación de cita ──────────────────────────────────────────────────

    @Async
    public void sendConfirmation(Appointment appt) {
        if (!enabled) { log.debug("Email deshabilitado. Confirmar cita #{} omitido.", appt.getId()); return; }
        String subject = "✅ Cita confirmada en " + clinicName;
        String body = buildConfirmationHtml(appt);
        send(appt.getEmail(), subject, body);
    }

    @Async
    public void sendCancellation(Appointment appt) {
        if (!enabled) { log.debug("Email deshabilitado. Cancelación cita #{} omitida.", appt.getId()); return; }
        String subject = "❌ Cita cancelada – " + clinicName;
        String body = buildCancellationHtml(appt);
        send(appt.getEmail(), subject, body);
    }

    @Async
    public void sendInvitation(String email, String fullName, String activationUrl) {
        if (!enabled) {
            log.info("Email deshabilitado. URL activación para {} → {}", email, activationUrl);
            return;
        }
        String subject = "🦷 Activa tu cuenta en " + clinicName;
        send(email, subject, buildInvitationHtml(fullName, activationUrl));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void send(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, false, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("Email enviado a {} – {}", to, subject);
        } catch (MessagingException e) {
            log.warn("Error enviando email a {}: {}", to, e.getMessage());
        }
    }

    private String buildConfirmationHtml(Appointment appt) {
        String date = appt.getDate().format(DATE_FMT);
        String time = appt.getTime().format(TIME_FMT);
        return """
            <!DOCTYPE html>
            <html lang="es">
            <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
            <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
                <tr><td>
                  <table width="600" align="center" cellpadding="0" cellspacing="0"
                         style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
                    <!-- Header -->
                    <tr><td style="background:#0d9488;padding:28px 32px;text-align:center;">
                      <h1 style="color:#fff;margin:0;font-size:22px;">%s</h1>
                      <p style="color:#a7f3d0;margin:4px 0 0;font-size:14px;">Tu cita ha sido registrada</p>
                    </td></tr>
                    <!-- Body -->
                    <tr><td style="padding:32px;">
                      <p style="font-size:15px;color:#374151;">Hola <strong>%s</strong>,</p>
                      <p style="font-size:15px;color:#374151;">Tu solicitud de cita ha sido recibida correctamente. Aquí tienes los detalles:</p>
                      <!-- Detalles -->
                      <table width="100%%" cellpadding="0" cellspacing="0"
                             style="background:#f0fdf9;border-radius:12px;padding:20px;margin:20px 0;">
                        <tr>
                          <td style="padding:6px 0;font-size:14px;color:#6b7280;width:130px;">Servicio</td>
                          <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:600;">%s</td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;font-size:14px;color:#6b7280;">Fecha</td>
                          <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:600;">%s</td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;font-size:14px;color:#6b7280;">Hora</td>
                          <td style="padding:6px 0;font-size:14px;color:#0d9488;font-weight:700;font-size:18px;">%s</td>
                        </tr>
                      </table>
                      <p style="font-size:14px;color:#6b7280;">
                        Si necesitas cancelar o modificar tu cita, llámanos al
                        <strong style="color:#0d9488;">%s</strong> con al menos 24 horas de antelación.
                      </p>
                      <p style="font-size:14px;color:#6b7280;">¡Te esperamos!</p>
                      <p style="font-size:14px;color:#374151;">El equipo de <strong>%s</strong></p>
                    </td></tr>
                    <!-- Footer -->
                    <tr><td style="background:#f9fafb;padding:16px 32px;text-align:center;">
                      <p style="font-size:12px;color:#9ca3af;margin:0;">
                        Clínica Dental Alamillo · Sevilla · Este email es una confirmación automática.
                      </p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                clinicName,
                appt.getPatientName(),
                appt.getService(),
                date,
                time,
                clinicPhone,
                clinicName
        );
    }

    private String buildInvitationHtml(String fullName, String activationUrl) {
        return """
            <!DOCTYPE html>
            <html lang="es">
            <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
            <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
                <tr><td>
                  <table width="600" align="center" cellpadding="0" cellspacing="0"
                         style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
                    <tr><td style="background:#0d9488;padding:28px 32px;text-align:center;">
                      <h1 style="color:#fff;margin:0;font-size:22px;">%s</h1>
                      <p style="color:#a7f3d0;margin:4px 0 0;font-size:14px;">Activa tu cuenta de paciente</p>
                    </td></tr>
                    <tr><td style="padding:32px;">
                      <p style="font-size:15px;color:#374151;">Hola <strong>%s</strong>,</p>
                      <p style="font-size:15px;color:#374151;">
                        Tu dentista en <strong>%s</strong> te ha creado una cuenta en el portal de pacientes.
                        Haz clic en el botón para establecer tu contraseña y activar tu acceso.
                      </p>
                      <div style="text-align:center;margin:28px 0;">
                        <a href="%s" style="background:#0d9488;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;display:inline-block;">
                          Activar mi cuenta
                        </a>
                      </div>
                      <p style="font-size:13px;color:#9ca3af;text-align:center;">
                        Este enlace caduca en 48 horas. Si no lo solicitaste puedes ignorar este correo.
                      </p>
                      <p style="font-size:14px;color:#374151;">El equipo de <strong>%s</strong></p>
                    </td></tr>
                    <tr><td style="background:#f9fafb;padding:16px 32px;text-align:center;">
                      <p style="font-size:12px;color:#9ca3af;margin:0;">
                        Clínica Dental Alamillo · Sevilla · %s
                      </p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(clinicName, fullName, clinicName, activationUrl, clinicName, clinicPhone);
    }

    private String buildCancellationHtml(Appointment appt) {
        return """
            <!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/></head>
            <body style="font-family:Arial,sans-serif;background:#f4f4f5;padding:32px 16px;">
              <div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;padding:32px;">
                <h2 style="color:#dc2626;">Cita cancelada</h2>
                <p>Hola <strong>%s</strong>, tu cita del <strong>%s</strong> a las <strong>%s</strong>
                   ha sido cancelada.</p>
                <p>Llámanos al <strong style="color:#0d9488;">%s</strong> para concertar una nueva fecha.</p>
                <p>— <em>%s</em></p>
              </div>
            </body></html>
            """.formatted(
                appt.getPatientName(),
                appt.getDate().format(DATE_FMT),
                appt.getTime().format(TIME_FMT),
                clinicPhone,
                clinicName
        );
    }
}
