import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const MAPS_SEARCH = 'Cl%C3%ADnica+Dental+Alamillo+Marta+Castro%2C+Av.+Juventudes+Musicales%2C+Norte%2C+41015+Sevilla'
const MAPS_EMBED  = `https://maps.google.com/maps?q=${MAPS_SEARCH}&output=embed&z=17&hl=es`
const MAPS_LINK   = `https://maps.google.com/maps?q=${MAPS_SEARCH}`

const howToGet = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
    title: 'Metro / Tranvía',
    desc: 'Línea T1 – Parada Centro Sevilla (3 min a pie)',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="1" /><path strokeLinecap="round" d="M16 8h4l3 3v5h-7V8z M5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm11 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      </svg>
    ),
    title: 'Autobús Urbano',
    desc: 'Líneas C1, C2 y 32 – Parada Puerta de Jerez',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m-5 9l3 3 3-3m-3 3V10" />
      </svg>
    ),
    title: 'Aparcamiento',
    desc: 'Parking Plaza Nueva a 200 m (tarifa especial pacientes)',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4l3 3" />
      </svg>
    ),
    title: 'Horario de Acceso',
    desc: 'Lun–Vie 09:00–20:00 · Sáb 09:00–14:00',
  },
]

export default function ContactMap() {
  const [ref, inView] = useInView({ threshold: 0.1 })

  return (
    <section
      id="contacto-mapa"
      className="py-20 md:py-28 bg-white"
      aria-labelledby="mapa-title"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12" ref={ref}>
          <motion.span
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-teal-600 font-semibold text-sm uppercase tracking-widest mb-3"
          >
            Encuéntranos
          </motion.span>
          <h2 id="mapa-title" className="section-title">Cómo Llegar a Nuestra Clínica</h2>
          <p className="section-subtitle">
            Estamos en el centro de Sevilla, accesibles en transporte público, en coche y en bicicleta.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Map embed */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="lg:col-span-3 rounded-2xl overflow-hidden shadow-lg border border-gray-100"
          >
            <div className="relative aspect-[4/3] bg-teal-50">
              <iframe
                title="Ubicación Clínica Dental Alamillo en Google Maps"
                src={MAPS_EMBED}
                width="100%"
                height="100%"
                style={{ border: 0, position: 'absolute', inset: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                aria-label="Mapa de Google con la ubicación de la Clínica Dental Alamillo en Sevilla"
              />
            </div>

            {/* Open in Google Maps CTA */}
            <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <circle cx="12" cy="11" r="3"/>
                </svg>
                Av. Juventudes Musicales, Norte · 41015 Sevilla
              </div>
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors"
                aria-label="Abrir en Google Maps (nueva pestaña)"
              >
                Abrir en Google Maps
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </motion.div>

          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="lg:col-span-2 flex flex-col gap-5"
          >
            {/* Address card */}
            <div className="card p-5">
              <h3 className="font-display font-bold text-gray-900 mb-3 text-base">Dirección</h3>
              <address className="not-italic text-sm text-gray-600 space-y-2">
                <p className="font-semibold text-gray-800">Clínica Dental Alamillo</p>
                <p>Av. Juventudes Musicales, Norte<br />41015 Sevilla, España</p>
                <div className="pt-2 space-y-1.5">
                  <a href="tel:+34602458249" className="flex items-center gap-2 text-teal-700 hover:text-teal-900 font-medium transition-colors">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
                    </svg>
                    602 45 82 49
                  </a>
                  <a href="mailto:info@clinicadentalalamillo.com" className="flex items-center gap-2 text-teal-700 hover:text-teal-900 font-medium transition-colors">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    info@clinicadentalalamillo.com
                  </a>
                </div>
              </address>
            </div>

            {/* How to get there */}
            <div className="card p-5">
              <h3 className="font-display font-bold text-gray-900 mb-4 text-base">Cómo Llegar</h3>
              <ul className="space-y-3.5">
                {howToGet.map(({ icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      {icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct to Maps button */}
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full justify-center text-sm"
              aria-label="Ver ruta en Google Maps (abre en nueva pestaña)"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Ver ruta en Google Maps
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
