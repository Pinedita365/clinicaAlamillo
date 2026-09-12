import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const services = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Limpieza Dental',
    desc: 'Eliminamos sarro y manchas con ultrasonidos y pulido profesional para una higiene bucodental óptima.',
    tag: 'Más solicitado',
    tagColor: 'bg-teal-100 text-teal-800',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
      </svg>
    ),
    title: 'Ortodoncia',
    desc: 'Brackets tradicionales, Invisalign® y ortodoncia lingual para adultos y niños. Resultados garantizados.',
    tag: null,
    tagColor: '',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 14v1m8-8h-1M5 12H4m13.657-5.657l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707" />
        <circle cx="12" cy="12" r="4" strokeLinecap="round" />
      </svg>
    ),
    title: 'Implantes Dentales',
    desc: 'Implantes de titanio de última generación. La solución permanente y natural para dientes perdidos.',
    tag: null,
    tagColor: '',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: 'Estética Dental',
    desc: 'Blanqueamiento, carillas de porcelana y composite para transformar tu sonrisa.',
    tag: null,
    tagColor: '',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: 'Endodoncia',
    desc: 'Tratamiento de conductos sin dolor con técnicas rotatorias de alta precisión. Salva tu diente natural.',
    tag: null,
    tagColor: '',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Odontopediatría',
    desc: 'Cuidado dental especializado para los más pequeños en un ambiente tranquilo y amigable.',
    tag: null,
    tagColor: '',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function Services() {
  const [ref, inView] = useInView({ threshold: 0.1 })

  return (
    <section
      id="servicios"
      className="py-20 md:py-28 bg-white"
      aria-labelledby="servicios-title"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            className="inline-block text-teal-600 font-semibold text-sm uppercase tracking-widest mb-3"
          >
            Nuestros Tratamientos
          </motion.span>
          <h2 id="servicios-title" className="section-title">Servicios Dentales en Sevilla</h2>
          <p className="section-subtitle">
            Ofrecemos una atención integral adaptada a cada paciente, con la más avanzada tecnología dental.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service) => (
            <motion.article
              key={service.title}
              variants={item}
              className="card p-6 group hover:-translate-y-1 transition-transform duration-300"
              aria-label={service.title}
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                {service.icon}
              </div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-display font-bold text-lg text-gray-900">{service.title}</h3>
                {service.tag && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${service.tagColor}`}>
                    {service.tag}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>
              <button
                className="mt-4 text-sm font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors"
                onClick={() => document.getElementById('citas')?.scrollIntoView({ behavior: 'smooth' })}
                aria-label={`Pedir cita para ${service.title}`}
              >
                Pedir cita
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
