import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Sidebar from './components/Sidebar'
import Logo from './components/Logo'
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  if (!session) return <Login />

  return (
    <div className="flex relative">
      <div className="eagle-watermark">
        <Logo size="100%" />
      </div>

      {/* barre mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-panel/95 backdrop-blur border-b border-border flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-2">
          <Logo size={24} />
          <span className="text-[9px] font-display text-accent">RAID RAVENS</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-slate-300 text-xl leading-none px-2">☰</button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setMobileOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="absolute left-0 top-0 h-full">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 min-h-screen relative z-[1] pt-14 lg:pt-0">
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
