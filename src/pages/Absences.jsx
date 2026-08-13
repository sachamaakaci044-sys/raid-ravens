import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import EmptyState from '../components/EmptyState'

export default function Absences() {
  const { profile } = useAuth()
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date_debut: '', date_fin: '', raison: '' })

  const load = () => supabase.from('absences').select('*').order('date_debut', { ascending: false }).then(({ data }) => setList(data || []))
  useEffect(() => { load() }, [])

  async function submit() {
    if (!form.date_debut || !form.date_fin) return
    await supabase.from('absences').insert({ ...form, membre: profile.pseudo })
    setForm({ date_debut: '', date_fin: '', raison: '' })
    setShowForm(false)
    load()
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="mb-1"><span className="accent-word">ABSENCES</span></h1>
          <p className="text-slate-500 text-sm">Gestion des membres absents ou en pause</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="bg-accentdim border border-accent/60 text-white text-sm px-4 py-2 rounded-md">
          + Déclarer une absence
        </button>
      </div>

      {showForm && (
        <div className="bg-panel border border-border rounded-xl p-4 mb-6 space-y-2">
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
            <input type="date" value={form.date_debut} onChange={e => setForm(f => ({ ...f, date_debut: e.target.value }))} className="bg-panel2 border border-border rounded px-3 py-2 text-sm" />
            <input type="date" value={form.date_fin} onChange={e => setForm(f => ({ ...f, date_fin: e.target.value }))} className="bg-panel2 border border-border rounded px-3 py-2 text-sm" />
          </div>
          <input placeholder="Raison (optionnel)" value={form.raison} onChange={e => setForm(f => ({ ...f, raison: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm" />
          <button onClick={submit} className="bg-accentdim border border-accent/60 text-white text-sm px-4 py-2 rounded-md">Valider</button>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState title="Aucune absence déclarée" text="Les absences des membres apparaîtront ici." actionLabel="Déclarer une absence" onAction={() => setShowForm(true)} />
      ) : (
        <div className="space-y-2">
          {list.map(a => (
            <div key={a.id} className="bg-panel border border-border rounded-lg p-3 text-sm flex justify-between items-center">
              <span>{a.membre} — {a.date_debut} → {a.date_fin}</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">{a.raison}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full border border-border text-slate-400 capitalize">{(a.statut || 'a_valider').replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
