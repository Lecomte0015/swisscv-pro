# Environnement de test jetable (préproduction)

`run.mjs` exécute 60 contrôles HTTP contre un Worker de test déployé et une base D1 de test **dédiés** (jamais la production :
le script refuse toute base autre que `swisscv-staging-tmp` et toute URL du Worker de production).

Recréer l'environnement (≈ 10 min) :
1. `npx wrangler d1 create swisscv-staging-tmp`
2. Créer `wrangler.staging.toml` : `name = "swisscv-pro-staging"`, `main = "index.js"`, la base ci-dessus, et dans `[vars]` des **valeurs aléatoires** pour `JWT_SECRET` et `STRIPE_WEBHOOK_SECRET`, des valeurs factices pour `STRIPE_SECRET_KEY`, `SUPABASE_URL` (`https://supabase.invalid`), `SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `RAPIDAPI_KEY`, `ADZUNA_*`. Pas de `routes`, pas de `crons`. Ne jamais commiter ce fichier.
3. Créer les tables de base (DDL de production, sans commentaires SQL) puis `scripts/d1-apply.sh swisscv-staging-tmp migrations/038_… 039_… 040_… wrangler.staging.toml`.
4. `npx wrangler deploy index.js --config wrangler.staging.toml` (filtrer la sortie : wrangler affiche les variables).
5. Fichier hors dépôt `staging.env` : `STAGING_JWT_SECRET=…`, `STAGING_WEBHOOK_SECRET=…`, `STAGING_DB_NAME=swisscv-staging-tmp`. Puis `STAGING_ENV=/chemin/staging.env node tests/staging/run.mjs`.
6. Supprimer ensuite : `npx wrangler delete --name swisscv-pro-staging --force` et `npx wrangler d1 delete swisscv-staging-tmp -y`.
