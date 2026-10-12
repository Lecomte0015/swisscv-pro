# Rapport de préproduction — SwissCV Pro (11.10.2026)

**Rien n'a été modifié en production pendant cette phase** : aucune migration, aucun déploiement du Worker, aucun déploiement de pages en production, aucune écriture en base de production, aucun paiement. Les seules actions sur la production ont été des lectures (voir §9).
Les tests d'intégration ont tourné sur un **environnement jetable** (Worker `swisscv-pro-staging` + base D1 `swisscv-staging-tmp`, secrets aléatoires, Supabase/Stripe/Anthropic factices), **supprimé** à la fin.

Artefacts à déployer (empreintes à revérifier juste avant) :
- `index.js` : SHA-256 `25b985c481162b963c44517f5d7df1173d77d2a192d552182742c5064dfc4c2f` (exactement le fichier testé sur l'environnement de test)
- `dist/` (produit par `scripts/build-public.sh`) : empreinte de contrôle `aea12802e5978bd86fc25679b2457142`

---

## 1. Constats nouveaux de cette phase (par gravité)

| # | Gravité | Constat | État |
|---|---|---|---|
| N1 | **Critique** | **Le code source complet du Worker (`index.js`, 374 Ko) est téléchargeable publiquement** sur `https://swisscv-pro.ch/index.js`, ainsi que `wrangler.toml`, `CLAUDE.md`, `package.json`, `env.example`, `README.md`, les fichiers `migrations/*.sql` et **mon rapport `AUDIT_MARKETING_2026-10-11.md`** (déployé par mes soins avec les pages). Cause : `wrangler pages deploy .` publie tout le dossier (le `.wranglerignore` ne concerne que les Workers). Les URL de déploiements précédents (`<hash>.pages.dev`) sont, elles, protégées par Cloudflare Access (302) ; seuls `swisscv-pro.ch` et `swisscv-pro.pages.dev` exposent le déploiement courant. | Corrigé dans le code de déploiement (`scripts/build-public.sh` + `dist/`) ; **effectif seulement après déploiement des pages** |
| N2 | **Critique** | **Clés d'API tierces codées en dur dans ce fichier public** : clé RapidAPI et clé Adzuna (valeurs de repli dans le code), plus les anciens identifiants admin codés en dur. | Littéraux retirés du Worker (les secrets Cloudflare `RAPIDAPI_KEY`, `ADZUNA_APP_ID/KEY` existent). **Les clés restent à renouveler chez les fournisseurs** (elles ont été publiques). |
| N3 | Haute | **Bonus feedback répétable à l'infini** : `/feedback/submit` est public et créditait 5 crédits à chaque envoi pour n'importe quelle adresse existante. Introduit par moi. | Corrigé (une fois par compte, atomique, index unique) — **règle commerciale à autoriser explicitement** |
| N4 | Haute | **Registre marketing : un même achat annoncé par plusieurs événements Stripe était compté plusieurs fois** (revenu surestimé dans `admin-marketing`). Introduit par moi. Mis en évidence par le test d'intégration (24 lignes pour quelques achats). | Corrigé (une ligne par session Checkout) |
| N5 | Haute | **Utilisation des crédits non protégée contre les requêtes parallèles** : le solde est lu avant l'appel IA puis réécrit après. Avec **1 crédit**, **6 analyses lancées en parallèle ont toutes réussi** (6 appels IA facturés). Concerne 8 fonctions (analyse, lettre, entretien, candidatures…). | **Non corrigé** (voir §7) |
| N6 | Moyenne | `wrangler.toml` : la section `[env.development]` pointe vers **la même base que la production** (`database_id` identique). Un `wrangler deploy --env development` écrirait en production. | Ne pas utiliser ; à corriger |
| N7 | Moyenne | Aucune limite de débit (inscription, connexion admin, feedback, contact, `/track`, création de session Stripe). | Non corrigé |
| N8 | Basse | La route `/job-tracker/reminders` appelle `handleGetActiveReminders`, fonction **inexistante** (erreur 500). Aucun en-tête de sécurité (CSP, X-Frame-Options, HSTS) dans `_headers`. | Non corrigé |
| N9 | Info | Lors de ma revue, **deux valeurs sont apparues dans une sortie de commande de cette session** : la clé publique Supabase « anon » (publique par conception) et la clé Adzuna (déjà publique via N1). Aucune autre clé n'a été affichée ; les logs et rapports n'en contiennent pas. | Renouvellement Adzuna recommandé (déjà requis par N2) |

Rappel des constats du rapport précédent confirmés en production avant correction : routes `/admin/*` ouvertes (HTTP 200 avec un faux jeton, reproduit aussi sur le Worker de test avec l'ancien code), crédits sans validation de prix, rejeux, etc. Ils sont corrigés dans le code, non déployés.

## 2. Tableau PASS / FAIL / NON TESTÉ

Légende des preuves : **L** = 90 tests locaux (vrai Worker, D1 locale), **S** = 60 contrôles sur l'environnement de test réel (Worker déployé + D1 distante), **R** = relecture du code / commandes en lecture seule. Les tests locaux seuls ne sont pas retenus comme preuve suffisante : chaque PASS critique est confirmé par **S**.

| # | Contrôle | Résultat | Preuve / détail |
|---|---|---|---|
| 1 | Routes administratives protégées côté serveur | **PASS** (code corrigé) — **FAIL en production actuelle** | S A1–A13, L : les 18 routes `/admin/*` du code × 5 méthodes × 3 types de jeton refusent (401) ; porte unique avant tout routage ; `/admin` nu inclus |
| 2 | Jeton absent / falsifié / expiré / sans expiration / d'un utilisateur ordinaire / non-admin / rétrogradé / banni rejeté | **PASS** | S A2–A7, L ; rôle revérifié en base à chaque requête |
| 2b | Connexion admin réelle (mot de passe Supabase) | **NON TESTÉ** | impossible sans mot de passe ; à vérifier juste après déploiement (rollback prêt) |
| 3 | Prix et quantités fixés côté serveur | **PASS** | S B1 (8 cas falsifiés/invalides → 400 avant Stripe), D8, E3, E4 |
| 3b | Création d'une vraie session Stripe / paiement avec carte de test | **NON TESTÉ** | aucune clé de test Stripe dans le projet ; B3 prouve seulement que la validation est franchie et que l'appel Stripe est tenté |
| 3c | Validation des webhooks Stripe (signature, montant, devise, mode, client, paiement confirmé) | **PASS** | S C1–C2, D1–D10 |
| 4 | Anti-doublon atomique achats et webhooks | **PASS** | S D2–D5 : **12 webhooks identiques simultanés sur D1 réelle → crédité une seule fois** ; E1 (Pack ×8) ; F6 (facture ×7) |
| 5a | Crédits gratuits : renouvellement | **PASS** | S I1 (SQL du cron sur D1 réelle : remonte 0→5, ne réduit jamais Pack/bonus/achats) ; simulation en production : **0 compte éligible** avant le 28.10 |
| 5b | Crédits mensuels (abonnés) | **PASS** | S F5, F7, F8 (jamais réduit, pas de rechargement par simple mise à jour) |
| 5c | Crédits achetés / Pack conservés | **PASS** | S D1, E1, F8, F16, I1 |
| 5d | Utilisation des crédits (déduction) | **FAIL** | N5 : 1 crédit → 6 analyses en parallèle (L, test marqué « todo ») |
| 5e | Bonus feedback | **PASS (après correction)** — **autorisation requise** | S G6–G7 ; avant correction : répétable |
| 6a | Abonnements multiples via l'application | **PASS** | S G3 (409 si même plan ou inférieur, montée Pro autorisée) |
| 6b | Abonnements multiples via le lien Stripe direct | **NON TESTÉ / risque** | les Payment Links Stripe sont publics et réutilisables ; à limiter côté Stripe si possible |
| 6c | Changements de plan | **PASS** | S F11–F12 |
| 6d | Paiements échoués | **PASS (comportement défini : aucun changement)** | S F9 (past_due, unpaid, `invoice.payment_failed` n'altèrent ni plan ni crédits) ; **règle commerciale à définir** (relance, durée d'accès) |
| 6e | Résiliations (programmée vs effective, ancien abonnement, Pack) | **PASS** | S F4, F13–F16 |
| 6f | Abonnement `incomplete` / prix inconnu | **PASS** | S F10, F18 |
| 6g | Rattachement Payment Link (autre email) | **PASS (rattachement)** — application du plan **NON TESTÉ** | S H1–H2 ; la relecture de l'abonnement chez Stripe n'est pas possible sans clé de test |
| 7 | Pages de succès : aucun droit sur la seule base de paramètres d'URL | **PASS** | L (16 tests des pages), S G4–G5 ; plus aucun drapeau Premium côté navigateur |
| 7b | Parcours complet dans un navigateur avec un vrai paiement | **NON TESTÉ** | pas de paiement réel autorisé |
| 8a | Secrets Cloudflare présents | **PASS** | 11 secrets listés (noms seulement) : JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY, SUPABASE_*, ANTHROPIC_API_KEY, RAPIDAPI_KEY, ADZUNA_* |
| 8b | Aucune clé / mot de passe codé en dur | **PASS (code)** — **FAIL (exposition passée)** | littéraux retirés (analyse masquée : 0 restant, hors clé Supabase « anon » publique) ; N1/N2 : clés à renouveler |
| 8c | Code source non publié | **PASS (build)** — **FAIL en production actuelle** | `dist/` ne contient ni `index.js`, ni `wrangler.toml`, ni `.md`, ni `migrations/`, ni `tests/` ; vérifié sur un serveur local |
| 9a | Migrations 039 et 040 | **PASS** | répétées avec le script exact sur la D1 de test, ré-exécutables sans erreur ; aucun doublon bloquant l'index unique en production ; tables absentes en production (pas de collision) |
| 9b | Compatibilité Worker ↔ pages | **PASS avec réserve** | l'ancien Worker fonctionne avec les nouvelles tables (S) ; nouveau Worker + ancien `credits.html` : message de succès cosmétique « null crédits » (voir §6) ; nouvelles pages + ancien Worker : parcours Premium fonctionnel |
| 9c | Limites de débit | **FAIL** | N7 : inexistantes |
| 9d | Retour arrière Worker | **PASS** | répété sur le Worker de test : rollback + retour en quelques secondes |
| 9e | Retour arrière / sauvegarde base | **PASS** | Time Travel : restauration répétée (la ligne témoin disparaît) ; export SQL répété ; migrations additives, compatibles avec l'ancien Worker |
| 9f | Retour arrière Pages | **NON TESTÉ** | via le tableau de bord Cloudflare ; attention : le déploiement actuel contient `index.js` public (voir §5) |
| 10 | Aucun événement de paiement fictif en production | **PASS** | aucune écriture en base de production pendant cette phase |

## 3. Tests d'intégration réalisés (environnement de test isolé)

60 contrôles, tous réussis, sur le Worker final (version `d5d84c8f…`, même empreinte que `index.js` à déployer) : porte admin (13), création de session de crédits (3), signature des webhooks (2), achats de crédits (10), Pack (4), abonnements/factures/échecs/résiliations (18), checkout Premium, statut de paiement, bonus feedback (7), Payment Link (2), renouvellement gratuit (1). Un premier passage avait relevé 1 échec (N4) : corrigé puis 60/60 sur deux passages consécutifs.
Tests locaux : 90 (89 réussis, 1 « todo » = N5 documenté, 0 échec).

**Non couvert** : paiement avec carte de test Stripe, webhook émis par Stripe, connexion admin Supabase réelle, envoi réel d'emails, exécution du cron planifié (le SQL a été exécuté, pas le déclencheur), navigateur réel avec paiement.

## 4. Migration exacte (production)

Fichiers : `migrations/039_billing_idempotency.sql` (2 tables + 1 index) et `migrations/040_feedback_single_credit.sql` (1 index unique partiel). Additives : elles ne modifient ni ne suppriment aucune donnée ; l'ancien Worker continue de fonctionner (vérifié).

```bash
cd /Volumes/EVERDRIVE/swisscv-deploy
./scripts/d1-apply.sh swisscv-db migrations/039_billing_idempotency.sql
./scripts/d1-apply.sh swisscv-db migrations/040_feedback_single_credit.sql
```
Le script exécute chaque instruction séparément, s'arrête à la première erreur et n'affiche aucun secret. Contrôle ensuite :
```bash
npx wrangler d1 execute swisscv-db --remote --command "SELECT name FROM sqlite_master WHERE name IN ('processed_checkout_sessions','processed_stripe_events','uq_feedback_one_credit_per_user')"
```
(3 lignes attendues).

## 5. Déploiement exact et retour arrière

**Avant tout** (actions de votre côté ou à autoriser) :
1. **Renouveler la clé RapidAPI et la clé Adzuna** chez leurs fournisseurs, puis : `echo "<nouvelle clé>" | npx wrangler secret put RAPIDAPI_KEY` (idem `ADZUNA_APP_KEY`, et `ADZUNA_APP_ID` si le fournisseur le change). À faire **avant** de supprimer le déploiement Pages actuel : un retour arrière Pages remettrait `index.js` en ligne.
2. Sauvegarde : Time Travel (repère actuel, sans donnée copiée) `npx wrangler d1 time-travel info swisscv-db` ; au moment de ma vérification : `000017ae-00000000-00005101-80340bb5fd4af45b01018e7f44ba4471`. Copie SQL optionnelle (contient des données personnelles : à enregistrer **hors** du dossier du projet) : `npx wrangler d1 export swisscv-db --remote --output=$HOME/backups/swisscv-db-avant-correctifs.sql`.
3. Vérifier l'empreinte : `shasum -a 256 index.js` doit afficher `25b985c4…4c2f`.

**Étapes** (à arrêter à la première anomalie) :
```bash
# 1. Migrations (voir §4)
# 2. Worker (version actuelle à restaurer en cas de problème : cc8dc959-816a-4003-aaf6-39a11aa0bbb5)
npx wrangler deploy
# 3. Pages : build public uniquement, puis publication
./scripts/build-public.sh
npx wrangler pages deploy dist --project-name swisscv-pro --branch main --commit-dirty=true
```
**Retours arrière**
- Worker : `npx wrangler rollback cc8dc959-816a-4003-aaf6-39a11aa0bbb5 -y --message "retour arrière"` (version précédente : `13bc67fa-136f-453a-b934-0cfb97fc8e39`). Répété sur le Worker de test.
- Base : les migrations sont additives (aucun retour nécessaire). Dernier recours : `npx wrangler d1 time-travel restore swisscv-db --bookmark=<repère>` (perd les écritures postérieures).
- Pages : tableau de bord Cloudflare → Pages → swisscv-pro → Deployments → déploiement `8e2bba56` → *Rollback* (contient `index.js` public : renouveler les clés d'abord).

**Vérifications après chaque étape**
- Après Worker : `GET /admin/metrics` avec un faux jeton → 401 ; vous reconnecter au back-office (l'ancien jeton n'est plus accepté, c'est voulu) puis ouvrir Dashboard, Utilisateurs, Marketing ; une connexion utilisateur normale et une analyse CV.
- Après Pages : `https://swisscv-pro.ch/index.js`, `/wrangler.toml`, `/CLAUDE.md` → 404 ; `/analytics.js`, `/login.html`, `/credits.html` → 200 ; parcours « Choisir Premium » → connexion avec bandeau du plan ; bandeau de consentement.

## 6. Incompatibilités et effets visibles

- **Reconnexion admin obligatoire** après le déploiement du Worker ; les sessions admin durent 12 h (renvoi automatique vers la connexion).
- Entre le déploiement du Worker et celui des pages (quelques minutes), un achat de crédits afficherait l'ancien message de retour (« null crédits » au lieu du nombre) ; les crédits sont néanmoins attribués. Déployer les pages immédiatement après.
- Les sessions Stripe créées avant le déploiement gardent l'ancienne URL de retour (`pages.dev`) ; leurs crédits sont attribués par le webhook si montant et palier sont conformes, sinon refus + email d'alerte à l'administrateur.
- `POST /stripe/create-checkout` renvoie 409 si le compte a déjà ce plan ou un plan supérieur.
- Le bonus feedback n'est accordé qu'une fois par compte (si autorisé).
- Contentsquare et Google Analytics ne se chargent qu'après consentement : les statistiques baisseront mécaniquement.

## 7. Risques restants (non corrigés dans ce lot)

1. **Utilisation des crédits (N5)** : à corriger en réservant le crédit de façon atomique avant l'appel IA et en le rendant en cas d'échec, dans les 8 fonctions concernées. À traiter avant d'investir dans l'acquisition payante.
2. **Limites de débit (N7)** : Workers Rate Limiting ou règles Cloudflare sur `/auth/*`, `/admin/login`, `/feedback/submit`, `/contact`, `/support/ticket`, `/track`, création de sessions Stripe.
3. Jetons utilisateur de 30 jours sans révocation ni contrôle du bannissement à chaque requête.
4. Liens Stripe directs réutilisables (double abonnement possible hors application) ; aucune règle commerciale pour `invoice.payment_failed`, `customer.subscription.paused`, litiges (`charge.dispute.created`), remboursements (à activer côté Stripe).
5. Pas d'en-têtes de sécurité (`_headers`) ; section `[env.development]` pointant vers la base de production ; route `/job-tracker/reminders` cassée.
6. Les clés RapidAPI/Adzuna ont été publiques : tant qu'elles ne sont pas renouvelées, elles restent exploitables.
7. Les tests simulent Stripe ; un passage en **mode test Stripe** (cartes de test) reste nécessaire.

## 8. Vérifications nécessaires dans Stripe (Dashboard)

1. **Webhooks → votre endpoint** : événements abonnés = `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `invoice.paid`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`.
2. **Identifiants de prix** : les Payment Links Premium et Pro doivent utiliser exactement `price_1Suy0EADypIYoB8vWc0RD5na` (Premium) et `price_1Suy1SADypIYoB8vxzCU7Cft` (Pro). Un autre identifiant serait désormais **ignoré** (avant : rétrogradation du client).
3. **Payment Links** : redirection après paiement vers `https://swisscv-pro.ch/success` ; transmission de `client_reference_id` autorisée ; code SWISS20 ; possibilité de limiter à un abonnement par client.
4. **Mode test** : avec `stripe listen` ou un lien de test, rejouer : achat de crédits, Pack, abonnement avec autre email, résiliation programmée puis effective, « Renvoyer » un événement.
5. Recouper les 2 abonnements actifs et les 5 comptes « client Stripe sans abonnement ».

## 9. Actions effectuées sur la production pendant cette phase (toutes en lecture)

Liste des versions et déploiements du Worker et de Pages, repère Time Travel, 7 requêtes SQL `SELECT` (doublons de bonus, tables existantes, abonnés, rôles, colonnes, simulation du renouvellement, comptes payants — agrégats sans données personnelles) et des requêtes HTTP `GET` anonymes de contrôle d'exposition (fichiers publics, route d'agrégats `/admin/metrics`). Les déploiements de pages réalisés dans la session précédente (qui publiaient les fichiers internes) sont à l'origine de l'exposition du rapport d'audit marketing.

Ressources de test créées puis **supprimées** : Worker `swisscv-pro-staging`, base `swisscv-staging-tmp`, fichier `wrangler.staging.toml`, secrets de test. Subsiste un déploiement Pages « Preview » (`49103e82…`, protégé par Cloudflare Access) ne contenant que le contenu public.

## 10. Autorisations demandées

| Action | Votre accord |
|---|---|
| A. Appliquer les migrations 039 et 040 en production | à donner |
| B. Déployer le Worker (empreinte `25b985c4…`) | à donner |
| C. Publier les pages **via `dist/`** (retire le code source et les documents internes du site public) | à donner |
| D. Règle commerciale : bonus feedback de 5 crédits **une seule fois par compte** | à confirmer (sinon je retire cette correction avant déploiement) |
| E. Renouvellement des clés RapidAPI et Adzuna (par vous) puis `wrangler secret put` | à faire / à me demander |
