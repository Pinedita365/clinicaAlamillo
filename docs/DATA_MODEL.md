# Modelo de datos, arquitectura y seguridad — Clínica Dental Alamillo

> Fase 1 (Cimientos). Documenta el modelo relacional, la arquitectura de carpetas
> del proyecto híbrido (React SPA + API Spring Boot) y la estrategia de seguridad
> y privacidad (cifrado de datos de salud en reposo + audit logs).

---

## 1. Modelo de datos relacional

Motor objetivo: **MariaDB 10.6+** (compatible MySQL). El esquema lo genera
Hibernate (`ddl-auto=update`) a partir de las entidades JPA; el DDL de referencia
que sigue documenta la intención (tipos y relaciones).

### 1.1 Diagrama de relaciones

```
                 ┌─────────────────┐
                 │      users      │  (Admin / Dentista / Paciente)
                 │─────────────────│
                 │ id (PK)         │
                 │ email (UQ)      │
                 │ password_hash   │
                 │ full_name       │
                 │ role            │  ENUM(ADMIN,DENTIST,PATIENT)
                 │ national_id 🔒  │  cifrado AES-GCM
                 │ medical_notes 🔒│  cifrado AES-GCM
                 └───────┬─────────┘
        ┌────────────────┼───────────────────────────┐
        │ patient_id     │ dentist_id                 │ patient_id
        ▼                ▼                            ▼
┌──────────────┐  ┌──────────────────┐        ┌──────────────────┐
│ tooth_records│  │    treatments    │        │   appointments   │ (ya existía)
│──────────────│  │──────────────────│        │──────────────────│
│ id (PK)      │  │ id (PK)          │        │ id (PK)          │
│ patient_id FK│  │ patient_id  FK   │        │ patient_name     │
│ dentist_id FK│  │ dentist_id  FK   │        │ service          │
│ tooth_number │  │ tooth_record_id FK──┐     │ date / time      │
│ surface      │  │ name / cost      │  │     │ status           │
│ condition    │  │ status           │  │     └──────────────────┘
│ notes 🔒     │  │ performed_at     │  │
└──────┬───────┘  └──────────────────┘  │
       └─────────────◄──────────────────┘  (treatment → pieza opcional)

┌──────────────────┐     ┌──────────────────┐
│ inventory_items  │     │   audit_logs     │  (append-only)
│──────────────────│     │──────────────────│
│ id (PK)          │     │ id (PK)          │
│ name / sku (UQ)  │     │ actor_email      │
│ quantity         │     │ action           │
│ low_stock_thresh │     │ entity_type/id   │
│ unit_cost        │     │ ip_address       │
└──────────────────┘     │ timestamp        │
                         └──────────────────┘
```

🔒 = campo de categoría especial (art. 9 RGPD) cifrado en reposo.

### 1.2 Entidades

| Entidad          | Tabla              | Rol en el dominio                                             |
|------------------|--------------------|--------------------------------------------------------------|
| `User`           | `users`            | Usuario con rol; para pacientes guarda datos clínicos base.  |
| `ToothRecord`    | `tooth_records`    | Pieza del **odontograma** (FDI) con patología/superficie.    |
| `Treatment`      | `treatments`       | Tratamiento aplicado/planificado; base de historial y facturación. |
| `InventoryItem`  | `inventory_items`  | Stock con umbral de alerta (`isLowStock()`).                 |
| `AuditLog`       | `audit_logs`       | Traza inmutable de acceso a datos médicos.                   |
| `Appointment`    | `appointments`     | Cita (módulo ya existente).                                  |
| `DentalService`  | `dental_services`  | Catálogo de servicios (módulo ya existente).                 |

### 1.3 DDL de referencia (MariaDB)

