import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../utils/auth'
import {
  listPatients, getPatientOdontogram, upsertToothRecord,
  getPatientTreatments, addTreatment, updateTreatmentStatus, deleteTreatment,
  getAppointmentsByEmail, createAppointment, updateAppointmentStatus,
  invitePatient,
} from '../utils/api'
import OdontogramView from '../components/OdontogramView'
import AccessibilityAlert from '../components/AccessibilityAlert'

const STATUS_LABEL = {
  PLANNED:     { label: 'Planificado',  color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'En curso',     color: 'bg-yellow-100 text-yellow-700' },
  COMPLETED:   { label: 'Completado',   color: 'bg-green-100 text-green-700' },
  CANCELLED:   { label: 'Cancelado',    color: 'bg-gray-100 text-gray-500' },
}
const STATUSES = Object.keys(STATUS_LABEL)

const BLANK_TREATMENT = { name: '', description: '', cost: '', status: 'PLANNED', toothRecordId: '', performedAt: '' }
const BLANK_CITA = { service: '', date: '', time: '', phone: '', notes: '' }

const APPOINTMENT_SERVICES = [
  'Primera visita',
  'Limpieza dental',
  'Curetajes',
  'Obturaciones / empastes',
  'Endodoncia',
  'Valoración ortodoncia',
  'Revisión ortodoncia',
  'Valoración implantes',
]

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30',
]

const APPT_STATUS = {
  PENDING:   { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmada', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelada',  color: 'bg-red-100 text-red-700' },
  COMPLETED: { label: 'Realizada',  color: 'bg-teal-100 text-teal-700' },
}

