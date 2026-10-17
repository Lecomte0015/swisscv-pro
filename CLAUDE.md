# SwissCV Pro — Mémoire Projet Claude

## Architecture
- **Worker Cloudflare** : `index.js` (bundlé, ~6700 lignes, jamais committé sur GitHub)
- **Frontend** : Cloudflare Pages (`swisscv-pro.pages.dev` / `swisscv-pro.ch`)
- **Base de données** : Cloudflare D1 — `swisscv-db` (ID: `b3ec1eb9-5e18-4e92-a0e4-7fa47e1fa3e0`)
- **Auth** : Supabase (JWT uniquement, pas de base Supabase utilisée)
- **Emails** : Resend API (`bonjour@swisscv-pro.ch`) — domaine vérifié DKIM+SPF
- **GitHub** : backup uniquement — déploiement via `wrangler deploy` direct

## Déploiement
```bash
# Worker
npx wrangler deploy

# Frontend (Pages) — TOUJOURS via dist/ (jamais `pages deploy .` : il publierait index.js, wrangler.toml, les .md et migrations/)
./scripts/build-public.sh
npx wrangler pages deploy dist --project-name swisscv-pro --branch main --commit-dirty=true

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
- `users` — utilisateurs (Supabase auth ID). Contient un utilisateur système `id = 'contact-form'` (email `contact-form@swisscv-pro.ch`) utilisé comme `user_id` placeholder pour les tickets créés via le formulaire de contact public (FK `support_tickets.user_id → users.id`)
- `cv_analyses` — analyses CV
- `saved_searches` — recherches sauvegardées + alertes emploi (`email_alerts`, `last_alert_sent`). Une ligne `name = 'Alertes basées sur mon CV'` est créée/mise à jour automatiquement après chaque analyse CV (si ≥2 mots-clés extraits)
- `admin_logs` — audit trail des actions admin (`admin_id`, `action`, `target_type`, `target_id`, `details`, `ip_address`). `admin_id` référence `users.id` (PAS la table `admins`, qui est vide/inutilisée en pratique — l'identité admin réelle vit dans `users.role IN ('admin','super_admin')`)
- `email_logs` — logs envois email (sent/opened/clicked via webhook Resend)
- `support_tickets` — tickets support client (inclut aussi les messages du formulaire de contact, préfixés `[Contact]` dans `subject`)
- `admins` — table historique du système admin séparé (migration 007), **vide et non utilisée** — ne pas s'y fier pour l'identité admin
- `notifications` — notifications système
- `page_sections` — CMS back-office
- `job_pack_events` — événements du Pack Recherche d'Emploi (`viewed`, `cta_clicked`, `checkout_started`, `purchased`, `activated`). `user_id` nullable (visiteurs anonymes avant connexion)
- `ai_usage` — coût réel par appel IA (`feature`, `tokens_used`, `cost_estimate` en USD), alimentée depuis le 21.08.2026 via `logAiUsage()` après chaque appel Anthropic (analyse CV, lettre, comparaison CV/offre, candidature 1-clic, candidatures en masse)

## Routes API principales
- `POST /admin/login` — auth admin
- `GET /admin/stats` — stats dashboard
- `GET /admin/users` — liste utilisateurs
- `PATCH /admin/users/:id` — changer le plan (tier) d'un utilisateur
- `PATCH /admin/users/:id/role` — changer le rôle d'un utilisateur
- `DELETE /admin/users/:id` — bannir un utilisateur (soft-ban via `deleted_at`, bloque la connexion, réversible en DB)
- `POST /admin/users/:id/cancel-subscription` — résilier l'abonnement d'un client depuis l'admin (annule chez Stripe + email de confirmation Resend)
- `GET /admin/logs` — logs d'audit admin (table `admin_logs`)
- `GET /admin/emails` — logs emails (table email_logs)
- `GET /admin/support/stats` — stats tickets support
- `GET /admin/support/tickets` — liste tickets
- `PATCH /admin/support/tickets/:id` — update statut/priorité
- `POST /support/ticket` — créer ticket (public)
- `POST /contact` — formulaire de contact public (crée un ticket support + email confirmation client + notification `contact@swisscv-pro.ch`)
- `POST /subscription/cancel` — résiliation abonnement par le client lui-même (annule chez Stripe + retour plan free)
- `DELETE /cv-analyses/:id` — supprimer une analyse CV (scopé à `user_id`)
- `DELETE /analyses/history` — supprimer tout l'historique d'analyses de l'utilisateur
- `POST /auth/verify-email` — vérifie le token Supabase et **retourne un JWT SwissCV Pro** (connexion auto après confirmation email, plus besoin de re-saisir le mot de passe)
- `POST /webhooks/resend` — webhook ouvertures/clics email
- `GET /admin/analytics/analyses-daily` — analytics
- `GET /admin/cms/sections` — CMS
- `POST /ai/generate-application` — Candidature 1 clic (CV optimisé + lettre, 3 crédits)
- `POST /ai/generate-bulk-applications` — Candidatures en masse (2 crédits/offre, max 5 free / 10 premium)
- `POST /stripe/create-job-pack-checkout` — Checkout Stripe `mode: payment` pour le Pack Recherche d'Emploi (prix/crédits fixés côté serveur via `JOB_PACK_CONFIG`, jamais transmis par le client)
- `POST /job-pack/track` — Tracking événements page de vente (`viewed`, `cta_clicked`), auth optionnelle, table `job_pack_events`

## Webhook Resend (tracking emails)
URL : `https://swisscv-pro.dallyhermann-71e.workers.dev/webhooks/resend`
Events : `email.opened`, `email.clicked`

