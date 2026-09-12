import { Helmet } from 'react-helmet-async'

function LegalPage({ title, children }) {
  return (
    <>
      <div className="pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <div className="prose prose-gray prose-headings:font-display prose-headings:text-gray-900 prose-a:text-teal-600 max-w-none text-gray-600 leading-relaxed space-y-6">
          {children}
        </div>
      </div>
    </>
  )
}

export default function AvisoLegal() {
  return (
    <>
      <Helmet>
        <title>Aviso Legal | Clínica Dental Alamillo Sevilla</title>
        <meta name="description" content="Aviso Legal de Clínica Dental Alamillo. Información sobre el titular del sitio web, condiciones de uso y responsabilidad." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <LegalPage title="Aviso Legal">
        <section aria-labelledby="datos-titular">
          <h2 id="datos-titular">1. Datos del Titular</h2>
          <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa:</p>
          <ul className="list-disc list-inside space-y-1 mt-3">
            <li><strong>Denominación social:</strong> Clínica Dental Alamillo S.L.</li>
            <li><strong>CIF:</strong> B-XXXXXXXX</li>
            <li><strong>Domicilio social:</strong> Av. Juventudes Musicales, Norte, 41015 Sevilla, España</li>
            <li><strong>Teléfono:</strong> +34 602 45 82 49</li>
            <li><strong>Email:</strong> info@clinicadentalalamillo.com</li>
            <li><strong>Registro Mercantil:</strong> Inscrita en el Registro Mercantil de Sevilla, Tomo X, Folio X, Hoja SE-XXXXX</li>
          </ul>
        </section>

        <section aria-labelledby="objeto-condiciones">
          <h2 id="objeto-condiciones">2. Objeto y Condiciones de Uso</h2>
          <p>El presente sitio web (<em>clinicadentalalamillo.com</em>) tiene como finalidad proporcionar información sobre los servicios de odontología ofrecidos por Clínica Dental Alamillo S.L., así como facilitar la solicitud de citas online.</p>
          <p>El acceso y uso de este sitio web implica la aceptación plena y sin reservas de las presentes condiciones legales. Si no está de acuerdo, deberá abstenerse de utilizarlo.</p>
        </section>

        <section aria-labelledby="propiedad-intelectual">
          <h2 id="propiedad-intelectual">3. Propiedad Intelectual e Industrial</h2>
          <p>Todos los contenidos del sitio web (textos, imágenes, diseño gráfico, logotipos, código fuente) son titularidad exclusiva de Clínica Dental Alamillo S.L. o de sus proveedores de contenido, estando protegidos por la legislación española e internacional sobre propiedad intelectual e industrial.</p>
          <p>Queda expresamente prohibida la reproducción total o parcial de los contenidos del sitio sin autorización expresa y por escrito del titular.</p>
        </section>

        <section aria-labelledby="exclusion-responsabilidad">
          <h2 id="exclusion-responsabilidad">4. Exclusión de Responsabilidad</h2>
          <p>La información médica proporcionada en este sitio web tiene carácter meramente informativo y no sustituye en ningún caso la consulta con un profesional de la salud dental. Clínica Dental Alamillo S.L. no se responsabiliza de los daños derivados del mal uso de la información contenida en el sitio.</p>
          <p>El titular se reserva el derecho a modificar, suspender o cancelar el acceso al sitio web sin previo aviso.</p>
        </section>

        <section aria-labelledby="legislacion">
          <h2 id="legislacion">5. Legislación Aplicable y Jurisdicción</h2>
          <p>Las presentes condiciones legales se rigen por la legislación española. Para la resolución de cualquier controversia derivada del uso del sitio web, las partes se someten a los Juzgados y Tribunales de la ciudad de Sevilla, con renuncia expresa a cualquier otro fuero que pudiera corresponderles.</p>
        </section>
      </LegalPage>
    </>
  )
}
