import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import EmptyState from '../components/EmptyState'

export default function VieFaction() {
  const [annonces, setAnnonces] = useState([])
  useEffect(() => {
    supabase.from('annonces').select('*').order('created_at', { ascending: false }).then(({ data }) => setAnnonces(data || []))
  }, [])

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <h1 className="mb-1">VIE DE <span className="accent-word">FACTION</span></h1>
      <p className="text-slate-500 text-sm mb-6">Annonces, événements et journal de bord</p>

      {annonces.length === 0 ? (
        <EmptyState title="Aucune annonce" text="Les annonces du staff s'afficheront ici." />
      ) : (
        <div className="space-y-3">
          {annonces.map(a => (
            <div key={a.id} className="bg-panel border border-border rounded-xl p-4">
              <div className="font-bold mb-1">{a.titre}</div>
              <div className="text-sm text-slate-400">{a.texte}</div>
              <div className="text-[11px] text-slate-600 mt-2 font-mono">{new Date(a.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