## Back-office
URL : `https://swisscv-pro.ch/admin-dashboard.html`
Pages : Dashboard, Utilisateurs, Témoignages, Analytics, Support, Logs, Emails, CMS

## Pages frontend (Cloudflare Pages)
- `app.html` — analyse CV (sauvegarde CV dans `localStorage.swisscv_last_cv`)
- `job-search.html` — recherche offres + sélection multiple pour bulk apply
- `apply.html` — candidature 1 clic depuis une offre (lit `sessionStorage.apply_job`)
- `bulk-apply.html` — candidatures en masse (lit `sessionStorage.bulk_apply_jobs`)
- `cover-letter.html` — génération lettre de motivation
- `job-tracker.html` — kanban suivi candidatures
- `pack-recherche-emploi.html` — page de vente du Pack Recherche d'Emploi (paiement unique)

## Tokens / Auth (frontend)
- `localStorage.swisscv_token` — JWT Supabase (clé correcte, pas `sb-access-token`)
- `localStorage.swisscv_user` — objet user JSON (nom, email, tier, crédits)
- `localStorage.swisscv_last_cv` — dernier texte CV extrait (pour pré-remplissage)
- `sessionStorage.apply_job` — objet job `{title, company, description}` pour apply.html
- `sessionStorage.bulk_apply_jobs` — tableau jobs pour bulk-apply.html

