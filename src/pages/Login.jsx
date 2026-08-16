import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setError('')
    setLoading(true)
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message) }
      else if (data.user) {
        await supabase.from('profiles').insert({ id: data.user.id, pseudo: pseudo || email.split('@')[0] })
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-panel border border-border rounded-xl p-6">
        <div className="text-center mb-6">
          <div className="text-lg font-bold text-accent">RAID RAVENS</div>
          <div className="text-[11px] text-slate-500 font-mono">PALLADIUM V12</div>
        </div>

        <div className="flex gap-2 mb-5 text-sm">
          <button onClick={() => setMode('signin')} className={`flex-1 py-2 rounded-md border ${mode === 'signin' ? 'border-accent text-accent' : 'border-border text-slate-500'}`}>Connexion</button>
          <button onClick={() => setMode('signup')} className={`flex-1 py-2 rounded-md border ${mode === 'signup' ? 'border-accent text-accent' : 'border-border text-slate-500'}`}>Inscription</button>
        </div>

        <div className="space-y-3">
          {mode === 'signup' && (
            <input placeholder="Pseudo" value={pseudo} onChange={e => setPseudo(e.target.value)} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm" />
          )}
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm" />
          <input placeholder="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-panel2 border border-border rounded px-3 py-2 text-sm" />
          {error && <div className="text-danger text-xs">{error}</div>}
          <button onClick={submit} disabled={loading} className="w-full bg-accentdim border border-accent/60 text-white text-sm px-4 py-2.5 rounded-md disabled:opacity-50">
            {loading ? '...' : mode === 'signin' ? 'Se connecter' : "S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  )
}
