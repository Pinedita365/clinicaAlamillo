package com.clinicaalamillo.security.crypto;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Cifra/descifra transparentemente campos de texto marcados con
 * {@code @Convert(converter = EncryptedStringConverter.class)}.
 *
 * <h3>Estrategia de cifrado de datos de salud en reposo</h3>
 * <ul>
 *   <li><b>Algoritmo:</b> AES-256 en modo GCM (cifrado autenticado: confidencialidad
 *       + integridad). Cada valor usa un IV aleatorio de 12 bytes.</li>
 *   <li><b>Formato almacenado:</b> Base64( IV(12) || ciphertext || tag(16) ). Así el
 *       IV viaja junto al dato y no se reutiliza nunca.</li>
 *   <li><b>Clave:</b> se inyecta por variable de entorno {@code HEALTH_ENCRYPTION_KEY}
 *       (32 bytes en Base64). NUNCA se versiona. En producción debe residir en un
 *       gestor de secretos (Vault, AWS KMS/Secrets Manager, Azure Key Vault).</li>
 *   <li><b>Alcance:</b> se aplica a campos de categoría especial (art. 9 RGPD): DNI,
 *       notas médicas, observaciones del odontograma, anamnesis.</li>
 * </ul>
 *
 * <p>Notas:</p>
 * <ul>
 *   <li>El cifrado es <b>no determinista</b> (IV aleatorio), por lo que estos campos
 *       no son directamente buscables con {@code WHERE campo = ?}. Es intencional:
 *       protege frente a inferencia. Para búsqueda usar índices sobre campos no
 *       sensibles o HMAC ciego (fase posterior).</li>
 *   <li>Complementa —no sustituye— al cifrado de disco/tablespace de la BD y a TLS
 *       en tránsito. Es defensa en profundidad frente a volcados de BD.</li>
 * </ul>
 */
@Component
@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int IV_LENGTH = 12;      // 96 bits, recomendado para GCM
    private static final int TAG_LENGTH_BITS = 128;

    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Clave AES en Base64 (32 bytes → AES-256). La mantenemos estática para que
     * Hibernate pueda instanciar el converter sin inyección; Spring rellena el
     * valor al arrancar mediante el setter anotado con {@link Value}.
     */
    private static SecretKeySpec keySpec;

    @Value("${app.security.health-encryption-key:}")
    public void setKey(String base64Key) {
        if (base64Key == null || base64Key.isBlank()) {
            // Sin clave configurada dejamos keySpec a null: fallará de forma explícita
            // en el primer acceso a un campo cifrado, evitando persistir datos en claro.
            keySpec = null;
            return;
        }
        byte[] raw = Base64.getDecoder().decode(base64Key.trim());
        if (raw.length != 16 && raw.length != 24 && raw.length != 32) {
            throw new IllegalStateException(
                    "HEALTH_ENCRYPTION_KEY inválida: se esperaban 16/24/32 bytes en Base64, se obtuvieron " + raw.length);
        }
        keySpec = new SecretKeySpec(raw, "AES");
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) return null;
        requireKey();
        try {
            byte[] iv = new byte[IV_LENGTH];
            RANDOM.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            byte[] cipherText = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));

            // IV || cipherText(+tag) → Base64
            byte[] out = new byte[iv.length + cipherText.length];
            System.arraycopy(iv, 0, out, 0, iv.length);
            System.arraycopy(cipherText, 0, out, iv.length, cipherText.length);
            return Base64.getEncoder().encodeToString(out);
        } catch (Exception e) {
            throw new IllegalStateException("Error cifrando dato sensible", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        requireKey();
        try {
            byte[] in = Base64.getDecoder().decode(dbData);
            byte[] iv = new byte[IV_LENGTH];
            System.arraycopy(in, 0, iv, 0, IV_LENGTH);

            byte[] cipherText = new byte[in.length - IV_LENGTH];
            System.arraycopy(in, IV_LENGTH, cipherText, 0, cipherText.length);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            return new String(cipher.doFinal(cipherText), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("Error descifrando dato sensible", e);
        }
    }

    private static void requireKey() {
        if (keySpec == null) {
            throw new IllegalStateException(
                    "Falta la clave de cifrado de datos de salud. Define la variable de entorno " +
                    "HEALTH_ENCRYPTION_KEY (32 bytes en Base64) antes de manejar datos clínicos.");
        }
    }
}
