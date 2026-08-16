// Supprime un membre (compte auth + profil). Réservé au staff (Admin).
// Utilise la clé service_role, gardée secrète côté serveur, jamais
// envoyée au navigateur.

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Non authentifié' }), { status: 401 })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // Client "utilisateur" pour vérifier qui appelle
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userErr } = await callerClient.auth.getUser()
    if (userErr || !userData?.user) return new Response(JSON.stringify({ error: 'Session invalide' }), { status: 401 })

    const { data: callerProfile } = await callerClient.from('profiles').select('grade').eq('id', userData.user.id).single()
    if (callerProfile?.grade !== 'Admin') {
      return new Response(JSON.stringify({ error: 'Réservé aux Admins' }), { status: 403 })
    }

    const { memberId } = await req.json()
    if (!memberId) return new Response(JSON.stringify({ error: 'memberId manquant' }), { status: 400 })

    // Client admin (clé secrète) pour supprimer réellement le compte
    const adminClient = createClient(supabaseUrl, serviceKey)
    const { error: delErr } = await adminClient.auth.admin.deleteUser(memberId)
    if (delErr) return new Response(JSON.stringify({ error: delErr.message }), { status: 500 })

    return new Response(JSON.stringify({ deleted: true }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
