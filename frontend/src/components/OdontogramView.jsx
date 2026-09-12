import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * OdontogramView – Odontograma dental interactivo (SVG).
 *
 * Representa la dentición del paciente en notación FDI y permite al dentista
 * registrar patologías por pieza. Diseñado mobile-first, accesible (WCAG 2.1 AA)
 * y con la paleta aguamarina de la clínica.
 *
 * Props:
 *  - records:   Array<{ toothNumber:number, condition:string, notes?:string }>
 *               Estado clínico actual de cada pieza registrada.
 *  - onToothChange: (toothNumber:number, condition:string) => void
 *               Callback al cambiar el estado de una pieza (modo edición).
 *  - editable:  boolean  – habilita la edición (rol dentista). Por defecto false.
 *  - dentition: 'permanent' | 'child' – tipo de dentición mostrada.
 *
 * El componente es controlado por `records`; no muta datos por sí mismo, solo
 * notifica cambios vía `onToothChange` para que el contenedor persista en el API.
 */

// ── Catálogo de estados (alineado con el enum ToothCondition del backend) ──────
export const TOOTH_CONDITIONS = {
  HEALTHY:   { label: 'Sano',        color: '#ffffff', stroke: '#94a3b8', text: '#334155' },
  CARIES:    { label: 'Caries',      color: '#ef4444', stroke: '#b91c1c', text: '#ffffff' },
  FILLED:    { label: 'Empaste',     color: '#3b82f6', stroke: '#1d4ed8', text: '#ffffff' },
  CROWN:     { label: 'Corona',      color: '#f59e0b', stroke: '#b45309', text: '#ffffff' },
  IMPLANT:   { label: 'Implante',    color: '#8b5cf6', stroke: '#6d28d9', text: '#ffffff' },
  EXTRACTED: { label: 'Ausente',     color: '#e2e8f0', stroke: '#64748b', text: '#64748b' },
  ROOT_CANAL:{ label: 'Endodoncia',  color: '#ec4899', stroke: '#be185d', text: '#ffffff' },
  SEALANT:   { label: 'Sellador',    color: '#14b8a6', stroke: '#0f766e', text: '#ffffff' },
  FRACTURE:  { label: 'Fractura',    color: '#f97316', stroke: '#c2410c', text: '#ffffff' },
}

const CONDITION_ORDER = Object.keys(TOOTH_CONDITIONS)

// ── Numeración FDI por cuadrante (de línea media hacia atrás) ──────────────────
const PERMANENT = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft:  [21, 22, 23, 24, 25, 26, 27, 28],
  lowerLeft:  [31, 32, 33, 34, 35, 36, 37, 38],
  lowerRight: [48, 47, 46, 45, 44, 43, 42, 41],
}
const CHILD = {
  upperRight: [55, 54, 53, 52, 51],
  upperLeft:  [61, 62, 63, 64, 65],
  lowerLeft:  [71, 72, 73, 74, 75],
  lowerRight: [85, 84, 83, 82, 81],
}

/** Un diente individual como botón SVG accesible. */
function Tooth({ number, condition, editable, onSelect, selected }) {
  const cfg = TOOTH_CONDITIONS[condition] ?? TOOTH_CONDITIONS.HEALTHY
  const isMissing = condition === 'EXTRACTED'

  return (
    <button
      type="button"
      onClick={() => editable && onSelect(number)}
      disabled={!editable}
      className={`group relative flex flex-col items-center gap-0.5 rounded-lg p-0.5 transition-all
        ${editable ? 'cursor-pointer hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-teal-500' : 'cursor-default'}
        ${selected ? 'ring-2 ring-teal-600 bg-teal-50' : ''}`}
      aria-pressed={selected}
      aria-label={`Pieza ${number} – ${cfg.label}${editable ? '. Pulsa para cambiar el estado.' : ''}`}
      title={`Pieza ${number}: ${cfg.label}`}
    >
      <svg width="26" height="34" viewBox="0 0 26 34" aria-hidden="true" className="drop-shadow-sm">
        {/* Corona */}
        <path
          d="M4 10 C4 3, 22 3, 22 10 C22 16, 20 20, 18 20 L8 20 C6 20, 4 16, 4 10 Z"
          fill={cfg.color} stroke={cfg.stroke} strokeWidth="1.5"
          strokeDasharray={isMissing ? '3 2' : undefined}
        />
        {/* Raíces */}
        <path d="M9 20 L7 32" stroke={cfg.stroke} strokeWidth="1.5" fill="none"
          strokeDasharray={isMissing ? '3 2' : undefined} />
        <path d="M17 20 L19 32" stroke={cfg.stroke} strokeWidth="1.5" fill="none"
          strokeDasharray={isMissing ? '3 2' : undefined} />
        {isMissing && <line x1="5" y1="6" x2="21" y2="26" stroke="#64748b" strokeWidth="1.5" />}
      </svg>
      <span className="text-[10px] font-semibold tabular-nums text-gray-500 group-hover:text-teal-700">
        {number}
      </span>
    </button>
  )
}

