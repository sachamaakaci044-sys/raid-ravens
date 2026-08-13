-- ============================================================
-- Raid Ravens — migration v3
-- ============================================================

-- Il manquait les règles permettant au staff de modifier/supprimer
-- une absence (seules la lecture et la création existaient).
create policy "absences_update_staff" on absences for update using (is_staff());
create policy "absences_delete_staff" on absences for delete using (is_staff());

-- Permet au staff de créer des tâches (déjà prévu à l'origine, on
-- s'assure juste que la policy existe bien).
drop policy if exists "taches_write_staff" on taches;
create policy "taches_write_staff" on taches for insert with check (is_staff());
create policy "taches_delete_staff" on taches for delete using (is_staff());

-- Fiabilise le temps réel : sans ça, une suppression peut ne pas être
-- détectée par les autres membres connectés (la ligne supprimée ne
-- contient plus assez d'infos pour appliquer le filtre par carte).
alter table pillage_bands replica identity full;
alter table pillage_positions replica identity full;
alter table pillage_secteurs replica identity full;
