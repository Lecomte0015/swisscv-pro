# Rapport — Lot 2 : points restés ouverts (11.10.2026)

**Statut : préparé et testé, NON DÉPLOYÉ.** Production actuelle : Worker `81c6212f-bc8b-46d4-b331-9b98eb66165a`, pages déployées via `dist/` (déploiement `cbbb7fcb…`). Rien n'a été modifié en production dans ce lot (seulement des lectures du schéma). Aucun prix, aucune quantité de crédits, aucune condition commerciale modifiés.

Artefacts à déployer : `index.js` SHA-256 `ef4e081d88804823268b085533a460e0d4024a539570609ce1e710f1772207d3` ; `dist/` empreinte de contrôle `763a65b75bae0375085243bcd2ddb9c8`.

## 1. Ce qui a été fait

| # | Point ouvert | Correction | Fichiers / fonctions |
|---|---|---|---|
| 1 | **Dépense des crédits en parallèle** (1 crédit → 6 analyses) | **Réservation atomique** : le crédit est retiré avant l'appel IA par une seule requête SQL conditionnelle ; rendu automatiquement (bloc `finally`) si l'IA échoue ; candidatures en masse : seules les réussites sont facturées ; téléchargement du CV généré : facturation revendiquée atomiquement (une fois par document) | `index.js` : `reserveCredits`, `releaseHeldCredits`, `handleAnalyzeCVText`, `handleGenerateCoverLetter`, `handleCompareCV`, `handleGenerateApplication`, `handleGenerateBulkApplications`, `handleChargeCvBuilderDownload`, `handleConsumeCredits` |
| 2 | **Aucune limite de débit** | Compteur atomique en D1 par route et par IP, réponse 429 + `retry_after`, **fail-open** si la base est indisponible ; nettoyage quotidien par le cron | `index.js` : `RATE_RULES`, `checkRateLimit`, `cleanupRateLimits` ; **migration 041** (`rate_limits`) |
| 3 | **Liens Stripe réutilisables / double abonnement** | Alerte email à l'administrateur quand un second abonnement actif apparaît sur un compte déjà abonné (aucune résiliation automatique) | `index.js` : `handleSubscriptionChange` |
| 4 | **Route `/job-tracker/reminders` cassée** (fonction absente) | Handler créé : rappels actifs échus ou à 7 jours, du compte connecté uniquement | `index.js` : `handleGetActiveReminders` |
| 5 | **Aucun en-tête de sécurité** | `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` (1 an). Pas de CSP bloquante : trop de scripts en ligne pour l'activer sans casser le site | `_headers` |
| 6 | **`[env.development]` pointant vers la base de production** | Section désactivée et documentée | `wrangler.toml` (local, non versionné) |

Limites de débit appliquées (par IP) : inscription 5/h, connexion 20/10 min, renvoi de confirmation 5/h, vérification email 20/10 min, **connexion admin 8/15 min**, feedback 10/h, contact 5/h, tickets 10/h, témoignages 5/h, `/track` 120/min, création de sessions Stripe 20/h. Les webhooks Stripe et toutes les lectures (GET) ne sont jamais limités.

## 2. Preuves

**Tests locaux : 108 sur 108 réussis, 0 échec, 0 « todo »** (deux passages identiques). Les 5 tests de requêtes parallèles échouent sur le Worker actuellement en production et réussissent avec la correction : le défaut était réel.

**Environnement de test jetable, Worker déployé + base D1 distante : 70 contrôles sur 71 réussis**, le 71e étant une erreur d'attente de mon propre test et non du Worker : la tentative de connexion admin du contrôle A13 comptait dans la même fenêtre ; le compteur lu en base vaut 11 pour 8 acceptées + 3 refusées, soit exactement la règle. Le test est corrigé. Nouveaux contrôles réels :
- **J1** : 12 consommations simultanées avec 3 crédits → exactement 3 acceptées, solde 0, 3 transactions (concurrence réelle sur D1).
- **J3** : 10 téléchargements simultanés d'un CV → facturé une seule fois.
- **J4** : l'IA échoue (clé factice, vraie requête sortante) → 6 analyses parallèles, aucune ne réussit, **crédits intégralement rendus**, 0 transaction.
- **J5** : solde 0 → refus 402, jamais négatif.
- **K1–K5** : 429 après 5 renvois de confirmation, 8 connexions admin, 25 inscriptions simultanées → au plus 5 acceptées ; webhooks et lectures non limités.
- **L1** : route des rappels.
L'environnement de test a été supprimé (Worker, base, configuration, secrets).

**Non testé** (comme avant) : paiement Stripe en mode test, connexion admin réelle, envoi réel d'emails (dont l'alerte de double abonnement : vérifiée localement), exécution réelle du cron de nettoyage.

## 3. Mise en production (à autoriser)

```bash
cd /Volumes/EVERDRIVE/swisscv-deploy
# 0. contrôles
shasum -a 256 index.js                      # doit afficher ef4e081d…07d3
# 1. migration 041 (additive : 1 table + 1 index)
./scripts/d1-apply.sh swisscv-db migrations/041_rate_limits.sql
# 2. Worker
npx wrangler deploy
# 3. pages (en-têtes de sécurité)
./scripts/build-public.sh
npx wrangler pages deploy dist --project-name swisscv-pro --branch main --commit-dirty=true
```
**Retour arrière** : `npx wrangler rollback 81c6212f-bc8b-46d4-b331-9b98eb66165a -y --message "retour arrière"` (le Worker précédent fonctionne avec la nouvelle table). Dernier recours base : Time Travel.
**Contrôles après déploiement** : `/admin/metrics` sans jeton → 401 ; connexion admin et navigation ; une analyse CV normale (solde −1) ; page de connexion ; en-têtes présents (`curl -I https://swisscv-pro.ch`).

## 4. Effets visibles

- Un utilisateur qui dépasse une limite voit « Trop de requêtes. Réessayez dans quelques instants. » (HTTP 429). Limites par IP : un bureau ou un réseau partagé avec beaucoup d'inscriptions simultanées pourrait en toucher une ; les seuils sont modifiables dans `RATE_RULES`.
- Le crédit d'une opération IA est débité au début et rendu en cas d'échec : le solde affiché peut baisser quelques secondes pendant la génération.
- Un crash brutal du Worker entre la réservation et le remboursement (très rare) laisserait un crédit débité sans résultat : choix assumé en faveur de la sécurité ; visible dans l'historique par l'absence de transaction.

## 5. Risques restants

1. **À faire de votre côté** (rappel) : renouveler les clés RapidAPI et Adzuna ; purger le cache Cloudflare ; contrôles Stripe (webhooks, identifiants de prix, redirection après paiement) et paiement en mode test.
2. Liens Stripe directs réutilisables : l'alerte prévient, mais la prévention complète se règle côté Stripe.
3. Jetons utilisateur de 30 jours sans révocation ni contrôle du bannissement à chaque requête.
4. Pas de CSP ; `/credits/consume` fait confiance au client pour déclarer l'action consommée (les fonctionnalités exécutées côté navigateur ne peuvent pas être imposées par le serveur).
5. Aucune règle commerciale pour `invoice.payment_failed`, pause d'abonnement, litiges.

## 6. Autorisations demandées

| Action | Accord |
|---|---|
| F. Migration 041 (table `rate_limits`) | à donner |
| G. Déployer le Worker `ef4e081d…` | à donner |
| H. Publier les pages (en-têtes de sécurité) | à donner |
