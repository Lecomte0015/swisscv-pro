# SwissCV Pro — Mémoire Projet Claude

## Architecture
- **Worker Cloudflare** : `index.js` (bundlé, ~5000 lignes, jamais committé sur GitHub)
- **Frontend** : Cloudflare Pages (`swisscv-pro.pages.dev` / `swisscv-pro.ch`)
- **Base de données** : Cloudflare D1 — `swisscv-db` (ID: `b3ec1eb9-5e18-4e92-a0e4-7fa47e1fa3e0`)
- **Auth** : Supabase (JWT uniquement, pas de base Supabase utilisée)
- **Emails** : Resend API (`bonjour@swisscv-pro.ch`) — domaine vérifié DKIM+SPF
- **GitHub** : backup uniquement — déploiement via `wrangler deploy` direct

## Déploiement
```bash
# Worker
npx wrangler deploy

# Frontend (Pages)
npx wrangler pages deploy . --project-name swisscv-pro

# Migration D1
npx wrangler d1 execute swisscv-db --remote --file=migrations/NNN_nom.sql

# Secret
echo "valeur" | npx wrangler secret put NOM_SECRET
```

## Secrets Cloudflare (ne jamais committer)
- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`

## Règles importantes
- `index.js` et `wrangler.toml` sont **gitignorés** — jamais sur GitHub
- Les template literals avec backticks `` ` `` ne fonctionnent pas dans index.js (déjà bundlé) → utiliser concaténation `'...' + var + '...'`
- Cron quotidien : `0 8 * * *` (handler `scheduled` dans index.js)

## Email automation (cron 8h quotidien)
| Séquence | Déclencheur | Template |
|---|---|---|
| Bienvenue | Inscription | `createWelcomeHTML` |
| Email 1 Post-analyse | Lendemain analyse | `createAnalysisReminderHTML` |
| Email 2 ATS Education | J+2 après Email 1 | `createAtsEducationHTML` |
| J+3 Relance | 3j sans analyse | `createJ3ReminderHTML` |
| Réengagement | 0 analyses >7j | `createReengagementHTML` |
| J+7 Upgrade | Free >7j | `createJ7UpgradeHTML` |
| J+14 Upgrade | Free >14j | `createJ14UpgradeHTML` |
| Crédits épuisés | Solde = 0 | `createCreditsDepletedHTML` |

## Colonnes D1 email tracking (table users)
`j3_reminder_sent`, `j7_upgrade_sent`, `credits_depleted_email_sent`,
`reengagement_email_sent`, `analysis_reminder_sent`, `j14_upgrade_sent`,
`analysis_edu_email_sent`

## Tables D1 principales
- `users` — utilisateurs (Supabase auth ID)
- `cv_analyses` — analyses CV
- `email_logs` — logs envois email (sent/opened/clicked via webhook Resend)
- `support_tickets` — tickets support client
- `admins` — comptes admin back-office
- `notifications` — notifications système
- `page_sections` — CMS back-office

## Routes API principales
- `POST /admin/login` — auth admin
- `GET /admin/stats` — stats dashboard
- `GET /admin/users` — liste utilisateurs
- `GET /admin/emails` — logs emails (table email_logs)
- `GET /admin/support/stats` — stats tickets support
- `GET /admin/support/tickets` — liste tickets
- `PATCH /admin/support/tickets/:id` — update statut/priorité
- `POST /support/ticket` — créer ticket (public)
- `POST /webhooks/resend` — webhook ouvertures/clics email
- `GET /admin/analytics/analyses-daily` — analytics
- `GET /admin/cms/sections` — CMS

## Webhook Resend (tracking emails)
URL : `https://swisscv-pro.dallyhermann-71e.workers.dev/webhooks/resend`
Events : `email.opened`, `email.clicked`

## Back-office
URL : `https://swisscv-pro.ch/admin-dashboard.html`
Pages : Dashboard, Utilisateurs, Témoignages, Analytics, Support, Logs, Emails, CMS

## Migrations appliquées
001 → 028 (toutes appliquées en remote D1)
Dernière : `028_email_logs.sql` — table `email_logs` pour tracking Resend

## Problèmes connus / résolus
- SSH GitHub nécessite passphrase → push manuel par l'utilisateur
- `wrangler pages deploy` nécessite session interactive (pas background)
- DNS DKIM était bloqué par NS `_domainkey` → Infomaniak déléguait vers leurs serveurs malgré Cloudflare actif → suppression des NS `_domainkey` dans Cloudflare a résolu
