import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const ADMIN_PASSWORD = 'shadow=pd'
const GRADES = ['Recru', 'Membre', 'Recruteur', 'Admin']
const METIERS = [
  { key: 'mineur_lvl', label: 'Mineur' },
  { key: 'farmer_lvl', label: 'Farmer' },
  { key: 'hunter_lvl', label: 'Hunter' },
  { key: 'alchimiste_lvl', label: 'Alchimiste' },
]
const DONJONS = [
  { key: 'saharia_lvl', label: 'Saharia', max: 51 },
  { key: 'nimbria_lvl', label: 'Nimbria', max: 100 },
  { key: 'talikus_lvl', label: 'Talikus', max: 100 },
  { key: 'vitalys_lvl', label: 'Vitalys', max: 100 },
  { key: 'manelios_lvl', label: 'Manelios', max: 100 },
]

function timeAgo(iso) {
  if (!iso) return 'jamais'
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  return `il y a ${Math.floor(diff / 86400)} j`
}

export default function Admin() {
  const [tab, setTab] = useState('membres')
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('admin-unlocked') === 'true')
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  function tryUnlock() {
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin-unlocked', 'true')
      setUnlocked(true)
      setError(false)
    } else setError(true)
  }

  if (!unlocked) {
    return (
      <div className="p-4 sm:p-8 max-w-sm">
        <h1 className="mb-1">PANEL <span className="accent-word">ADMIN</span></h1>
        <p className="text-slate-500 text-sm mb-6">Accès protégé — entre le mot de passe staff.</p>
        <input type="password" placeholder="Mot de passe" value={input}
          onChange={e => { setInput(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && tryUnlock()}
          className="w-full bg-panel2 border border-border rounded px-3 py-2.5 text-sm mb-2" autoFocus />
        {error && <div className="text-danger text-xs mb-2">Mot de passe incorrect.</div>}
        <button onClick={tryUnlock} className="w-full bg-accentdim border border-accent/60 text-white text-sm px-4 py-2.5 rounded-md">Déverrouiller</button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <h1 className="mb-1">PANEL <span className="accent-word">ADMIN</span></h1>
      <p className="text-slate-500 text-sm mb-6">Zone réservée aux Admins.</p>

      <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
        {['membres', 'taches', 'absences', 'quotas', 'banque', 'annonces', 'evenements'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm capitalize whitespace-nowrap ${tab === t ? 'text-accent border-b-2 border-accent' : 'text-slate-500'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'membres' && <MembresTab />}
      {tab === 'taches' && <TachesTab />}
      {tab === 'absences' && <AbsencesTab />}
      {tab === 'quotas' && <QuotasTab />}
      {tab === 'banque' && <BanqueTab />}
      {tab === 'annonces' && <AnnoncesTab />}
      {tab === 'evenements' && <EvenementsTab />}
    </div>
  )
}

function MembresTab() {
  const [members, setMembers] = useState([])
  const [confirmId, setConfirmId] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () => supabase.from('profiles').select('*').order('pseudo').then(({ data }) => setMembers(data || []))
  useEffect(() => { load() }, [])

  async function updateField(id, field, value) {
    await supabase.from('profiles').update({ [field]: value }).eq('id', id)
    load()
  }

  async function deleteMember(id) {
    setBusy(true)
    const { error } = await supabase.functions.invoke('delete-member', { body: { memberId: id } })
    setBusy(false)
    setConfirmId(null)
    if (error) { alert("Erreur : " + error.message); return }
    load()
  }

  return (
    <div className="bg-panel border border-border rounded-xl overflow-x-auto">
      <table className="w-full text-sm min-w-[1100px]">
        <thead className="bg-panel2 text-slate-500 text-xs uppercase">
          <tr>
            <th className="text-left p-3">Pseudo</th>
            <th className="text-left p-3">Grade</th>
            <th className="text-left p-3" colSpan={4}>Métiers</th>
            <th className="text-left p-3" colSpan={5}>Donjons</th>
            <th className="text-left p-3">Dernière activité</th>
            <th className="text-left p-3"></th>
          </tr>
        </thead>
        <tbody>
          {members.map(m => (
            <tr key={m.id} className="border-t border-border">
              <td className="p-3 font-medium whitespace-nowrap">{m.pseudo}</td>
              <td className="p-3">
                <select value={m.grade} onChange={e => updateField(m.id, 'grade', e.target.value)}
                  className="bg-panel2 border border-border rounded px-2 py-1 text-xs">
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </td>
              {METIERS.map(met => (
                <td key={met.key} className="p-2">
                  <input type="number" min={1} max={20} value={m[met.key] ?? 1}
                    onChange={e => updateField(m.id, met.key, Number(e.target.value))}
                    title={met.label} className="w-12 bg-panel2 border border-border rounded px-1.5 py-1 text-xs font-mono" />
                </td>
              ))}
              {DONJONS.map(d => (
                <td key={d.key} className="p-2">
                  <input type="number" min={1} max={d.max} value={m[d.key] ?? 1}
                    onChange={e => updateField(m.id, d.key, Number(e.target.value))}
                    title={d.label} className="w-12 bg-panel2 border border-border rounded px-1.5 py-1 text-xs font-mono" />
                </td>
              ))}
              <td className="p-3 text-xs text-slate-500 whitespace-nowrap">{timeAgo(m.last_seen_at)}</td>
              <td className="p-3">
                {confirmId === m.id ? (
                  <div className="flex gap-1 items-center whitespace-nowrap">
                    <span className="text-[11px] text-danger">Sûr ?</span>
                    <button disabled={busy} onClick={() => deleteMember(m.id)} className="text-[11px] text-danger border border-danger/40 rounded px-1.5 py-0.5">Oui</button>
                    <button onClick={() => setConfirmId(null)} className="text-[11px] text-slate-500 border border-border rounded px-1.5 py-0.5">Non</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmId(m.id)} className="text-slate-500 hover:text-danger text-xs">✕</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {members.length === 0 && <div className="p-6 text-center text-sm text-slate-500">Aucun membre.</div>}
    </div>
  )
}

function TachesTab() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ titre: '', description: '', assigne: '' })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const load = () => supabase.from('taches').select('*').order('created_at', { ascending: false }).then(({ data }) => setList(data || []))
  useEffect(() => { load() }, [])

  async function submit() {
    if (!form.titre) return
    await supabase.from('taches').insert({ ...form, statut: 'a_faire' })
    setForm({ titre: '', description: '', assigne: '' })
    load()
  }
  async function remove(id) { await supabase.from('taches').delete().eq('id', id); load() }
  function startEdit(t) { setEditId(t.id); setEditForm({ titre: t.titre, assigne: t.assigne || '', statut: t.statut }) }
  async function saveEdit(id) { await supabase.from('taches').update(editForm).eq('id', id); setEditId(null); load() }

  const statutLabel = { a_faire: 'À faire', en_cours: 'En cours', termine: 'Terminé' }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
      <div className="bg-panel border border-border rounded-xl p-4 space-y-2 h-fit">
        <input placeholder="Titre de la tâche" value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm" />
        <textarea placeholder="Description (optionnel)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm" />
        <input placeholder="Assigné à (pseudo, optionnel)" value={form.assigne} onChange={e => setForm(f => ({ ...f, assigne: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm" />
        <button onClick={submit} className="w-full bg-accentdim border border-accent/60 text-white text-sm px-4 py-2 rounded-md">Créer la tâche</button>
      </div>
      <div className="space-y-2">
        {list.map(t => (
          <div key={t.id} className="bg-panel border border-border rounded-lg p-3 text-sm">
            {editId === t.id ? (
              <div className="space-y-2">
                <input value={editForm.titre} onChange={e => setEditForm(f => ({ ...f, titre: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-2 py-1 text-sm" />
                <input value={editForm.assigne} onChange={e => setEditForm(f => ({ ...f, assigne: e.target.value }))} placeholder="Assigné à" className="w-full bg-panel2 border border-border rounded px-2 py-1 text-sm" />
                <select value={editForm.statut} onChange={e => setEditForm(f => ({ ...f, statut: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-2 py-1 text-sm">
                  {Object.entries(statutLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(t.id)} className="text-xs text-explored border border-explored/40 rounded px-2 py-1">Enregistrer</button>
                  <button onClick={() => setEditId(null)} className="text-xs text-slate-500 border border-border rounded px-2 py-1">Annuler</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{t.titre}</div>
                  {t.description && <div className="text-xs text-slate-500 mt-0.5">{t.description}</div>}
                  {t.assigne && <div className="text-xs text-accent mt-0.5">→ {t.assigne}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-border text-slate-400">{statutLabel[t.statut] || t.statut}</span>
                  <button onClick={() => startEdit(t)} className="text-slate-500 hover:text-accent text-xs px-1">✎</button>
                  <button onClick={() => remove(t.id)} className="text-slate-500 hover:text-danger text-xs px-1">✕</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && <div className="text-sm text-slate-500">Aucune tâche créée.</div>}
      </div>
    </div>
  )
}

function AbsencesTab() {
  const [list, setList] = useState([])
  const load = () => supabase.from('absences').select('*').order('date_debut', { ascending: false }).then(({ data }) => setList(data || []))
  useEffect(() => { load() }, [])

  async function setStatut(id, statut) { await supabase.from('absences').update({ statut }).eq('id', id); load() }
  async function remove(id) { await supabase.from('absences').delete().eq('id', id); load() }

  const statutColor = { a_valider: 'text-slate-400 border-border', valide: 'text-explored border-explored/40', refuse: 'text-danger border-danger/40' }

  return (
    <div className="space-y-2">
      {list.length === 0 && <div className="text-sm text-slate-500">Aucune absence déclarée.</div>}
      {list.map(a => (
        <div key={a.id} className="bg-panel border border-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <div>
            <span className="font-medium">{a.membre}</span> — {a.date_debut} → {a.date_fin}
            {a.raison && <span className="text-slate-500"> · {a.raison}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full border capitalize ${statutColor[a.statut || 'a_valider']}`}>{(a.statut || 'a_valider').replace('_', ' ')}</span>
            <button onClick={() => setStatut(a.id, 'valide')} className="text-explored text-xs px-2 py-1 border border-explored/40 rounded">Valider</button>
            <button onClick={() => setStatut(a.id, 'refuse')} className="text-danger text-xs px-2 py-1 border border-danger/40 rounded">Refuser</button>
            <button onClick={() => remove(a.id)} className="text-slate-500 hover:text-danger text-xs px-1">✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function QuotasTab() {
  const [quotas, setQuotas] = useState([])
  const load = () => supabase.from('quotas').select('*').order('created_at', { ascending: false }).then(({ data }) => setQuotas(data || []))
  useEffect(() => { load() }, [])
  async function setStatut(id, statut) { await supabase.from('quotas').update({ statut }).eq('id', id); load() }

  return (
    <div className="space-y-2">
      {quotas.length === 0 && <div className="text-sm text-slate-500">Aucun quota déclaré.</div>}
      {quotas.map(q => (
        <div key={q.id} className="bg-panel border border-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <div>{q.membre} — {q.item} ({q.montant}) — semaine {q.semaine}</div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full border border-border capitalize">{q.statut.replace('_', ' ')}</span>
            <button onClick={() => setStatut(q.id, 'valide')} className="text-explored text-xs px-2 py-1 border border-explored/40 rounded">Valider</button>
            <button onClick={() => setStatut(q.id, 'refuse')} className="text-danger text-xs px-2 py-1 border border-danger/40 rounded">Refuser</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function BanqueTab() {
  const [form, setForm] = useState({ type: 'entree', description: '', categorie: '', montant: '' })
  async function submit() {
    if (!form.description || !form.montant) return
    await supabase.from('banque_transactions').insert({ ...form, montant: Number(form.montant), auteur: 'Staff' })
    setForm({ type: 'entree', description: '', categorie: '', montant: '' })
  }
  return (
    <div className="bg-panel border border-border rounded-xl p-5 max-w-md space-y-3">
      <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm">
        <option value="entree">Entrée</option>
        <option value="sortie">Sortie</option>
      </select>
      <input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm" />
      <input placeholder="Catégorie" value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm" />
      <input placeholder="Montant" type="number" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm" />
      <button onClick={submit} className="bg-accentdim border border-accent/60 text-white text-sm px-4 py-2 rounded-md w-full">Ajouter la transaction</button>
    </div>
  )
}

function AnnoncesTab() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ titre: '', texte: '' })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const load = () => supabase.from('annonces').select('*').order('created_at', { ascending: false }).then(({ data }) => setList(data || []))
  useEffect(() => { load() }, [])

  async function submit() {
    if (!form.titre || !form.texte) return
    await supabase.from('annonces').insert(form)
    setForm({ titre: '', texte: '' })
    load()
  }
  async function remove(id) { await supabase.from('annonces').delete().eq('id', id); load() }
  function startEdit(a) { setEditId(a.id); setEditForm({ titre: a.titre, texte: a.texte }) }
  async function saveEdit(id) { await supabase.from('annonces').update(editForm).eq('id', id); setEditId(null); load() }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
      <div className="bg-panel border border-border rounded-xl p-5 space-y-3 h-fit">
        <input placeholder="Titre" value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm" />
        <textarea placeholder="Texte" value={form.texte} onChange={e => setForm(f => ({ ...f, texte: e.target.value }))} rows={4} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm" />
        <button onClick={submit} className="bg-accentdim border border-accent/60 text-white text-sm px-4 py-2 rounded-md w-full">Publier l'annonce</button>
      </div>
      <div className="space-y-2">
        {list.map(a => (
          <div key={a.id} className="bg-panel border border-border rounded-lg p-3 text-sm">
            {editId === a.id ? (
              <div className="space-y-2">
                <input value={editForm.titre} onChange={e => setEditForm(f => ({ ...f, titre: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-2 py-1 text-sm" />
                <textarea value={editForm.texte} onChange={e => setEditForm(f => ({ ...f, texte: e.target.value }))} rows={3} className="w-full bg-panel2 border border-border rounded px-2 py-1 text-sm" />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(a.id)} className="text-xs text-explored border border-explored/40 rounded px-2 py-1">Enregistrer</button>
                  <button onClick={() => setEditId(null)} className="text-xs text-slate-500 border border-border rounded px-2 py-1">Annuler</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="font-medium">{a.titre}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{a.texte}</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(a)} className="text-slate-500 hover:text-accent text-xs px-1">✎</button>
                  <button onClick={() => remove(a.id)} className="text-slate-500 hover:text-danger text-xs px-1">✕</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function EvenementsTab() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ titre: '', date_heure: '', description: '' })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const load = () => supabase.from('evenements').select('*').order('date_heure', { ascending: false }).then(({ data }) => setList(data || []))
  useEffect(() => { load() }, [])

  async function submit() {
    if (!form.titre || !form.date_heure) return
    await supabase.from('evenements').insert({ ...form, date_heure: new Date(form.date_heure).toISOString() })
    setForm({ titre: '', date_heure: '', description: '' })
    load()
  }
  async function remove(id) { await supabase.from('evenements').delete().eq('id', id); load() }
  function startEdit(e) { setEditId(e.id); setEditForm({ titre: e.titre, date_heure: e.date_heure?.slice(0, 16), description: e.description || '' }) }
  async function saveEdit(id) {
    await supabase.from('evenements').update({ ...editForm, date_heure: new Date(editForm.date_heure).toISOString() }).eq('id', id)
    setEditId(null); load()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
      <div className="bg-panel border border-border rounded-xl p-4 space-y-2 h-fit">
        <input placeholder="Titre (ex: Boss Arachna)" value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm" />
        <input type="datetime-local" value={form.date_heure} onChange={e => setForm(f => ({ ...f, date_heure: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm" />
        <textarea placeholder="Description (optionnel)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm" />
        <button onClick={submit} className="w-full bg-accentdim border border-accent/60 text-white text-sm px-4 py-2 rounded-md">Créer l'événement</button>
      </div>
      <div className="space-y-2">
        {list.map(e => (
          <div key={e.id} className="bg-panel border border-border rounded-lg p-3 text-sm">
            {editId === e.id ? (
              <div className="space-y-2">
                <input value={editForm.titre} onChange={ev => setEditForm(f => ({ ...f, titre: ev.target.value }))} className="w-full bg-panel2 border border-border rounded px-2 py-1 text-sm" />
                <input type="datetime-local" value={editForm.date_heure} onChange={ev => setEditForm(f => ({ ...f, date_heure: ev.target.value }))} className="w-full bg-panel2 border border-border rounded px-2 py-1 text-sm" />
                <textarea value={editForm.description} onChange={ev => setEditForm(f => ({ ...f, description: ev.target.value }))} rows={2} className="w-full bg-panel2 border border-border rounded px-2 py-1 text-sm" />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(e.id)} className="text-xs text-explored border border-explored/40 rounded px-2 py-1">Enregistrer</button>
                  <button onClick={() => setEditId(null)} className="text-xs text-slate-500 border border-border rounded px-2 py-1">Annuler</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="font-medium">{e.titre}</div>
                  <div className="text-xs text-slate-500 font-mono">{new Date(e.date_heure).toLocaleString()}</div>
                  {e.description && <div className="text-xs text-slate-400 mt-1">{e.description}</div>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(e)} className="text-slate-500 hover:text-accent text-xs px-1">✎</button>
                  <button onClick={() => remove(e.id)} className="text-slate-500 hover:text-danger text-xs px-1">✕</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && <div className="text-sm text-slate-500">Aucun événement programmé.</div>}
      </div>
    </div>
  )
}