```sql
CREATE TABLE users (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  email          VARCHAR(150) NOT NULL UNIQUE,
  password_hash  VARCHAR(100) NOT NULL,          -- BCrypt
  full_name      VARCHAR(120) NOT NULL,
  phone          VARCHAR(20),
  role           VARCHAR(20)  NOT NULL DEFAULT 'PATIENT',
  national_id    VARCHAR(512),                   -- AES-GCM (Base64)
  birth_date     DATE,
  medical_notes  TEXT,                           -- AES-GCM (Base64)
  enabled        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     DATETIME NOT NULL,
  updated_at     DATETIME NOT NULL
);

CREATE TABLE tooth_records (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  patient_id   BIGINT NOT NULL,
  dentist_id   BIGINT,
  tooth_number INT NOT NULL,                      -- FDI: 11–48 / 51–85
  surface        VARCHAR(12) NOT NULL DEFAULT 'WHOLE',
  tooth_condition VARCHAR(20) NOT NULL DEFAULT 'HEALTHY',  -- 'condition' es reservada en MariaDB
  notes        TEXT,                              -- AES-GCM
  updated_at   DATETIME NOT NULL,
  CONSTRAINT fk_tooth_patient FOREIGN KEY (patient_id) REFERENCES users(id),
  CONSTRAINT fk_tooth_dentist FOREIGN KEY (dentist_id) REFERENCES users(id),
  CONSTRAINT uk_tooth UNIQUE (patient_id, tooth_number, surface)
);

CREATE TABLE treatments (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  patient_id      BIGINT NOT NULL,
  dentist_id      BIGINT,
  tooth_record_id BIGINT,
  name            VARCHAR(120) NOT NULL,
  description     TEXT,
  cost            DECIMAL(10,2),
  status          VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
  performed_at    DATE,
  created_at      DATETIME NOT NULL,
  CONSTRAINT fk_treat_patient FOREIGN KEY (patient_id) REFERENCES users(id),
  CONSTRAINT fk_treat_dentist FOREIGN KEY (dentist_id) REFERENCES users(id),
  CONSTRAINT fk_treat_tooth   FOREIGN KEY (tooth_record_id) REFERENCES tooth_records(id)
);

CREATE TABLE inventory_items (
  id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(120) NOT NULL,
  sku                 VARCHAR(60) UNIQUE,
  category            VARCHAR(60),
  quantity            INT NOT NULL DEFAULT 0,
  unit                VARCHAR(20) DEFAULT 'uds',
  low_stock_threshold INT NOT NULL DEFAULT 5,
  unit_cost           DECIMAL(10,2),
  supplier            VARCHAR(120),
  updated_at          DATETIME NOT NULL
);

CREATE TABLE audit_logs (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_email VARCHAR(150) NOT NULL,
  actor_role  VARCHAR(20),
  action      VARCHAR(30) NOT NULL,
  entity_type VARCHAR(60),
  entity_id   VARCHAR(60),
  ip_address  VARCHAR(45),
  detail      VARCHAR(500),
  event_time  DATETIME NOT NULL,               -- 'timestamp' es reservada en MariaDB
  INDEX idx_audit_actor (actor_email),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_timestamp (event_time)
);
```

> Nota PostgreSQL: si se migra a PostgreSQL, `national_id`/`medical_notes` pueden
> apoyarse en `pgcrypto`, y los `ENUM` en tipos `VARCHAR` + `CHECK` o tipos ENUM
> nativos. El cifrado a nivel de aplicación (sección 3) es agnóstico del motor.

---

## 2. Arquitectura de carpetas (proyecto híbrido)

```
Clinica_Alamillo/
├── backend/                       # API REST — Spring Boot 3 (Java 21)
│   └── src/main/java/com/clinicaalamillo/
│       ├── ClinicaAlamillo.java   # @SpringBootApplication (@EnableAsync)
│       ├── audit/                 # Auditoría transversal
│       │   ├── Audited.java        (anotación)
│       │   ├── AuditAspect.java    (intercepta @Audited)
│       │   └── AuditService.java   (persistencia async)
│       ├── config/                # CORS, OpenAPI, errores, seed
│       │   ├── CorsConfig, OpenApiConfig, GlobalExceptionHandler
│       │   └── DataInitializer.java (admin inicial)
│       ├── controller/            # REST controllers (Auth, Appointment, Service)
│       ├── dto/                   # DTOs de request/response
│       │   └── auth/               (LoginRequest, RegisterRequest, AuthResponse)
│       ├── model/                 # Entidades JPA (User, ToothRecord, ...)
│       ├── repository/            # Spring Data JPA
│       ├── security/              # Spring Security + JWT
│       │   ├── SecurityConfig, JwtService, JwtAuthenticationFilter
│       │   ├── CustomUserDetailsService
│       │   └── crypto/EncryptedStringConverter.java
│       └── service/               # Lógica de negocio (Auth, Appointment, ...)
│
├── frontend/                      # SPA — React 18 + Vite + Tailwind
│   └── src/
│       ├── components/            # Hero, BookingForm, OdontogramView,
│       │                          # BookingCalendar, GamifiedPet, AccessibilityAlert...
│       ├── pages/                 # Home, Admin, ComponentsDemo, legales
│       ├── hooks/ · utils/        # useInView, api.js
│       └── main.jsx · App.jsx
│
├── docs/                          # Documentación (este archivo)
└── README.md
```