## Suivi marketing (mis en place le 11.10.2026 — voir AUDIT_MARKETING_2026-10-11.md)
- **Migration 038** : `users.is_internal` (admin/test/système exclus des indicateurs), `users.first_source/first_medium/first_campaign/first_referrer_host/first_landing_path` (attribution "premier contact"), tables `funnel_events`, `payments` (registre Stripe, `stripe_event_id` UNIQUE), `subscription_events`.
- **`analytics.js`** (inclus sur toutes les pages publiques, `<script src="/analytics.js">`) : bandeau de consentement ; Google Analytics `G-VE7PJZTF8L` chargé **uniquement après "Accepter"** (ne plus jamais remettre de snippet gtag inline) ; capture d'attribution (désactivée après "Refuser") ; `swisscvTrack(event, plan)` → `POST /track`. Les pages appellent `gtag('event', …)` sans souci : no-op tant qu'il n'y a pas de consentement.
- **`POST /track`** (public, liste blanche `pricing_viewed` / `premium_cta_clicked` / `signup_page_viewed`, dédoublonné par jour). Les événements serveur (`signup`, `first_analysis`, `job_search_used`, `checkout_started`) sont écrits par `recordFunnelEvent()` ; **jamais d'événement d'achat venant du navigateur**.
- **Registre des paiements** : `recordStripeLedger(event, env)` appelé au début de `handleStripeWebhook` (n'altère pas la logique Premium/Pack). Alimente `payments` (`invoice.paid`, `checkout.session.completed` crédits/Pack, `charge.refunded` — à activer côté Stripe si absent), `subscription_events` (created/canceled/cancel_scheduled) et `users.subscription_status`.
- **Indicateurs** : `GET /admin/marketing/funnel` + page `admin-marketing.html`. `/admin/metrics` (conversion, MRR) exclut les comptes internes/bannis et ne compte comme payant qu'un abonnement Stripe réellement lié. MRR = tarif public (9/29 CHF) tant que le registre est jeune.
- Pour tracer Facebook/campagnes : ajouter `?utm_source=facebook&utm_medium=social&utm_campaign=<nom>` aux liens (les apps mobiles suppriment souvent le referrer → sinon classé "direct").
- Restent à valider par le fondateur (touchent la facturation) : prix des crédits fourni par le client dans `handleCreateCreditCheckout`, URL de retour `pages.dev` des achats de crédits, rechargement de crédits sur `customer.subscription.updated`.

## Sécurité facturation et admin (corrigé le 11.10.2026 — voir RAPPORT_SECURISATION_2026-10-11.md)
✅ **Déployés en production le 11.10.2026** (migrations 039+040, Worker version 81c6212f-bc8b-46d4-b331-9b98eb66165a, pages via dist/). Version précédente du Worker pour retour arrière : cc8dc959-816a-4003-aaf6-39a11aa0bbb5. Reste à faire : renouveler les clés RapidAPI/Adzuna (elles ont été publiques), purger le cache Cloudflare, corriger la course sur la déduction des crédits (voir RAPPORT_PREPROD_2026-10-11.md).
- **Prix des crédits à l'unité = `CREDIT_PACKS` dans `index.js`** (5→200, 15→500, 30→800 centimes CHF) ; le navigateur n'envoie qu'un palier, tout montant reçu est comparé. Pack = `JOB_PACK_CONFIG`. Ne jamais lire un prix ou une quantité dans une requête client ni dans les métadonnées Stripe sans les revalider.
- **Attribution des crédits** : `processCreditCheckout()` — valide (payé, mode, devise, montant = tarif, client Stripe), puis `DB.batch` atomique avec `processed_checkout_sessions` (clé = session) : une session ne crédite qu'une fois. `invoice.paid` : seulement `subscription_create`/`subscription_cycle`, dédoublonné par `processed_stripe_events`. Aucun achat n'élève `credits_monthly_limit`. Les recharges **remontent** un solde sans jamais le réduire (`resetFreeTierCredits` inclus).
- **Retours de paiement** : une URL de succès n'est jamais une preuve. `GET /stripe/checkout-status?session_id=` lit le registre alimenté par le webhook signé ; `success.html` interroge `/auth/me`. Ne plus poser de drapeau Premium côté navigateur.
- **Premium** : Payment Links + `client_reference_id` (id du compte) ; plan voulu transporté par `?plan=` → `checkout-intent.js` → `credits.html?checkout=` (paramètre retiré avant redirection).
- **Admin** : toutes les routes `/admin/*` (sauf `/admin/login`) passent par `requireAdmin()` : jeton signé émis par `/admin/login` (claim `adm`, 12 h) + rôle revérifié en base. Plus d'identifiants codés en dur. `admin/js/session-guard.js` renvoie vers la connexion si le jeton est refusé.
- **Logs** : jamais d'email complet ni de secret (`maskEmail()`).
- **Tests** : `node --test tests/billing/*.test.mjs` (84 tests, vrai Worker + D1 locale, Stripe simulé). Ne pas lancer sur le dossier entier (fichiers `._*` du disque externe).
- **Crédits à l'usage (lot 2, déployé le 11.10.2026 — Worker 4884cbaf-42e8-4add-9370-85cbd89e0a70, migration 041 ; version précédente pour retour arrière : 81c6212f-bc8b-46d4-b331-9b98eb66165a ; voir RAPPORT_LOT2)** : tout débit passe par `reserveCredits()` (UPDATE conditionnel atomique, retire le crédit AVANT l'appel IA) et `releaseHeldCredits()` dans un bloc `finally` (rend les crédits si l'opération échoue ; candidatures en masse : seules les réussites sont facturées). Ne jamais réécrire `credits_balance = <valeur lue avant>` : c'est la faille de dépense en parallèle.
- **Limites de débit** : `RATE_RULES` + `checkRateLimit()` (table `rate_limits`, migration 041, compteur atomique par route et IP, 429 + `retry_after`, fail-open si la base est indisponible). Les webhooks Stripe et les GET ne sont pas limités.
- **Double abonnement** : si un second abonnement actif arrive pour un compte déjà abonné, alerte email administrateur (aucune résiliation automatique).
- **En-têtes** (`_headers`) : nosniff, X-Frame-Options SAMEORIGIN, Referrer-Policy, Permissions-Policy, HSTS. Pas de CSP (trop de scripts en ligne pour l'activer sans casser le site).
- **Version en production (11.10.2026, 21:03 UTC)** : Worker `047053e0-2325-430c-9b5b-e0ff523d7604` (index.js SHA-256 `6dcaa0b5…e29c`). RapidAPI n'est plus appelé sans secret `RAPIDAPI_KEY` (secret supprimé, application RapidAPI supprimée) ; recherche d'offres via Adzuna. Version précédente : `6069d8ba-421e-4375-b13d-f3a43ad43611`.
- **Back-office (coquille partagée, publiée le 11.10.2026 — déploiement Pages `feddadba`, précédent `4a141759`)** : le menu des pages admin est décrit UNE SEULE FOIS dans `admin/js/admin-shell.js` (tableau `NAV` : groupes, libellés, icônes SVG) + `admin/css/admin-shell.css`. Les pages n'embarquent plus de `<nav>` : elles chargent juste ces deux fichiers dans le `<head>`. Pour ajouter une page au menu : ajouter une ligne dans `NAV`. Thème clair par défaut (`admin_theme`), menu réductible (`admin_sidebar`), tiroir sur mobile. `mobile-menu.*` et `dark-mode.js` supprimés (remplacés par la coquille).
- **Campagnes email marketing (✅ déployé le 12.10.2026 : migration 042, Worker `1b08fc39-d7f2-46b7-a0ef-7b100da835b6` (précédent `047053e0-2325-430c-9b5b-e0ff523d7604`), Pages `dda66d09` (précédent `4cb87f04`) ; voir RAPPORT_CAMPAGNES_2026-10-12.md ; aucune campagne envoyée à ce jour)** : page `admin-campaigns.html` ; moteur dans `index.js` (`MKT_THEMES`, `renderMarketingEmail`, `processMarketingCampaign`, `handleMarketingRoutes`) ; tables `marketing_campaigns` / `marketing_sends` (clé primaire campagne+utilisateur = jamais deux fois le même email), `users.marketing_opt_out` (migration 042). Envoi via l'API batch Resend, plafond journalier appliqué DANS la requête de réservation, reprise par le cron ; désinscription par jeton HMAC (`/marketing/unsubscribe`, page `unsubscribe.html`). Toute nouvelle campagne = test à soi-même d'abord, puis petit groupe. Les emails transactionnels (confirmation, paiement) ne sont jamais concernés par la désinscription marketing.
- Contentsquare et Google Analytics sont chargés uniquement par `analytics.js` après consentement : ne pas remettre de balise `<script>` de suivi directement dans les pages.

## Identité visuelle et page d'accueil (17.10.2026)
- **Logo** : croix blanche dans un carré rouge `#D50000` → `brand/logo-mark.svg`. Ajouté devant « SwissCV Pro » sur toutes les pages par `brand/brand.css` (règles `a.logo::before`, `a.navbar-brand::before`, `.footer-about > h3`, `.logo-icon`). Chaque page charge un bloc « Identité visuelle » dans le `<head>` (favicon, icônes, manifeste, brand.css, balises og:image). Modifier le logo = modifier ce dossier, pas les pages.
- **Icônes** : `favicon.ico`, `brand/icon.svg`, `brand/apple-touch-icon.png`, `site.webmanifest` (whitelist de `scripts/build-public.sh`, qui copie aussi `brand/`).
- **Aperçu des liens (Facebook…)** : `brand/og-image.png` 1200×630. L'avertissement `fb:app_id` du débogueur Facebook est sans effet.
- **Accueil** : texte et couleurs du haut de page viennent du **CMS** (`page_sections`, section `hero`), pas du HTML (le HTML n'est qu'un repli). Haut de page = téléphone avec la boucle `brand/video/hero-phone.mp4` ; « Comment ça marche » = `brand/video/comment-ca-marche.mp4` synchronisée avec les 3 étapes (chapitres 0 / 7 / 13 s dans le script en bas d'`index.html`).
- **Le score « 100 »** des visuels est le score de **complétude** du générateur de CV, pas le score d'analyse IA : l'étiqueter « Score CV » / « CV complet », jamais « Score ATS ».
- **Sources des vidéos et visuels** : `marketing/remotion/` (Remotion ; voir son LISEZ-MOI). Kit Facebook prêt à publier : `marketing/facebook/programme/`.

## Équipes du plan Pro — lot 1 (✅ déployé le 17.10.2026 : migration 043, Worker `2b94cd3d-0934-461c-aa10-5ffbe9548071` ; version précédente pour retour arrière : `1b08fc39-d7f2-46b7-a0ef-7b100da835b6` ; Pages `23006ea6`)
- Cible : cabinets d'outplacement / coachs (« plan Pro A »). Une équipe = un propriétaire **Pro** + admins/membres, **5 places** (`teams.max_members`, propriétaire et invitations en attente compris).
- Tables `teams`, `team_members`, `team_invitations` (existaient en prod sans migration, documentées dans 043) + `team_credit_usage` (consommation du pot commun par membre).
- **Crédits partagés** : `reserveCredits()` débite d'abord le compte du propriétaire si l'utilisateur est membre d'une équipe active (`getTeamMembership`, propriétaire `subscription_tier = 'pro'`), sinon ses propres crédits. Elle renvoie `payerId` + `usageId` ; les appelants remboursent via `releaseHeldCredits(env, creditsHeldUserId, creditsHeld, creditsHeldUsageId)`. Tout nouvel outil payant doit suivre ce schéma. Les pré-contrôles de solde utilisent `hasTeamCredits()`.
- Propriétaire plus Pro → équipe « suspendue » (plus de partage ni d'invitation), automatiquement.
- Invitations : email Resend `createTeamInvitationHTML` (lien `team.html?invite=<jeton>`, 7 jours, adresse invitée obligatoire). Lien ouvert sans être connecté → jeton gardé dans `localStorage.swisscv_pending_invite`, `checkout-intent.js` (`nextPage`) y renvoie après connexion/inscription.
- Routes : `GET /teams/my-team` (équipe, membres, consommation du mois, crédits, invitations), `POST /teams/create`, `POST /teams/invite`, `GET /teams/invitations`, `POST /teams/invitations/:jeton/accept`, `DELETE /teams/invitations/:id`, `PUT|DELETE /teams/:id`, `DELETE /teams/members/:id`, `PUT /teams/members/:id/role`, `POST /teams/leave`.
- Tests : `tests/billing/teams.test.mjs` ; démo locale dans un navigateur : `node tests/billing/team-devserver.mjs` (après `./scripts/build-public.sh`).
- Lot 2 prévu (non fait) : dossiers candidats (exige consentement des candidats + mise à jour CGU/confidentialité, LPD). « API access » affiché « Bientôt » sur la page Tarifs.

## Migrations appliquées
001 → 043 appliquées en remote D1
Dernière : `032_job_pack.sql` — colonnes `has_job_pack`/`job_pack_purchased_at`/`job_pack_reminder_sent` sur `users` + table `job_pack_events`

## Parcours inscription → première utilisation (revu août 2026)
Avant : inscription → email confirmation Supabase → clic → **retour forcé sur `login.html`** (re-saisie mot de passe) → `onboarding.html` (formulaire lourd, 4 étapes, ~10-15 champs obligatoires) → dashboard. Beaucoup d'inscrits ne terminaient jamais ce parcours (67% des comptes n'avaient jamais utilisé un seul crédit gratuit).

Maintenant :
1. Inscription → email confirmation (template Supabase custom, en français, dans `confirm.html`'s style — voir Supabase Dashboard → Authentication → Email Templates → Confirm signup)
2. Clic sur le lien → `confirm.html` appelle `POST /auth/verify-email`, qui vérifie le token Supabase **et retourne un JWT SwissCV Pro** → connexion automatique, pas de re-saisie de mot de passe
3. Redirection directe vers `app.html` (analyse CV) — ou `dashboard.html` si le profil est déjà complété
4. `onboarding.html` n'est plus imposé en premier ; il reste accessible mais optionnel/à proposer plus tard (pas encore de rappel actif construit dans le dashboard)
5. `login.html` a la même logique de redirection (profil incomplet → `app.html`, pas `onboarding.html`)

⚠️ Le formulaire d'onboarding lui-même n'est PAS un verrou technique : ni `app.html` ni `dashboard.html` ne vérifient `profile_completed`. Le matching d'offres (`handleGetJobSuggestions`) fonctionne déjà sans onboarding complet, via fallback sur les mots-clés extraits de la dernière analyse CV.

## Alertes emploi automatiques (branché août 2026)
`checkNewJobsForAlerts(env)` existait déjà en code mais n'était jamais appelée — elle tourne maintenant chaque jour à 8h avec `runDailyEmailAutomation` (handler `scheduled`).
- Après chaque analyse CV réussie, si ≥2 mots-clés sont extraits, une `saved_search` nommée `'Alertes basées sur mon CV'` est créée/mise à jour automatiquement avec `email_alerts = 1` (voir `handleAnalyzeCVText`)
- L'utilisateur voit une notice de transparence sur `app.html` juste après ses résultats ("📬 Vous recevrez par email...") avec lien vers `job-search.html` pour gérer/désactiver
- Recherches manuelles (case à cocher dans `job-search.html`) toujours possibles en plus, gratuit et illimité, aucune restriction de plan

## Pack Recherche d'Emploi (ajouté août 2026)
Offre à paiement unique (CHF 19.90, `JOB_PACK_CONFIG` dans `index.js`), complémentaire à Gratuit/Premium — voir [PACK_RECHERCHE_EMPLOI.md](PACK_RECHERCHE_EMPLOI.md) et [PACK_IMPLEMENTATION_PLAN.md](PACK_IMPLEMENTATION_PLAN.md). Page de vente : `pack-recherche-emploi.html`. Réutilise le pool `credits_balance` existant (pas de système de quota séparé) — 55 crédits sans expiration. Prix fixé par estimation manuelle, à confirmer une fois `ai_usage` accumule des données réelles.

✅ Renouvellement des crédits gratuits : corrigé et en production. `resetFreeTierCredits()` (cron quotidien 8h) remonte le solde des comptes free à `FREE_TIER_MONTHLY_CREDITS` (5) tous les 30 jours glissants, sans jamais réduire un solde supérieur. Vérifié en base le 13.10.2026 (dernier renouvellement le 11.10, aucun compte free en retard). La mention « 5 crédits/mois » de `pricing.html`/`credits.html` est donc exacte.

Visibilité du Pack ajoutée le 31.08.2026 (le Pack n'était accessible que via lien direct sinon) : bannière sur `pricing.html` (section dédiée avant les recharges de crédits à l'unité), mention dans l'email `credits_depleted`. Pas encore intégré dans un déclencheur comportemental (ex. quand les crédits deviennent bas dans `app.html`).

## Notification admin sur nouvel achat (ajouté 31.08.2026)
`contact@swisscv-pro.ch` reçoit maintenant un email automatique (`notifyAdminOfPurchase()`, `index.js`) à chaque : achat de crédits à la carte, achat du Pack Recherche d'Emploi, nouvel abonnement Premium/Pro. Simple tableau HTML (utilisateur, montant, crédits) — pas de design soigné, c'est une notification interne. N'échoue jamais silencieusement le flux d'achat côté client si l'envoi rate (try/catch dédié).

## Email de confirmation abonnement (ajouté 31.08.2026)
`handleSubscriptionChange` n'envoyait jamais d'email de confirmation quand un utilisateur passait Premium/Pro (trou trouvé en auditant pourquoi une nouvelle abonnée n'avait reçu que l'email de bienvenue). Corrigé : email envoyé uniquement sur `customer.subscription.created` (pas `updated`, pour éviter un envoi à chaque changement mineur), via `createPremiumConfirmationHTML`. Pas de garde anti-doublon en cas de redélivrance webhook Stripe — même niveau de robustesse que les autres emails transactionnels existants du projet.

## Nouvelles fonctionnalités (ajoutées mars 2026)
- **Candidature en 1 clic** (`apply.html`) — depuis une offre → CV optimisé + lettre + score match + PDF (3 crédits)
- **Candidatures en masse** (`bulk-apply.html`) — multi-sélection offres → génération parallèle via `Promise.all` (2 crédits/offre)
- **Sélection multiple** sur `job-search.html` — checkboxes par carte + floating action bar → redirect vers `bulk-apply.html`
- **Sauvegarde CV** dans `localStorage.swisscv_last_cv` (app.html) pour pré-remplissage automatique sur apply.html et bulk-apply.html

## Règles index.js
- Pas de backticks dans les nouvelles fonctions ajoutées → utiliser `'...' + var + '...'`
- Les templates email existants utilisent déjà des template literals (OK, ne pas modifier leur syntaxe)
- Ne jamais utiliser `email_notifications` dans les queries SQL (colonne inexistante)

## Problèmes connus / résolus
- SSH GitHub nécessite passphrase → push manuel par l'utilisateur
- `wrangler pages deploy` nécessite session interactive (pas background)
- DNS DKIM était bloqué par NS `_domainkey` → Infomaniak déléguait vers leurs serveurs malgré Cloudflare actif → suppression des NS `_domainkey` dans Cloudflare a résolu
- **Pas de vraie page 404** : n'importe quelle URL inexistante sur `swisscv-pro.ch` renvoyait la homepage en statut 200 (comportement par défaut de Cloudflare Pages sans `404.html`) → confirmé via Search Console (rapport Indexation → "Page en double sans URL canonique sélectionnée", 17 pages, toutes des URLs cassées/périmées servant la homepage). Corrigé le 31.08.2026 : `404.html` créé (vrai statut 404, `noindex`), `<link rel="canonical">` ajouté sur `index.html` (absent jusque-là). Vérifié : `/landing`, `/credits/history`, `/teams/invite`, etc. renvoient bien 404 maintenant.
- **Doublon www vs non-www** : `www.swisscv-pro.ch` servait le même contenu que `swisscv-pro.ch` sans redirection (2 des 17 doublons Search Console). Corrigé le 31.08.2026 via une Redirect Rule Cloudflare (zone-level, `Rules → Redirect Rules`, modèle "Rediriger de WWW vers la racine", 301) — pas faisable depuis le code, fait manuellement dans le dashboard. Vérifié : `www.swisscv-pro.ch/*` → `301` → `swisscv-pro.ch/*`, chemin conservé.
- Modèle cover letter : `claude-3-5-haiku-20241022` n'existe pas → utiliser `claude-haiku-4-5-20251001`
- Token auth frontend : utiliser `swisscv_token` (pas `sb-access-token` ni `token`)
- ~~Bug `email_notifications` dans `runDailyEmailAutomation`~~ — résolu, cette colonne n'est plus référencée dans le code

## ⚠️ Piège Cloudflare Workers : promesses non attendues
Plusieurs bugs cette session venaient du même piège : un appel `sendEmail(...).catch(...)` **sans `await` ni `ctx.waitUntil()`** peut être tué par le runtime dès que la `Response` est renvoyée au client — l'email n'est jamais réellement envoyé, sans erreur visible. Toujours soit `await` l'envoi (si la fonction n'a pas accès à `ctx`), soit l'envelopper dans `ctx.waitUntil(...)` (si on est dans le handler `fetch(request, env, ctx)` et qu'on ne veut pas bloquer la réponse).

## Session août 2026 — corrections apportées
Le worker n'avait pas été redéployé depuis le **15 avril 2026** (~4 mois) malgré des commits git sur le frontend — `index.js` étant gitignoré, aucun correctif backend n'était passé en prod pendant tout ce temps, y compris le cron email (jamais réenregistré). Corrigé et redéployé. Résumé des correctifs de fond :
- **Résiliation abonnement** (client + admin) : routes `/subscription/cancel` et `/admin/users/:id/cancel-subscription` n'existaient pas → créées, avec annulation Stripe réelle + email de confirmation Resend
- **Logs admin** (`admin-logs.html`) : route `/admin/logs` n'existait pas (code orphelin dans `admin/js/audit-trail.js`, jamais intégré) → intégrée, `logAdminAction()` appelée sur : login admin, résiliation, modif tier/rôle, ban, CMS, témoignages, tickets support, déclenchement manuel automation email
- **Suppression historique CV** (`dashboard.html`) : routes `DELETE /cv-analyses/:id` et `DELETE /analyses/history` n'existaient pas → créées
- **Boutons "Modifier"/"Bannir"** (`admin-users.html`) : routes `PATCH /admin/users/:id`, `PATCH /admin/users/:id/role`, `DELETE /admin/users/:id` n'existaient pas → créées (le ban est un soft-ban réversible via `deleted_at`, qui bloque désormais la connexion dans `handleLogin`)
- **Ouverture de ticket** (`admin-support.html`) : `viewTicket()` était un `// TODO` jamais terminé → vraie modale avec détails + changement statut/priorité
- **Formulaire de contact** (`contact.html`) : simulait juste un succès sans rien envoyer (`// Simulate form submission`) → branché sur `POST /contact`, avec FK vers un utilisateur système `contact-form`
- **Bug `sendEmail()`** : variable `html` au lieu de `htmlContent` dans l'INSERT `email_logs` → cassait le tracking de tous les emails silencieusement
- **Emails non fiables** (bienvenue, crédits épuisés, contact) : promesses `sendEmail()` non attendues → corrigé avec `await`/`ctx.waitUntil()` (voir piège ci-dessus)
- **Webhook Stripe sans vérification de signature** : `// TODO: Verify signature` jamais implémenté malgré `STRIPE_WEBHOOK_SECRET` déjà présent comme secret Cloudflare (jamais lu par `getConfig()`) → corrigé le 21.08.2026 (`verifyStripeSignature()`, HMAC-SHA256 via Web Crypto API, tolérance 5 min)
- **Parcours inscription** et **alertes emploi automatiques** : voir sections dédiées ci-dessus
