import { motion } from 'framer-motion'

const stats = [
  { value: '+500',  label: 'Pacientes Felices' },
  { value: '+10',   label: 'Años de Experiencia' },
  { value: '4.9★',  label: 'Valoración Google' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.55, ease: 'easeOut' } }),
}

export default function Hero() {
  const scrollToCitas = () => {
    document.getElementById('citas')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      className="relative min-h-screen flex items-center bg-hero-pattern overflow-hidden"
      aria-label="Sección principal"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-white -z-10" />

      {/* Decorative circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-100 rounded-full opacity-40 blur-3xl -z-10" aria-hidden="true" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-teal-200 rounded-full opacity-30 blur-3xl -z-10" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 grid md:grid-cols-2 gap-12 items-center">

        {/* Text column */}
        <div>
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" animate="show"
            className="inline-flex items-center gap-2 bg-teal-100 text-teal-800 text-sm font-semibold px-4 py-1.5 rounded-full mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" aria-hidden="true" />
            Clínica Dental en Sevilla
          </motion.div>

          <motion.h1
            custom={1} variants={fadeUp} initial="hidden" animate="show"
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-gray-900 leading-tight text-balance mb-6"
          >
            Tu{' '}
            <span className="text-teal-600">Sonrisa Perfecta</span>
            {' '}Empieza Aquí
          </motion.h1>

          <motion.p
            custom={2} variants={fadeUp} initial="hidden" animate="show"
            className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg"
          >
            En <strong className="text-gray-700">Clínica Dental Alamillo</strong> combinamos la última tecnología con un trato personalizado para cuidar tu salud bucodental en el corazón de Sevilla.
          </motion.p>

          <motion.div
            custom={3} variants={fadeUp} initial="hidden" animate="show"
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={scrollToCitas}
              className="btn-primary text-base px-8 py-4 shadow-lg shadow-teal-200"
              aria-label="Ir al formulario de citas"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Pedir Cita Gratis
            </button>
            <a
              href="tel:+34602458249"
              className="btn-secondary text-base px-8 py-4"
              aria-label="Llamar a la clínica"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
              </svg>
              Llamar Ahora
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            custom={4} variants={fadeUp} initial="hidden" animate="show"
            className="flex flex-wrap gap-4 mt-10"
          >
            {[
              '✓ Sin lista de espera',
              '✓ Primeras consultas gratuitas',
              '✓ Financiación sin intereses',
            ].map((badge) => (
              <span key={badge} className="text-sm text-gray-500 font-medium">{badge}</span>
            ))}
          </motion.div>
        </div>

        {/* Stats column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.6 } }}
          className="flex flex-col items-center gap-6"
        >
          {/* Illustration card */}
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-teal-100 p-8 text-center">
            <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-14 h-14 text-teal-500" viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
                <path d="M32 4C20 4 12 12 12 22c0 5 2 9 5 12.5-2 3-5 6-5 10.5 0 8.3 6.7 14 20 15 13.3-1 20-6.7 20-15 0-4.5-3-7.5-5-10.5 3-3.5 5-7.5 5-12.5 0-10-8-18-20-18zm0 8c5 0 10 4.5 10 10S37 32 32 32s-10-4.5-10-10 5-10 10-10z" opacity=".15"/>
                <path d="M32 6C21 6 13 13 13 22c0 4.5 1.7 8.6 4.4 11.7-2.4 3.3-4.4 7-4.4 11.3 0 7.5 5.8 13 19 14 13.2-1 19-6.5 19-14 0-4.3-2-8-4.4-11.3C48.3 30.6 50 26.5 50 22c0-9-8-16-18-16zm0 4c7.7 0 14 5.8 14 12s-6.3 12-14 12S18 28.2 18 22s6.3-12 14-12zm0 28c10.5 0 16 4.5 16 11 0 5.5-4.5 10-16 11-11.5-1-16-5.5-16-11 0-6.5 5.5-11 16-11z"/>
              </svg>
            </div>
            <h2 className="font-display font-bold text-xl text-gray-900 mb-1">Clínica Dental Alamillo</h2>
            <p className="text-gray-500 text-sm mb-4">Sevilla · Desde 2026</p>
            <div className="flex justify-center gap-1 mb-2" aria-label="Valoración 4.9 de 5 estrellas">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <p className="text-sm text-gray-400">4.9 · 47 reseñas en Google</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
            {stats.map(({ value, label }, i) => (
              <motion.div
                key={label}
                custom={5 + i} variants={fadeUp} initial="hidden" animate="show"
                className="bg-white rounded-2xl border border-teal-100 shadow-sm p-4 text-center"
              >
                <p className="text-2xl font-display font-extrabold text-teal-600">{value}</p>
                <p className="text-xs text-gray-500 mt-1 leading-tight">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        aria-hidden="true"
      >
        <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </motion.div>
    </section>
  )
}