export default function OdontogramView({
  records = [],
  onToothChange,
  editable = false,
  dentition = 'permanent',
}) {
  const [selected, setSelected] = useState(null)
  const layout = dentition === 'child' ? CHILD : PERMANENT

  // Mapa piezaNº → estado, para consulta O(1) al pintar.
  const conditionByTooth = useMemo(() => {
    const map = {}
    for (const r of records) map[r.toothNumber] = r.condition
    return map
  }, [records])

  const selectedCondition = selected != null
    ? (conditionByTooth[selected] ?? 'HEALTHY')
    : null

  const handleSelect = (toothNumber) => {
    setSelected((prev) => (prev === toothNumber ? null : toothNumber))
  }

  const applyCondition = (condition) => {
    if (selected == null) return
    onToothChange?.(selected, condition)
  }

  const toothProps = { editable, onSelect: handleSelect }

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <p className="sr-only">Odontograma en notación FDI. Arcada superior e inferior.</p>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[520px] space-y-4">
            {/* Superior */}
            <div className="flex items-end justify-center gap-3">
              <div className="flex items-end gap-0.5">
                {layout.upperRight.map((n) => (
                  <Tooth key={n} number={n} condition={conditionByTooth[n] ?? 'HEALTHY'}
                    selected={selected === n} {...toothProps} />
                ))}
              </div>
              <div className="w-px self-stretch bg-teal-200" aria-hidden="true" />
              <div className="flex items-end gap-0.5">
                {layout.upperLeft.map((n) => (
                  <Tooth key={n} number={n} condition={conditionByTooth[n] ?? 'HEALTHY'}
                    selected={selected === n} {...toothProps} />
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100" aria-hidden="true" />

            {/* Inferior */}
            <div className="flex items-start justify-center gap-3">
              <div className="flex items-start gap-0.5">
                {layout.lowerRight.map((n) => (
                  <Tooth key={n} number={n} condition={conditionByTooth[n] ?? 'HEALTHY'}
                    selected={selected === n} {...toothProps} />
                ))}
              </div>
              <div className="w-px self-stretch bg-teal-200" aria-hidden="true" />
              <div className="flex items-start gap-0.5">
                {layout.lowerLeft.map((n) => (
                  <Tooth key={n} number={n} condition={conditionByTooth[n] ?? 'HEALTHY'}
                    selected={selected === n} {...toothProps} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selector de estado para la pieza seleccionada (modo edición) */}
        {editable && selected != null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t border-gray-100 pt-4"
            role="group" aria-label={`Estado de la pieza ${selected}`}
          >
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Pieza <span className="text-teal-700">{selected}</span> — asignar estado:
            </p>
            <div className="flex flex-wrap gap-2">
              {CONDITION_ORDER.map((key) => {
                const c = TOOTH_CONDITIONS[key]
                const active = selectedCondition === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyCondition(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all
                      ${active ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}
                    aria-pressed={active}
                  >
                    <span className="w-3 h-3 rounded-full border" style={{ background: c.color, borderColor: c.stroke }} aria-hidden="true" />
                    {c.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="Leyenda de estados">
        {CONDITION_ORDER.map((key) => {
          const c = TOOTH_CONDITIONS[key]
          return (
            <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="w-3 h-3 rounded-sm border" style={{ background: c.color, borderColor: c.stroke }} aria-hidden="true" />
              {c.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
