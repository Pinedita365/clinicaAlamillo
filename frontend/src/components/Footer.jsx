import { Link } from 'react-router-dom'

const legalLinks = [
  { to: '/aviso-legal',          label: 'Aviso Legal' },
  { to: '/politica-privacidad',  label: 'Política de Privacidad' },
  { to: '/politica-cookies',     label: 'Política de Cookies' },
]

const services = [
  'Limpieza dental',
  'Curetajes',
  'Obturaciones / empastes',
  'Endodoncia',
  'Ortodoncia',
  'Implantes dentales',
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="contacto" className="bg-gray-900 text-gray-300" role="contentinfo">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main grid */}
        <div className="py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4" aria-label="Clínica Dental Alamillo – Inicio">
              <img src={`${import.meta.env.BASE_URL}LogoClinica.jpeg`} alt="" className="h-9 w-9 rounded-xl object-cover" aria-hidden="true" />
              <span className="font-display font-bold text-white text-lg">
                Alamillo <span className="text-teal-400 font-medium text-base">Dental</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Tu clínica dental de confianza en Sevilla. Más de 10 años cuidando la salud bucodental de nuestros pacientes.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              <a href="https://www.facebook.com/clinicadentalalamillo" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-teal-600 flex items-center justify-center transition-colors"
                aria-label="Facebook de Clínica Dental Alamillo">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/clinicadentalalamillo" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-teal-600 flex items-center justify-center transition-colors"
                aria-label="Instagram de Clínica Dental Alamillo">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Services column */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Tratamientos</h3>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s}>
                  <a
                    href="/#servicios"
                    className="text-sm text-gray-400 hover:text-teal-400 transition-colors"
                    aria-label={`Servicio: ${s}`}
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <svg className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3"/>
                </svg>
                <address className="not-italic">Av. Juventudes Musicales, Norte<br />41015 Sevilla, España</address>
              </li>
              <li>
                <a href="tel:+34602458249" className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-teal-400 transition-colors">
                  <svg className="w-4 h-4 text-teal-500 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
                  </svg>
                  602 45 82 49
                </a>
              </li>
              <li>
                <a href="mailto:info@clinicadentalalamillo.com" className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-teal-400 transition-colors">
                  <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  info@clinicadentalalamillo.com
                </a>
              </li>
            </ul>
          </div>

          {/* Hours column */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Horario</h3>
            <ul className="space-y-2">
              {[
                { day: 'Lunes – Viernes', hours: '09:00 – 20:00' },
                { day: 'Sábado',          hours: '09:00 – 14:00' },
                { day: 'Domingo',         hours: 'Cerrado' },
              ].map(({ day, hours }) => (
                <li key={day} className="flex justify-between text-sm gap-4">
                  <span className="text-gray-400">{day}</span>
                  <span className={`font-medium ${hours === 'Cerrado' ? 'text-gray-600' : 'text-teal-400'}`}>{hours}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 p-3 bg-teal-900/40 rounded-xl border border-teal-800/50">
              <p className="text-xs text-teal-300 font-medium">🦷 Urgencias dentales disponibles</p>
              <p className="text-xs text-gray-400 mt-0.5">Llama al 602 45 82 49</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {year} Clínica Dental Alamillo S.L. · CIF: B-XXXXXXXX · Todos los derechos reservados.</p>
          <nav aria-label="Navegación legal">
            <ul className="flex flex-wrap gap-4 justify-center sm:justify-end">
              {legalLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-teal-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
