import { useMemo, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAvailability } from '../utils/api'

/**
 * BookingCalendar – Calendario mensual interactivo para reserva de citas.
 *
 * Muestra un mes navegable, deshabilita días pasados / fines de semana, y al
 * seleccionar un día consulta al API los huecos libres (GET /appointments/availability).
 * Mobile-first y accesible: navegación por teclado, roles ARIA de grid y estados
 * anunciados con aria-live.
 *
 * Props:
 *  - onSelect: ({ date:string 'YYYY-MM-DD', time:string 'HH:mm' }) => void
 *              Se invoca cuando el usuario elige día + hora.
 *  - minLeadDays: number  – antelación mínima en días (por defecto 1 = a partir de mañana).
 *  - closedWeekdays: number[] – días cerrados (0=domingo … 6=sábado). Por defecto [0, 6].
 */

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] // lunes-first
const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** 'YYYY-MM-DD' local (sin desfases de zona horaria como toISOString). */
function toISODate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Índice de columna lunes-first (0=lunes … 6=domingo) para un getDay() dominical. */
const mondayIndex = (jsDay) => (jsDay + 6) % 7

export default function BookingCalendar({
  onSelect,
  minLeadDays = 1,
  closedWeekdays = [0, 6],
}) {
  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])

  const minDate = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + minLeadDays)
    return d
  }, [today, minLeadDays])

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotError, setSlotError] = useState(null)

  // Matriz de días de la cuadrícula del mes visible.
  const weeks = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstOfMonth = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const leading = mondayIndex(firstOfMonth.getDay())

    const cells = []
    for (let i = 0; i < leading; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    while (cells.length % 7 !== 0) cells.push(null)

    const rows = []
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
    return rows
  }, [viewDate])

  const isDisabled = useCallback((date) => {
    if (!date) return true
    if (date < minDate) return true
    if (closedWeekdays.includes(date.getDay())) return true
    return false
  }, [minDate, closedWeekdays])

  // Al elegir un día, pedir disponibilidad al API.
  useEffect(() => {
    if (!selectedDate) return
    let cancelled = false
    setLoadingSlots(true)
    setSlotError(null)
    setSelectedTime(null)

    getAvailability(selectedDate)
      .then((data) => { if (!cancelled) setSlots(Array.isArray(data) ? data : (data?.slots ?? [])) })
      .catch(() => { if (!cancelled) setSlotError('No se pudo cargar la disponibilidad. Inténtalo de nuevo.') })
      .finally(() => { if (!cancelled) setLoadingSlots(false) })

    return () => { cancelled = true }
  }, [selectedDate])

  const goMonth = (delta) => {
    setViewDate((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1))
  }

  const canGoPrev = viewDate > new Date(today.getFullYear(), today.getMonth(), 1)

  const pickDay = (date) => {
    const iso = toISODate(date)
    setSelectedDate(iso)
  }

  const pickTime = (time) => {
    setSelectedTime(time)
    onSelect?.({ date: selectedDate, time })
  }

  return (
    <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-4 sm:p-6 max-w-md w-full">
      {/* Cabecera de navegación */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => goMonth(-1)}
          disabled={!canGoPrev}
          className="p-2 rounded-lg text-gray-500 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-label="Mes anterior"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-display font-bold text-gray-900 capitalize" aria-live="polite">
          {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
        </h3>
        <button
          type="button"
          onClick={() => goMonth(1)}
          className="p-2 rounded-lg text-gray-500 hover:bg-teal-50 hover:text-teal-700 focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-label="Mes siguiente"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Cuadrícula del mes */}
      <div role="grid" aria-label="Selecciona un día">
        <div role="row" className="grid grid-cols-7 mb-2">
          {WEEKDAY_LABELS.map((w, i) => (
            <div key={i} role="columnheader" className="text-center text-xs font-semibold text-gray-400 py-1">
              {w}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div role="row" key={wi} className="grid grid-cols-7 gap-1 mb-1">
            {week.map((date, di) => {
              if (!date) return <div key={di} role="gridcell" aria-hidden="true" />
              const iso = toISODate(date)
              const disabled = isDisabled(date)
              const isSelected = selectedDate === iso
              const isToday = iso === toISODate(today)
              return (
                <button
                  key={di}
                  role="gridcell"
                  type="button"
                  disabled={disabled}
                  onClick={() => pickDay(date)}
                  aria-selected={isSelected}
                  aria-label={`${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}${disabled ? ', no disponible' : ''}`}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                    ${disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-teal-100 cursor-pointer'}
                    ${isSelected ? 'bg-teal-600 text-white hover:bg-teal-600' : ''}
                    ${isToday && !isSelected ? 'ring-1 ring-teal-400' : ''}
                    focus-visible:ring-2 focus-visible:ring-teal-500`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Panel de horas disponibles */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-5 border-t border-gray-100 pt-4"
          >
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Horas disponibles el <span className="text-teal-700">{selectedDate}</span>
            </p>

            <div aria-live="polite" aria-busy={loadingSlots}>
              {loadingSlots ? (
                <div className="flex justify-center py-4">
                  <svg className="animate-spin w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                </div>
              ) : slotError ? (
                <p className="text-sm text-red-500" role="alert">{slotError}</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-gray-400">No quedan huecos libres este día. Prueba otra fecha.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2" role="group" aria-label="Seleccionar hora">
                  {slots.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => pickTime(t)}
                      aria-pressed={selectedTime === t}
                      className={`py-2 text-sm rounded-lg border-2 font-medium transition-all
                        ${selectedTime === t
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-teal-400'}
                        focus-visible:ring-2 focus-visible:ring-teal-500`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
