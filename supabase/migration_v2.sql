-- ============================================================
-- Raid Ravens — migration v2
-- À coller dans Supabase > SQL Editor > New query > Run
-- (à faire APRÈS le schema.sql initial, une seule fois)
-- ============================================================

-- 1. Modération des absences par le staff
alter table absences add column if not exists statut text not null default 'a_valider';

-- 2. Niveaux de donjons sur le profil
alter table profiles add column if not exists saharia_lvl int not null default 1;
alter table profiles add column if not exists nimbria_lvl int not null default 1;
alter table profiles add column if not exists talikus_lvl int not null default 1;
alter table profiles add column if not exists vitalys_lvl int not null default 1;
alter table profiles add column if not exists manelios_lvl int not null default 1;

-- 3. Pillage multi-cartes (une carte = un serveur Faction Paladium)
create table if not exists pillage_cartes (
  id text primary key,
  nom text not null
);
insert into pillage_cartes (id, nom) values
  ('runegard', 'Runegard'),
  ('egopolis', 'Egopolis'),
  ('aeloria', 'Aeloria'),
  ('xanoth', 'Xanoth'),
  ('kilmordra', 'Kilmordra')
on conflict (id) do nothing;

alter table pillage_bands add column if not exists carte_id text not null default 'runegard' references pillage_cartes(id);

alter table pillage_positions drop constraint if exists pillage_positions_pkey;
alter table pillage_positions add column if not exists carte_id text not null default 'runegard' references pillage_cartes(id);
alter table pillage_positions add primary key (membre, carte_id);

alter table pillage_secteurs drop constraint if exists pillage_secteurs_pkey;
alter table pillage_secteurs add column if not exists carte_id text not null default 'runegard' references pillage_cartes(id);
alter table pillage_secteurs add primary key (carte_id, id);

-- crée les 9 secteurs pour chaque carte qui n'en a pas encore
insert into pillage_secteurs (id, carte_id, claimed_by)
  select g, c.id, null
  from pillage_cartes c, generate_series(1,9) g
  on conflict do nothing;

-- 4. Événements de faction (pour les notifications Discord programmées)
create table if not exists evenements (
  id bigint generated always as identity primary key,
  titre text not null,
  date_heure timestamptz not null,
  description text,
  created_at timestamptz not null default now()
);
alter table evenements enable row level security;
create policy "evenements_select" on evenements for select using (auth.role() = 'authenticated');
create policy "evenements_insert_staff" on evenements for insert with check (is_staff());

-- ============================================================
-- 5. Notifications Discord automatiques
-- ============================================================
-- Après avoir déployé la fonction (voir README > "Notifications
-- Discord"), va dans Supabase > Database > Webhooks > Create a
-- new hook, pour CHACUNE de ces 4 tables :
--   annonces   → événement : Insert
--   quotas     → événement : Insert
--   absences   → événement : Insert
--   evenements → événement : Insert
-- Type : HTTP Request → POST vers l'URL de ta fonction
-- (https://<PROJECT_REF>.functions.supabase.co/notify-discord)
-- Aucune ligne SQL n'est nécessaire pour cette étape, tout se fait
-- dans l'interface Supabase.
