import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useAuth } from '../utils/auth'
import { loginApi } from '../utils/api'

export default function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const from       = location.state?.from ?? '/paciente'

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const successMsg = location.state?.message ?? null

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await loginApi(form)
      login(data.token, { email: data.email, fullName: data.fullName, role: data.role })
      // Dentistas/Admin van al panel clínico; pacientes al portal propio
      const dest = data.role === 'PATIENT' ? '/paciente' : '/clinica'
      navigate(data.role === 'PATIENT' ? from : dest, { replace: true })
    } catch (err) {
      setError(err.message ?? 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Iniciar sesión | Clínica Dental Alamillo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shadow">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 2.8 1.3 3.8C6.5 12 6 13.5 6 15c0 3.5 2 6 6 7 4-1 6-3.5 6-7 0-1.5-.5-3-1.3-4.2.8-1 1.3-2.3 1.3-3.8 0-2.5-2.5-5-6-5z" fill="white"/>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">Bienvenido de nuevo</h1>
          <p className="text-center text-gray-500 text-sm mb-8">
            Accede a tu área personal de Clínica Dental Alamillo
          </p>

          {successMsg && (
            <div role="status" className="mb-4 px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm border border-green-100">
              {successMsg}
            </div>
          )}

          {error && (
            <div role="alert" className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="email" name="email" type="email" autoComplete="email"
                required value={form.email} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm transition"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password" name="password" type="password" autoComplete="current-password"
                required value={form.password} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Accediendo…' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-teal-600 font-medium hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  )
}
