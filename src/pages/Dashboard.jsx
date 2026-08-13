import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import MemberCard from '../components/MemberCard'
import EmptyState from '../components/EmptyState'

export default function Dashboard() {
  const [members, setMembers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [tasksCount, setTasksCount] = useState(0)
  const [evenements, setEvenements] = useState([])

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setMembers(data || []))
    supabase.from('banque_transactions').select('*').order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setTransactions(data || []))
    supabase.from('taches').select('id', { count: 'exact', head: true }).neq('statut', 'termine')
      .then(({ count }) => setTasksCount(count || 0))
    supabase.from('evenements').select('*').gte('date_heure', new Date().toISOString()).order('date_heure').limit(3)
      .then(({ data }) => setEvenements(data || []))
  }, [])

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <h1 className="mb-1">VUE D'<span className="accent-word">ENSEMBLE</span></h1>
      <p className="text-slate-500 text-sm mb-6">État de la faction Raid Ravens en temps réel</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-panel border border-border rounded-xl p-4">
          <div className="text-[11px] text-slate-500 uppercase mb-2">Membres actifs</div>
          <div className="text-3xl font-bold">{members.length}</div>
        </div>
        <div className="bg-panel border border-border rounded-xl p-4">
          <div className="text-[11px] text-slate-500 uppercase mb-2">Tâches en cours</div>
          <div className="text-3xl font-bold">{tasksCount}</div>
        </div>
        <div className="bg-panel border border-border rounded-xl p-4 col-span-2">
          <div className="text-[11px] text-slate-500 uppercase mb-2">Dernières transactions</div>
          <div className="text-lg font-bold">{transactions.length ? transactions[0].description : 'Aucune'}</div>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-xl p-5">
        <div className="text-sm font-bold mb-4 text-slate-300">Effectifs récents</div>
        {members.length === 0 ? (
          <EmptyState title="Aucun membre" text="Les membres inscrits apparaîtront ici." />
        ) : (
          <div className="space-y-2">
            {members.map(m => <MemberCard key={m.id} member={m} />)}
          </div>
        )}
      </div>

      {evenements.length > 0 && (
        <div className="bg-panel border border-border rounded-xl p-5 mt-6">
          <div className="text-sm font-bold mb-4 text-slate-300">Prochains événements</div>
          <div className="space-y-2">
            {evenements.map(e => (
              <div key={e.id} className="bg-panel2 border border-border rounded-lg p-3 flex justify-between items-center text-sm">
                <span className="font-medium">{e.titre}</span>
                <span className="text-accent font-mono text-xs">{new Date(e.date_heure).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