export default function ClinicalDashboard() {
  const { user, logout } = useAuth()

  const [patients,    setPatients]    = useState([])
  const [search,      setSearch]      = useState('')
  const [selected,    setSelected]    = useState(null)
  const [records,     setRecords]     = useState([])
  const [treatments,  setTreatments]  = useState([])
  const [loadingClin, setLoadingClin] = useState(false)
  const [tab,         setTab]         = useState(0)
  const [tForm,        setTForm]        = useState(BLANK_TREATMENT)
  const [showTForm,    setShowTForm]    = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [msg,          setMsg]          = useState(null)
  const [citas,        setCitas]        = useState([])
  const [citaForm,     setCitaForm]     = useState(BLANK_CITA)
  const [showCitaForm, setShowCitaForm] = useState(false)
  const [savingCita,   setSavingCita]   = useState(false)
  const [showInvite,   setShowInvite]   = useState(false)
  const [inviteForm,   setInviteForm]   = useState({ fullName: '', email: '' })
  const [inviteMsg,    setInviteMsg]    = useState(null)
  const [savingInvite, setSavingInvite] = useState(false)

  // Cargar lista de pacientes
  useEffect(() => {
    listPatients().then(setPatients).catch(console.error)
  }, [])

  // Cargar datos del paciente seleccionado
  const loadPatient = async (p) => {
    setSelected(p); setLoadingClin(true); setMsg(null)
    try {
      const [o, t, c] = await Promise.all([
        getPatientOdontogram(p.id),
        getPatientTreatments(p.id),
        getAppointmentsByEmail(p.email),
      ])
      setRecords(o); setTreatments(t); setCitas(c); setTab(0)
    } catch (err) {
      setMsg('Error cargando datos: ' + err.message)
    } finally {
      setLoadingClin(false)
    }
  }

  const handleCreateCita = async (e) => {
    e.preventDefault(); setSavingCita(true); setMsg(null)
    try {
      const created = await createAppointment({
        patientName: selected.fullName,
        phone:       citaForm.phone || '000000000',
        email:       selected.email,
        service:     citaForm.service,
        date:        citaForm.date,
        time:        citaForm.time,
        notes:       citaForm.notes || '',
      })
      setCitas(cs => [created, ...cs])
      setCitaForm(BLANK_CITA); setShowCitaForm(false)
      setMsg('Cita creada correctamente')
    } catch (err) {
      setMsg('Error: ' + err.message)
    } finally {
      setSavingCita(false)
    }
  }

  const handleInvitePatient = async (e) => {
    e.preventDefault(); setSavingInvite(true); setInviteMsg(null)
    try {
      await invitePatient(inviteForm)
      setInviteMsg({ type: 'ok', text: `Invitación enviada a ${inviteForm.email}` })
      setInviteForm({ fullName: '', email: '' })
    } catch (err) {
      setInviteMsg({ type: 'err', text: err.message })
    } finally {
      setSavingInvite(false)
    }
  }

  const handleCitaStatusChange = async (id, status) => {
    try {
      const updated = await updateAppointmentStatus(id, status)
      setCitas(cs => cs.map(c => c.id === id ? updated : c))
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
  }

  // Cambio en odontograma (OdontogramView editable)
  const handleToothChange = async (toothNumber, condition) => {
    if (!selected) return
    try {
      const updated = await upsertToothRecord(selected.id, { toothNumber, condition, surface: 'WHOLE' })
      setRecords(rs => {
        const idx = rs.findIndex(r => r.toothNumber === updated.toothNumber && r.surface === updated.surface)
        return idx >= 0 ? rs.map((r, i) => i === idx ? updated : r) : [...rs, updated]
      })
    } catch (err) {
      setMsg('Error guardando: ' + err.message)
    }
  }

  const handleAddTreatment = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(null)
    try {
      const payload = {
        ...tForm,
        cost: tForm.cost ? parseFloat(tForm.cost) : null,
        toothRecordId: tForm.toothRecordId ? parseInt(tForm.toothRecordId) : null,
        performedAt: tForm.performedAt || null,
      }
      const created = await addTreatment(selected.id, payload)
      setTreatments(ts => [created, ...ts])
      setTForm(BLANK_TREATMENT); setShowTForm(false)
      setMsg('Tratamiento añadido')
    } catch (err) {
      setMsg('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await updateTreatmentStatus(id, status)
      setTreatments(ts => ts.map(t => t.id === id ? updated : t))
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
  }

  const handleDeleteTreatment = async (id) => {
    if (!confirm('¿Eliminar este tratamiento?')) return
    try {
      await deleteTreatment(id)
      setTreatments(ts => ts.filter(t => t.id !== id))
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
  }

  const filtered = patients.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Helmet>
        <title>Panel Clínico | Clínica Dental Alamillo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar: lista de pacientes */}
        <aside className="w-72 shrink-0 bg-white border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 2.8 1.3 3.8C6.5 12 6 13.5 6 15c0 3.5 2 6 6 7 4-1 6-3.5 6-7 0-1.5-.5-3-1.3-4.2.8-1 1.3-2.3 1.3-3.8 0-2.5-2.5-5-6-5z" fill="white"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-gray-400">{user?.role}</p>
              </div>
              <button onClick={logout} title="Cerrar sesión"
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
            <input
              type="search" placeholder="Buscar paciente…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition"
            />
            <button
              onClick={() => { setShowInvite(v => !v); setInviteMsg(null) }}
              className="mt-2 w-full text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors px-3 py-2 rounded-xl text-left flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              {showInvite ? 'Cancelar' : 'Invitar nuevo paciente'}
            </button>

            <AnimatePresence>
              {showInvite && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleInvitePatient}
                  className="overflow-hidden mt-1 space-y-2"
                >
                  {inviteMsg && (
                    <p className={`text-xs px-2 py-1.5 rounded-lg ${inviteMsg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {inviteMsg.text}
                    </p>
                  )}
                  <input required placeholder="Nombre completo *" value={inviteForm.fullName}
                    onChange={e => setInviteForm(f => ({ ...f, fullName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-teal-500 outline-none transition" />
                  <input required type="email" placeholder="Email *" value={inviteForm.email}
                    onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-teal-500 outline-none transition" />
                  <button type="submit" disabled={savingInvite}
                    className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors disabled:opacity-60">
                    {savingInvite ? 'Enviando…' : 'Enviar invitación'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <ul className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filtered.length === 0 && (
              <li className="p-4 text-center text-xs text-gray-400">Sin resultados</li>
            )}
            {filtered.map(p => (
              <li key={p.id}>
                <button
                  onClick={() => loadPatient(p)}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    selected?.id === p.id ? 'bg-teal-50 border-r-2 border-teal-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800 truncate">{p.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{p.email}</p>
                </button>
              </li>
            ))}
          </ul>
          <div className="p-3 border-t border-gray-100 text-xs text-gray-400 text-center">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <svg className="mx-auto mb-3 w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                </svg>
                <p className="text-sm">Selecciona un paciente del panel izquierdo</p>
              </div>
            </div>
          ) : (
            <div className="p-6 max-w-4xl">
              {/* Patient header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                  {selected.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selected.fullName}</h2>
                  <p className="text-sm text-gray-400">{selected.email}</p>
                </div>
              </div>

              {/* Accessibility alerts (placeholder – puede conectarse a datos reales) */}
              <AccessibilityAlert
                patientName={selected.fullName}
                needs={[]}
                onAcknowledge={() => {}}
                acknowledged={true}
              />

              {msg && (
                <div role="alert" className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
                  msg.startsWith('Error') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
                }`}>{msg}</div>
              )}

              {loadingClin ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
                </div>
              ) : (
                <>
                  {/* Tabs */}
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6" role="tablist">
                    {['Odontograma', 'Tratamientos', 'Citas'].map((t, i) => (
                      <button key={t} role="tab" aria-selected={tab === i} onClick={() => setTab(i)}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          tab === i ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}>{t}</button>
                    ))}
                  </div>

                  {/* Odontograma */}
                  {tab === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <p className="text-xs text-gray-400 mb-4">Haz clic en una pieza para cambiar su estado. Se guarda automáticamente.</p>
                      <OdontogramView records={records} onToothChange={handleToothChange} editable />
                    </motion.div>
                  )}

                  {/* Citas */}
                  {tab === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="flex justify-end">
                        <button onClick={() => setShowCitaForm(v => !v)}
                          className="btn-primary text-sm py-2 px-4">
                          {showCitaForm ? 'Cancelar' : '+ Nueva Cita'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {showCitaForm && (
                          <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleCreateCita}
                            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3 overflow-hidden"
                          >
                            <h3 className="font-semibold text-gray-800 text-sm">Nueva cita para {selected.fullName}</h3>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="col-span-2">
                                <select required value={citaForm.service}
                                  onChange={e => setCitaForm(f => ({ ...f, service: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition">
                                  <option value="">Tipo de consulta *</option>
                                  {APPOINTMENT_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                              <input type="tel" placeholder="Teléfono" value={citaForm.phone}
                                onChange={e => setCitaForm(f => ({ ...f, phone: e.target.value }))}
                                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition" />
                              <input type="date" required value={citaForm.date}
                                onChange={e => setCitaForm(f => ({ ...f, date: e.target.value }))}
                                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition" />
                              <div className="col-span-2">
                                <select required value={citaForm.time}
                                  onChange={e => setCitaForm(f => ({ ...f, time: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition">
                                  <option value="">Hora *</option>
                                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                              <div className="col-span-2">
                                <textarea placeholder="Notas (opcional)" value={citaForm.notes} rows={2}
                                  onChange={e => setCitaForm(f => ({ ...f, notes: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition resize-none" />
                              </div>
                            </div>
                            <button type="submit" disabled={savingCita}
                              className="btn-primary text-sm py-2 px-5 disabled:opacity-60">
                              {savingCita ? 'Guardando…' : 'Crear Cita'}
                            </button>
                          </motion.form>
                        )}
                      </AnimatePresence>

                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {citas.length === 0 ? (
                          <p className="text-center text-gray-400 text-sm py-10">Sin citas registradas</p>
                        ) : (
                          <ul className="divide-y divide-gray-50">
                            {citas.map(c => {
                              const st = APPT_STATUS[c.status] ?? { label: c.status, color: 'bg-gray-100 text-gray-600' }
                              return (
                                <li key={c.id} className="p-4 flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                      <span className="font-medium text-sm text-gray-900">{c.service}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{c.date} · {c.time ? String(c.time).substring(0, 5) : ''}</p>
                                    {c.notes && <p className="text-xs text-gray-400 mt-0.5">{c.notes}</p>}
                                  </div>
                                  <select value={c.status}
                                    onChange={e => handleCitaStatusChange(c.id, e.target.value)}
                                    className="text-xs px-2 py-1 rounded-lg border border-gray-200 focus:border-teal-500 outline-none transition shrink-0">
                                    {Object.keys(APPT_STATUS).map(s => (
                                      <option key={s} value={s}>{APPT_STATUS[s].label}</option>
                                    ))}
                                  </select>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Tratamientos */}
                  {tab === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="flex justify-end">
                        <button onClick={() => setShowTForm(v => !v)}
                          className="btn-primary text-sm py-2 px-4">
                          {showTForm ? 'Cancelar' : '+ Añadir tratamiento'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {showTForm && (
                          <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleAddTreatment}
                            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3 overflow-hidden"
                          >
                            <h3 className="font-semibold text-gray-800 text-sm">Nuevo tratamiento</h3>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="col-span-2">
                                <input required placeholder="Nombre del tratamiento *" value={tForm.name}
                                  onChange={e => setTForm(f => ({ ...f, name: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition" />
                              </div>
                              <div className="col-span-2">
                                <textarea placeholder="Descripción (opcional)" value={tForm.description} rows={2}
                                  onChange={e => setTForm(f => ({ ...f, description: e.target.value }))}
                                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition resize-none" />
                              </div>
                              <input type="number" min="0" step="0.01" placeholder="Coste (€)" value={tForm.cost}
                                onChange={e => setTForm(f => ({ ...f, cost: e.target.value }))}
                                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition" />
                              <select value={tForm.status} onChange={e => setTForm(f => ({ ...f, status: e.target.value }))}
                                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition">
                                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s].label}</option>)}
                              </select>
                              <input type="number" placeholder="ID pieza (opcional)" value={tForm.toothRecordId}
                                onChange={e => setTForm(f => ({ ...f, toothRecordId: e.target.value }))}
                                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition" />
                              <input type="date" placeholder="Fecha realización" value={tForm.performedAt}
                                onChange={e => setTForm(f => ({ ...f, performedAt: e.target.value }))}
                                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-teal-500 outline-none transition" />
                            </div>
                            <button type="submit" disabled={saving}
                              className="btn-primary text-sm py-2 px-5 disabled:opacity-60">
                              {saving ? 'Guardando…' : 'Guardar'}
                            </button>
                          </motion.form>
                        )}
                      </AnimatePresence>

                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {treatments.length === 0 ? (
                          <p className="text-center text-gray-400 text-sm py-10">Sin tratamientos registrados</p>
                        ) : (
                          <ul className="divide-y divide-gray-50">
                            {treatments.map(t => {
                              const st = STATUS_LABEL[t.status] ?? { label: t.status, color: 'bg-gray-100 text-gray-600' }
                              return (
                                <li key={t.id} className="p-4 flex items-start gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium text-sm text-gray-900">{t.name}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                                      {t.toothNumber && <span className="text-xs text-gray-400">· Pieza {t.toothNumber}</span>}
                                    </div>
                                    {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {t.cost != null && <span className="text-sm font-semibold text-teal-700">{t.cost}€</span>}
                                    <select value={t.status}
                                      onChange={e => handleStatusChange(t.id, e.target.value)}
                                      className="text-xs px-2 py-1 rounded-lg border border-gray-200 focus:border-teal-500 outline-none transition">
                                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s].label}</option>)}
                                    </select>
                                    <button onClick={() => handleDeleteTreatment(t.id)}
                                      className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                      title="Eliminar tratamiento">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                                      </svg>
                                    </button>
                                  </div>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
