import { Helmet } from 'react-helmet-async'

const cookies = [
  { nombre: 'clinica_alamillo_cookie_consent', tipo: 'Propia · Esencial',   duracion: '1 año',   finalidad: 'Almacena la preferencia de cookies del usuario.' },
  { nombre: '_ga',                              tipo: 'Google Analytics',    duracion: '2 años',  finalidad: 'Identifica usuarios únicos para estadísticas.' },
  { nombre: '_ga_XXXXXXX',                      tipo: 'Google Analytics',    duracion: '2 años',  finalidad: 'Mantiene el estado de la sesión de Google Analytics.' },
  { nombre: '_gid',                             tipo: 'Google Analytics',    duracion: '24 horas', finalidad: 'Distingue usuarios para estadísticas.' },
  { nombre: 'session_id',                       tipo: 'Propia · Técnica',   duracion: 'Sesión',  finalidad: 'Gestión de sesión de usuario en el servidor.' },
]

export default function PoliticaCookies() {
  const rechazar = () => {
    localStorage.setItem('clinica_alamillo_cookie_consent', JSON.stringify({ analytics: false, marketing: false, date: new Date().toISOString() }))
    alert('Tus preferencias han sido guardadas. Solo se usarán cookies esenciales.')
  }

  const aceptar = () => {
    localStorage.setItem('clinica_alamillo_cookie_consent', JSON.stringify({ analytics: true, marketing: false, date: new Date().toISOString() }))
    alert('Has aceptado todas las cookies. Gracias.')
  }

  return (
    <>
      <Helmet>
        <title>Política de Cookies | Clínica Dental Alamillo Sevilla</title>
        <meta name="description" content="Política de Cookies de Clínica Dental Alamillo. Información sobre el uso de cookies conforme al RGPD y LSSI-CE." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">Política de Cookies</h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-display font-bold text-gray-900 mb-3">1. ¿Qué son las cookies?</h2>
            <p>Las cookies son pequeños ficheros de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten que el sitio recuerde tus preferencias y mejore tu experiencia de navegación.</p>
            <p className="mt-2">Este sitio utiliza cookies propias y de terceros. Puedes gestionar tus preferencias en cualquier momento usando el panel de abajo o la configuración de tu navegador.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-gray-900 mb-3">2. Tipos de Cookies Utilizadas</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-teal-50">
                    <th className="text-left p-3 font-semibold text-gray-700">Nombre</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Tipo</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Duración</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Finalidad</th>
                  </tr>
                </thead>
                <tbody>
                  {cookies.map((c, i) => (
                    <tr key={c.nombre} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-mono text-xs text-teal-700 break-all">{c.nombre}</td>
                      <td className="p-3 text-xs whitespace-nowrap">{c.tipo}</td>
                      <td className="p-3 text-xs whitespace-nowrap">{c.duracion}</td>
                      <td className="p-3 text-xs">{c.finalidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-gray-900 mb-3">3. Base Legal</h2>
            <p>El uso de cookies analíticas se realiza con tu <strong>consentimiento previo</strong> (art. 22.2 LSSI-CE y art. 6.1.a RGPD). Las cookies técnicas/esenciales no requieren consentimiento por ser necesarias para el funcionamiento del sitio.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-gray-900 mb-3">4. Cómo Gestionar tus Preferencias</h2>
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6">
              <p className="text-sm text-gray-600 mb-4">Puedes cambiar tus preferencias de cookies en cualquier momento:</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={rechazar}
                  className="flex-1 px-5 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold text-sm hover:border-teal-400 hover:bg-white transition-all"
                >
                  Solo cookies esenciales
                </button>
                <button
                  onClick={aceptar}
                  className="flex-1 px-5 py-3 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition-colors"
                >
                  Aceptar todas las cookies
                </button>
              </div>
            </div>
            <p className="mt-4 text-sm">
              También puedes configurar o deshabilitar las cookies directamente desde tu navegador. Para más información, visita las páginas de ayuda de{' '}
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">Chrome</a>,{' '}
              <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">Firefox</a> o{' '}
              <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">Safari</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-gray-900 mb-3">5. Transferencias Internacionales</h2>
            <p>Google Analytics puede transferir datos a servidores en EE.UU. Esta transferencia se realiza bajo las Cláusulas Contractuales Tipo (CCT) aprobadas por la Comisión Europea, conforme al art. 46 RGPD.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-gray-900 mb-3">6. Contacto</h2>
            <p>Para cualquier consulta sobre cookies puedes contactar con nosotros en <a href="mailto:privacidad@clinicadentalalamillo.com" className="text-teal-600 underline">privacidad@clinicadentalalamillo.com</a>.</p>
          </section>
        </div>
      </div>
    </>
  )
}
