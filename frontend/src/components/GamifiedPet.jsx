import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * GamifiedPet – Mascota virtual del "Diario Dental" (portal pediátrico).
 *
 * Refuerza hábitos y adherencia al tratamiento en pacientes infantiles mediante
 * gamificación: una mascota (diente animado) que sube de nivel con la experiencia
 * (XP) y desbloquea recompensas que el dentista concede al completar tratamientos.
 *
 * Mobile-first, accesible y motivador. Las animaciones respetan
 * `prefers-reduced-motion` (Framer Motion lo aplica automáticamente).
 *
 * Props:
 *  - name:       string  – nombre de la mascota (p.ej. "Muelín").
 *  - level:      number  – nivel actual.
 *  - xp:         number  – experiencia acumulada en el nivel actual.
 *  - xpToNext:   number  – XP necesaria para subir de nivel.
 *  - rewards:    Array<{ id, label, icon, unlocked:boolean }>
 *  - mood:       'happy' | 'excited' | 'sleepy' – expresión de la mascota.
 *  - onCelebrate: () => void – callback opcional al pulsar "¡Celebrar!".
 */

const MOODS = {
  happy:   { eyes: 'M9 13 Q10 12 11 13 M15 13 Q16 12 17 13', mouth: 'M10 17 Q13 20 16 17', label: 'contento' },
  excited: { eyes: 'M9 12 l2 2 M17 12 l-2 2',                mouth: 'M10 16 Q13 21 16 16 Z', label: 'entusiasmado' },
  sleepy:  { eyes: 'M9 13 h2 M15 13 h2',                     mouth: 'M11 18 Q13 19 15 18', label: 'somnoliento' },
}

/** Diente-mascota como SVG animado. */
function PetAvatar({ mood, bouncing }) {
  const face = MOODS[mood] ?? MOODS.happy
  return (
    <motion.svg
      width="120" height="130" viewBox="0 0 26 28"
      role="img" aria-label={`Mascota ${face.label}`}
      animate={bouncing ? { y: [0, -10, 0], rotate: [0, -4, 4, 0] } : { y: [0, -4, 0] }}
      transition={{ duration: bouncing ? 0.6 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
      className="drop-shadow-lg"
    >
      {/* Cuerpo del diente */}
      <path
        d="M4 9 C4 2, 22 2, 22 9 C22 17, 19 24, 16 24 C14.5 24, 14 20, 13 20 C12 20, 11.5 24, 10 24 C7 24, 4 17, 4 9 Z"
        fill="#ffffff" stroke="#0d9488" strokeWidth="1.2"
      />
      {/* Mejillas */}
      <circle cx="8" cy="15" r="1.6" fill="#5eead4" opacity="0.7" />
      <circle cx="18" cy="15" r="1.6" fill="#5eead4" opacity="0.7" />
      {/* Ojos y boca */}
      <path d={face.eyes} stroke="#0f766e" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d={face.mouth} stroke="#0f766e" strokeWidth="1" fill="#f472b6" strokeLinecap="round" />
    </motion.svg>
  )
}

export default function GamifiedPet({
  name = 'Muelín',
  level = 1,
  xp = 0,
  xpToNext = 100,
  rewards = [],
  mood = 'happy',
  onCelebrate,
}) {
  const [celebrating, setCelebrating] = useState(false)

  const pct = useMemo(() => {
    if (!xpToNext) return 0
    return Math.min(100, Math.round((xp / xpToNext) * 100))
  }, [xp, xpToNext])

  const unlockedCount = rewards.filter((r) => r.unlocked).length

  const celebrate = () => {
    setCelebrating(true)
    onCelebrate?.()
    setTimeout(() => setCelebrating(false), 1500)
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-white rounded-3xl border border-teal-100 shadow-md p-6 max-w-sm w-full text-center">
      {/* Nivel */}
      <div className="inline-flex items-center gap-1.5 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
        <span aria-hidden="true">⭐</span> Nivel {level}
      </div>

      {/* Mascota + confeti al celebrar */}
      <div className="relative flex justify-center py-2" aria-live="polite">
        <PetAvatar mood={celebrating ? 'excited' : mood} bouncing={celebrating} />
        <AnimatePresence>
          {celebrating && (
            <>
              {['🎉', '✨', '⭐', '🦷', '💙'].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-2xl"
                  style={{ left: `${15 + i * 18}%`, top: '10%' }}
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 0], y: -60, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, delay: i * 0.08 }}
                  aria-hidden="true"
                >
                  {emoji}
                </motion.span>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      <h3 className="font-display font-bold text-xl text-gray-900">{name}</h3>
      <p className="text-sm text-gray-500 mb-4">Tu compañero dental</p>

      {/* Barra de XP */}
      <div className="mb-1 flex justify-between text-xs font-semibold text-gray-500">
        <span>Experiencia</span>
        <span className="tabular-nums">{xp} / {xpToNext} XP</span>
      </div>
      <div
        className="h-3 bg-white rounded-full overflow-hidden border border-teal-100"
        role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
        aria-label={`Progreso al nivel ${level + 1}: ${pct}%`}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-teal-400 to-teal-600"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Recompensas */}
      <div className="mt-5 text-left">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">Recompensas</p>
          <span className="text-xs text-gray-400">{unlockedCount}/{rewards.length} desbloqueadas</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {rewards.map((r) => (
            <div
              key={r.id}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all
                ${r.unlocked
                  ? 'border-teal-300 bg-teal-50'
                  : 'border-dashed border-gray-200 bg-gray-50 opacity-60'}`}
              title={r.unlocked ? r.label : `Bloqueada: ${r.label}`}
              aria-label={r.unlocked ? `Recompensa desbloqueada: ${r.label}` : `Recompensa bloqueada: ${r.label}`}
            >
              <span className="text-2xl" aria-hidden="true">{r.unlocked ? r.icon : '🔒'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botón celebrar */}
      <button
        type="button"
        onClick={celebrate}
        disabled={celebrating}
        className="btn-primary w-full justify-center mt-5 disabled:opacity-60"
        aria-label="Celebrar con tu mascota"
      >
        {celebrating ? '¡Yupi! 🎉' : '¡Celebrar! 🎉'}
      </button>
    </div>
  )
}
