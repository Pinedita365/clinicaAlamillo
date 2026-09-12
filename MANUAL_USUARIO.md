# Manual de Usuario — Clínica Dental Alamillo

Este manual explica cómo utilizar el programa paso a paso. Está dirigido al personal de la clínica y a los pacientes, sin necesidad de conocimientos técnicos.

---

## ¿Qué puedo hacer según mi perfil?

| Soy... | Puedo... |
|--------|----------|
| **Visitante** (sin cuenta) | Ver la web, consultar servicios y pedir cita online |
| **Paciente** (con cuenta) | Ver mi odontograma, mis tratamientos, descargar presupuesto y factura |
| **Dentista** | Todo lo anterior + gestionar odontogramas, tratamientos e inventario |
| **Administrador** | Todo lo anterior + ver auditoría, gestionar servicios y el panel completo |

---

## PARTE 1 — Para pacientes sin cuenta

### Cómo pedir una cita online

1. Entra en la página principal de la clínica.
2. Haz clic en el botón **"Pedir Cita"** (aparece en la cabecera y en la sección principal).
3. Se abre el formulario de cita. Rellena los campos:
   - **Nombre completo** — tu nombre y apellidos.
   - **Teléfono** — número de contacto.
   - **Email** — recibirás aquí la confirmación.
   - **Servicio** — elige el tratamiento del listado desplegable.
   - **Fecha** — selecciona el día que prefieres en el calendario.
4. Una vez elegida la fecha, aparecen automáticamente los **horarios disponibles**. Los que ya están ocupados no se muestran.
5. Elige tu hora y haz clic en **"Solicitar Cita"**.
6. Recibirás un email de confirmación con los detalles.

> **Nota:** La cita queda en estado *Pendiente* hasta que la clínica la confirme. Si tienes cuenta en el sistema, puedes seguir el estado desde tu portal.

---

## PARTE 2 — Para pacientes con cuenta

### Cómo crear una cuenta

1. Ve a la página de **Registro** (enlace en la cabecera o en `/registro`).
2. Rellena: nombre completo, email y contraseña.
3. Haz clic en **"Crear cuenta"**. Accederás automáticamente a tu área personal.

---

### Cómo iniciar sesión

1. Haz clic en **"Iniciar sesión"** en la cabecera o ve a `/login`.
2. Introduce tu email y contraseña.
3. Haz clic en **"Entrar"**.

Si olvidaste tu contraseña, contacta con la clínica para que la restablezcan.

Para cerrar sesión, usa el botón **"Cerrar sesión"** que aparece en la esquina superior derecha de tu área personal.

---

### El Portal del Paciente

Tras iniciar sesión entrarás en tu área personal, que tiene cuatro secciones (pestañas):

---

#### Pestaña: Resumen

Muestra un vistazo rápido de tu situación:

- **Tratamientos totales** — cuántos tratamientos tienes registrados.
- **Completados** — cuántos has terminado ya.
- **Piezas registradas** — cuántos dientes tienen alguna anotación en tu odontograma.
- **Tu mascota dental** — una mascota animada que sube de nivel según avanzas en tus tratamientos. Es una forma de motivarte a completar tu plan dental. Cada tratamiento completado suma 10 puntos de experiencia (XP).

---

#### Pestaña: Mi Odontograma

Aquí puedes ver el estado de tus piezas dentales tal y como lo ha registrado tu dentista.

- Cada diente aparece con un color según su estado:

| Color | Significado |
|-------|-------------|
| Verde | Sano |
| Naranja | Caries |
| Azul | Obturado (empaste) |
| Amarillo | Corona |
| Rojo | Extracción o pieza ausente |
| Morado | Endodoncia |
| Teal (verdoso) | Implante |

- Esta vista es **solo de consulta**. Solo tu dentista puede modificar el odontograma.

---

#### Pestaña: Tratamientos

Lista todos los tratamientos que tu dentista ha registrado. Para cada uno puedes ver:

- **Nombre** del tratamiento (ej: Empaste, Limpieza, Implante…)
- **Descripción** con detalles adicionales
- **Estado** actual:
  - 🔵 *Planificado* — está previsto pero aún no se ha realizado
  - 🟡 *En curso* — en proceso
  - 🟢 *Completado* — ya realizado
  - 🔴 *Cancelado*
- **Pieza** dental afectada (notación FDI)
- **Coste** del tratamiento

##### Descargar documentos

En la parte superior de esta sección tienes dos botones:

**⬇ Presupuesto PDF**
Descarga un PDF con todos tus tratamientos (excepto cancelados), los costes de cada uno y el total. Válido como presupuesto durante 30 días desde su emisión.

**🧾 Generar Factura**
Genera y descarga una factura oficial con número correlativo (formato `FACT-2026-0001`) de todos tus tratamientos **completados**. La factura incluye la nota de exención de IVA aplicable a los servicios dentales (Art. 20.Uno.3 LIVA) y cumple con el Real Decreto 1619/2012.

