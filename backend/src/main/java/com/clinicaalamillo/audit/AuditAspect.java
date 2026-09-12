package com.clinicaalamillo.audit;

import com.clinicaalamillo.model.AuditLog;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Intercepta todos los métodos anotados con {@link Audited} y registra una
 * entrada de auditoría con el actor autenticado, la acción, el recurso, la IP y
 * el resultado (OK/ERROR). Es transversal: cualquier acceso a datos médicos
 * marcado queda trazado sin ensuciar la lógica de negocio.
 */
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditService auditService;

    @Around("@annotation(audited)")
    public Object audit(ProceedingJoinPoint pjp, Audited audited) throws Throwable {
        String result = "OK";
        try {
            return pjp.proceed();
        } catch (Throwable ex) {
            result = "ERROR: " + ex.getClass().getSimpleName();
            throw ex;
        } finally {
            auditService.record(buildEntry(pjp, audited, result));
        }
    }

    private AuditLog buildEntry(ProceedingJoinPoint pjp, Audited audited, String result) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String actor = (auth != null && auth.isAuthenticated()) ? auth.getName() : "anonymous";
        String role = (auth != null && auth.getAuthorities() != null)
                ? auth.getAuthorities().stream()
                    .map(Object::toString).collect(Collectors.joining(","))
                : null;

        // Primer argumento como identificador del recurso (convención: id del paciente/recurso)
        Object[] args = pjp.getArgs();
        String entityId = (args != null && args.length > 0 && args[0] != null)
                ? String.valueOf(args[0]) : null;

        return AuditLog.builder()
                .actorEmail(actor)
                .actorRole(role)
                .action(audited.action())
                .entityType(audited.entity())
                .entityId(entityId)
                .ipAddress(currentIp())
                .detail(pjp.getSignature().toShortString() + " → " + result
                        + argsPreview(args))
                .build();
    }

    private String argsPreview(Object[] args) {
        if (args == null || args.length == 0) return "";
        // No volcamos datos sensibles: solo tipos y aridad
        return " [args=" + Arrays.stream(args)
                .map(a -> a == null ? "null" : a.getClass().getSimpleName())
                .collect(Collectors.joining(",")) + "]";
    }

    private String currentIp() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return null;
            HttpServletRequest req = attrs.getRequest();
            String forwarded = req.getHeader("X-Forwarded-For");
            return (forwarded != null && !forwarded.isBlank())
                    ? forwarded.split(",")[0].trim()
                    : req.getRemoteAddr();
        } catch (Exception e) {
            return null;
        }
    }
}
