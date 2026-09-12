import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { validateInviteToken, acceptInvite } from '../utils/api'

export default function ActivarCuenta() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const token      = params.get('token') ?? ''

  const [info,        setInfo]        = useState(null)   // { email, fullName }
  const [validating,  setValidating]  = useState(true)
  const [tokenError,  setTokenError]  = useState(null)

  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [formError,   setFormError]   = useState(null)

  useEffect(() => {
    if (!token) { setTokenError('Enlace no válido.'); setValidating(false); return }
    validateInviteToken(token)
      .then(setInfo)
      .catch(e => setTokenError(e.message))
      .finally(() => setValidating(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) { setFormError('La contraseña debe tener al menos 8 caracteres.'); return }
    if (password !== confirm) { setFormError('Las contraseñas no coinciden.'); return }
    setSubmitting(true); setFormError(null)
    try {
      await acceptInvite({ token, password })
      navigate('/login', { state: { message: '¡Cuenta activada! Ya puedes iniciar sesión.' } })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Activar cuenta | Clínica Dental Alamillo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo/header */}
          <div className="text-center mb-8">
            <img src="/LogoClinica.jpeg" alt="Clínica Dental Alamillo" className="h-14 w-14 rounded-2xl object-cover mx-auto mb-4 shadow" />
            <h1 className="text-2xl font-display font-bold text-gray-900">Activa tu cuenta</h1>
            <p className="text-gray-500 text-sm mt-1">Clínica Dental Alamillo</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-teal-100 p-8">
            {validating && (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
              </div>
            )}

            {!validating && tokenError && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-800 mb-1">Enlace no válido</p>
                <p className="text-sm text-gray-500 mb-6">{tokenError}</p>
                <a href="/" className="btn-secondary text-sm">Volver al inicio</a>
              </div>
            )}

            {!validating && info && (
              <>
                <p className="text-gray-700 mb-6">
                  Hola <strong>{info.fullName}</strong>, establece la contraseña para activar tu cuenta{' '}
                  <span className="text-teal-600 font-medium">{info.email}</span>.
                </p>

                {formError && (
                  <div role="alert" className="mb-4 px-4 py-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-100">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="password" type="password" autoComplete="new-password"
                      placeholder="Mínimo 8 caracteres"
                      value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm transition"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="confirm" type="password" autoComplete="new-password"
                      placeholder="Repite la contraseña"
                      value={confirm} onChange={e => setConfirm(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm transition"
                      required
                    />
                  </div>
                  <button
                    type="submit" disabled={submitting}
                    className="btn-primary w-full justify-center py-3 text-sm font-semibold disabled:opacity-60 mt-2"
                  >
                    {submitting ? 'Activando…' : 'Activar mi cuenta'}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}
