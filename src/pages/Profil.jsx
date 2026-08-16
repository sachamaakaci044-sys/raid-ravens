import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'

const METIERS = [
  { key: 'mineur_lvl', label: 'Mineur', color: '#eab308' },
  { key: 'farmer_lvl', label: 'Farmer', color: '#3ddc84' },
  { key: 'hunter_lvl', label: 'Hunter', color: '#a48fe0' },
  { key: 'alchimiste_lvl', label: 'Alchimiste', color: '#3dc9dc' },
]

const DONJONS = [
  { key: 'saharia_lvl', label: 'Saharia', max: 51, note: 'donjon temporaire' },
  { key: 'nimbria_lvl', label: 'Nimbria', max: 100 },
  { key: 'talikus_lvl', label: 'Talikus', max: 100 },
  { key: 'vitalys_lvl', label: 'Vitalys', max: 100 },
  { key: 'manelios_lvl', label: 'Manelios', max: 100 },
]

export default function Profil() {
  const { profile, reloadProfile } = useAuth()
  const [levels, setLevels] = useState(() =>
    Object.fromEntries(METIERS.map(m => [m.key, profile?.[m.key] ?? 1]))
  )
  const [donjons, setDonjons] = useState(() =>
    Object.fromEntries(DONJONS.map(d => [d.key, profile?.[d.key] ?? 1]))
  )
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await supabase.from('profiles').update({ ...levels, ...donjons }).eq('id', profile.id)
    await reloadProfile()
    setSaving(false)
  }

  if (!profile) return null

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <h1 className="mb-1">MON <span className="accent-word">PROFIL</span></h1>
      <p className="text-slate-500 text-sm mb-6">Tes métiers Palladium et infos de faction</p>

      <div className="bg-panel border border-border rounded-xl p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accentdim flex items-center justify-center font-bold">
            {profile.pseudo.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-bold">{profile.pseudo}</div>
            <div className="text-xs text-slate-500">{profile.grade}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {METIERS.map(m => (
          <div key={m.key} className="bg-panel border border-border rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium" style={{ color: m.color }}>{m.label.toUpperCase()}</span>
              <span className="text-xl font-bold">{levels[m.key]}</span>
            </div>
            <input
              type="range" min={1} max={20} value={levels[m.key]}
              onChange={e => setLevels(l => ({ ...l, [m.key]: Number(e.target.value) }))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1"><span>NIV. 1</span><span>NIV. 20</span></div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="text-sm font-display font-semibold text-accent mb-3">DONJONS</div>
        <div className="grid grid-cols-2 gap-4">
          {DONJONS.map(d => (
            <div key={d.key} className="bg-panel border border-border rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-200">
                  {d.label.toUpperCase()}
                  {d.note && <span className="text-[10px] text-slate-500 font-normal ml-1.5">({d.note})</span>}
                </span>
                <span className="text-xl font-bold">{donjons[d.key]}</span>
              </div>
              <input
                type="range" min={1} max={d.max} value={donjons[d.key]}
                onChange={e => setDonjons(v => ({ ...v, [d.key]: Number(e.target.value) }))}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1"><span>NIV. 1</span><span>NIV. {d.max}</span></div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4">Tu peux modifier uniquement tes propres niveaux. Les grades et rôles sont gérés par le staff.</p>
      <button onClick={save} disabled={saving} className="bg-accentdim border border-accent/60 text-white text-sm px-5 py-2.5 rounded-md hover:bg-accent hover:text-bg transition-colors disabled:opacity-50">
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </div>
  )
}