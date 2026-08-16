import { NavLink } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { navLinks } from '../navLinks'
import { ShieldCheck } from 'lucide-react'

export default function BottomNav() {
  const { isStaff } = useAuth()
  const items = isStaff ? [...navLinks, { to: '/admin', label: 'Admin', icon: ShieldCheck }] : navLinks

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-panel/95 backdrop-blur border-t border-border overflow-x-auto">
      <div className="flex min-w-max">
        {items.map(l => {
          const Icon = l.icon
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-4 py-2.5 min-w-[68px] text-[10px] ${
                  isActive ? 'text-accent' : 'text-slate-500'
                }`
              }
            >
              <Icon size={19} strokeWidth={2} />
              <span className="whitespace-nowrap">{l.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
