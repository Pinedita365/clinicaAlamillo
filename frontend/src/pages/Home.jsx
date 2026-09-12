import { Helmet } from 'react-helmet-async'
import Hero from '../components/Hero'
import Services from '../components/Services'
import BookingForm from '../components/BookingForm'
import Reviews from '../components/Reviews'
import ContactMap from '../components/ContactMap'

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Clínica Dental Alamillo | Dentista en Sevilla – Pide Cita Online</title>
        <meta name="description" content="Clínica Dental Alamillo en Sevilla. Limpieza dental, ortodoncia, implantes y blanqueamiento. Más de 10 años de experiencia. ¡Pide tu cita online gratis!" />
        <meta name="keywords" content="dentista Sevilla, clínica dental Sevilla, limpieza dental Sevilla, ortodoncia Sevilla, implantes dentales Sevilla, Alamillo dental" />
        <link rel="canonical" href="https://clinicadentalalamillo.com/" />
      </Helmet>

      <Hero />
      <Services />
      <BookingForm />
      <Reviews />
      <ContactMap />
    </>
  )
}
