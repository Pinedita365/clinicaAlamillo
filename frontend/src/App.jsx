import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './utils/auth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CookieBanner from './components/CookieBanner'
import Home from './pages/Home'
import AvisoLegal from './pages/AvisoLegal'
import PoliticaPrivacidad from './pages/PoliticaPrivacidad'
import PoliticaCookies from './pages/PoliticaCookies'
import Admin from './pages/Admin'
import ComponentsDemo from './pages/ComponentsDemo'
import Login from './pages/Login'
import Register from './pages/Register'
import PatientPortal from './pages/PatientPortal'
import ClinicalDashboard from './pages/ClinicalDashboard'
import InventoryPage from './pages/InventoryPage'
import KanbanAgenda from './pages/KanbanAgenda'
import ActivarCuenta from './pages/ActivarCuenta'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

function AnimatedPage({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  )
}

// Ruta pública con Navbar + Footer
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  )
}

// Ruta protegida: redirige a /login si no está autenticado
function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/paciente" replace />
  return children
}

function AppRoutes() {
  const location = useLocation()

  // Paneles sin Navbar/Footer público
  if (location.pathname === '/gestion')    return <Admin />
  if (location.pathname === '/clinica')    return (
    <ProtectedRoute roles={['DENTIST', 'ADMIN']}>
      <ClinicalDashboard />
    </ProtectedRoute>
  )
  if (location.pathname === '/inventario') return (
    <ProtectedRoute roles={['DENTIST', 'ADMIN']}>
      <InventoryPage />
    </ProtectedRoute>
  )
  if (location.pathname === '/agenda') return (
    <ProtectedRoute roles={['DENTIST', 'ADMIN']}>
      <KanbanAgenda />
    </ProtectedRoute>
  )

  return (
    <PublicLayout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
          <Route path="/aviso-legal"         element={<AnimatedPage><AvisoLegal /></AnimatedPage>} />
          <Route path="/politica-privacidad" element={<AnimatedPage><PoliticaPrivacidad /></AnimatedPage>} />
          <Route path="/politica-cookies"    element={<AnimatedPage><PoliticaCookies /></AnimatedPage>} />
          <Route path="/componentes"         element={<AnimatedPage><ComponentsDemo /></AnimatedPage>} />

          {/* Auth */}
          <Route path="/login"          element={<AnimatedPage><Login /></AnimatedPage>} />
          <Route path="/registro"       element={<AnimatedPage><Register /></AnimatedPage>} />
          <Route path="/activar-cuenta" element={<AnimatedPage><ActivarCuenta /></AnimatedPage>} />

          {/* Área paciente */}
          <Route path="/paciente" element={
            <ProtectedRoute roles={['PATIENT', 'DENTIST', 'ADMIN']}>
              <AnimatedPage><PatientPortal /></AnimatedPage>
            </ProtectedRoute>
          } />

          {/* Catch-all de paneles de gestión capturados arriba */}
          <Route path="/gestion"    element={null} />
          <Route path="/clinica"    element={null} />
          <Route path="/inventario" element={null} />
          <Route path="/agenda"     element={null} />
        </Routes>
      </AnimatePresence>
    </PublicLayout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