> La diferencia principal: el **presupuesto** incluye lo planificado y lo realizado; la **factura** incluye solo lo ya completado y tiene validez fiscal.

---

#### Pestaña: Perfil

Aquí puedes actualizar tus datos personales:

- **Nombre completo**
- **Teléfono**
- **Fecha de nacimiento**

El email no se puede cambiar desde aquí (es el identificador de tu cuenta). Si necesitas cambiarlo, contacta con la clínica.

Cuando hayas modificado los datos, pulsa **"Guardar cambios"**.

---

## PARTE 3 — Para el personal de recepción

### El Panel de Administración

**Cómo acceder:**
1. Ve a la dirección `/gestion` en tu navegador.
2. Introduce la contraseña del panel (la proporciona la dirección de la clínica).
3. Haz clic en **"Acceder al Panel"**.

---

#### Sección: Dashboard

La pantalla principal muestra:

- **Tarjetas de resumen** con los totales de citas por estado y los servicios activos.
- **Próximas citas** — las 5 citas más cercanas con su fecha, hora, paciente y estado.

Usa el botón de **recarga** (icono circular en la barra superior) para actualizar los datos sin recargar la página.

---

#### Sección: Citas

Aquí gestionas todas las citas de la clínica.

**Buscar una cita:**
Escribe en el buscador el nombre del paciente, su email o el servicio solicitado. La lista se filtra en tiempo real.

**Filtrar por estado:**
Usa los botones de colores para mostrar solo las citas Pendientes, Confirmadas, Completadas o Canceladas.

**Acciones disponibles para cada cita:**

| Acción | Cuándo usarla |
|--------|--------------|
| **✓ Confirmar** | Cuando hayas comprobado la disponibilidad y quieras confirmar la cita al paciente |
| **✓ Completar** | Una vez realizada la consulta |
| **✕ Cancelar** | Si el paciente cancela o hay que anular la cita. Se envía email automático al paciente |
| **📝** (icono) | Muestra las notas que dejó el paciente al pedir la cita |

---

#### Sección: Servicios

Gestiona los tratamientos que aparecen en el formulario público de cita.

**Editar un servicio existente:**
1. Haz clic en **✏️ Editar** en la fila del servicio.
2. Modifica los campos que necesites (nombre, descripción, duración, precio).
3. Pulsa **💾 Guardar** para confirmar o **Cancelar** para descartar.

**Añadir un nuevo servicio:**
1. Haz clic en **"+ Nuevo servicio"** (arriba a la derecha).
2. Rellena el formulario que aparece: nombre, descripción, duración y precio.
3. Marca la casilla **"Activo"** para que aparezca en el formulario público.
4. Pulsa **"✓ Crear Servicio"**.

**Desactivar un servicio:**
Edita el servicio y desmarca la casilla **"Activo"**. El servicio seguirá en el sistema pero no aparecerá en el formulario de cita online.

**Eliminar un servicio:**
Haz clic en 🗑️ y confirma la eliminación. Esta acción no se puede deshacer.

---

#### Accesos directos a herramientas clínicas

En la barra superior del panel verás tres accesos directos:

- 🗓 **Agenda Kanban** — vista de citas en tablero visual
- 🦷 **Odontograma** — dashboard clínico
- 📦 **Inventario** — gestión de material

> Estos accesos requieren que el dentista o administrador haya iniciado sesión con su cuenta JWT (desde `/login`).

---

## PARTE 4 — Para dentistas

### Dashboard Clínico

**Cómo acceder:**
Inicia sesión en `/login` con tu cuenta de dentista. Serás redirigido automáticamente al dashboard clínico en `/clinica`.

---

#### Buscar y seleccionar un paciente

En la columna izquierda hay un buscador. Escribe el nombre o email del paciente. Haz clic en su nombre para cargar su ficha.

---

#### Registrar información en el odontograma

1. Con un paciente seleccionado, verás su odontograma en el panel principal.
2. **Haz clic sobre cualquier diente** para registrar o actualizar su estado.
3. Se abre un formulario con los siguientes campos:
   - **Estado:** Sano / Caries / Obturado / Corona / Endodoncia / Extracción / Implante / Fractura
   - **Superficie:** Global / Oclusal / Vestibular / Lingual / Mesial / Distal
   - **Notas:** cualquier observación adicional
4. Pulsa **"Guardar"**. El odontograma se actualiza inmediatamente.

> Si ya existe un registro para esa pieza y superficie, se actualiza; no crea un duplicado.

---

#### Gestionar tratamientos del paciente

Debajo del odontograma aparece el listado de tratamientos del paciente seleccionado.

**Añadir un tratamiento:**
1. Haz clic en **"+ Añadir tratamiento"**.
2. Rellena: nombre, descripción, coste, estado inicial, pieza dental asociada (opcional) y fecha.
3. Guarda.

