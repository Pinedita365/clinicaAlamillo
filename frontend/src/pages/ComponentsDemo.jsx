import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import OdontogramView from '../components/OdontogramView'
import BookingCalendar from '../components/BookingCalendar'
import GamifiedPet from '../components/GamifiedPet'
import AccessibilityAlert from '../components/AccessibilityAlert'

/**
 * Página-escaparate de los componentes clave de la Fase 1. Sirve como demo
 * viva y banco de pruebas manual. No está enlazada en la navegación pública;
 * se accede por URL directa (/componentes). No debe indexarse (noindex).
 */

const DEMO_RECORDS = [
  { toothNumber: 16, condition: 'CARIES' },
  { toothNumber: 11, condition: 'CROWN' },
  { toothNumber: 26, condition: 'FILLED' },
  { toothNumber: 36, condition: 'ROOT_CANAL' },
  { toothNumber: 46, condition: 'IMPLANT' },
  { toothNumber: 48, condition: 'EXTRACTED' },
]

const DEMO_REWARDS = [
  { id: 1, label: 'Cepillo mágico', icon: '🪥', unlocked: true },
  { id: 2, label: 'Sonrisa estrella', icon: '🌟', unlocked: true },
  { id: 3, label: 'Sin caries', icon: '🛡️', unlocked: false },
  { id: 4, label: 'Superhéroe dental', icon: '🦸', unlocked: false },
]

const DEMO_NEEDS = [
  { type: 'SENSORY', detail: 'Le molesta mucho el ruido del aspirador.' },
  { type: 'ANXIETY' },
]

function Section({ title, subtitle, children }) {
  return (
    <section className="mb-12">
      <h2 className="section-title text-2xl">{title}</h2>
      {subtitle && <p className="text-gray-500 mb-6">{subtitle}</p>}
      {children}
    </section>
  )
}

export default function ComponentsDemo() {
  const [records, setRecords] = useState(DEMO_RECORDS)
  const [ack, setAck] = useState(false)
  const [picked, setPicked] = useState(null)

  const handleToothChange = (toothNumber, condition) => {
    setRecords((prev) => {
      const rest = prev.filter((r) => r.toothNumber !== toothNumber)
      return condition === 'HEALTHY' ? rest : [...rest, { toothNumber, condition }]
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Helmet>
        <title>Componentes · Clínica Dental Alamillo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="mb-10">
        <h1 className="font-display font-bold text-3xl text-gray-900">Componentes clave</h1>
        <p className="text-gray-500 mt-1">Demo interactiva · Fase 1 (Cimientos)</p>
      </header>

      <Section title="Odontograma interactivo" subtitle="Modo dentista (editable): selecciona una pieza y asígnale un estado.">
        <OdontogramView records={records} onToothChange={handleToothChange} editable dentition="permanent" />
      </Section>

      <Section title="Calendario de reserva" subtitle="Selecciona un día laborable y consulta los huecos libres (requiere el API en :8080).">
        <BookingCalendar onSelect={setPicked} />
        {picked && (
          <p className="mt-4 text-sm text-teal-700 font-medium">
            Seleccionado: {picked.date} a las {picked.time}
          </p>
        )}
      </Section>

      <Section title="Mascota gamificada" subtitle="Portal pediátrico 'Diario Dental': niveles, XP y recompensas.">
        <GamifiedPet name="Muelín" level={3} xp={65} xpToNext={100} rewards={DEMO_REWARDS} mood="happy" />
      </Section>

      <Section title="Aviso de accesibilidad" subtitle="Se muestra al profesional antes de la consulta.">
        <AccessibilityAlert
          patientName="Lucía M."
          needs={DEMO_NEEDS}
          appointmentTime="10:30"
          acknowledged={ack}
          onAcknowledge={() => setAck(true)}
        />
      </Section>
    </div>
  )
}
