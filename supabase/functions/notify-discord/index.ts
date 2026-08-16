// Edge Function : reçoit les événements de la base (via Database Webhooks)
// et les relaie vers Discord. L'URL du webhook Discord n'est JAMAIS dans le
// code : elle est lue depuis un secret Supabase (DISCORD_WEBHOOK_URL).

Deno.serve(async (req) => {
  try {
    const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL')
    if (!webhookUrl) {
      return new Response(JSON.stringify({ error: 'DISCORD_WEBHOOK_URL non configuré' }), { status: 500 })
    }

    const payload = await req.json()
    const table = payload.table
    const type = payload.type // INSERT | UPDATE | DELETE
    const row = payload.record || payload.old_record

    let content = null

    if (table === 'annonces') {
      content = type === 'DELETE'
        ? `🗑️ Annonce supprimée : **${row.titre}**`
        : `📣 **${type === 'UPDATE' ? 'Annonce modifiée' : 'Nouvelle annonce'} : ${row.titre}**\n${row.texte}`
    } else if (table === 'quotas') {
      content = `💰 **Quota déclaré** — ${row.membre} : ${row.item} (${row.montant}) — semaine ${row.semaine}`
    } else if (table === 'absences') {
      content = `📅 **Absence déclarée** — ${row.membre} du ${row.date_debut} au ${row.date_fin}${row.raison ? ` (${row.raison})` : ''}`
    } else if (table === 'evenements') {
      const date = new Date(row.date_heure)
      content = type === 'DELETE'
        ? `🗑️ Événement annulé : **${row.titre}**`
        : `🗓️ **${type === 'UPDATE' ? 'Événement modifié' : 'Nouvel événement'} : ${row.titre}**\n${date.toLocaleString('fr-FR')}${row.description ? `\n${row.description}` : ''}`
    } else if (table === 'taches') {
      if (type === 'INSERT') content = `📋 **Nouvelle tâche : ${row.titre}**${row.assigne ? ` → ${row.assigne}` : ''}`
      else if (type === 'DELETE') content = `🗑️ Tâche supprimée : **${row.titre}**`
      else if (type === 'UPDATE' && row.statut === 'termine') content = `✅ Tâche terminée : **${row.titre}**`
    } else if (table === 'profiles' && type === 'DELETE') {
      content = `👤 Membre supprimé : **${row.pseudo}**`
    }

    if (!content) {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 })
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    return new Response(JSON.stringify({ sent: res.ok }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
