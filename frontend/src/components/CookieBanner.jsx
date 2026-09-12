import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'clinica_alamillo_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY)
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: true, marketing: false, date: new Date().toISOString() }))
    setVisible(false)
  }

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: false, marketing: false, date: new Date().toISOString() }))
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50"
          role="dialog"
          aria-label="Banner de cookies"
          aria-modal="false"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl" aria-hidden="true">🍪</span>
              <div>
                <h2 className="font-display font-bold text-gray-900 text-sm">Usamos cookies</h2>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Utilizamos cookies propias para mejorar tu experiencia y cookies analíticas (Google Analytics) para entender el uso del sitio.
                  Puedes aceptar todas o rechazar las no esenciales.{' '}
                  <Link to="/politica-cookies" className="text-teal-600 underline hover:text-teal-800" onClick={reject}>
                    Más información
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={reject}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                aria-label="Rechazar cookies no esenciales"
              >
                Solo esenciales
              </button>
              <button
                onClick={accept}
                className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
                aria-label="Aceptar todas las cookies"
              >
                Aceptar todas
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
