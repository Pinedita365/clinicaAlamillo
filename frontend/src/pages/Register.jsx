import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useAuth } from '../utils/auth'
import { registerApi, loginApi } from '../utils/api'

export default function Register() {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirm: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      await registerApi({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password })
      // Login automático tras el registro
      const data = await loginApi({ email: form.email, password: form.password })
      login(data.token, { email: data.email, fullName: data.fullName, role: data.role })
      navigate('/paciente', { replace: true })
    } catch (err) {
      setError(err.message ?? 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Crear cuenta | Clínica Dental Alamillo</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shadow">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 2.8 1.3 3.8C6.5 12 6 13.5 6 15c0 3.5 2 6 6 7 4-1 6-3.5 6-7 0-1.5-.5-3-1.3-4.2.8-1 1.3-2.3 1.3-3.8 0-2.5-2.5-5-6-5z" fill="white"/>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">Crea tu cuenta</h1>
          <p className="text-center text-gray-500 text-sm mb-8">
            Gestiona tus citas y consulta tu historial
          </p>

          {error && (
            <div role="alert" className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {[
              { id: 'fullName', label: 'Nombre completo', type: 'text',     auto: 'name',          ph: 'Juan García López' },
              { id: 'email',    label: 'Correo electrónico', type: 'email', auto: 'email',         ph: 'tu@email.com' },
              { id: 'phone',    label: 'Teléfono (opcional)', type: 'tel',  auto: 'tel',           ph: '600 000 000' },
              { id: 'password', label: 'Contraseña (mín. 8 caracteres)', type: 'password', auto: 'new-password', ph: '••••••••' },
              { id: 'confirm',  label: 'Confirmar contraseña', type: 'password', auto: 'new-password', ph: '••••••••' },
            ].map(({ id, label, type, auto, ph }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  id={id} name={id} type={type} autoComplete={auto}
                  required={id !== 'phone'} value={form[id]} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm transition"
                  placeholder={ph}
                />
              </div>
            ))}

            <p className="text-xs text-gray-400">
              Al registrarte aceptas nuestra{' '}
              <Link to="/politica-privacidad" className="underline">política de privacidad</Link>.
              Tus datos médicos se cifran en reposo (RGPD).
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-teal-600 font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  )
}
