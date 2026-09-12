import { motion } from 'framer-motion'

/**
 * AccessibilityAlert – Aviso pre-consulta de necesidades especiales.
 *
 * Se muestra al dentista/recepción ANTES de la consulta para adaptar la atención
 * al perfil de accesibilidad del paciente (sensibilidad sensorial, movilidad
 * reducida, comunicación, ansiedad…). El propio componente es accesible
 * (WCAG 2.1 AA): usa `role="alert"`, contraste suficiente e iconos con texto.
 *
 * Nota de privacidad: estas necesidades son datos de salud (categoría especial,
 * art. 9 RGPD). Muéstralo solo a personal autorizado; su origen debe viajar
 * cifrado y su consulta quedar auditada (ver AuditLog en backend).
 *
 * Props:
 *  - patientName: string
 *  - needs: Array<{ type:string, detail?:string }>
 *           type ∈ NEED_TYPES (ver claves abajo). detail = texto libre opcional.
 *  - appointmentTime: string – hora de la cita (informativa).
 *  - onAcknowledge: () => void – marca el aviso como leído por el profesional.
 *  - acknowledged: boolean
 */

// Catálogo de necesidades soportadas → icono, etiqueta y pauta de adaptación.
export const NEED_TYPES = {
  SENSORY: {
    icon: '🔇', label: 'Sensibilidad sensorial',
    tip: 'Reducir luces y ruido; avisar antes de usar instrumental. Ofrecer auriculares.',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
  },
  MOBILITY: {
    icon: '♿', label: 'Movilidad reducida',
    tip: 'Acceso sin barreras; prever transferencia al sillón y tiempo extra.',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
  },
  ANXIETY: {
    icon: '💗', label: 'Ansiedad / fobia dental',
    tip: 'Explicar cada paso, señal de parada acordada, ambiente calmado.',
    color: 'bg-pink-50 border-pink-200 text-pink-800',
  },
  COMMUNICATION: {
    icon: '💬', label: 'Comunicación',
    tip: 'Lenguaje claro, apoyos visuales; confirmar comprensión. Posible intérprete.',
    color: 'bg-teal-50 border-teal-200 text-teal-800',
  },
  COGNITIVE: {
    icon: '🧩', label: 'Apoyo cognitivo',
    tip: 'Instrucciones sencillas y pautadas; acompañante de confianza si procede.',
    color: 'bg-amber-50 border-amber-200 text-amber-800',
  },
  MEDICAL: {
    icon: '⚕️', label: 'Alerta médica',
    tip: 'Revisar historia clínica: alergias, medicación y patologías previas.',
    color: 'bg-red-50 border-red-200 text-red-800',
  },
}

export default function AccessibilityAlert({
  patientName,
  needs = [],
  appointmentTime,
  onAcknowledge,
  acknowledged = false,
}) {
  if (needs.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      role="alert"
      aria-labelledby="a11y-alert-title"
      className="rounded-2xl border-2 border-teal-300 bg-teal-50/60 overflow-hidden shadow-sm"
    >
      {/* Cabecera */}
      <div className="flex items-start gap-3 p-4 bg-teal-100/70">
        <div className="w-10 h-10 shrink-0 rounded-full bg-teal-600 flex items-center justify-center" aria-hidden="true">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3l9 16H3l9-16z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h2 id="a11y-alert-title" className="font-display font-bold text-teal-900">
            Adaptaciones de accesibilidad
          </h2>
          <p className="text-sm text-teal-800">
            {patientName ? <><span className="font-semibold">{patientName}</span> requiere</> : 'Este paciente requiere'} atención adaptada
            {appointmentTime ? ` · cita ${appointmentTime}` : ''}.
          </p>
        </div>
      </div>

      {/* Lista de necesidades con pautas */}
      <ul className="p-4 space-y-2.5">
        {needs.map((need, i) => {
          const cfg = NEED_TYPES[need.type] ?? {
            icon: 'ℹ️', label: need.type, tip: '', color: 'bg-gray-50 border-gray-200 text-gray-700',
          }
          return (
            <li key={i} className={`flex gap-3 p-3 rounded-xl border ${cfg.color}`}>
              <span className="text-xl leading-none shrink-0" aria-hidden="true">{cfg.icon}</span>
              <div className="min-w-0">
                <p className="font-semibold text-sm">{cfg.label}</p>
                {cfg.tip && <p className="text-xs opacity-90 mt-0.5">{cfg.tip}</p>}
                {need.detail && (
                  <p className="text-xs mt-1 font-medium">
                    <span className="opacity-70">Nota del paciente:</span> {need.detail}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {/* Confirmación de lectura por el profesional */}
      <div className="px-4 pb-4">
        {acknowledged ? (
          <p className="text-sm text-teal-700 font-semibold flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Aviso revisado por el profesional.
          </p>
        ) : (
          <button
            type="button"
            onClick={onAcknowledge}
            className="btn-secondary w-full justify-center text-sm"
            aria-label="Confirmar que he leído las adaptaciones de accesibilidad"
          >
            He leído y tendré en cuenta estas adaptaciones
          </button>
        )}
      </div>
    </motion.section>
  )
}
