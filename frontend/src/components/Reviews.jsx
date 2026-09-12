import ReviewCard from './ReviewCard'
import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'

const reviews = [
  {
    author: 'María José R.',
    rating: 5,
    date: 'Hace 2 semanas',
    text: 'Llevaba años con miedo al dentista y en Clínica Alamillo se me pasó completamente. El Dr. me explicó cada paso del tratamiento de ortodoncia con mucha paciencia. El personal es increíble y la clínica está equipada con tecnología de última generación. ¡Totalmente recomendable!',
    service: 'Ortodoncia',
    avatarColor: '#26a69a',
  },
  {
    author: 'Carlos M.',
    rating: 5,
    date: 'Hace 1 mes',
    text: 'Me puse dos implantes y el resultado es espectacular. No noté dolor durante el procedimiento y la recuperación fue muy rápida. El equipo es muy profesional y te tratan como si fueras de la familia. Sin duda la mejor clínica dental de Sevilla.',
    service: 'Implantes Dentales',
    avatarColor: '#0d9488',
  },
  {
    author: 'Laura P.',
    rating: 5,
    date: 'Hace 3 semanas',
    text: 'Fui para una limpieza dental y me quedé asombrada con el resultado. Los dientes me quedaron blanquísimos y el personal fue súper amable. Los precios son muy razonables y la clínica está impecable. Ya he recomendado a toda mi familia.',
    service: 'Limpieza Dental',
    avatarColor: '#14b8a6',
  },
]

export default function Reviews() {
  const [ref, inView] = useInView({ threshold: 0.1 })

  return (
    <section
      id="resenas"
      className="py-20 md:py-28 bg-gray-50"
      aria-labelledby="resenas-title"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14" ref={ref}>
          <motion.span
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-teal-600 font-semibold text-sm uppercase tracking-widest mb-3"
          >
            Lo que dicen nuestros pacientes
          </motion.span>
          <h2 id="resenas-title" className="section-title">Reseñas Verificadas en Google</h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex gap-1" aria-label="Valoración media 4.9">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span className="text-2xl font-display font-bold text-gray-900">4.9</span>
            <span className="text-gray-400 text-sm">· 47 reseñas en Google</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <ReviewCard key={review.author} review={review} index={i} />
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="https://g.page/r/clinicadentalalamillo/review"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex"
            aria-label="Ver todas las reseñas en Google (abre en nueva pestaña)"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Ver todas las reseñas en Google
          </a>
        </div>
      </div>
    </section>
  )
}
