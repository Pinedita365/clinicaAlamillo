import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useAuth } from '../utils/auth'
import { getMyProfile, getMyOdontogram, getMyTreatments, getMyAppointments, updateMyProfile, downloadMyBudget, downloadMyInvoice } from '../utils/api'
import OdontogramView from '../components/OdontogramView'
import GamifiedPet from '../components/GamifiedPet'

const TABS = ['Resumen', 'Mi Odontograma', 'Tratamientos', 'Mis Citas', 'Perfil']

const STATUS_LABEL = {
  PLANNED:     { label: 'Planificado',  color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'En curso',     color: 'bg-yellow-100 text-yellow-700' },
  COMPLETED:   { label: 'Completado',   color: 'bg-green-100 text-green-700' },
  CANCELLED:   { label: 'Cancelado',    color: 'bg-red-100 text-red-700' },
}

export default function PatientPortal() {
  const { user, logout } = useAuth()
  const [tab,        setTab]        = useState(0)
  const [profile,    setProfile]    = useState(null)
  const [records,    setRecords]    = useState([])
  const [treatments, setTreatments] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [editForm,   setEditForm]   = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [saveMsg,    setSaveMsg]    = useState(null)
  const [pdfLoading,    setPdfLoading]    = useState(null) // 'budget' | 'invoice' | null
  const [pdfError,      setPdfError]      = useState(null)
  const [appointments,  setAppointments]  = useState([])

  const handleDownload = async (type) => {
    setPdfLoading(type); setPdfError(null)
    try {
      if (type === 'budget') await downloadMyBudget()
      else await downloadMyInvoice()
    } catch (e) {
      setPdfError(e.message)
    } finally {
      setPdfLoading(null)
    }
  }

  useEffect(() => {
    Promise.all([getMyProfile(), getMyOdontogram(), getMyTreatments(), getMyAppointments()])
      .then(([p, o, t, a]) => {
        setProfile(p)
        setRecords(o)
        setTreatments(t)
        setAppointments(a)
        setEditForm({ fullName: p.fullName, phone: p.phone ?? '', birthDate: p.birthDate ?? '' })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true); setSaveMsg(null)
    try {
      const updated = await updateMyProfile(editForm)
      setProfile(updated)
      setSaveMsg('Perfil actualizado correctamente')
    } catch (err) {
      setSaveMsg('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Gamified XP (simple: 10 XP por tratamiento completado)
  const xp = treatments.filter(t => t.status === 'COMPLETED').length * 10
  const level = Math.floor(xp / 50) + 1

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Mi Área | Clínica Dental Alamillo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hola, {profile?.fullName?.split(' ')[0]} 👋</h1>
            <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 overflow-x-auto" role="tablist">
          {TABS.map((t, i) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === i}
              onClick={() => setTab(i)}
              className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${tab === i ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab: Resumen */}
        {tab === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Tratamientos totales', value: treatments.length, color: 'text-teal-600' },
                { label: 'Completados', value: treatments.filter(t => t.status === 'COMPLETED').length, color: 'text-green-600' },
                { label: 'Piezas registradas', value: records.length, color: 'text-blue-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4">Tu mascota dental</h2>
              <GamifiedPet
                name="Muelita"
                level={level}
                xp={xp % 50}
                xpToNext={50}
                mood={treatments.some(t => t.status === 'IN_PROGRESS') ? 'working' : 'happy'}
                rewards={[]}
              />
            </div>
          </motion.div>
        )}

        {/* Tab: Mi Odontograma */}
        {tab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-1">Odontograma</h2>
              <p className="text-sm text-gray-400 mb-6">Estado actual de tus piezas dentales (solo lectura)</p>
              {records.length === 0 ? (
                <p className="text-center text-gray-400 py-10">
                  Aún no hay registros en tu odontograma. Tu dentista los irá añadiendo en tus visitas.
                </p>
              ) : (
                <OdontogramView records={records} editable={false} />
              )}
            </div>
          </motion.div>
        )}

        {/* Tab: Tratamientos */}
        {tab === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                <h2 className="font-semibold text-gray-800">Historial de tratamientos</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload('budget')}
                    disabled={!!pdfLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold hover:bg-teal-100 transition-colors disabled:opacity-50"
                    aria-label="Descargar presupuesto en PDF"
                  >
                    {pdfLoading === 'budget' ? '...' : '⬇ Presupuesto PDF'}
                  </button>
                  <button
                    onClick={() => handleDownload('invoice')}
                    disabled={!!pdfLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    aria-label="Generar y descargar factura en PDF"
                  >
                    {pdfLoading === 'invoice' ? '...' : '🧾 Generar Factura'}
                  </button>
                </div>
              </div>
              {pdfError && (
                <div className="mx-6 mt-3 px-4 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700" role="alert">
                  {pdfError}
                </div>
              )}
              {treatments.length === 0 ? (
                <p className="text-center text-gray-400 py-10">No hay tratamientos registrados aún.</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {treatments.map(t => {
                    const st = STATUS_LABEL[t.status] ?? { label: t.status, color: 'bg-gray-100 text-gray-600' }
                    return (
                      <li key={t.id} className="p-5 flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900">{t.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                          </div>
                          {t.description && <p className="text-sm text-gray-500 mt-0.5">{t.description}</p>}
                          <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                            {t.dentistName && <span>Dr. {t.dentistName}</span>}
                            {t.toothNumber && <span>Pieza {t.toothNumber}</span>}
                            {t.performedAt && <span>{t.performedAt}</span>}
                          </div>
                        </div>
                        {t.cost != null && (
                          <span className="text-sm font-semibold text-teal-700 shrink-0">{t.cost} €</span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab: Mis Citas */}
        {tab === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Mis Citas</h2>
                <a href="/#citas" className="text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors">
                  + Pedir nueva cita
                </a>
              </div>
              {appointments.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-400 mb-4">No tienes citas registradas aún.</p>
                  <a href="/#citas" className="btn-primary text-sm">Pedir cita online</a>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {appointments.map(a => {
                    const colors = {
                      PENDING:   'bg-yellow-100 text-yellow-700',
                      CONFIRMED: 'bg-green-100 text-green-700',
                      CANCELLED: 'bg-red-100 text-red-700',
                      COMPLETED: 'bg-teal-100 text-teal-700',
                    }
                    const labels = { PENDING: 'Pendiente', CONFIRMED: 'Confirmada', CANCELLED: 'Cancelada', COMPLETED: 'Realizada' }
                    return (
                      <li key={a.id} className="p-5 flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-medium text-gray-900">{a.service}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[a.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {labels[a.status] ?? a.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {a.date} · {a.time ? String(a.time).substring(0, 5) : ''}
                          </p>
                          {a.notes && <p className="text-xs text-gray-400 mt-0.5">{a.notes}</p>}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab: Perfil */}
        {tab === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm max-w-md">
              <h2 className="font-semibold text-gray-800 mb-6">Mis datos</h2>
              {saveMsg && (
                <div role="alert" className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
                  saveMsg.startsWith('Error') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
                }`}>
                  {saveMsg}
                </div>
              )}
              {editForm && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {[
                    { id: 'fullName', label: 'Nombre completo', type: 'text' },
                    { id: 'phone',    label: 'Teléfono', type: 'tel' },
                    { id: 'birthDate', label: 'Fecha de nacimiento', type: 'date' },
                  ].map(({ id, label, type }) => (
                    <div key={id}>
                      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input
                        id={id} name={id} type={type}
                        value={editForm[id] ?? ''} onChange={(e) => setEditForm(f => ({ ...f, [e.target.name]: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm transition"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                    <input value={profile?.email ?? ''} disabled
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
                    <p className="text-xs text-gray-400 mt-1">El email no se puede modificar desde aquí.</p>
                  </div>
                  <button type="submit" disabled={saving}
                    className="btn-primary w-full justify-center py-2.5 text-sm font-semibold disabled:opacity-60">
                    {saving ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}
