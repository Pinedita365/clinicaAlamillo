import { Helmet } from 'react-helmet-async'

export default function PoliticaPrivacidad() {
  return (
    <>
      <Helmet>
        <title>Política de Privacidad | Clínica Dental Alamillo Sevilla</title>
        <meta name="description" content="Política de Privacidad de Clínica Dental Alamillo conforme al RGPD y LOPDGDD. Conoce cómo tratamos tus datos personales." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section aria-labelledby="responsable">
            <h2 id="responsable" className="text-xl font-display font-bold text-gray-900 mb-3">1. Responsable del Tratamiento</h2>
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm space-y-1">
              <p><strong>Responsable:</strong> Clínica Dental Alamillo S.L.</p>
              <p><strong>CIF:</strong> B-XXXXXXXX</p>
              <p><strong>Dirección:</strong> Av. Juventudes Musicales, Norte, 41015 Sevilla</p>
              <p><strong>Contacto DPD:</strong> <a href="mailto:privacidad@clinicadentalalamillo.com" className="text-teal-600 underline">privacidad@clinicadentalalamillo.com</a></p>
            </div>
          </section>

          <section aria-labelledby="datos-recabados">
            <h2 id="datos-recabados" className="text-xl font-display font-bold text-gray-900 mb-3">2. Datos Personales Recabados</h2>
            <p>Tratamos los siguientes datos cuando utilizas nuestros formularios:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Nombre y apellidos</li>
              <li>Número de teléfono</li>
              <li>Dirección de correo electrónico</li>
              <li>Fecha y hora de cita preferida</li>
              <li>Motivo de consulta (si lo facilitas voluntariamente)</li>
            </ul>
            <p className="mt-3">En nuestra actividad clínica, también tratamos datos de salud (categoría especial según el art. 9 RGPD) bajo el amparo del consentimiento explícito y la necesidad de prestación asistencial.</p>
          </section>

          <section aria-labelledby="finalidad">
            <h2 id="finalidad" className="text-xl font-display font-bold text-gray-900 mb-3">3. Finalidad y Base Jurídica del Tratamiento</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 border border-gray-200 font-semibold text-gray-700">Finalidad</th>
                    <th className="text-left p-3 border border-gray-200 font-semibold text-gray-700">Base jurídica (RGPD)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Gestión de citas online',         'Ejecución de un precontrato (art. 6.1.b)'],
                    ['Prestación de servicios clínicos', 'Consentimiento + interés vital (art. 6.1.a / 9.2.c)'],
                    ['Envío de recordatorios por SMS',   'Interés legítimo (art. 6.1.f)'],
                    ['Mejora del sitio web (analítica)', 'Consentimiento (art. 6.1.a)'],
                    ['Cumplimiento de obligaciones legales', 'Obligación legal (art. 6.1.c)'],
                  ].map(([fin, base]) => (
                    <tr key={fin} className="border-b border-gray-100">
                      <td className="p-3 border border-gray-200">{fin}</td>
                      <td className="p-3 border border-gray-200 text-gray-500">{base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="conservacion">
            <h2 id="conservacion" className="text-xl font-display font-bold text-gray-900 mb-3">4. Plazo de Conservación</h2>
            <p>Los datos serán conservados durante el tiempo necesario para prestar el servicio solicitado y, posteriormente, durante los plazos legales exigibles:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Historiales clínicos: mínimo <strong>5 años</strong> (art. 17 Ley 41/2002 y normativa andaluza)</li>
              <li>Datos de citas online: <strong>1 año</strong> desde la última visita</li>
              <li>Datos fiscales y de facturación: <strong>6 años</strong> (art. 30 CCom)</li>
            </ul>
          </section>

          <section aria-labelledby="destinatarios">
            <h2 id="destinatarios" className="text-xl font-display font-bold text-gray-900 mb-3">5. Destinatarios de los Datos</h2>
            <p>No cedemos tus datos personales a terceros salvo obligación legal. Podemos compartirlos con proveedores de servicios (encargados del tratamiento) que actúan bajo nuestras instrucciones y han suscrito contratos de confidencialidad:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Proveedor de servicios de email/SMS (notificaciones de cita)</li>
              <li>Google LLC (analítica web, bajo cláusulas contractuales tipo UE-EE.UU.)</li>
              <li>Proveedor de alojamiento web (servidores en la UE)</li>
            </ul>
          </section>

          <section aria-labelledby="derechos">
            <h2 id="derechos" className="text-xl font-display font-bold text-gray-900 mb-3">6. Tus Derechos</h2>
            <p>De acuerdo con el RGPD y la LOPDGDD, tienes derecho a:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {['Acceso', 'Rectificación', 'Supresión', 'Portabilidad', 'Oposición', 'Limitación'].map((d) => (
                <div key={d} className="bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 text-sm text-teal-800 font-medium">
                  ✓ {d}
                </div>
              ))}
            </div>
            <p className="mt-4">
              Puedes ejercer tus derechos enviando un email a <a href="mailto:privacidad@clinicadentalalamillo.com" className="text-teal-600 underline">privacidad@clinicadentalalamillo.com</a> junto con copia de tu DNI.
              También puedes presentar una reclamación ante la <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">Agencia Española de Protección de Datos (aepd.es)</a>.
            </p>
          </section>

          <section aria-labelledby="seguridad">
            <h2 id="seguridad" className="text-xl font-display font-bold text-gray-900 mb-3">7. Medidas de Seguridad</h2>
            <p>Aplicamos medidas técnicas y organizativas apropiadas según el art. 32 RGPD: cifrado HTTPS/TLS, control de acceso basado en roles, copias de seguridad cifradas y evaluaciones periódicas de seguridad.</p>
          </section>
        </div>
      </div>
    </>
  )
}
