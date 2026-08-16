import {
  LayoutDashboard, Landmark, ClipboardList, CalendarOff,
  Target, Trophy, Map, UserCircle, Megaphone,
} from 'lucide-react'

export const navLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/banque', label: 'Banque', icon: Landmark },
  { to: '/taches', label: 'Tâches', icon: ClipboardList },
  { to: '/absences', label: 'Absences', icon: CalendarOff },
  { to: '/quotas', label: 'Quotas', icon: Target },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/pillage', label: 'Pillage', icon: Map },
  { to: '/profil', label: 'Mon Profil', icon: UserCircle },
  { to: '/faction', label: 'Vie de Faction', icon: Megaphone },
]
