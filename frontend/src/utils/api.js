const API_BASE  = import.meta.env.VITE_API_URL ?? '/api'
const TOKEN_KEY = 'ca_jwt'

async function request(method, path, body) {
  const token = localStorage.getItem(TOKEN_KEY)
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error(err.detail ?? err.message ?? `Error ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────
export const loginApi    = (data) => request('POST', '/auth/login',    data)
export const registerApi = (data) => request('POST', '/auth/register', data)

// ── Citas (público) ───────────────────────────────────────────
export const createAppointment  = (data) => request('POST', '/appointments', data)
export const getAvailability    = (date) => request('GET',  `/appointments/availability?date=${date}`)

// ── Citas (admin) ─────────────────────────────────────────────
export const getAllAppointments      = ()             => request('GET',   '/appointments')
export const updateAppointmentStatus = (id, status) => request('PATCH', `/appointments/${id}/status?status=${status}`)

// ── Servicios (público) ───────────────────────────────────────
export const getServices   = ()        => request('GET',    '/services')
export const getAllServices = ()        => request('GET',    '/services/all')
export const createService = (data)    => request('POST',   '/services',      data)
export const updateService = (id, d)   => request('PUT',    `/services/${id}`, d)
export const deleteService = (id)      => request('DELETE', `/services/${id}`)

// ── Área paciente (propio) ────────────────────────────────────
export const getMyProfile        = ()     => request('GET', '/patient/me')
export const updateMyProfile     = (data) => request('PUT', '/patient/me', data)
export const getMyOdontogram     = ()     => request('GET', '/patient/me/odontogram')
export const getMyTreatments     = ()     => request('GET', '/patient/me/treatments')
export const getMyAppointments   = ()     => request('GET', '/patient/me/appointments')

// ── Invitaciones de pacientes ─────────────────────────────────
export const invitePatient       = (data)  => request('POST', '/clinical/patients/invite', data)
export const validateInviteToken = (token) => request('GET',  `/auth/invite/validate?token=${encodeURIComponent(token)}`)
export const acceptInvite        = (data)  => request('POST', '/auth/invite/accept', data)

// ── Clínico (dentista/admin) ──────────────────────────────────
export const listPatients          = ()                 => request('GET',    '/clinical/patients')
export const getPatientOdontogram  = (id)               => request('GET',    `/clinical/patients/${id}/odontogram`)
export const upsertToothRecord     = (patientId, data)  => request('PUT',    `/clinical/patients/${patientId}/odontogram`, data)
export const deleteToothRecord     = (recordId)         => request('DELETE', `/clinical/tooth-records/${recordId}`)
export const getPatientTreatments  = (id)               => request('GET',    `/clinical/patients/${id}/treatments`)
export const addTreatment          = (patientId, data)  => request('POST',   `/clinical/patients/${patientId}/treatments`, data)
export const updateTreatmentStatus = (id, status)       => request('PATCH',  `/clinical/treatments/${id}/status?status=${status}`)
export const deleteTreatment       = (id)               => request('DELETE', `/clinical/treatments/${id}`)

// ── Inventario ────────────────────────────────────────────────
export const getInventory      = ()          => request('GET',    '/inventory')
export const getLowStock       = ()          => request('GET',    '/inventory/low-stock')
export const createInventoryItem = (data)    => request('POST',   '/inventory',    data)
export const updateInventoryItem = (id, data)=> request('PUT',    `/inventory/${id}`, data)
export const adjustStock         = (id, delta)=> request('PATCH', `/inventory/${id}/stock?delta=${delta}`)
export const deleteInventoryItem = (id)      => request('DELETE', `/inventory/${id}`)

// ── Agenda por rango de fechas (dentista/admin) ───────────────
export const getAppointmentsByDateRange = (from, to) =>
  request('GET', `/appointments/range?from=${from}&to=${to}`)

// ── Citas de un paciente por email (dentista/admin) ───────────
export const getAppointmentsByEmail = (email) =>
  request('GET', `/appointments/by-email?email=${encodeURIComponent(email)}`)

// ── PDF (descarga como blob) ──────────────────────────────────
export async function downloadPdf(url, filename) {
  const token = localStorage.getItem('ca_jwt')
  const res = await fetch(`${API_BASE}${url}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(`Error ${res.status} al generar PDF`)
  const blob = await res.blob()
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  a.click()
  URL.revokeObjectURL(href)
}

// Presupuesto (propio paciente)
export const downloadMyBudget  = ()   => downloadPdf('/patient/me/pdf/budget',  'presupuesto.pdf')
// Factura (propio paciente)
export const downloadMyInvoice = ()   => downloadPdf('/patient/me/pdf/invoice', 'factura.pdf')
// Presupuesto de un paciente (dentista/admin)
export const downloadPatientBudget  = (id) => downloadPdf(`/clinical/patients/${id}/pdf/budget`,  `presupuesto-${id}.pdf`)
// Factura de un paciente (dentista/admin)
export const downloadPatientInvoice = (id) => downloadPdf(`/clinical/patients/${id}/pdf/invoice`, `factura-${id}.pdf`)

// ── Auditoría (admin) ─────────────────────────────────────────
export const getAuditLog = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  ).toString()
  return request('GET', `/audit${qs ? '?' + qs : ''}`)
}
