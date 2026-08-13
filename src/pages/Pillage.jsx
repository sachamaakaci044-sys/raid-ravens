import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'

const MIN = -35000, MAX = 35000, SIZE = 70000, PX = 640, TOPOFF = 30
const TICKS = [-30000, -20000, -10000, 0, 10000, 20000, 30000]
const toPxX = x => ((x - MIN) / SIZE) * PX
const toPxZ = z => TOPOFF + ((z - MIN) / SIZE) * PX

const CARTES = [
  { id: 'runegard', nom: 'Runegard' },
  { id: 'egopolis', nom: 'Egopolis' },
  { id: 'aeloria', nom: 'Aeloria' },
  { id: 'xanoth', nom: 'Xanoth' },
  { id: 'kilmordra', nom: 'Kilmordra' },
]

const BASE_COLORS = { normale: '#3dc9dc', claim: '#e2574c' }

function colorFor(name) {
  const palette = ['#f2a541', '#3dc9dc', '#e2574c', '#c774e8', '#7fd858', '#e0b03d', '#5b8ef2', '#e8749a']
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

function sectors() {
  const s = []
  const step = SIZE / 3
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      s.push({ id: row * 3 + col + 1, xMin: MIN + col * step, xMax: MIN + (col + 1) * step, zMin: MIN + row * step, zMax: MIN + (row + 1) * step })
    }
  }
  return s
}

