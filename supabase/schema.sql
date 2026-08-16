-- ============================================================
-- Raid Ravens — schéma Supabase (100% gratuit sur le plan Free)
-- À coller dans Supabase > SQL Editor > New query > Run
-- ============================================================

-- Profils membres (1 ligne par utilisateur Supabase Auth)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text not null,
  grade text not null default 'Membre', -- 'Membre' | 'Mod' | 'Admin'
  mineur_lvl int not null default 1,
  farmer_lvl int not null default 1,
  hunter_lvl int not null default 1,
  alchimiste_lvl int not null default 1,
  saharia_lvl int not null default 1,
  nimbria_lvl int not null default 1,
  talikus_lvl int not null default 1,
  vitalys_lvl int not null default 1,
  manelios_lvl int not null default 1,
  created_at timestamptz not null default now()
);

-- Banque de faction
create table if not exists banque_transactions (
  id bigint generated always as identity primary key,
  type text not null,            -- 'entree' | 'sortie'
  description text not null,
  categorie text,
  auteur text not null,
  montant numeric not null,
  created_at timestamptz not null default now()
);

-- Tâches (kanban)
create table if not exists taches (
  id bigint generated always as identity primary key,
  titre text not null,
  description text,
  assigne text,
  statut text not null default 'a_faire', -- 'a_faire' | 'en_cours' | 'termine'
  created_at timestamptz not null default now()
);

-- Absences
create table if not exists absences (
  id bigint generated always as identity primary key,
  membre text not null,
  date_debut date not null,
  date_fin date not null,
  raison text,
  statut text not null default 'a_valider', -- 'a_valider' | 'valide' | 'refuse'
  created_at timestamptz not null default now()
);

-- Quotas hebdomadaires
create table if not exists quotas (
  id bigint generated always as identity primary key,
  membre text not null,
  item text not null,
  montant numeric not null,
  semaine text not null,
  statut text not null default 'en_attente', -- 'en_attente' | 'valide' | 'refuse'
  created_at timestamptz not null default now()
);

-- Annonces (Vie de Faction)
create table if not exists annonces (
  id bigint generated always as identity primary key,
  titre text not null,
  texte text not null,
  auteur text,
  created_at timestamptz not null default now()
);

-- Pillage : bandes explorées (quadrillage) — une par carte (serveur Faction)
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

create table if not exists pillage_bands (
  id bigint generated always as identity primary key,
  carte_id text not null default 'runegard' references pillage_cartes(id),
  z numeric not null,
  x_debut numeric not null,
  x_fin numeric not null,
  largeur numeric not null default 300,
  membre text not null,
  created_at timestamptz not null default now()
);

-- Pillage : position actuelle de chaque joueur (une ligne par membre et par carte)
create table if not exists pillage_positions (
  membre text not null,
  carte_id text not null default 'runegard' references pillage_cartes(id),
  x numeric not null,
  z numeric not null,
  updated_at timestamptz not null default now(),
  primary key (membre, carte_id)
);

-- Pillage : 9 secteurs par carte, réservation par membre
create table if not exists pillage_secteurs (
  id int not null,
  carte_id text not null references pillage_cartes(id),
  claimed_by text,
  primary key (carte_id, id)
);
insert into pillage_secteurs (id, carte_id, claimed_by)
  select g, c.id, null from pillage_cartes c, generate_series(1,9) g
  on conflict do nothing;

-- Événements de faction (annonces programmées, ex: boss)
create table if not exists evenements (
  id bigint generated always as identity primary key,
  titre text not null,
  date_heure timestamptz not null,
  description text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS — activé partout, lecture ouverte aux membres connectés
-- ============================================================
alter table profiles enable row level security;
alter table banque_transactions enable row level security;
alter table taches enable row level security;
alter table absences enable row level security;
alter table quotas enable row level security;
alter table annonces enable row level security;
alter table pillage_bands enable row level security;
alter table pillage_positions enable row level security;
alter table pillage_secteurs enable row level security;
alter table pillage_cartes enable row level security;
alter table evenements enable row level security;

-- Helper : est-ce que l'utilisateur connecté est staff (Mod/Admin) ?
create or replace function is_staff()
returns boolean language sql stable as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and grade in ('Mod','Admin')
  );
$$;

-- profiles : tout le monde connecté peut lire ; chacun modifie son propre
-- profil (métiers) ; seul le staff peut changer le champ "grade" d'autrui.
create policy "profiles_select" on profiles for select using (auth.role() = 'authenticated');
create policy "profiles_insert_self" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_self" on profiles for update using (auth.uid() = id);
create policy "profiles_update_staff" on profiles for update using (is_staff());

-- Tables lues par tous les connectés, écrites par tous les connectés
-- (faction fermée et de confiance ; le staff a en plus le droit de modifier)
create policy "banque_select" on banque_transactions for select using (auth.role() = 'authenticated');
create policy "banque_insert_staff" on banque_transactions for insert with check (is_staff());

create policy "taches_select" on taches for select using (auth.role() = 'authenticated');
create policy "taches_write_staff" on taches for insert with check (is_staff());
create policy "taches_update_all" on taches for update using (auth.role() = 'authenticated');

create policy "absences_select" on absences for select using (auth.role() = 'authenticated');
create policy "absences_insert_self" on absences for insert with check (auth.role() = 'authenticated');
create policy "absences_update_staff" on absences for update using (is_staff());
create policy "absences_delete_staff" on absences for delete using (is_staff());

create policy "quotas_select" on quotas for select using (auth.role() = 'authenticated');
create policy "quotas_insert_self" on quotas for insert with check (auth.role() = 'authenticated');
create policy "quotas_update_staff" on quotas for update using (is_staff());

create policy "annonces_select" on annonces for select using (auth.role() = 'authenticated');
create policy "annonces_insert_staff" on annonces for insert with check (is_staff());

create policy "pillage_bands_all" on pillage_bands for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "pillage_positions_all" on pillage_positions for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "pillage_secteurs_all" on pillage_secteurs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "pillage_cartes_select" on pillage_cartes for select using (auth.role() = 'authenticated');

create policy "evenements_select" on evenements for select using (auth.role() = 'authenticated');
create policy "evenements_insert_staff" on evenements for insert with check (is_staff());

-- Active le temps réel sur les tables du pillage (Database > Replication
-- dans Supabase, ou directement ici) :
alter publication supabase_realtime add table pillage_bands, pillage_positions, pillage_secteurs;
