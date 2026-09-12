import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../utils/auth'

const navLinks = [
  { href: '/#servicios', label: 'Servicios' },
  { href: '/#citas',     label: 'Pedir Cita' },
  { href: '/#resenas',   label: 'Reseñas' },
  { href: '/#contacto',  label: 'Contacto' },
]

export default function Navbar() {
  const [isOpen,      setIsOpen]      = useState(false)
  const [isScrolled,  setIsScrolled]  = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => { logout(); navigate('/') }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setIsOpen(false) }, [location])

  const handleAnchor = (e, href) => {
    if (href.startsWith('/#')) {
      if (location.pathname === '/') {
        e.preventDefault()
        const id = href.slice(2)
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}
      role="banner"
    >
      <nav
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20"
        aria-label="Navegación principal"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" aria-label="Clínica Dental Alamillo – Inicio">
          <img src="/LogoClinica.jpeg" alt="" className="h-9 w-9 rounded-xl object-cover shadow-sm" aria-hidden="true" />
          <span className={`font-display font-bold text-lg leading-tight transition-colors
            ${isScrolled ? 'text-gray-900' : 'text-gray-900'}`}>
            <span className="text-teal-600">Alamillo</span>{' '}
            <span className="hidden sm:inline text-gray-700 font-medium text-base">Dental</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => handleAnchor(e, href)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-teal-700 hover:bg-teal-50 transition-all duration-200"
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA desktop */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="tel:+34602458249"
            className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors flex items-center gap-1.5"
            aria-label="Llamar a la clínica"
          >
            <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
            </svg>
            602 45 82 49
          </a>
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={user.role === 'PATIENT' ? '/paciente' : '/clinica'}
                className="text-sm font-medium text-teal-700 hover:underline"
              >
                Mi área
              </Link>
              <button onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100">
                Salir
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-teal-700 transition-colors">
                Iniciar sesión
              </Link>
              <a href="/#citas" onClick={(e) => handleAnchor(e, '/#citas')} className="btn-primary text-sm">
                Pedir Cita
              </a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-teal-50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <motion.svg
            width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            animate={isOpen ? 'open' : 'closed'}
            aria-hidden="true"
          >
            {isOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6"  x2="21" y2="6"  />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </motion.svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={(e) => handleAnchor(e, href)}
                  className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-teal-700 hover:bg-teal-50 transition-all"
                >
                  {label}
                </a>
              ))}
              <div className="pt-3 pb-1 border-t border-gray-100 mt-2">
                <a href="/#citas" onClick={(e) => handleAnchor(e, '/#citas')} className="btn-primary w-full justify-center">
                  Pedir Cita Ahora
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
