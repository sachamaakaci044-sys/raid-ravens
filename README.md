# Raid Ravens — Dashboard Palladium V12

Projet 100% gratuit : React + Vite + Tailwind, base de données et auth
Supabase (plan Free), hébergé sur Vercel (plan Free).

## 1. Créer le projet Supabase (gratuit)

1. Va sur https://supabase.com → New project (gratuit, pas de carte requise).
2. Une fois le projet créé, va dans **SQL Editor** → New query.
3. Colle tout le contenu de `supabase/schema.sql` et clique **Run**.
4. Va dans **Project Settings > API** et note :
   - `Project URL` → sera `VITE_SUPABASE_URL`
   - `anon public key` → sera `VITE_SUPABASE_ANON_KEY`
5. Va dans **Authentication > Providers**, laisse "Email" activé
   (c'est le seul nécessaire ici). Tu peux désactiver la confirmation
   par email dans **Authentication > Settings** pour aller plus vite
   entre potes (sinon chacun doit valider son email à l'inscription).

## 2. Configurer le projet en local

```bash
npm install
cp .env.example .env
# remplis .env avec ton URL et ta clé Supabase
npm run dev
```

Ouvre http://localhost:5173 — inscris-toi avec un pseudo, un email et
un mot de passe. Le premier compte créé aura le grade "Membre" par
défaut : passe-le en "Admin" directement dans Supabase (Table editor
> profiles > modifie la colonne `grade`) pour débloquer le Panel Admin.

## 3. Déployer gratuitement sur Vercel

1. Crée un dépôt GitHub avec ce projet (`git init`, `git add .`,
   `git commit`, push sur un nouveau repo).
2. Va sur https://vercel.com → New Project → importe ton repo GitHub.
3. Dans les paramètres du projet Vercel, ajoute les variables
   d'environnement :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Déploie. Ton site est en ligne sur un lien `xxx.vercel.app`,
   gratuit, sans limite de temps.

## 4. Suppression de membres (sécurisée)

La suppression d'un membre passe par une fonction serveur dédiée, pour
ne jamais exposer la clé secrète Supabase au navigateur.

```bash
supabase functions deploy delete-member
```

Rien d'autre à configurer : les clés nécessaires sont fournies
automatiquement par Supabase à la fonction.

## 5. Notifications Discord (optionnel)

Actions couvertes : nouvelle/modifiée/supprimée annonce, nouveau quota,
nouvelle absence, événement créé/modifié/supprimé, tâche créée/
terminée/supprimée, membre supprimé.

1. Sur Discord : Paramètres du serveur → Intégrations → Webhooks →
   Nouveau webhook → choisis le salon → **Copier l'URL du webhook**.
2. Installe la CLI Supabase si ce n'est pas déjà fait
   (`npm install -g supabase`), puis connecte-toi à ton projet
   (`supabase login`, `supabase link --project-ref TON_PROJECT_REF`).
3. Déploie la fonction :
   ```bash
   supabase functions deploy notify-discord
   ```
4. Stocke ton webhook comme secret (jamais dans le code) :
   ```bash
   supabase secrets set DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxxxx
   ```
5. Dans le dashboard Supabase → **Database → Webhooks → Create a new
   hook**, crée un hook pour chaque table, en cochant les événements
   indiqués :
   - `annonces` → Insert, Update, Delete
   - `quotas` → Insert
   - `absences` → Insert
   - `evenements` → Insert, Update, Delete
   - `taches` → Insert, Update, Delete
   - `profiles` → Delete

   Pour chacun : type **HTTP Request**, méthode **POST**, URL = l'URL
   de ta fonction (`https://TON_PROJECT_REF.functions.supabase.co/notify-discord`).

Une fois configuré : crée une annonce depuis Panel Admin, tu dois voir
le message apparaître sur Discord dans la seconde.


- Auth par email/mot de passe (Supabase Auth)
- Dashboard avec effectifs et niveaux de métier uniformes
- Banque (transactions, ajout par le staff)
- Tâches en kanban (À faire / En cours / Terminé)
- Absences (déclaration par les membres)
- Quotas (déclaration + validation staff)
- Leaderboard calculé automatiquement (tâches terminées + quotas validés)
- Mon Profil (le membre modifie ses propres niveaux de métier)
- Panel Admin : gestion des membres/grades, quotas, banque, annonces
- Vie de Faction (annonces du staff)
- **Pillage** : quadrillage partagé en 9 secteurs, positions et bandes
  explorées synchronisées en temps réel via Supabase Realtime (pas de
  polling — mise à jour instantanée entre tous les membres connectés)

## Limites du plan gratuit à connaître

- Supabase Free : projet mis en pause après 7 jours d'inactivité totale
  (se réactive automatiquement à la prochaine visite, il faut juste
  quelques secondes) ; 500 Mo de base de données ; largement suffisant
  pour une faction.
- Vercel Free : bande passante généreuse pour un usage perso/faction,
  pas de carte bancaire requise.
