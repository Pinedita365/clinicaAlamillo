import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getAllAppointments, updateAppointmentStatus,
  getAllServices, createService, updateService, deleteService,
} from '../utils/api'

// ── Herramientas clínicas (rutas protegidas por JWT, se abren en la misma pestaña) ──
const CLINIC_TOOLS = [
  { href: '/agenda',     icon: '🗓', label: 'Agenda Kanban' },
  { href: '/clinica',    icon: '🦷', label: 'Odontograma' },
  { href: '/inventario', icon: '📦', label: 'Inventario' },
]

// ── Contraseña de acceso (configurable vía .env) ────────────
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'alamillo2025'
const SESSION_KEY    = 'cda_admin_session'

// ──────────────────────────────────────────────────────────────
// Utilidades UI
// ──────────────────────────────────────────────────────────────
const STATUS_LABELS = {
  PENDING:   { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmada', color: 'bg-teal-100 text-teal-800' },
  CANCELLED: { label: 'Cancelada',  color: 'bg-red-100 text-red-800' },
  COMPLETED: { label: 'Completada', color: 'bg-gray-100 text-gray-700' },
}

function StatusBadge({ status }) {
  const { label, color } = STATUS_LABELS[status] ?? { label: status, color: 'bg-gray-100 text-gray-700' }
  return <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${color}`}>{label}</span>
}

function Spinner() {
  return (
    <div className="flex justify-center py-16" aria-live="polite" aria-label="Cargando...">
      <svg className="animate-spin w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
      </svg>
    </div>
  )
}

function Alert({ type = 'error', message, onClose }) {
  const styles = type === 'success'
    ? 'bg-teal-50 border-teal-300 text-teal-800'
    : 'bg-red-50 border-red-300 text-red-700'
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border text-sm mb-4 ${styles}`} role="alert">
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100" aria-label="Cerrar">&times;</button>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// LOGIN
// ──────────────────────────────────────────────────────────────
function LoginScreen({ onAuth }) {
  const [pwd, setPwd]     = useState('')
  const [error, setError] = useState(false)
  const [show, setShow]   = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pwd === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1')
      onAuth()
    } else {
      setError(true)
      setPwd('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Panel de Gestión</h1>
          <p className="text-gray-400 text-sm mt-1">Clínica Dental Alamillo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-7">
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="pwd" className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña de acceso
            </label>
            <div className="relative mb-4">
              <input
                id="pwd"
                type={show ? 'text' : 'password'}
                value={pwd}
                onChange={(e) => { setPwd(e.target.value); setError(false) }}
                placeholder="••••••••••"
                className={`input-field pr-11 ${error ? 'input-error' : ''}`}
                autoFocus
                autoComplete="current-password"
                aria-invalid={error}
                aria-describedby={error ? 'pwd-error' : undefined}
              />
              <button
                type="button" tabIndex={-1}
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {show
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {error && (
              <p id="pwd-error" className="text-xs text-red-500 mb-3" role="alert">Contraseña incorrecta. Inténtalo de nuevo.</p>
            )}
            <button type="submit" className="btn-primary w-full justify-center">
              Acceder al Panel
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Acceso restringido · Solo personal autorizado
        </p>
      </motion.div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// DASHBOARD – ESTADÍSTICAS
// ──────────────────────────────────────────────────────────────
function DashboardTab({ appointments, services }) {
  const counts = appointments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1
    return acc
  }, {})

  const today = new Date().toISOString().split('T')[0]
  const todayCount = appointments.filter(a => a.date === today).length

  const stats = [
    { label: 'Total citas',      value: appointments.length, icon: '📅', color: 'bg-teal-50 border-teal-200' },
    { label: 'Pendientes',       value: counts.PENDING   ?? 0, icon: '⏳', color: 'bg-yellow-50 border-yellow-200' },
    { label: 'Confirmadas',      value: counts.CONFIRMED ?? 0, icon: '✅', color: 'bg-green-50 border-green-200' },
    { label: 'Hoy',              value: todayCount,          icon: '🗓️', color: 'bg-blue-50 border-blue-200' },
    { label: 'Servicios activos', value: services.filter(s => s.active).length, icon: '🦷', color: 'bg-purple-50 border-purple-200' },
    { label: 'Canceladas',       value: counts.CANCELLED ?? 0, icon: '❌', color: 'bg-red-50 border-red-200' },
  ]

  const upcoming = appointments
    .filter(a => a.date >= today && a.status !== 'CANCELLED')
    .sort((a, b) => (a.date + a.time) < (b.date + b.time) ? -1 : 1)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon, color }) => (
          <div key={label} className={`rounded-2xl border p-4 ${color}`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-display font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Próximas citas */}
      <div>
        <h3 className="font-display font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Próximas citas</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-400">No hay citas próximas.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map(a => (
              <div key={a.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm">
                <div className="text-teal-600 font-semibold w-20 shrink-0">{a.date}</div>
                <div className="text-gray-500 w-12 shrink-0">{String(a.time).slice(0,5)}</div>
                <div className="flex-1 font-medium text-gray-800 truncate">{a.patientName}</div>
                <div className="text-gray-400 truncate hidden sm:block">{a.service}</div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// CITAS – tabla con acciones
// ──────────────────────────────────────────────────────────────
function AppointmentsTab({ appointments, onRefresh }) {
  const [filter, setFilter]   = useState('ALL')
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(null) // id being updated
  const [alert, setAlert]     = useState(null)

  const filtered = appointments
    .filter(a => filter === 'ALL' || a.status === filter)
    .filter(a => {
      const q = search.toLowerCase()
      return !q || a.patientName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.service.toLowerCase().includes(q)
    })
    .sort((a, b) => (a.date + a.time) > (b.date + b.time) ? -1 : 1)

  const changeStatus = async (id, status) => {
    setLoading(id)
    try {
      await updateAppointmentStatus(id, status)
      setAlert({ type: 'success', message: 'Estado actualizado correctamente.' })
      onRefresh()
    } catch (e) {
      setAlert({ type: 'error', message: e.message })
    } finally {
      setLoading(null)
    }
  }

  const nextStatus = (current) => {
    if (current === 'PENDING')   return [['CONFIRMED', '✓ Confirmar'], ['CANCELLED', '✕ Cancelar']]
    if (current === 'CONFIRMED') return [['COMPLETED', '✓ Completar'], ['CANCELLED', '✕ Cancelar']]
    return []
  }

  return (
    <div>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="search"
          placeholder="Buscar paciente, servicio..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field flex-1 text-sm"
          aria-label="Buscar citas"
        />
        <div className="flex gap-1 flex-wrap">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${filter === s ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              aria-pressed={filter === s}
            >
              {s === 'ALL' ? 'Todas' : STATUS_LABELS[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Fecha', 'Hora', 'Paciente', 'Servicio', 'Teléfono', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                  No hay citas que coincidan con los filtros.
                </td>
              </tr>
            )}
            {filtered.map((a, i) => (
              <tr
                key={a.id}
                className={`border-b border-gray-50 hover:bg-teal-50/40 transition-colors
                  ${a.status === 'CANCELLED' ? 'opacity-50' : ''}`}
              >
                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{a.date}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{String(a.time).slice(0,5)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{a.patientName}</div>
                  <div className="text-xs text-gray-400 truncate max-w-[140px]">{a.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{a.service}</td>
                <td className="px-4 py-3 text-gray-500">{a.phone}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {nextStatus(a.status).map(([st, label]) => (
                      <button
                        key={st}
                        disabled={loading === a.id}
                        onClick={() => changeStatus(a.id, st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all
                          ${st === 'CANCELLED'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}
                          disabled:opacity-40`}
                        aria-label={`${label} cita de ${a.patientName}`}
                      >
                        {loading === a.id ? '...' : label}
                      </button>
                    ))}
                    {a.notes && (
                      <button
                        title={a.notes}
                        className="px-2 py-1 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 text-xs"
                        aria-label={`Notas: ${a.notes}`}
                      >
                        📝
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-2">{filtered.length} cita{filtered.length !== 1 ? 's' : ''} mostradas</p>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// SERVICIOS – CRUD completo
// ──────────────────────────────────────────────────────────────
const EMPTY_SERVICE = { name: '', description: '', duration: '', priceRange: '', iconKey: '', active: true }

function ServiceRow({ svc, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [form,    setForm]    = useState(svc)
  const [saving,  setSaving]  = useState(false)
  const [alert,   setAlert]   = useState(null)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(svc.id, form)
      setEditing(false)
    } catch (e) {
      setAlert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => { setForm(svc); setEditing(false); setAlert(null) }

  if (!editing) {
    return (
      <tr className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${!svc.active ? 'opacity-50' : ''}`}>
        <td className="px-4 py-3 font-semibold text-gray-800">{svc.name}</td>
        <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{svc.description}</td>
        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{svc.duration}</td>
        <td className="px-4 py-3 font-semibold text-teal-700 whitespace-nowrap">{svc.priceRange}</td>
        <td className="px-4 py-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${svc.active ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-500'}`}>
            {svc.active ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-semibold hover:bg-teal-100 transition-colors"
              aria-label={`Editar servicio ${svc.name}`}
            >
              ✏️ Editar
            </button>
            <button
              onClick={() => onDelete(svc.id, svc.name)}
              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
              aria-label={`Eliminar servicio ${svc.name}`}
            >
              🗑️
            </button>
          </div>
        </td>
      </tr>
    )
  }

  // Edit mode – inline form row
  return (
    <>
      {alert && (
        <tr><td colSpan={6} className="px-4 pb-1">
          <Alert type="error" message={alert} onClose={() => setAlert(null)} />
        </td></tr>
      )}
      <tr className="bg-teal-50/40 border-b border-teal-100">
        <td className="px-4 py-2">
          <input className="input-field text-sm py-2"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Nombre del servicio" aria-label="Nombre del servicio" />
        </td>
        <td className="px-4 py-2">
          <input className="input-field text-sm py-2"
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Descripción" aria-label="Descripción" />
        </td>
        <td className="px-4 py-2">
          <input className="input-field text-sm py-2 w-28"
            value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
            placeholder="45 min" aria-label="Duración" />
        </td>
        <td className="px-4 py-2">
          <input className="input-field text-sm py-2 w-36"
            value={form.priceRange} onChange={e => setForm(f => ({ ...f, priceRange: e.target.value }))}
            placeholder="60 – 80 €" aria-label="Rango de precio" />
        </td>
        <td className="px-4 py-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active}
              onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
              className="w-4 h-4 accent-teal-600" aria-label="Servicio activo" />
            <span className="text-xs text-gray-600">Activo</span>
          </label>
        </td>
        <td className="px-4 py-2">
          <div className="flex gap-2">
            <button
              onClick={handleSave} disabled={saving}
              className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 disabled:opacity-50"
              aria-label="Guardar cambios"
            >
              {saving ? '...' : '💾 Guardar'}
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200"
              aria-label="Cancelar edición"
            >
              Cancelar
            </button>
          </div>
        </td>
      </tr>
    </>
  )
}

function ServicesTab({ services, onRefresh }) {
  const [showAdd, setShowAdd]   = useState(false)
  const [newSvc,  setNewSvc]    = useState(EMPTY_SERVICE)
  const [saving,  setSaving]    = useState(false)
  const [alert,   setAlert]     = useState(null)

  const handleSave = async (id, data) => {
    await updateService(id, data)
    setAlert({ type: 'success', message: `"${data.name}" actualizado correctamente.` })
    onRefresh()
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar el servicio "${name}"? Esta acción no se puede deshacer.`)) return
    try {
      await deleteService(id)
      setAlert({ type: 'success', message: `"${name}" eliminado.` })
      onRefresh()
    } catch (e) {
      setAlert({ type: 'error', message: e.message })
    }
  }

  const handleAdd = async () => {
    if (!newSvc.name.trim()) { setAlert({ type: 'error', message: 'El nombre del servicio es obligatorio.' }); return }
    setSaving(true)
    try {
      await createService(newSvc)
      setAlert({ type: 'success', message: `"${newSvc.name}" creado correctamente.` })
      setNewSvc(EMPTY_SERVICE)
      setShowAdd(false)
      onRefresh()
    } catch (e) {
      setAlert({ type: 'error', message: e.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">{services.length} servicio{services.length !== 1 ? 's' : ''} configurados</p>
        <button
          onClick={() => setShowAdd(s => !s)}
          className="btn-primary text-sm px-4 py-2"
          aria-expanded={showAdd}
          aria-controls="add-service-form"
        >
          {showAdd ? '— Cancelar' : '+ Nuevo servicio'}
        </button>
      </div>

      {/* Formulario nuevo servicio */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            id="add-service-form"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="overflow-hidden mb-5"
          >
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <h3 className="font-display font-bold text-gray-800 col-span-full">Nuevo Servicio</h3>
              {[
                { field: 'name',        label: 'Nombre *',          placeholder: 'Ej: Periodoncia' },
                { field: 'description', label: 'Descripción',        placeholder: 'Breve descripción...' },
                { field: 'duration',    label: 'Duración',           placeholder: '45 min' },
                { field: 'priceRange',  label: 'Precio',             placeholder: '80 – 150 €' },
                { field: 'iconKey',     label: 'Clave icono (opcional)', placeholder: 'perio' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <input
                    className="input-field text-sm py-2"
                    value={newSvc[field]}
                    onChange={e => setNewSvc(s => ({ ...s, [field]: e.target.value }))}
                    placeholder={placeholder}
                    aria-label={label}
                  />
                </div>
              ))}
              <div className="flex items-center gap-2 col-span-full">
                <input type="checkbox" id="new-active" checked={newSvc.active}
                  onChange={e => setNewSvc(s => ({ ...s, active: e.target.checked }))}
                  className="w-4 h-4 accent-teal-600" />
                <label htmlFor="new-active" className="text-sm text-gray-700">Activo (visible en el formulario de citas)</label>
              </div>
              <div className="col-span-full">
                <button
                  onClick={handleAdd} disabled={saving}
                  className="btn-primary disabled:opacity-50"
                  aria-label="Crear nuevo servicio"
                >
                  {saving ? 'Creando...' : '✓ Crear Servicio'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabla de servicios */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Nombre', 'Descripción', 'Duración', 'Precio', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">No hay servicios configurados.</td></tr>
            )}
            {services.map(svc => (
              <ServiceRow key={svc.id} svc={svc} onSave={handleSave} onDelete={handleDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// SHELL DEL PANEL
// ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'dashboard',   label: 'Dashboard',  icon: '📊' },
  { id: 'citas',       label: 'Citas',      icon: '📅' },
  { id: 'servicios',   label: 'Servicios',  icon: '🦷' },
]

function AdminShell({ onLogout }) {
  const [tab,          setTab]          = useState('dashboard')
  const [appointments, setAppointments] = useState([])
  const [services,     setServices]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [appts, svcs] = await Promise.all([getAllAppointments(), getAllServices()])
      setAppointments(appts)
      setServices(svcs)
    } catch (e) {
      setError('No se pudieron cargar los datos. ¿Está el servidor arrancado en :8080?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <div>
            <p className="font-display font-bold text-gray-900 text-sm leading-none">Panel de Gestión</p>
            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block capitalize">{today}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Herramientas clínicas */}
          {CLINIC_TOOLS.map(({ href, icon, label }) => (
            <a
              key={href}
              href={href}
              className="hidden md:flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-teal-700 px-2.5 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
              aria-label={label}
              title={label}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </a>
          ))}
          <button
            onClick={load}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-teal-600 transition-colors"
            title="Recargar datos"
            aria-label="Recargar datos"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
          <a href="/" className="text-xs text-gray-400 hover:text-teal-600 transition-colors hidden sm:block">
            ← Ver web
          </a>
          <button
            onClick={onLogout}
            className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            aria-label="Cerrar sesión del panel"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6">
        <nav className="flex gap-1 -mb-px" role="tablist" aria-label="Secciones del panel">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all
                ${tab === id
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
            >
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8" role="tabpanel">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700" role="alert">
            ⚠️ {error}
            <button onClick={load} className="ml-3 font-semibold underline">Reintentar</button>
          </div>
        )}
        {loading ? (
          <Spinner />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'dashboard' && <DashboardTab appointments={appointments} services={services} />}
              {tab === 'citas'     && <AppointmentsTab appointments={appointments} onRefresh={load} />}
              {tab === 'servicios' && <ServicesTab services={services} onRefresh={load} />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// PÁGINA RAÍZ – orquesta login / panel
// ──────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
  }

  return authed
    ? <AdminShell onLogout={logout} />
    : <LoginScreen onAuth={() => setAuthed(true)} />
}
