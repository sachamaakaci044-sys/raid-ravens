import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import EmptyState from '../components/EmptyState'

export default function Quotas() {
  const { profile } = useAuth()
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ item: '', montant: '', semaine: '' })

  const load = () => supabase.from('quotas').select('*').order('created_at', { ascending: false }).then(({ data }) => setList(data || []))
  useEffect(() => { load() }, [])

  async function submit() {
    if (!form.item || !form.montant || !form.semaine) return
    await supabase.from('quotas').insert({ ...form, montant: Number(form.montant), membre: profile.pseudo })
    setForm({ item: '', montant: '', semaine: '' })
    setShowForm(false)
    load()
  }

  const statutColor = { en_attente: 'text-slate-400 border-border', valide: 'text-explored border-explored/40', refuse: 'text-danger border-danger/40' }

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="mb-1"><span className="accent-word">QUOTAS</span></h1>
          <p className="text-slate-500 text-sm">Déclare tes contributions hebdomadaires (argent ou items)</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="bg-accentdim border border-accent/60 text-white text-sm px-4 py-2 rounded-md">
          + Déclarer un quota
        </button>
      </div>

      {showForm && (
        <div className="bg-panel border border-border rounded-xl p-4 mb-6 space-y-2">
          <input placeholder="Item / contribution" value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm" />
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
            <input placeholder="Montant" type="number" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} className="bg-panel2 border border-border rounded px-3 py-2 text-sm" />
            <input placeholder="Semaine (ex: S32)" value={form.semaine} onChange={e => setForm(f => ({ ...f, semaine: e.target.value }))} className="bg-panel2 border border-border rounded px-3 py-2 text-sm" />
          </div>
          <button onClick={submit} className="bg-accentdim border border-accent/60 text-white text-sm px-4 py-2 rounded-md">Valider</button>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState title="Aucun quota déclaré" text="Clique sur « Déclarer un quota » pour enregistrer ta première contribution hebdomadaire." actionLabel="Déclarer un quota" onAction={() => setShowForm(true)} />
      ) : (
        <div className="space-y-2">
          {list.map(q => (
            <div key={q.id} className="bg-panel border border-border rounded-lg p-3 text-sm flex justify-between items-center">
              <span>{q.membre} — {q.item} ({q.montant}) — {q.semaine}</span>
              <span className={`text-xs px-2 py-1 rounded-full border capitalize ${statutColor[q.statut]}`}>{q.statut.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
