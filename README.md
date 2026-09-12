# Clínica Dental Alamillo — Guía de Usuario y Documentación Técnica

PWA full-stack para la **Clínica Dental Alamillo** (Sevilla).  
Frontend en **React 18 + Vite + Tailwind CSS + Framer Motion** · Backend en **Spring Boot 3 (Java 21) + MariaDB**.

---

## Índice

1. [Puesta en marcha](#1-puesta-en-marcha)
2. [Mapa de rutas](#2-mapa-de-rutas)
3. [Web pública](#3-web-pública)
4. [Panel de Administración — /gestion](#4-panel-de-administración--gestion)
5. [Autenticación — /login y /registro](#5-autenticación--login-y-registro)
6. [Portal del Paciente — /paciente](#6-portal-del-paciente--paciente)
7. [Dashboard Clínico — /clinica](#7-dashboard-clínico--clinica)
8. [Inventario — /inventario](#8-inventario--inventario)
9. [Agenda Kanban — /agenda](#9-agenda-kanban--agenda)
10. [Generación de PDF](#10-generación-de-pdf)
11. [Notificaciones por email](#11-notificaciones-por-email)
12. [Seguridad y privacidad](#12-seguridad-y-privacidad)
13. [API REST](#13-api-rest)
14. [Variables de entorno](#14-variables-de-entorno)
15. [Estructura del proyecto](#15-estructura-del-proyecto)
16. [SEO Local](#16-seo-local)
17. [Datos a actualizar antes del lanzamiento](#17-datos-a-actualizar-antes-del-lanzamiento)

---

## 1. Puesta en marcha

### Requisitos previos

| Herramienta | Versión mínima |
|-------------|----------------|
| Java (JDK)  | 21 LTS (probado con JDK 24) |
| Maven       | 3.9+           |
| Node.js     | 18 LTS         |
| npm         | 9+             |
| MariaDB     | 10.6+          |

La base de datos debe existir antes de arrancar:
```sql
CREATE DATABASE IF NOT EXISTS CAlamillo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Arrancar el backend

```bash
cd backend
mvn spring-boot:run
# Disponible en http://localhost:8080
# Swagger UI en http://localhost:8080/swagger-ui.html
```

### Arrancar el frontend

```bash
cd frontend
npm install
npm run dev
# Disponible en http://localhost:3000
```

Ambos servidores deben estar corriendo simultáneamente.

### Credenciales por defecto

| Rol | Email | Contraseña |
|-----|-------|------------|
| ADMIN (JWT) | `admin@clinicadentalalamillo.com` | `CambiaEstaClave2026!` |
| Panel legado `/gestion` | — | `alamillo2025` |

El usuario ADMIN se crea automáticamente al primer arranque si la tabla `users` está vacía (`DataInitializer`). En arranques posteriores no hace nada.

---

## 2. Mapa de rutas

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Web pública + formulario de cita | Todos |
| `/login` | Iniciar sesión JWT | Público |
| `/registro` | Crear cuenta de paciente | Público |
| `/gestion` | Panel de administración (contraseña simple) | Contraseña |
| `/paciente` | Portal del paciente | Autenticado |
| `/clinica` | Dashboard clínico + odontograma | DENTIST, ADMIN |
| `/inventario` | Gestión de inventario | DENTIST, ADMIN |
| `/agenda` | Agenda Kanban de citas | DENTIST, ADMIN |
| `/componentes` | Demo de componentes UI (desarrollo) | Público, noindex |
| `/swagger-ui.html` | Documentación API REST interactiva | Desarrollo |

---

## 3. Web pública

**URL:** `http://localhost:3000`

La portada es la cara visible de la clínica para cualquier visitante. No requiere cuenta.

### Pedir cita online
1. Clic en **"Pedir Cita"** en la cabecera o en la sección principal.
2. Rellenar el formulario: nombre, teléfono, email, servicio y fecha.
3. Los huecos horarios disponibles se cargan automáticamente al seleccionar la fecha — los ocupados no aparecen.
4. Enviar. La cita queda en estado **Pendiente** y el paciente recibe un email de confirmación si el servidor SMTP está configurado.

### Servicios
La sección de servicios muestra los tratamientos activos con precio y duración. El contenido se gestiona desde el panel de administración (pestaña Servicios).

---

## 4. Panel de Administración — `/gestion`

**URL:** `http://localhost:3000/gestion`  
**Contraseña:** `alamillo2025` (configurable en `.env` con `VITE_ADMIN_PASSWORD`)

Acceso con contraseña simple, sin necesidad de cuenta JWT. Pensado para el personal de recepción.

### Dashboard
- Tarjetas de resumen: total de citas, pendientes, confirmadas, citas de hoy, servicios activos, canceladas.
- Lista de las 5 próximas citas ordenadas por fecha y hora.

### Citas
- Tabla completa con buscador (nombre, email o servicio) y filtro por estado.
- Acciones por cita:
  - **Confirmar** — pasa de Pendiente a Confirmada.
  - **Completar** — pasa de Confirmada a Completada.
  - **Cancelar** — envía email de cancelación al paciente.
  - El icono 📝 muestra las notas de la cita al pasar el cursor.

### Servicios
- Lista editable de todos los tratamientos de la clínica.
- Edición inline: clic en ✏️ → modificar campos → 💾 Guardar.
- Solo los servicios **activos** aparecen en el formulario público de cita.
- **+ Nuevo servicio** para añadir tratamientos.
- 🗑️ elimina el servicio tras confirmación.

### Accesos directos a herramientas clínicas
En la barra superior aparecen tres botones (pantallas medianas y grandes):

- 🗓 **Agenda Kanban** → `/agenda`
- 🦷 **Odontograma** → `/clinica`
- 📦 **Inventario** → `/inventario`

Estas tres rutas requieren login JWT (ver sección 5).

---

## 5. Autenticación — `/login` y `/registro`

### Iniciar sesión — `/login`

Introduce email y contraseña. Según el rol, la app redirige automáticamente a:

- **PATIENT** → `/paciente`
- **DENTIST / ADMIN** → `/clinica`

El token JWT dura 24 horas y se almacena en el navegador (`localStorage`). Para cerrar sesión usar el botón **"Salir"** en la barra de navegación.

### Registrarse — `/registro`

Cualquier persona puede crear una cuenta. El rol asignado es siempre **PATIENT**. Tras el registro se inicia sesión automáticamente.

Para asignar rol DENTIST o ADMIN, ejecutar directamente en MariaDB:

```sql
UPDATE users SET role = 'DENTIST' WHERE email = 'dr.garcia@clinica.com';
UPDATE users SET role = 'ADMIN'   WHERE email = 'admin@clinica.com';
```

---

## 6. Portal del Paciente — `/paciente`

**Acceso:** Cualquier usuario autenticado (PATIENT, DENTIST, ADMIN).

### Resumen
Estadísticas personales: tratamientos totales, completados y en curso. Incluye una **mascota gamificada** con barra de XP que sube de nivel según los tratamientos completados (10 XP por tratamiento completado).

### Mi Odontograma
Vista de los 32 dientes permanentes y 20 dientes de leche en **notación FDI**. Solo lectura; el dentista es quien edita desde `/clinica`. Cada diente muestra su estado con un color identificativo:

| Color | Estado |
|-------|--------|
| Verde | Sano |
| Naranja | Caries |
| Azul | Obturado |
| Amarillo | Corona |
| Rojo | Extracción |
| Morado | Endodoncia |
| Teal | Implante |

### Tratamientos
Lista de todos los tratamientos registrados por el dentista con nombre, descripción, pieza FDI, coste y estado con badge de color.

**Descargar presupuesto PDF** — genera un PDF con todos los tratamientos no cancelados, cabecera de la clínica, tabla de costes y total acumulado.

### Perfil
Formulario editable: nombre completo, teléfono y fecha de nacimiento. El email no se puede modificar (es el identificador de la cuenta).

---

## 7. Dashboard Clínico — `/clinica`

**Acceso:** Solo DENTIST y ADMIN. Panel de trabajo sin la barra de navegación pública.

### Lista de pacientes (columna izquierda)
Buscador en tiempo real por nombre o email. Clic en un paciente para cargar su odontograma y tratamientos en el panel principal.

### Odontograma interactivo
- Vista completa de los 32 dientes permanentes (FDI 11–48) y 20 deciduos (FDI 51–85).
- **Clic en cualquier diente** → abre un formulario para registrar o actualizar:
  - **Estado:** Sano, Caries, Obturado, Corona, Endodoncia, Extracción, Implante, Fractura.
  - **Superficie:** Global, Oclusal, Vestibular, Lingual, Mesial, Distal.
  - **Notas:** texto libre.
- Si ya existe un registro para esa pieza y superficie, se actualiza (no duplica).

### Gestión de tratamientos
- Lista de tratamientos del paciente seleccionado.
- **Añadir tratamiento:** nombre, descripción, coste, estado inicial, pieza FDI asociada (opcional) y fecha.
- Cambiar estado: Planificado → En curso → Completado / Cancelado.
- Eliminar tratamiento.

---

## 8. Inventario — `/inventario`

**Acceso:** DENTIST y ADMIN. Solo ADMIN puede eliminar artículos.

- **Banner ámbar** en la parte superior si algún artículo está por debajo de su umbral mínimo de stock.
- Tabla con todos los artículos: nombre, cantidad actual, unidad, umbral mínimo y proveedor.
- Los artículos con stock bajo se resaltan en rojo.
- Botones **＋** y **−** en cada fila para ajustar stock unitariamente.
- ✏️ para editar todos los campos del artículo.
- **+ Nuevo artículo** abre un modal para dar de alta material.

---

## 9. Agenda Kanban — `/agenda`

**Acceso:** DENTIST y ADMIN. Vista de citas en tablero drag-and-drop.

### Columnas

| Columna | Color | Significado |
|---------|-------|-------------|
| Pendiente | Amarillo | Cita solicitada, sin confirmar |
| Confirmada | Teal | Cita confirmada con el paciente |
| Completada | Gris | Cita ya realizada |
| Cancelada | Rojo | Cita cancelada |

### Filtro de fechas
Selectores **Desde / Hasta** en la barra superior. Por defecto muestra los próximos 7 días. El botón de recarga fuerza una actualización manual.

### Drag & Drop
Arrastrar una tarjeta de una columna a otra cambia el estado de la cita en tiempo real. El cambio es inmediato en la interfaz y se sincroniza con el servidor. Si hay un error de red, la tarjeta vuelve a su posición original automáticamente.

Cada tarjeta muestra: nombre del paciente, servicio, fecha, hora y teléfono (clicable para llamar desde móvil).

---

## 10. Generación de PDF

El sistema genera presupuestos en PDF con:
- Cabecera con nombre, dirección, teléfono y CIF de la clínica.
- Datos del paciente (nombre, email, teléfono, número de paciente).
- Tabla de tratamientos: estado, pieza FDI y coste.
- Total acumulado.
- Nota legal de validez del presupuesto (30 días).

**Endpoints:**

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `GET /api/patient/me/pdf/budget` | PATIENT / ADMIN | El paciente descarga su propio presupuesto |
| `GET /api/clinical/patients/{id}/pdf/budget` | DENTIST / ADMIN | El dentista descarga el presupuesto de un paciente |

Los datos de la cabecera se configuran en `application.properties`:

```properties
app.clinic.name=Clínica Dental Alamillo
app.clinic.address=Calle Alamillo, XX · Sevilla
app.clinic.phone=622 92 69 03
app.clinic.cif=B-XXXXXXXX
```

---

## 11. Notificaciones por email

El sistema envía emails automáticos al paciente en dos situaciones:

- **Nueva cita** — email de confirmación con fecha, hora y servicio.
- **Cita cancelada** — email de cancelación con invitación a reagendar.

Por defecto está desactivado (`app.mail.enabled=false`). Para activarlo en producción:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=tucuenta@gmail.com
spring.mail.password=tu-app-password-de-gmail
app.mail.enabled=true
```

Los envíos son **asíncronos**: un fallo de email nunca bloquea ni revierte la operación de negocio.

---

## 12. Seguridad y privacidad

- Las contraseñas se almacenan como **hash BCrypt**, nunca en claro.
- Los campos médicos sensibles (DNI, notas clínicas) están **cifrados en reposo con AES-256-GCM** mediante una clave configurable en `HEALTH_ENCRYPTION_KEY`.
- Todos los accesos a datos de pacientes quedan registrados en un **log de auditoría** consultable en `GET /api/audit` (solo ADMIN), con filtros por actor, entidad y rango de fechas.
- Los tokens JWT expiran a las **24 horas**.
- Las claves de cifrado y el secreto JWT nunca deben almacenarse en el código fuente en producción; usar variables de entorno.

Generar claves seguras para producción:

```bash
openssl rand -base64 48   # JWT_SECRET
openssl rand -base64 32   # HEALTH_ENCRYPTION_KEY (AES-256)
```

---

## 13. API REST

Documentación interactiva disponible en `http://localhost:8080/swagger-ui.html`.

### Auth

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/api/auth/register` | Alta de paciente → devuelve JWT | No |
| `POST` | `/api/auth/login` | Login → devuelve JWT | No |
| `GET` | `/api/auth/me` | Identidad y rol del token | Sí |

### Citas

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/api/appointments` | Crear cita | No |
| `GET` | `/api/appointments` | Listar todas | Sí |
| `GET` | `/api/appointments/availability?date=` | Slots libres de una fecha | No |
| `GET` | `/api/appointments/range?from=&to=` | Citas en rango de fechas | DENTIST, ADMIN |
| `PATCH` | `/api/appointments/{id}/status?status=` | Cambiar estado | Sí |

### Clínico

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/clinical/patients` | Listar pacientes | DENTIST, ADMIN |
| `GET` | `/api/clinical/patients/{id}/odontogram` | Odontograma de un paciente | DENTIST, ADMIN |
| `PUT` | `/api/clinical/patients/{id}/odontogram` | Registrar/actualizar pieza | DENTIST, ADMIN |
| `DELETE` | `/api/clinical/tooth-records/{id}` | Eliminar registro de pieza | DENTIST, ADMIN |
| `GET` | `/api/clinical/patients/{id}/treatments` | Tratamientos de un paciente | DENTIST, ADMIN |
| `POST` | `/api/clinical/patients/{id}/treatments` | Añadir tratamiento | DENTIST, ADMIN |
| `PATCH` | `/api/clinical/treatments/{id}/status?status=` | Cambiar estado tratamiento | DENTIST, ADMIN |
| `DELETE` | `/api/clinical/treatments/{id}` | Eliminar tratamiento | DENTIST, ADMIN |
| `GET` | `/api/clinical/patients/{id}/pdf/budget` | Presupuesto PDF | DENTIST, ADMIN |

### Paciente (propio)

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/patient/me` | Perfil propio | PATIENT |
| `PUT` | `/api/patient/me` | Actualizar perfil | PATIENT |
| `GET` | `/api/patient/me/odontogram` | Odontograma propio | PATIENT |
| `GET` | `/api/patient/me/treatments` | Tratamientos propios | PATIENT |
| `GET` | `/api/patient/me/pdf/budget` | Presupuesto PDF propio | PATIENT |

### Inventario

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/inventory` | Listar todo | DENTIST, ADMIN |
| `GET` | `/api/inventory/low-stock` | Artículos bajo mínimo | DENTIST, ADMIN |
| `POST` | `/api/inventory` | Crear artículo | DENTIST, ADMIN |
| `PUT` | `/api/inventory/{id}` | Editar artículo | DENTIST, ADMIN |
| `PATCH` | `/api/inventory/{id}/stock?delta=N` | Ajustar stock | DENTIST, ADMIN |
| `DELETE` | `/api/inventory/{id}` | Eliminar artículo | ADMIN |

### Auditoría

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/audit?actor=&entity=&from=&to=&page=&size=` | Log de accesos | ADMIN |

### Uso del token JWT

```http
Authorization: Bearer <token>
```

---

## 14. Variables de entorno

### Backend

| Variable | Descripción | Obligatoria en prod |
|----------|-------------|:-------------------:|
| `JWT_SECRET` | Secreto de firma JWT (mínimo 32 caracteres) | ✅ |
| `JWT_EXPIRATION_MS` | Duración del token en ms (por defecto 86400000 = 24 h) | — |
| `HEALTH_ENCRYPTION_KEY` | Clave AES-256 en Base64 para cifrar campos médicos | ✅ |
| `ADMIN_EMAIL` | Email del administrador inicial | ✅ |
| `ADMIN_PASSWORD` | Contraseña del administrador inicial | ✅ |
| `MAIL_HOST` | Servidor SMTP | — |
| `MAIL_PORT` | Puerto SMTP (por defecto 587) | — |
| `MAIL_USERNAME` | Usuario SMTP | — |
| `MAIL_PASSWORD` | Contraseña SMTP | — |
| `MAIL_FROM` | Dirección remitente visible | — |
| `MAIL_ENABLED` | `true` para activar envío de emails | — |
| `CORS_ORIGINS` | Origen permitido (ej: `https://tudominio.com`) | ✅ |
| `CLINIC_NAME` | Nombre de la clínica en PDFs y emails | — |
| `CLINIC_ADDRESS` | Dirección en PDFs | — |
| `CLINIC_PHONE` | Teléfono en PDFs y emails | — |
| `CLINIC_CIF` | CIF en PDFs | — |

### Frontend

```env
# frontend/.env.local
VITE_API_URL=/api                        # URL base de la API (el proxy de Vite redirige /api → :8080)
VITE_ADMIN_PASSWORD=alamillo2025         # Contraseña del panel /gestion
```

---

## 15. Estructura del proyecto

```
Clinica_Alamillo/
├── frontend/
│   ├── public/
│   │   ├── manifest.json        # PWA manifest
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Hero.jsx
│       │   ├── Services.jsx
│       │   ├── BookingForm.jsx
│       │   ├── BookingCalendar.jsx
│       │   ├── OdontogramView.jsx
│       │   ├── GamifiedPet.jsx
│       │   ├── AccessibilityAlert.jsx
│       │   ├── ReviewCard.jsx
│       │   ├── Reviews.jsx
│       │   ├── Footer.jsx
│       │   └── CookieBanner.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── PatientPortal.jsx
│       │   ├── ClinicalDashboard.jsx
│       │   ├── InventoryPage.jsx
│       │   ├── KanbanAgenda.jsx
│       │   ├── Admin.jsx
│       │   ├── AvisoLegal.jsx
│       │   ├── PoliticaPrivacidad.jsx
│       │   └── PoliticaCookies.jsx
│       └── utils/
│           ├── api.js            # Cliente HTTP centralizado con JWT
│           └── auth.js           # AuthProvider + useAuth hook
│
└── backend/
    └── src/main/java/com/clinicaalamillo/
        ├── model/                # Entidades JPA
        │   ├── User.java         # Roles: ADMIN, DENTIST, PATIENT
        │   ├── Appointment.java
        │   ├── DentalService.java
        │   ├── ToothRecord.java  # Odontograma FDI
        │   ├── Treatment.java
        │   ├── InventoryItem.java
        │   └── AuditLog.java
        ├── security/
        │   ├── JwtFilter.java
        │   ├── JwtService.java
        │   ├── SecurityConfig.java
        │   └── crypto/
        │       └── EncryptedStringConverter.java  # AES-256-GCM
        ├── service/
        │   ├── AppointmentService.java
        │   ├── ClinicalService.java
        │   ├── InventoryService.java
        │   ├── PatientService.java
        │   ├── EmailService.java   # @Async, desactivado por defecto
        │   └── PdfService.java     # OpenPDF presupuestos
        └── controller/
            ├── AppointmentController.java
            ├── ClinicalController.java
            ├── InventoryController.java
            ├── PatientController.java
            ├── PdfController.java
            └── AuditController.java
```

---

## 16. SEO Local

### Palabras clave objetivo

| Tipo | Keywords |
|------|----------|
| Primarias | dentista Sevilla, clínica dental Sevilla |
| Long-tail | limpieza dental Sevilla precio, ortodoncia invisible Sevilla, implantes dentales Sevilla |
| Barrio | dentista Triana, clínica dental Los Remedios, dentista Nervión |
| Urgencias | dentista urgencias Sevilla, urgencias dentales Sevilla domingo |

### Checklist SEO

- [x] Schema.org `Dentist` con dirección, horarios, teléfono y `aggregateRating`
- [x] Meta `description` con keyword geolocalizada en cada página
- [x] `sitemap.xml` con todas las URLs
- [x] `robots.txt` configurado
- [x] Open Graph para redes sociales
- [ ] Google Business Profile — completar al 100%, subir fotos, responder reseñas
- [ ] Directorios locales: Páginas Amarillas, Doctoralia, Top Doctors
- [ ] Core Web Vitals — LCP < 2.5s, CLS < 0.1 (monitorizar con Search Console)

---

## 17. Datos a actualizar antes del lanzamiento

| Campo | Archivo(s) | Placeholder actual |
|-------|------------|-------------------|
| Dirección física | `Footer.jsx`, `AvisoLegal.jsx`, `index.html` | `Calle Alamillo, XX` |
| Teléfono | `Footer.jsx`, `Hero.jsx`, `index.html`, `application.properties` | `622 92 69 03` |
| Email contacto | `Footer.jsx`, `PoliticaPrivacidad.jsx` | `info@clinicadentalalamillo.com` |
| CIF | `Footer.jsx`, `AvisoLegal.jsx`, `application.properties` | `B-XXXXXXXX` |
| Registro Mercantil | `AvisoLegal.jsx` | `SE-XXXXX` |
| Dominio real | `sitemap.xml`, `robots.txt`, `index.html` | `clinicadentalalamillo.com` |
| Coordenadas GPS | `index.html` (Schema.org) | `37.3886 / -5.9823` |
| Contraseña ADMIN | Variable de entorno `ADMIN_PASSWORD` | `CambiaEstaClave2026!` |
| Contraseña panel `/gestion` | Variable de entorno `VITE_ADMIN_PASSWORD` | `alamillo2025` |
