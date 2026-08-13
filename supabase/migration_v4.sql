-- ============================================================
-- Raid Ravens — migration v4
-- ============================================================

-- 1. Nouveaux grades : Recru, Membre, Recruteur, Admin
-- (le staff avec accès Panel Admin, c'est UNIQUEMENT Admin désormais)
update profiles set grade = 'Recruteur' where grade = 'Mod';
update profiles set grade = 'Membre' where grade not in ('Recru','Membre','Recruteur','Admin');

create or replace function is_staff()
returns boolean language sql stable as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and grade = 'Admin'
  );
$$;

-- 2. Dernière activité (proxy simple de "dernière connexion")
alter table profiles add column if not exists last_seen_at timestamptz;

-- 3. Modification / suppression des annonces et événements (staff uniquement)
create policy "annonces_update_staff" on annonces for update using (is_staff());
create policy "annonces_delete_staff" on annonces for delete using (is_staff());
create policy "evenements_update_staff" on evenements for update using (is_staff());
create policy "evenements_delete_staff" on evenements for delete using (is_staff());

-- 4. Suppression de membres : la ligne profils peut être supprimée par le
-- staff (le compte auth lui-même est supprimé via l'Edge Function
-- delete-member, qui utilise la clé secrète — jamais depuis le navigateur).
create policy "profiles_delete_staff" on profiles for delete using (is_staff());

-- 5. Bases repérées sur la carte de Pillage (distinctes des bandes)
create table if not exists pillage_bases (
  id bigint generated always as identity primary key,
  carte_id text not null references pillage_cartes(id),
  x numeric not null,
  z numeric not null,
  type text not null default 'normale', -- 'normale' | 'claim'
  label text,
  membre text not null,
  created_at timestamptz not null default now()
);
alter table pillage_bases enable row level security;
create policy "pillage_bases_all" on pillage_bases for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
alter table pillage_bases replica identity full;
alter publication supabase_realtime add table pillage_bases;
