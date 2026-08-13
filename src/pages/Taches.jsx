import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const COLS = [
  { key: 'a_faire', label: 'À faire' },
  { key: 'en_cours', label: 'En cours' },
  { key: 'termine', label: 'Terminé' },
]

export default function Taches() {
  const [taches, setTaches] = useState([])

  const load = () => supabase.from('taches').select('*').order('created_at').then(({ data }) => setTaches(data || []))
  useEffect(() => { load() }, [])

  async function move(id, statut) {
    await supabase.from('taches').update({ statut }).eq('id', id)
    load()
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <h1 className="mb-1"><span className="accent-word">TÂCHES</span></h1>
      <p className="text-slate-500 text-sm mb-6">Kanban des missions de la faction</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {COLS.map(col => {
          const items = taches.filter(t => t.statut === col.key)
          return (
            <div key={col.key} className="bg-panel border border-border rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-sm">{col.label}</span>
                <span className="text-xs bg-panel2 border border-border rounded-full w-5 h-5 flex items-center justify-center">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map(t => (
                  <div key={t.id} className="bg-panel2 border border-border rounded-lg p-3 text-sm">
                    <div className="font-medium">{t.titre}</div>
                    {t.assigne && <div className="text-xs text-slate-500 mt-1">{t.assigne}</div>}
                    <div className="flex gap-1 mt-2">
                      {COLS.filter(c => c.key !== col.key).map(c => (
                        <button key={c.key} onClick={() => move(t.id, c.key)} className="text-[10px] px-2 py-0.5 border border-border rounded text-slate-400 hover:text-accent hover:border-accent">
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {items.length === 0 && <div className="text-xs text-slate-600 text-center py-4">Aucune tâche</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
