import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { createAppointment } from '../utils/api'

const SERVICES = [
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

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8" aria-label={`Paso ${current} de ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
              ${i + 1 < current  ? 'bg-teal-600 text-white' : ''}
              ${i + 1 === current ? 'bg-teal-600 text-white ring-4 ring-teal-100' : ''}
              ${i + 1 > current  ? 'bg-gray-100 text-gray-400' : ''}
            `}
            aria-current={i + 1 === current ? 'step' : undefined}
          >
            {i + 1 < current ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (i + 1)}
          </div>
          {i < total - 1 && (
            <div className={`w-8 h-0.5 transition-colors duration-300 ${i + 1 < current ? 'bg-teal-600' : 'bg-gray-200'}`} aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  )
}

export default function BookingForm() {
  const [step,    setStep]    = useState(1)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm({ mode: 'onBlur' })

  const selectedTime = watch('time')

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  const nextStep = async () => {
    const fields = step === 1
      ? ['service']
      : step === 2
        ? ['date', 'time']
        : ['name', 'phone', 'email']
    const valid = await trigger(fields)
    if (valid) setStep((s) => s + 1)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setError(null)
    try {
      await createAppointment({
        patientName:  data.name,
        phone:        data.phone,
        email:        data.email,
        service:      data.service,
        date:         data.date,
        time:         data.time,
        notes:        data.notes || '',
      })
      setSuccess(true)
    } catch {
      setError('Ha ocurrido un error al enviar la cita. Por favor, llámenos directamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12 px-6"
        role="alert"
        aria-live="polite"
      >
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-2xl text-gray-900 mb-2">¡Cita Solicitada!</h3>
        <p className="text-gray-500 mb-6">
          Hemos recibido tu solicitud. Te confirmaremos la cita por SMS y email en las próximas horas.
        </p>
        <button
          className="btn-secondary"
          onClick={() => { setSuccess(false); setStep(1) }}
        >
          Pedir otra cita
        </button>
      </motion.div>
    )
  }

  return (
    <section id="citas" className="py-20 md:py-28 bg-gradient-to-br from-teal-50 to-white" aria-labelledby="citas-title">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="inline-block text-teal-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Sistema de Citas
          </span>
          <h2 id="citas-title" className="section-title">Pide tu Cita Online</h2>
          <p className="section-subtitle text-base">
            Rápido, fácil y sin esperas. Te confirmamos en menos de 2 horas.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-teal-100 p-6 md:p-10">
          <StepIndicator current={step} total={3} />

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <AnimatePresence mode="wait">

              {/* PASO 1 – Servicio */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="font-display font-bold text-xl text-gray-900 mb-6">¿Qué tratamiento necesitas?</h3>
                  <div className="grid grid-cols-2 gap-3" role="group" aria-label="Seleccionar tratamiento">
                    {SERVICES.map((svc) => {
                      const isSelected = watch('service') === svc
                      return (
                        <button
                          key={svc}
                          type="button"
                          onClick={() => setValue('service', svc)}
                          className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200
                            ${isSelected
                              ? 'border-teal-600 bg-teal-50 text-teal-800'
                              : 'border-gray-200 text-gray-600 hover:border-teal-300 hover:bg-teal-50/50'
                            }`}
                          aria-pressed={isSelected}
                        >
                          {svc}
                        </button>
                      )
                    })}
                  </div>
                  <input type="hidden" {...register('service', { required: 'Selecciona un tratamiento' })} />
                  {errors.service && (
                    <p className="mt-3 text-sm text-red-500" role="alert">{errors.service.message}</p>
                  )}
                </motion.div>
              )}

              {/* PASO 2 – Fecha y hora */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="font-display font-bold text-xl text-gray-900 mb-6">Elige fecha y hora</h3>
                  <div className="mb-6">
                    <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                      Fecha <span aria-hidden="true" className="text-red-500">*</span>
                    </label>
                    <input
                      id="date"
                      type="date"
                      min={minDateStr}
                      className={`input-field ${errors.date ? 'input-error' : ''}`}
                      aria-required="true"
                      aria-invalid={!!errors.date}
                      aria-describedby={errors.date ? 'date-error' : undefined}
                      {...register('date', {
                        required: 'Selecciona una fecha',
                        validate: (v) => new Date(v) >= minDate || 'La fecha debe ser a partir de mañana',
                      })}
                    />
                    {errors.date && <p id="date-error" className="mt-1 text-sm text-red-500" role="alert">{errors.date.message}</p>}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Hora <span aria-hidden="true" className="text-red-500">*</span>
                    </p>
                    <div className="grid grid-cols-4 gap-2" role="group" aria-label="Seleccionar hora">
                      {TIME_SLOTS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setValue('time', t)}
                          className={`py-2.5 px-1 text-sm rounded-xl border-2 font-medium transition-all duration-200
                            ${selectedTime === t
                              ? 'border-teal-600 bg-teal-600 text-white'
                              : 'border-gray-200 text-gray-600 hover:border-teal-400'
                            }`}
                          aria-pressed={selectedTime === t}
                          aria-label={`Hora ${t}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <input type="hidden" {...register('time', { required: 'Selecciona una hora' })} />
                    {errors.time && <p className="mt-2 text-sm text-red-500" role="alert">{errors.time.message}</p>}
                  </div>
                </motion.div>
              )}

              {/* PASO 3 – Datos de contacto */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="font-display font-bold text-xl text-gray-900 mb-6">Tus datos de contacto</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Nombre completo <span aria-hidden="true" className="text-red-500">*</span>
                      </label>
                      <input
                        id="name" type="text" placeholder="Ej: Ana García López"
                        className={`input-field ${errors.name ? 'input-error' : ''}`}
                        aria-required="true" aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        autoComplete="name"
                        {...register('name', {
                          required: 'Introduce tu nombre',
                          minLength: { value: 2, message: 'Nombre demasiado corto' },
                        })}
                      />
                      {errors.name && <p id="name-error" className="mt-1 text-sm text-red-500" role="alert">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Teléfono <span aria-hidden="true" className="text-red-500">*</span>
                      </label>
                      <input
                        id="phone" type="tel" placeholder="6XX XXX XXX"
                        className={`input-field ${errors.phone ? 'input-error' : ''}`}
                        aria-required="true" aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                        autoComplete="tel"
                        {...register('phone', {
                          required: 'Introduce tu teléfono',
                          pattern: { value: /^[6-9]\d{8}$/, message: 'Teléfono no válido (9 dígitos, empieza por 6, 7, 8 o 9)' },
                        })}
                      />
                      {errors.phone && <p id="phone-error" className="mt-1 text-sm text-red-500" role="alert">{errors.phone.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Email <span aria-hidden="true" className="text-red-500">*</span>
                      </label>
                      <input
                        id="email" type="email" placeholder="tu@correo.com"
                        className={`input-field ${errors.email ? 'input-error' : ''}`}
                        aria-required="true" aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        autoComplete="email"
                        {...register('email', {
                          required: 'Introduce tu email',
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email no válido' },
                        })}
                      />
                      {errors.email && <p id="email-error" className="mt-1 text-sm text-red-500" role="alert">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Notas adicionales <span className="text-gray-400 font-normal">(opcional)</span>
                      </label>
                      <textarea
                        id="notes" rows={3}
                        placeholder="Cuéntanos brevemente tu motivo de consulta..."
                        className="input-field resize-none"
                        {...register('notes')}
                      />
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed">
                      Al enviar aceptas nuestra{' '}
                      <a href="/politica-privacidad" className="text-teal-600 underline hover:text-teal-800">
                        Política de Privacidad
                      </a>
                      . Tus datos se usarán exclusivamente para gestionar tu cita y no serán cedidos a terceros.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error general */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600" role="alert">
                {error}
              </div>
            )}

            {/* Botones de navegación */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="btn-secondary flex-1"
                  aria-label="Volver al paso anterior"
                >
                  ← Atrás
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex-1"
                  aria-label="Siguiente paso"
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Confirmar y enviar solicitud de cita"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                      </svg>
                      Enviando...
                    </span>
                  ) : '✓ Confirmar Cita'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