Separación de responsabilidades: el **frontend** consume el API vía `utils/api.js`
(base configurable con `VITE_API_URL`); el **backend** expone JSON y no sirve la SPA
(despliegues independientes, CORS controlado por `CORS_ORIGINS`).

---

## 3. Seguridad y privacidad

### 3.1 Autenticación y autorización (roles)
- **Spring Security + JWT (HS256)**, API *stateless*. El token lleva `sub` (email)
  y `role`; se valida en `JwtAuthenticationFilter` en cada petición.
- Roles → autoridades: `ROLE_ADMIN`, `ROLE_DENTIST`, `ROLE_PATIENT`.
- Reglas en `SecurityConfig`:
  - Público: `/api/auth/**`, alta de cita, disponibilidad, catálogo de servicios, Swagger.
  - Protegido por rol: `/api/patient/**`, `/api/clinical/**`, `/api/inventory/**`,
    `/api/audit/**` (solo ADMIN), `/api/admin/**` (solo ADMIN).
  - `@EnableMethodSecurity` habilita `@PreAuthorize` para control fino por método.
- Contraseñas con **BCrypt** (`PasswordEncoder`); nunca en claro.

> Compatibilidad Fase 1: los endpoints ya en producción (`/api/appointments`,
> `/api/services` y el panel actual por contraseña) se mantienen abiertos para no
> interrumpir el servicio. Migrarlos a JWT es tarea de una fase posterior.

### 3.2 Cifrado de datos de salud **en reposo**
- Cifrado **a nivel de campo** con `EncryptedStringConverter` (JPA `AttributeConverter`):
  **AES-256-GCM** (cifrado autenticado), IV aleatorio de 12 bytes por valor,
  formato `Base64(IV || ciphertext || tag)`.
- Se aplica a: `User.nationalId`, `User.medicalNotes`, `ToothRecord.notes`
  (ampliable a anamnesis y cualquier campo art. 9 RGPD).
- **Clave** en `HEALTH_ENCRYPTION_KEY` (32 bytes Base64), inyectada por entorno y
  custodiada en un gestor de secretos (Vault/KMS). Sin clave → fallo explícito
  (nunca se persiste en claro).
- Defensa en profundidad: complementa cifrado de disco/tablespace de la BD y **TLS**
  en tránsito. El cifrado no determinista impide búsquedas directas por estos campos
  (intencional; para búsqueda usar HMAC ciego en fase posterior).

### 3.3 Trazabilidad — Audit Logs
- Anotar métodos que acceden a datos médicos con `@Audited(action, entity)`.
- `AuditAspect` registra actor (email + rol), acción, recurso, IP y resultado en
  `audit_logs`, de forma **asíncrona** y en transacción independiente
  (`REQUIRES_NEW`): auditar nunca revierte ni ralentiza la operación de negocio.
- Tabla **append-only**: la app solo inserta; la retención se gestiona en BD.
  Cumple la obligación de trazabilidad de acceso a categorías especiales (RGPD/LOPDGDD).

### 3.4 Variables de entorno de seguridad

| Variable                 | Descripción                                   | Obligatoria en prod |
|--------------------------|-----------------------------------------------|:-------------------:|
| `JWT_SECRET`             | Secreto HS256, ≥ 32 bytes                     | ✅ |
| `JWT_EXPIRATION_MS`      | Vigencia del token (def. 86400000 = 24 h)     | — |
| `HEALTH_ENCRYPTION_KEY`  | Clave AES-256 (32 bytes Base64)               | ✅ |
| `ADMIN_EMAIL`            | Email del admin inicial (seed)                | ✅ |
| `ADMIN_PASSWORD`         | Contraseña del admin inicial (seed)           | ✅ |
| `CORS_ORIGINS`           | Orígenes permitidos (CSV)                     | ✅ |

Generar valores seguros:
```bash
# JWT_SECRET (48 bytes → Base64)
openssl rand -base64 48
# HEALTH_ENCRYPTION_KEY (32 bytes → Base64, AES-256)
openssl rand -base64 32
```
