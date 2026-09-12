import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAppointmentsByDateRange, updateAppointmentStatus } from '../utils/api'

// ── Constantes de columnas ──────────────────────────────────────
const COLUMNS = [
  { key: 'PENDING',   label: 'Pendiente',  color: 'bg-yellow-50 border-yellow-200', header: 'bg-yellow-100 text-yellow-800',  dot: 'bg-yellow-400' },
  { key: 'CONFIRMED', label: 'Confirmada', color: 'bg-teal-50 border-teal-200',     header: 'bg-teal-100 text-teal-800',      dot: 'bg-teal-500'   },
  { key: 'COMPLETED', label: 'Completada', color: 'bg-gray-50 border-gray-200',     header: 'bg-gray-100 text-gray-700',      dot: 'bg-gray-400'   },
  { key: 'CANCELLED', label: 'Cancelada',  color: 'bg-red-50 border-red-200',       header: 'bg-red-100 text-red-700',        dot: 'bg-red-400'    },
]

function isoToday() {
  return new Date().toISOString().split('T')[0]
}
function isoOffset(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

// ── Tarjeta de cita (draggable) ────────────────────────────────
function AppointmentCard({ appt, onDragStart }) {
  const timeStr = typeof appt.time === 'string' ? appt.time.slice(0, 5) : appt.time

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, appt)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow select-none"
      aria-label={`Cita de ${appt.patientName} el ${appt.date} a las ${timeStr}`}
      role="listitem"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-gray-900 text-sm leading-tight">{appt.patientName}</p>
        <span className="text-xs text-teal-600 font-bold whitespace-nowrap">{timeStr}</span>
      </div>
      <p className="text-xs text-gray-500 truncate mb-1">{appt.service}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">{appt.date}</span>
        {appt.phone && (
          <a
            href={`tel:${appt.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-teal-600 hover:underline"
            aria-label={`Llamar a ${appt.patientName}`}
          >
            {appt.phone}
          </a>
        )}
      </div>
      {appt.notes && (
        <p className="text-xs text-gray-400 mt-1.5 italic truncate" title={appt.notes}>
          {appt.notes}
        </p>
      )}
    </div>
  )
}

// ── Columna Kanban ─────────────────────────────────────────────
function KanbanColumn({ col, cards, onDragStart, onDrop, dragOverKey, setDragOverKey }) {
  const isOver = dragOverKey === col.key

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOverKey(col.key)
  }
  const handleDragLeave = () => setDragOverKey(null)
  const handleDrop = (e) => {
    e.preventDefault()
    setDragOverKey(null)
    onDrop(e, col.key)
  }

  return (
    <div
      className={`flex flex-col rounded-2xl border-2 transition-colors min-h-[500px]
        ${col.color} ${isOver ? 'border-teal-400 ring-2 ring-teal-200' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="list"
      aria-label={`Columna ${col.label}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${col.header}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} aria-hidden="true" />
          <span className="font-semibold text-sm">{col.label}</span>
        </div>
        <span className="text-xs font-bold bg-white/60 px-2 py-0.5 rounded-full">
          {cards.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {cards.length === 0 && (
          <p className="text-xs text-gray-400 text-center pt-8">Sin citas</p>
        )}
        {cards.map((appt) => (
          <AppointmentCard key={appt.id} appt={appt} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────
export default function KanbanAgenda() {
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [fromDate,     setFromDate]     = useState(isoToday())
  const [toDate,       setToDate]       = useState(isoOffset(7))
  const [dragOverKey,  setDragOverKey]  = useState(null)

  const draggingAppt = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAppointmentsByDateRange(fromDate, toDate)
      setAppointments(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [fromDate, toDate])

  useEffect(() => { load() }, [load])

  const handleDragStart = (e, appt) => {
    draggingAppt.current = appt
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = async (e, targetStatus) => {
    const appt = draggingAppt.current
    draggingAppt.current = null
    if (!appt || appt.status === targetStatus) return

    // Optimistic update
    setAppointments(prev =>
      prev.map(a => a.id === appt.id ? { ...a, status: targetStatus } : a)
    )
    try {
      await updateAppointmentStatus(appt.id, targetStatus)
    } catch (err) {
      setError('No se pudo actualizar el estado: ' + err.message)
      load()
    }
  }

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = appointments.filter(a => a.status === col.key)
    return acc
  }, {})

  const total = appointments.length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center" aria-hidden="true">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-none">Agenda Kanban</p>
            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
              {total} cita{total !== 1 ? 's' : ''} en el rango
            </p>
          </div>
        </div>

        {/* Date range + nav */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <label className="sr-only" htmlFor="from-date">Desde</label>
          <input
            id="from-date"
            type="date"
            value={fromDate}
            max={toDate}
            onChange={e => setFromDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <span className="text-xs text-gray-400">—</span>
          <label className="sr-only" htmlFor="to-date">Hasta</label>
          <input
            id="to-date"
            type="date"
            value={toDate}
            min={fromDate}
            onChange={e => setToDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button
            onClick={load}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-teal-600 transition-colors"
            title="Recargar"
            aria-label="Recargar agenda"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
          <button
            onClick={() => navigate('/clinica')}
            className="text-xs text-gray-400 hover:text-teal-600 transition-colors hidden sm:block"
          >
            Odontograma
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Volver
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-sm text-red-700 flex items-center justify-between">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">✕</button>
        </div>
      )}

      {/* Kanban board */}
      <main className="flex-1 px-4 sm:px-6 py-6 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-24" aria-live="polite">
            <svg className="animate-spin w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 min-w-[320px]">
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.key}
                col={col}
                cards={grouped[col.key] ?? []}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                dragOverKey={dragOverKey}
                setDragOverKey={setDragOverKey}
              />
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 text-center mt-4">
          Arrastra una tarjeta a otra columna para cambiar su estado.
        </p>
      </main>
    </div>
  )
}
