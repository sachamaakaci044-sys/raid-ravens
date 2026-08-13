import { NavLink } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import Logo from './Logo'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/banque', label: 'Banque' },
  { to: '/taches', label: 'Tâches' },
  { to: '/absences', label: 'Absences' },
  { to: '/quotas', label: 'Quotas' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/pillage', label: 'Pillage' },
  { to: '/profil', label: 'Mon Profil' },
  { to: '/faction', label: 'Vie de Faction' },
]

export default function Sidebar({ onNavigate }) {
  const { profile, isStaff, signOut } = useAuth()

  return (
    <div className="w-60 shrink-0 bg-panel/90 backdrop-blur border-r border-border flex flex-col h-screen sticky top-0 relative overflow-hidden">
      {/* lueur décorative en haut de la sidebar */}
      <div className="pointer-events-none absolute -top-24 -left-16 w-56 h-56 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 w-40 h-40 rounded-full bg-accent2/10 blur-3xl" />

      <div className="relative p-5 border-b border-border flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-accent/30 blur-md" />
          <Logo size={34} />
        </div>
        <div>
          <div className="text-[10px] font-display tracking-wide text-accent leading-tight" style={{ textShadow: '0 0 12px rgba(161,59,255,0.5)' }}>RAID<br/>RAVENS</div>
          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-explored animate-pulse" />
            PALLADIUM V12
          </div>
        </div>
      </div>

      <nav className="relative flex-1 overflow-y-auto p-3 space-y-1">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm transition-all border ${
                isActive
                  ? 'bg-accentdim/40 text-white border-accent/50 shadow-[0_0_16px_-4px_rgba(179,159,238,0.6)]'
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-panel2 hover:border-border'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
        {isStaff && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm transition-all border-t border-border mt-2 pt-3 ${
                isActive ? 'text-accent2 bg-accent2dim/20' : 'text-accent2/80 hover:text-accent2'
              }`
            }
          >
            ⚑ Panel Admin
          </NavLink>
        )}
      </nav>

      <div className="p-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-accentdim flex items-center justify-center text-xs font-bold shrink-0">
            {(profile?.pseudo || '?').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm truncate">{profile?.pseudo || '...'}</div>
            <div className="text-[10px] text-slate-500">{profile?.grade || 'Membre'}</div>
          </div>
        </div>
        <button onClick={signOut} className="text-slate-500 hover:text-danger text-xs" title="Se déconnecter">⏻</button>
      </div>
    </div>
  )
}
