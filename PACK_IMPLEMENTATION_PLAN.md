# Pack Recherche d'Emploi — Audit & Plan d'implémentation

Document de travail (Phase 1 + Phase 2 du plan initial). Rien n'a été codé à ce stade — ce fichier sert de base de décision avant toute modification de `index.js` ou de la base D1.

## 1. Résumé exécutif

Le système de paiement ponctuel (Stripe `mode: payment`) **existe déjà en production** sous forme de recharge de crédits générique sur `credits.html`. Ce n'est donc pas un chantier "from scratch" : l'essentiel du travail est produit/positionnement (page de vente, bundle cohérent, narrative "recherche d'emploi") plutôt qu'infrastructure de paiement.

Deux découvertes changent le scope recommandé par rapport au prompt initial :
- **La recharge de crédits actuelle n'a jamais été achetée** (0 transaction `credit_purchase` en base, sur 5 utilisateurs seulement ayant un `stripe_customer_id`). Ça confirme l'hypothèse du prompt : "des crédits" tout seul ne convertit pas. Ça valide l'intérêt de re-packager en offre narrative.
- **Le webhook Stripe ne vérifie pas sa signature** (`// TODO: Verify signature with STRIPE_WEBHOOK_SECRET` à la ligne 2772 de `index.js`). C'est une faille de sécurité déjà présente, mais elle devient plus grave dès qu'on ajoute un nouveau flux qui crédite de la valeur (le Pack) : n'importe qui connaissant l'URL du webhook peut aujourd'hui forger un `checkout.session.completed` et se créditer gratuitement. **À corriger avant ou en même temps que le Pack**, pas après.

## 2. Audit du système existant

### 2.1 Crédits
- Table `users` porte `credits_balance`, `credits_monthly_limit`, `credits_last_reset_at`, `stripe_customer_id`, `stripe_subscription_id`.
- Coûts réels appliqués (objet `CREDIT_COSTS`, `index.js:2490`, + coûts inline pour les fonctionnalités récentes) :

| Action | Coût réel | Vérifié par |
|---|---|---|
| `cv_analysis` | 1 crédit | `CREDIT_COSTS` + 130 transactions en base, toutes à 1 |
| `cover_letter` | 2 crédits | `CREDIT_COSTS` + 25 transactions à 2 |
| `interview_prep` | 1 crédit | `CREDIT_COSTS` + 4 transactions à 1 |
| `job_search`, `cv_template`, `job_tracker` | 0 (gratuit) | `CREDIT_COSTS` |
| `generate_application` (candidature 1 clic) | 3 crédits | `index.js:6548`, confirmé par 2 transactions en base |
| `bulk_applications` (candidatures en masse) | 2 crédits/offre | `index.js:6673`, confirmé par 1 transaction |

⚠️ **La table `credit_costs` (migration 002) n'existe pas en base D1 remote** (`sqlite_master` la confirme absente). La migration n'a jamais été appliquée, ou la table a été supprimée depuis. Elle n'est de toute façon interrogée nulle part dans `index.js` — la vraie source de vérité est l'objet JS `CREDIT_COSTS`. À noter pour éviter de perdre du temps à modifier cette table plus tard en pensant qu'elle sert à quelque chose.

⚠️ **Le reset mensuel des crédits gratuits n'existe pas en pratique.** `credits_last_reset_at` n'est mis à jour que dans `handleInvoicePaid` (abonnement payant). Un utilisateur free reçoit 5 crédits à l'inscription et ne les revoit jamais réapprovisionnés — la mention "5 crédits/mois" sur `pricing.html`/`credits.html` ne correspond pas au comportement réel. C'est un problème préexistant, indépendant du Pack, mais qui va devenir plus visible si on construit une comparaison Gratuit/Pack/Premium qui doit être honnête. Je le signale, à traiter séparément si tu veux (pas bloquant pour le Pack).

### 2.2 État réel des données (D1, interrogé aujourd'hui)
- 187 utilisateurs `free`, 2 `premium`, 0 `pro` (contredit le chiffre "1 abonnement actif" du prompt initial — il y a en réalité 2 comptes taggés `premium` en base, à vérifier lesquels sont vraiment facturés vs legacy).
- 830 crédits cumulés en circulation côté free, 167 côté premium.
- Historique d'usage réel (`credit_transactions`) : 130 analyses CV, 25 lettres, 4 préparations entretien, 2 candidatures 1-clic, 1 candidature en masse. C'est un volume d'usage très faible — cohérent avec le fait qu'il n'y ait eu que 3 clients payants historiques.
- 5 utilisateurs seulement ont un `stripe_customer_id` — même le funnel de paiement existant est très peu emprunté.
- 0 achat de crédits à la carte, jamais, malgré la fonctionnalité en prod.

