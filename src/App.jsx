import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Banque from './pages/Banque'
import Taches from './pages/Taches'
import Absences from './pages/Absences'
import Quotas from './pages/Quotas'
import Leaderboard from './pages/Leaderboard'
import Profil from './pages/Profil'
import VieFaction from './pages/VieFaction'
import Pillage from './pages/Pillage'
import Admin from './pages/Admin'

function Shell() {
  const { session, isStaff } = useAuth()
  if (!session) return <Login />

  return (
    <div className="flex relative">
      {/* barre de marque mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-panel/95 backdrop-blur border-b border-border flex items-center px-4 z-30">
        <img src="/raven-logo.png" alt="Raid Ravens" className="w-7 h-7 object-contain mr-2" />
        <span className="text-xs font-display font-bold text-accent">RAID RAVENS</span>
      </div>

      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 min-h-screen relative z-[1] pt-14 pb-16 lg:pt-0 lg:pb-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/banque" element={<Banque />} />
          <Route path="/taches" element={<Taches />} />
          <Route path="/absences" element={<Absences />} />
          <Route path="/quotas" element={<Quotas />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/pillage" element={<Pillage />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/faction" element={<VieFaction />} />
          <Route path="/admin" element={isStaff ? <Admin /> : <Navigate to="/" />} />
        </Routes>
      </div>

      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}
