import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import EmptyState from '../components/EmptyState'

const METIER_KEYS = ['mineur_lvl', 'farmer_lvl', 'hunter_lvl', 'alchimiste_lvl']
const DONJON_KEYS = ['saharia_lvl', 'nimbria_lvl', 'talikus_lvl', 'vitalys_lvl', 'manelios_lvl']

export default function Leaderboard() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    async function load() {
      const [{ data: profiles }, { data: taches }, { data: quotas }] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('taches').select('assigne, statut').eq('statut', 'termine'),
        supabase.from('quotas').select('membre, montant').eq('statut', 'valide'),
      ])

      const list = (profiles || []).map(p => {
        const missions = (taches || []).filter(t => t.assigne === p.pseudo).length
        const revenu = (quotas || []).filter(q => q.membre === p.pseudo).reduce((s, q) => s + q.montant, 0)
        const metiersTotal = METIER_KEYS.reduce((s, k) => s + (p[k] || 1), 0)
        const donjonsTotal = DONJON_KEYS.reduce((s, k) => s + (p[k] || 1), 0)
        // pondération : missions et revenu comptent le plus (activité concrète),
        // métiers/donjons apportent un bonus de progression
        const score = missions * 10 + revenu * 0.5 + metiersTotal * 2 + donjonsTotal * 1
        return { membre: p.pseudo, missions, revenu, metiersTotal, donjonsTotal, score: Math.round(score) }
      }).sort((a, b) => b.score - a.score)

      setRows(list)
    }
    load()
  }, [])

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <h1 className="mb-1"><span className="accent-word">LEADERBOARD</span></h1>
      <p className="text-slate-500 text-sm mb-6">Classement combiné : missions, quotas, métiers et donjons</p>

      {rows.length === 0 ? (
        <EmptyState title="Classement vide" text="Le classement se remplit automatiquement à partir des membres, tâches terminées et quotas validés." />
      ) : (
        <div className="bg-panel border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-panel2 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Membre</th>
                <th className="text-left p-3">Missions</th>
                <th className="text-left p-3">Revenu</th>
                <th className="text-left p-3">Métiers</th>
                <th className="text-left p-3">Donjons</th>
                <th className="text-left p-3">Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.membre} className="border-t border-border">
                  <td className="p-3 text-slate-500">{i + 1}</td>
                  <td className="p-3 font-medium">{r.membre}</td>
                  <td className="p-3">{r.missions}</td>
                  <td className="p-3">{r.revenu}</td>
                  <td className="p-3 text-slate-400">{r.metiersTotal}</td>
                  <td className="p-3 text-slate-400">{r.donjonsTotal}</td>
                  <td className="p-3 text-accent font-bold">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-slate-600 mt-3">Score = missions×10 + revenu×0.5 + total niveaux métiers×2 + total niveaux donjons. Dis-moi si les poids te semblent à ajuster.</p>
    </div>
  )
}