### 2.3 Stripe — paiement ponctuel (déjà en prod)
`handleCreateCreditCheckout` (`index.js:3057`) crée déjà une session Stripe `mode: 'payment'` avec `price_data` dynamique (prix libre, pas besoin de Price ID préconfiguré dans le dashboard Stripe). `handleCheckoutCompleted` (`index.js:2930`) traite déjà `metadata.type === 'credit_purchase'` et ajoute les crédits au compte, avec une entrée dans `credit_transactions`.

**Conséquence directe pour le Pack** : je n'ai pas besoin de construire un nouveau mécanisme de paiement. Je peux ajouter un nouveau `metadata.type === 'job_pack_purchase'` traité par la même fonction `handleCheckoutCompleted`, avec sa propre logique d'attribution (crédits + éventuel flag `has_job_pack` sur `users`). C'est une extension, pas une nouvelle brique.

Le flux abonnement (Premium/Pro) passe lui par des **Stripe Payment Links** statiques (`buy.stripe.com/...`), différent du flux crédits. Le Pack doit suivre le modèle "crédits" (session dynamique), pas le modèle "Payment Link" — sinon on ne peut pas mettre le `user_id` en metadata proprement.

### 2.4 Webhook Stripe — signature non vérifiée
Confirmé : `handleStripeWebhook` (`index.js:2767`) parse le body JSON sans jamais appeler l'API de vérification de signature Stripe, alors que `STRIPE_WEBHOOK_SECRET` existe déjà comme secret Cloudflare. C'est un TODO resté en l'état. **Je recommande de le corriger avant de lancer le Pack**, sans quoi on ouvre une nouvelle surface d'attaque financière (n'importe qui pourrait POST un faux événement `checkout.session.completed` avec `metadata.type = job_pack_purchase` et obtenir le pack gratuitement).

### 2.5 Coût IA (section 22 du prompt initial)
La table `ai_usage` (migration 006) existe en base mais **n'a jamais été alimentée** (0 ligne). Il n'y a donc aucune donnée réelle de coût par requête à ce jour — impossible de calculer une marge précise comme demandé dans le prompt initial sans, soit instrumenter cette table maintenant, soit faire une estimation manuelle à partir des tailles de prompts/modèles utilisés.

Modèles actuellement utilisés selon la fonctionnalité :
- `claude-haiku-4-5-20251001` (lettres de motivation, coût faible)
- `claude-sonnet-4-5` / `claude-sonnet-4-6` (analyse CV, candidature 1-clic, candidatures en masse — coût plus élevé, `max_tokens` entre 3000 et 4000)

Sans données réelles, je ne veux pas donner un chiffre de marge précis présenté comme un fait — ce serait le même genre d'erreur que le `churnRate` fabriqué qu'on a corrigé cette session. **Recommandation concrète : brancher `ai_usage` (INSERT du coût réel après chaque appel IA) avant de figer un prix définitif.** Ce n'est pas un gros chantier — la table existe déjà, il manque juste les `INSERT`.

### 2.6 Emails (Resend)
Infrastructure déjà en place et fiable (corrigée cette session : `sendEmail()`, `ctx.waitUntil()`, tracking `email_logs`). Ajouter 2-3 emails pour le Pack est un ajout mineur sur une base saine, pas un nouveau chantier.

## 3. Ce que je recommande de construire (scope réduit vs. le prompt initial)

Le prompt de départ demande une infrastructure complète (A/B testing, dashboard KPI, onboarding personnalisé par métier/secteur, 12 événements de tracking, upsell comportemental). Avec **3 clients payants historiques et 0 achat de crédits jamais réalisé**, cette infrastructure n'a rien à mesurer — elle coûterait plus cher à construire qu'elle ne rapporterait d'information exploitable avant plusieurs mois. Je propose une V1 volontairement plus petite, qui reste une vraie extension du système (rien de cassé, rien de fake) :

**Inclus en V1 :**
1. Corriger la vérification de signature webhook Stripe (prérequis sécurité, pas optionnel)
2. Brancher `ai_usage` avec le coût réel par appel IA (pour un prix basé sur des faits, pas une hypothèse)
3. Un seul prix (CHF 19.– ou 19.90, à trancher après le point 2)
4. Une allocation de crédits fixe, sans expiration (Option A du prompt — cohérent avec le fait qu'il n'existe déjà aucun mécanisme d'expiration ailleurs dans le système ; ajouter une date d'expiration demanderait une nouvelle colonne + une logique de purge qu'on n'a nulle part ailleurs)
5. Extension de `handleCheckoutCompleted` pour traiter `metadata.type === 'job_pack_purchase'`
6. 1 page de vente `/pack-recherche-emploi` (structure sections 1-8 du prompt, sans le volet A/B)
7. Tableau comparatif Gratuit / Pack / Premium
8. FAQ réelle (pas les 11 questions du prompt — seulement celles dont la réponse est vraie et vérifiable dans le système actuel)
9. 2-3 emails post-achat via Resend (activé, jour 1 relance, découverte Premium) — pas 6
10. Tracking minimal mais réel : quelques colonnes/événements dans une table dédiée (`job_pack_events` ou réutilisation d'`email_logs`-style), pas 12 événements analytics avec dashboard dédié

**Reporté (pas construit maintenant, sans que ce soit un refus) :**
- Tests A/B de prix/positionnement — nécessite du volume pour être interprétable
- Onboarding personnalisé métier/secteur/région — vrai chantier UX séparé
- Dashboard KPI dédié — à faire une fois qu'il y a des ventes à mesurer
- Upsell/downsell comportemental fin — peut s'ajouter une fois le Pack en prod et observé
- Les 8 pages SEO du pack — le pack devient une destination de conversion pour les 6 pages SEO déjà publiées (`cv-suisse`, `modele-cv-suisse`, `cv-ats`, `analyse-cv`, `adapter-cv-offre-emploi`, `lettre-motivation-suisse`) avant de créer du contenu SEO supplémentaire

## 4. Modèle de données proposé

Pas de nouvelle table de crédits séparée — extension de l'existant :

```sql
-- Migration 032 (proposée)
ALTER TABLE users ADD COLUMN has_job_pack INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN job_pack_purchased_at INTEGER;

CREATE TABLE IF NOT EXISTS job_pack_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'viewed','cta_clicked','checkout_started','purchased','activated','limit_reached'
  metadata TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Les crédits eux-mêmes utilisent le pool `credits_balance` existant — pas de système parallèle. `has_job_pack` sert uniquement à afficher "Pack actif" dans le dashboard et à personnaliser les emails/CTA, pas à gérer un quota séparé.

## 5. Flux paiement proposé

1. `POST /stripe/create-job-pack-checkout` (nouvelle route, copie de `handleCreateCreditCheckout` avec `metadata.type = 'job_pack_purchase'`, prix et crédits fixés côté serveur — pas transmis par le client, pour éviter qu'un utilisateur modifie le prix depuis le front)
2. Stripe Checkout Session `mode: payment`
3. Webhook `checkout.session.completed` → `handleCheckoutCompleted` étendu : si `metadata.type === 'job_pack_purchase'`, ajoute les crédits + met `has_job_pack = 1` + `job_pack_purchased_at` + insère un event `purchased` puis `activated`
4. Redirection vers une page de confirmation avec le parcours guidé (section 13 du prompt, gardée telle quelle — c'est une bonne idée peu coûteuse à construire)

## 6. Prix — à confirmer après le point 2.5

Je ne veux pas figer CHF 19.– maintenant alors qu'on n'a pas encore de coût IA réel mesuré. Deux options :

- **Rapide** : estimation manuelle raisonnable à partir des `max_tokens` et modèles utilisés, avec une marge de sécurité large, prix de lancement à CHF 19.90
- **Rigoureuse** : je branche `ai_usage` d'abord (petit chantier, ~30-45 min), on laisse tourner une semaine avec le trafic actuel, puis on calcule un coût réel avant de figer le prix

Vu le volume actuel (quelques dizaines d'analyses/mois), l'option rigoureuse ne retarde pas beaucoup les choses et évite de fixer un prix sur une hypothèse — cohérent avec la règle 21 du prompt initial ("ne pas choisir le prix uniquement parce qu'il est psychologiquement attractif").

## 7. Ce qui ne doit pas casser

Vérifié compatible sans risque : `handleCreateCheckout` (abonnements), `handleSubscriptionChange`, `handleInvoicePaid`, `handleSubscriptionCanceled` ne sont pas touchés. `handleCheckoutCompleted` est étendu par un nouveau `if`, pas modifié dans sa branche `credit_purchase` existante. Aucune table existante n'est modifiée en profondeur, seulement 2 colonnes ajoutées sur `users`.

## 8. Décisions prises (21.08.2026)

1. ✅ **Vérification de signature webhook Stripe corrigée et déployée.** `verifyStripeSignature()` (HMAC-SHA256 via Web Crypto API, tolérance 5 min) ajoutée dans `handleStripeWebhook`. `STRIPE_WEBHOOK_SECRET` était déjà présent comme secret Cloudflare mais jamais lu par `getConfig()` — corrigé. Déployé (`Version ID: 5c309a65-5ede-4d94-a3be-11b1fe923acd`). ⚠️ À surveiller : vérifier dans le dashboard Stripe (Developers → Webhooks → Events) que les prochains événements réels repassent bien en 200, pas en 400 — je n'ai pas pu tester avec le vrai secret depuis cet environnement.
2. ✅ **Tracking `ai_usage` branché et déployé.** `logAiUsage()` ajouté après chacun des 5 appels réels à l'API Anthropic (`cv_analysis`, `cover_letter`, `cv_compare`, `generate_application`, `bulk_applications`). Chaque ligne enregistre les tokens réels (`usage.input_tokens`/`output_tokens` renvoyés par Anthropic) et un coût estimé en USD via une table de tarifs par modèle (`AI_PRICING`, à ajuster si les tarifs changent). On laisse tourner quelques jours avant de calculer un coût réel par action.
3. ⏳ Allocation de crédits proposée validée comme point de départ : **20 analyses CV + 10 lettres + 5 candidatures 1-clic = 55 crédits**, à confronter au coût réel mesuré au point 2 avant de figer le prix.

## 9. Prochaine étape

Revenir dans quelques jours (le temps d'accumuler des données `ai_usage` sur un usage réel) pour :
- Calculer le coût réel moyen par type d'action à partir des lignes `ai_usage`
- En déduire un coût plancher pour le pack de 55 crédits proposé
- Figer le prix (CHF 19.– / 19.90 / autre) avec une marge connue plutôt qu'une hypothèse
- Puis lancer la construction du reste (migration `job_pack_events`, route de checkout, page de vente `/pack-recherche-emploi`, emails)

Requête à relancer pour vérifier l'accumulation de données :
```bash
npx wrangler d1 execute swisscv-db --remote --command "SELECT feature, COUNT(*) n, AVG(cost_estimate) avg_cost_usd, SUM(cost_estimate) total_cost_usd FROM ai_usage GROUP BY feature;"
```

## 10. V1 construite et déployée (21.08.2026)

Décision finale : construire maintenant avec un prix estimé plutôt qu'attendre les données `ai_usage`. Estimation manuelle des coûts avant lancement (input/output pricing par modèle, `AI_PRICING` dans `index.js`) :

| Fonctionnalité | Modèle | Coût estimé/usage |
|---|---|---|
| Analyse CV | claude-sonnet-4-6 | ~$0.02 |
| Lettre de motivation | claude-haiku-4-5 | ~$0.003 |
| Candidature 1-clic | claude-sonnet-4-5 | ~$0.045 |

Coût IA estimé pour 55 crédits (20 analyses + 10 lettres + 5 candidatures) ≈ $0.65 (~CHF 0.60). Avec les frais Stripe (~CHF 0.90 sur une transaction CHF 19.90), coût variable total ≈ CHF 1.50, soit une marge estimée >90%. Marge large, cohérente avec le principe de ne pas exposer le produit à une perte même si l'estimation est optimiste — **à confirmer avec les données réelles `ai_usage` d'ici quelques semaines**.

Construit et déployé :
- Migration `032_job_pack.sql` (colonnes `users` + table `job_pack_events`)
- `JOB_PACK_CONFIG` (source unique de prix/contenu)
- `handleCreateJobPackCheckout` (route `POST /stripe/create-job-pack-checkout`)
- Extension `handleCheckoutCompleted` pour `job_pack_purchase`, avec protection anti-double-traitement webhook
- `handleTrackJobPackEvent` (route `POST /job-pack/track`)
- Emails `createJobPackActivatedHTML` (immédiat) + `createJobPackReminderHTML` (J+3, cron quotidien)
- Page de vente `pack-recherche-emploi.html`
- Bannière + badge "Pack actif" sur `credits.html`
- `sitemap.xml` mis à jour

Voir [PACK_RECHERCHE_EMPLOI.md](PACK_RECHERCHE_EMPLOI.md) pour la fiche produit complète et la liste des tests encore à faire (notamment un achat réel de bout en bout, pas encore testé).