export default function Pillage() {
  const { profile } = useAuth()
  const [carteId, setCarteId] = useState(CARTES[0].id)
  const [bands, setBands] = useState([])
  const [positions, setPositions] = useState([])
  const [secteurs, setSecteurs] = useState([])
  const [bases, setBases] = useState([])
  const [form, setForm] = useState({ z: '', xDebut: '', xFin: '', largeur: 300 })
  const [pos, setPos] = useState({ x: '', z: '' })
  const [baseForm, setBaseForm] = useState({ x: '', z: '', type: 'normale', label: '' })
  const [cursor, setCursor] = useState(null)

  function fromPxX(px) { return Math.round(MIN + (px / PX) * SIZE) }
  function fromPxZ(py) { return Math.round(MIN + ((py - TOPOFF) / PX) * SIZE) }

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const scaleX = PX / rect.width
    const scaleY = (TOPOFF + PX + 30) / rect.height
    const px = (e.clientX - rect.left) * scaleX
    const py = (e.clientY - rect.top) * scaleY
    if (py < TOPOFF || py > TOPOFF + PX) { setCursor(null); return }
    setCursor({ x: fromPxX(px), z: fromPxZ(py) })
  }

  async function loadAll() {
    const [b, p, s, ba] = await Promise.all([
      supabase.from('pillage_bands').select('*').eq('carte_id', carteId),
      supabase.from('pillage_positions').select('*').eq('carte_id', carteId),
      supabase.from('pillage_secteurs').select('*').eq('carte_id', carteId).order('id'),
      supabase.from('pillage_bases').select('*').eq('carte_id', carteId).order('created_at', { ascending: false }),
    ])
    setBands(b.data || [])
    setPositions(p.data || [])
    setSecteurs(s.data || [])
    setBases(ba.data || [])
  }

  useEffect(() => {
    loadAll()
    const channel = supabase
      .channel('pillage-live-' + carteId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pillage_bands', filter: `carte_id=eq.${carteId}` }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pillage_positions', filter: `carte_id=eq.${carteId}` }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pillage_secteurs', filter: `carte_id=eq.${carteId}` }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pillage_bases', filter: `carte_id=eq.${carteId}` }, loadAll)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [carteId])

  async function addBand() {
    if (!form.z) return
    await supabase.from('pillage_bands').insert({
      carte_id: carteId,
      z: Number(form.z),
      x_debut: form.xDebut === '' ? MIN : Number(form.xDebut),
      x_fin: form.xFin === '' ? MAX : Number(form.xFin),
      largeur: Number(form.largeur) || 300,
      membre: profile.pseudo,
    })
    setForm({ z: '', xDebut: '', xFin: '', largeur: 300 })
    loadAll()
  }

  async function deleteBand(id) {
    await supabase.from('pillage_bands').delete().eq('id', id)
    loadAll()
  }

  async function updatePosition() {
    if (pos.x === '' || pos.z === '') return
    await supabase.from('pillage_positions').upsert(
      { membre: profile.pseudo, carte_id: carteId, x: Number(pos.x), z: Number(pos.z), updated_at: new Date().toISOString() },
      { onConflict: 'membre,carte_id' }
    )
    loadAll()
  }

  async function claimSector(s) {
    if (s.claimed_by === profile.pseudo) {
      await supabase.from('pillage_secteurs').update({ claimed_by: null }).eq('id', s.id).eq('carte_id', carteId)
    } else if (!s.claimed_by) {
      await supabase.from('pillage_secteurs').update({ claimed_by: profile.pseudo }).eq('id', s.id).eq('carte_id', carteId)
    }
    loadAll()
  }

  async function addBase() {
    if (baseForm.x === '' || baseForm.z === '') return
    await supabase.from('pillage_bases').insert({
      carte_id: carteId,
      x: Number(baseForm.x),
      z: Number(baseForm.z),
      type: baseForm.type,
      label: baseForm.label || null,
      membre: profile.pseudo,
    })
    setBaseForm({ x: '', z: '', type: 'normale', label: '' })
    loadAll()
  }

  async function deleteBase(id) {
    await supabase.from('pillage_bases').delete().eq('id', id)
    loadAll()
  }

  const coverage = Math.min(100, (bands.reduce((sum, b) => sum + (b.x_fin - b.x_debut) * b.largeur, 0) / (SIZE * SIZE)) * 100)

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <h1 className="mb-1"><span className="accent-word">PILLAGE</span></h1>
      <p className="text-slate-500 text-sm mb-3">Quadrillage partagé en direct — coordonnées -35000 / 35000</p>

      <button
        onClick={() => document.getElementById('tuto-pillage')?.scrollIntoView({ behavior: 'smooth' })}
        className="scroll-hint inline-flex items-center gap-2 text-xs text-accent border border-accent/40 rounded-full px-3 py-1.5 mb-5 hover:bg-accentdim/20"
      >
        ↓ Voir le tuto de quadrillage
      </button>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CARTES.map(c => (
          <button
            key={c.id}
            onClick={() => setCarteId(c.id)}
            className={`text-sm px-3 py-1.5 rounded-md border transition-colors whitespace-nowrap ${carteId === c.id ? 'border-accent text-accent bg-accentdim/20' : 'border-border text-slate-500 hover:text-slate-300'}`}
          >
            {c.nom}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        <div className="space-y-4">
          <div className="bg-panel border border-border rounded-xl p-4">
            <div className="text-xs uppercase text-slate-500 mb-3">Ma position</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input placeholder="X" value={pos.x} onChange={e => setPos(p => ({ ...p, x: e.target.value }))} className="bg-panel2 border border-border rounded px-2 py-1.5 text-sm font-mono" />
              <input placeholder="Z" value={pos.z} onChange={e => setPos(p => ({ ...p, z: e.target.value }))} className="bg-panel2 border border-border rounded px-2 py-1.5 text-sm font-mono" />
            </div>
            <button onClick={updatePosition} className="w-full bg-[#4a3010] border border-pos text-pos text-sm px-3 py-1.5 rounded">Mettre à jour</button>
          </div>

          <div className="bg-panel border border-border rounded-xl p-4">
            <div className="text-xs uppercase text-slate-500 mb-3">Épingler une base</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input placeholder="X" value={baseForm.x} onChange={e => setBaseForm(f => ({ ...f, x: e.target.value }))} className="bg-panel2 border border-border rounded px-2 py-1.5 text-sm font-mono" />
              <input placeholder="Z" value={baseForm.z} onChange={e => setBaseForm(f => ({ ...f, z: e.target.value }))} className="bg-panel2 border border-border rounded px-2 py-1.5 text-sm font-mono" />
            </div>
            <select value={baseForm.type} onChange={e => setBaseForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-2 py-1.5 text-sm mb-2">
              <option value="normale">Base normale</option>
              <option value="claim">Base claim</option>
            </select>
            <input placeholder="Note (optionnel)" value={baseForm.label} onChange={e => setBaseForm(f => ({ ...f, label: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-2 py-1.5 text-sm mb-2" />
            <button onClick={addBase} className="w-full bg-[#3a1a1a] border border-danger text-danger text-sm px-3 py-1.5 rounded">Épingler</button>
          </div>

          <div className="bg-panel border border-border rounded-xl p-4">
            <div className="text-xs uppercase text-slate-500 mb-3">Ajouter une bande</div>
            <input placeholder="Z de la bande" value={form.z} onChange={e => setForm(f => ({ ...f, z: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-2 py-1.5 text-sm font-mono mb-2" />
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input placeholder="X début" value={form.xDebut} onChange={e => setForm(f => ({ ...f, xDebut: e.target.value }))} className="bg-panel2 border border-border rounded px-2 py-1.5 text-sm font-mono" />
              <input placeholder="X fin" value={form.xFin} onChange={e => setForm(f => ({ ...f, xFin: e.target.value }))} className="bg-panel2 border border-border rounded px-2 py-1.5 text-sm font-mono" />
            </div>
            <input placeholder="Largeur" value={form.largeur} onChange={e => setForm(f => ({ ...f, largeur: e.target.value }))} className="w-full bg-panel2 border border-border rounded px-2 py-1.5 text-sm font-mono mb-2" />
            <button onClick={addBand} className="w-full bg-accentdim border border-explored text-explored text-sm px-3 py-1.5 rounded">Ajouter</button>
          </div>

          <div className="bg-panel border border-border rounded-xl p-4">
            <div className="text-xs uppercase text-slate-500 mb-2 flex justify-between">
              <span>Bandes ({bands.length})</span>
              <span className="text-explored">{coverage.toFixed(2)}%</span>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto mb-3">
              {bands.slice().sort((a, b) => a.z - b.z).map(b => (
                <div key={b.id} className="flex items-center justify-between bg-panel2 rounded px-2 py-1.5 text-xs font-mono">
                  <span className="truncate">[{b.membre}] Z={b.z}</span>
                  <button onClick={() => deleteBand(b.id)} className="text-slate-500 hover:text-danger px-1">✕</button>
                </div>
              ))}
              {bands.length === 0 && <div className="text-xs text-slate-600">Aucune bande sur cette carte.</div>}
            </div>
            <div className="text-xs uppercase text-slate-500 mb-2">Bases ({bases.length})</div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {bases.map(b => (
                <div key={b.id} className="flex items-center justify-between bg-panel2 rounded px-2 py-1.5 text-xs font-mono">
                  <span className="truncate" style={{ color: BASE_COLORS[b.type] }}>
                    ● {b.type} X={b.x} Z={b.z} {b.label ? `· ${b.label}` : ''}
                  </span>
                  <button onClick={() => deleteBase(b.id)} className="text-slate-500 hover:text-danger px-1">✕</button>
                </div>
              ))}
              {bases.length === 0 && <div className="text-xs text-slate-600">Aucune base épinglée.</div>}
            </div>
          </div>
        </div>

        <div className="bg-panel border border-border rounded-xl p-4 relative">
          {cursor && (
            <div className="absolute top-6 right-6 bg-panel2/90 backdrop-blur border border-accent/40 rounded-md px-3 py-1.5 text-xs font-mono text-accent z-10 shadow-lg">
              X {cursor.x} · Z {cursor.z}
            </div>
          )}
          <svg
            viewBox={`0 0 ${PX} ${TOPOFF + PX + 30}`}
            className="w-full bg-[#0a0e0c] rounded-lg border border-border cursor-crosshair"
            onMouseMove={onMove}
            onMouseLeave={() => setCursor(null)}
          >
            <rect x="0" y={TOPOFF} width={PX} height={PX} fill="none" stroke="#3a4740" />
            {TICKS.map(t => (
              <g key={'tx' + t}>
                <line x1={toPxX(t)} y1={TOPOFF} x2={toPxX(t)} y2={TOPOFF + PX} stroke="#1c241f" strokeWidth="0.5" />
                <text x={toPxX(t)} y={TOPOFF - 6} fill="#5a6560" fontFamily="ui-monospace,monospace" fontSize="9" textAnchor="middle">{t}</text>
              </g>
            ))}
            {TICKS.map(t => (
              <g key={'tz' + t}>
                <line x1="0" y1={toPxZ(t)} x2={PX} y2={toPxZ(t)} stroke="#1c241f" strokeWidth="0.5" />
                <text x="3" y={toPxZ(t) - 3} fill="#5a6560" fontFamily="ui-monospace,monospace" fontSize="9">{t}</text>
              </g>
            ))}
            {cursor && (
              <>
                <line x1={toPxX(cursor.x)} y1={TOPOFF} x2={toPxX(cursor.x)} y2={TOPOFF + PX} stroke="#b39fee" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
                <line x1="0" y1={toPxZ(cursor.z)} x2={PX} y2={toPxZ(cursor.z)} stroke="#b39fee" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
              </>
            )}
            {sectors().map(s => {
              const claim = secteurs.find(x => x.id === s.id)
              const x1 = toPxX(s.xMin), x2 = toPxX(s.xMax), y1 = toPxZ(s.zMin), y2 = toPxZ(s.zMax)
              const fill = claim?.claimed_by ? colorFor(claim.claimed_by) : 'transparent'
              return (
                <g key={s.id} style={{ cursor: 'pointer' }} onClick={() => claimSector(claim || { id: s.id, claimed_by: null })}>
                  <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} fill={fill} fillOpacity={claim?.claimed_by ? 0.12 : 0} stroke="#a48fe0" strokeDasharray="4 3" strokeWidth="0.7" />
                  <text x={x1 + 8} y={y1 + 16} fill="#a48fe0" fontFamily="ui-monospace,monospace" fontSize="11">
                    {s.id}{claim?.claimed_by ? ` · ${claim.claimed_by}` : ''}
                  </text>
                </g>
              )
            })}
            {bands.map(b => {
              const x1 = toPxX(b.x_debut), x2 = toPxX(b.x_fin), zc = toPxZ(b.z)
              const h = Math.max(2, (b.largeur / SIZE) * PX)
              return <rect key={b.id} x={x1} y={zc - h / 2} width={x2 - x1} height={h} fill="#3ddc84" fillOpacity="0.35" stroke="#3ddc84" strokeWidth="0.5" />
            })}
            {bases.map(b => {
              const px = toPxX(b.x), pz = toPxZ(b.z)
              const c = BASE_COLORS[b.type] || BASE_COLORS.normale
              return (
                <g key={'base-' + b.id}>
                  <rect x={px - 5} y={pz - 5} width="10" height="10" fill={c} stroke="#0a0a0c" strokeWidth="1" transform={`rotate(45 ${px} ${pz})`} />
                  <text x={px + 10} y={pz + 3} fill={c} fontFamily="ui-monospace,monospace" fontSize="9">{b.label || b.type}</text>
                </g>
              )
            })}
            {positions.map(p => {
              const c = colorFor(p.membre)
              const px = toPxX(p.x), pz = toPxZ(p.z)
              return (
                <g key={p.membre}>
                  <line x1={px - 7} y1={pz} x2={px + 7} y2={pz} stroke={c} strokeWidth="1.5" />
                  <line x1={px} y1={pz - 7} x2={px} y2={pz + 7} stroke={c} strokeWidth="1.5" />
                  <circle cx={px} cy={pz} r="3.5" fill={c} />
                  <text x={px + 9} y={pz - 8} fill={c} fontFamily="ui-monospace,monospace" fontSize="10">{p.membre}</text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      <div id="tuto-pillage" className="mt-6 bg-panel border border-border rounded-xl p-4 sm:p-5 scroll-mt-6">
        <div className="text-sm font-display font-semibold text-accent mb-3">Comment ça marche</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-400">
          <div>
            <div className="text-slate-200 font-medium mb-1">1. Choisis ta carte</div>
            Les onglets en haut séparent les 5 serveurs Faction (Runegard, Egopolis, Aeloria, Xanoth, Kilmordra) — chaque carte a ses propres secteurs, bandes, bases et positions.
          </div>
          <div>
            <div className="text-slate-200 font-medium mb-1">2. Réserve un secteur</div>
            Clique sur une des 9 cases pointillées pour te l'attribuer. Re-clique dessus pour la libérer.
          </div>
          <div>
            <div className="text-slate-200 font-medium mb-1">3. Quadrille en bandes</div>
            Avance en ligne droite, puis note le Z parcouru avec le X de départ/fin dans "Ajouter une bande" — visible par toute la faction en direct.
          </div>
          <div>
            <div className="text-slate-200 font-medium mb-1">4. Épingle les bases trouvées</div>
            Rentre les coordonnées exactes, choisis "normale" (cyan) ou "claim" (rouge) selon le type de base repérée.
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          <div>
            <div className="text-slate-200 font-medium text-sm mb-2">La technique du zigzag</div>
            <p className="text-sm text-slate-400 mb-3">
              Avance en ligne droite jusqu'au bord de ta zone, puis <span className="text-accent font-medium">recule de ta largeur de bande</span> (300 par défaut) sur l'axe Z, et repars dans l'autre sens.
            </p>
            <svg viewBox="0 0 260 170" className="w-full max-w-[260px] bg-[#0a0a0c] rounded-lg border border-border">
              <rect x="10" y="10" width="240" height="150" fill="none" stroke="#2a2a30" />
              <polyline points="20,25 240,25 240,60 20,60 20,95 240,95 240,130 20,130 20,150" fill="none" stroke="#a13bff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="20" cy="25" r="3" fill="#3ddc84" />
              <text x="20" y="18" fill="#5a6560" fontFamily="ui-monospace,monospace" fontSize="8">départ</text>
              <text x="130" y="70" fill="#5a6560" fontFamily="ui-monospace,monospace" fontSize="8" textAnchor="middle">recule de 300</text>
            </svg>
          </div>
          <div>
            <div className="text-slate-200 font-medium text-sm mb-2">Le résultat visé, une fois fini</div>
            <p className="text-sm text-slate-400 mb-3">
              Une carte totalement quadrillée sans espace vide entre les bandes — la couverture affichée à gauche s'approche alors de 100%.
            </p>
            <svg viewBox="0 0 260 170" className="w-full max-w-[260px] bg-[#0a0a0c] rounded-lg border border-border">
              <rect x="10" y="10" width="240" height="150" fill="none" stroke="#2a2a30" />
              {[25, 45, 65, 85, 105, 125, 145].map(y => (
                <rect key={y} x="14" y={y - 8} width="232" height="16" fill="#3ddc84" fillOpacity="0.3" stroke="#3ddc84" strokeWidth="0.5" />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