**Cambiar el estado de un tratamiento:**
Usa el selector de estado en cada tratamiento para avanzarlo: Planificado → En curso → Completado.

**Eliminar un tratamiento:**
Haz clic en el icono de eliminar 🗑️ junto al tratamiento.

---

#### Generar documentos para el paciente

Para generar el presupuesto o la factura de un paciente, el botón está disponible desde el portal del propio paciente. Si el dentista necesita generarlos, puede acceder a los endpoints directamente o a través de la API.

---

### Inventario

**Cómo acceder:** Ve a `/inventario` (o usa el enlace del panel).

---

**Ver el stock actual:**
La tabla principal muestra todo el material con su cantidad actual, unidad de medida, umbral mínimo y proveedor.

Los artículos con stock por debajo del mínimo se resaltan en rojo y aparece un aviso ámbar en la parte superior de la página.

**Ajustar el stock:**
- Usa el botón **＋** para sumar una unidad.
- Usa el botón **−** para restar una unidad.
- El stock nunca baja de cero.

**Editar un artículo:**
Haz clic en **✏️** para modificar nombre, cantidad, umbral mínimo, unidad o proveedor. Pulsa **Guardar**.

**Añadir material nuevo:**
1. Haz clic en **"+ Nuevo artículo"**.
2. Rellena el formulario en el modal que aparece.
3. Pulsa **"Crear"**.

**Eliminar un artículo:** Solo los administradores pueden eliminar artículos del inventario.

---

## PARTE 5 — Para administradores

Los administradores tienen acceso a todo lo descrito en las partes anteriores, más lo siguiente:

---

### Agenda Kanban

**Cómo acceder:** Ve a `/agenda` (o usa el acceso directo del panel).

La agenda muestra las citas en un tablero de cuatro columnas:

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  PENDIENTE  │  │  CONFIRMADA │  │  COMPLETADA │  │  CANCELADA  │
│   (amarillo)│  │   (teal)    │  │   (gris)    │  │   (rojo)    │
├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────────┤
│ Ana García  │  │ Luis Pérez  │  │ María López │  │             │
│ 09:00       │  │ 10:30       │  │ 09:00       │  │             │
│ Limpieza    │  │ Ortodoncia  │  │ Empaste     │  │             │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

**Filtrar por fecha:**
Usa los campos **Desde** y **Hasta** en la barra superior para ver las citas de un periodo concreto. Por defecto muestra los próximos 7 días.

**Cambiar el estado de una cita:**
Arrastra la tarjeta de la cita y suéltala en la columna de destino. El cambio se guarda automáticamente. Si hay algún problema de conexión, la tarjeta vuelve a su posición original.

Cada tarjeta muestra el nombre del paciente, el servicio, la fecha, la hora y el teléfono. El teléfono es un enlace: desde el móvil, al tocarlo se llama directamente.

---

### Eliminar artículos del inventario

Solo los administradores pueden eliminar artículos. Haz clic en el icono 🗑️ junto al artículo que quieres eliminar.

---

### Log de auditoría

El sistema registra automáticamente todos los accesos a datos médicos de pacientes (quién accedió, a qué datos y cuándo). Este registro está disponible para los administradores a través de la API en `/api/audit`.

---

## Preguntas frecuentes

**¿Por qué no puedo ver los horarios disponibles?**
Asegúrate de haber seleccionado una fecha. El sistema carga los horarios disponibles al elegir el día. Si todos están ocupados, prueba con otra fecha.

**¿Cómo cambio mi contraseña?**
En este momento el cambio de contraseña se realiza contactando con la clínica. El personal administrativo puede restablecerla desde la base de datos.

**¿Por qué la factura no incluye todos mis tratamientos?**
La factura solo incluye tratamientos en estado **Completado**. Los tratamientos planificados o en curso aparecen en el presupuesto pero no en la factura, ya que no han sido prestados todavía.

**¿Los servicios dentales llevan IVA?**
No. Los servicios de asistencia dental están exentos de IVA según el artículo 20.Uno.3 de la Ley 37/1992 del IVA. Esto queda reflejado en la factura generada por el sistema.

**¿Qué pasa si cierro el navegador sin cerrar sesión?**
Tu sesión expira automáticamente a las 24 horas. No es necesario cerrar sesión activamente, aunque es recomendable hacerlo si usas un ordenador compartido.

**¿Puedo modificar mi email?**
No desde el portal. El email es el identificador de tu cuenta. Si necesitas cambiarlo, contacta con el personal de la clínica.

**¿Cómo sé si mi cita ha sido confirmada?**
Recibirás un email de confirmación cuando la clínica cambie el estado de tu cita a *Confirmada*. También puedes comprobarlo desde tu portal en la pestaña de Tratamientos.

---

## Contacto y soporte

Si tienes alguna dificultad para usar el programa, contacta con el personal de la clínica.

**Clínica Dental Alamillo**
Calle Alamillo, XX · Sevilla
Tel: 622 92 69 03
