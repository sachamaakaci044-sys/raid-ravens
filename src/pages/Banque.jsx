import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import EmptyState from '../components/EmptyState'

export default function Banque() {
  const [tx, setTx] = useState([])
  useEffect(() => {
    supabase.from('banque_transactions').select('*').order('created_at', { ascending: false }).then(({ data }) => setTx(data || []))
  }, [])

  const solde = tx.reduce((s, t) => s + (t.type === 'entree' ? t.montant : -t.montant), 0)
  const entrees = tx.filter(t => t.type === 'entree').reduce((s, t) => s + t.montant, 0)
  const sorties = tx.filter(t => t.type === 'sortie').reduce((s, t) => s + t.montant, 0)

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <h1 className="mb-1">BANQUE DE <span className="accent-word">FACTION</span></h1>
      <p className="text-slate-500 text-sm mb-6">Suivi des fonds, entrées et sorties du coffre</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-panel border border-border rounded-xl p-4">
          <div className="text-[11px] text-slate-500 uppercase mb-2">Solde actuel</div>
          <div className="text-2xl font-bold">{solde}</div>
        </div>
        <div className="bg-panel border border-border rounded-xl p-4">
          <div className="text-[11px] text-slate-500 uppercase mb-2">Entrées</div>
          <div className="text-2xl font-bold text-explored">{entrees}</div>
        </div>
        <div className="bg-panel border border-border rounded-xl p-4">
          <div className="text-[11px] text-slate-500 uppercase mb-2">Sorties</div>
          <div className="text-2xl font-bold text-danger">{sorties}</div>
        </div>
      </div>

      {tx.length === 0 ? (
        <EmptyState title="Aucune transaction" text="Les mouvements de la banque de faction s'afficheront ici." />
      ) : (
        <div className="bg-panel border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-panel2 text-slate-500 text-xs uppercase">
              <tr><th className="text-left p-3">Type</th><th className="text-left p-3">Description</th><th className="text-left p-3">Catégorie</th><th className="text-left p-3">Auteur</th><th className="text-right p-3">Montant</th></tr>
            </thead>
            <tbody>
              {tx.map(t => (
                <tr key={t.id} className="border-t border-border">
                  <td className="p-3 capitalize">{t.type}</td>
                  <td className="p-3">{t.description}</td>
                  <td className="p-3 text-slate-500">{t.categorie}</td>
                  <td className="p-3 text-slate-500">{t.auteur}</td>
                  <td className={`p-3 text-right font-mono ${t.type === 'entree' ? 'text-explored' : 'text-danger'}`}>{t.type === 'entree' ? '+' : '-'}{t.montant}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
