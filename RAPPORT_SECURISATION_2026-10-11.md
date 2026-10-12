# Rapport — Sécurisation et validation commerciale (11.10.2026)

**Statut : corrections implémentées et testées en local. Rien n'est déployé en production** (ni migration, ni Worker, ni pages) : en attente de votre accord, voir §7.
Aucun vrai paiement, remboursement ni changement de prix. Les prix existants (5 crédits = 2 CHF, 15 = 5 CHF, 30 = 8 CHF, Pack = 19.90 CHF, Premium 9 CHF, Pro 29 CHF) sont **inchangés** : la table serveur reprend exactement ceux de `credits.html` / `pricing.html`.

---

## 1. Anomalies confirmées

Chaque anomalie ci-dessous a été **reproduite par un test qui échoue sur le Worker actuel** (copie de `index.js` avant correctifs) et réussit après correction. Résultat global sur l'ancien code : 34 tests sur 46 en échec pour les achats/abonnements, 8 sur 10 pour l'admin et les journaux.

| # | Gravité | Anomalie | Preuve (ancien code) |
|---|---|---|---|
| 1 | **Critique** | **Routes `/admin/*` sans authentification réelle** : il suffit d'un en-tête `Authorization: Bearer <n'importe quoi>`. Permet de changer le plan d'un compte (Premium/Pro gratuit), son rôle, de bannir, d'annuler des abonnements, lancer la campagne email, lire les métriques. **Confirmé en production** par une requête sans identifiant sur une route d'agrégats (HTTP 200 avec un faux jeton ; 401 sans jeton). Je n'ai pas testé les routes de modification ni de données personnelles en production. | `Bearer x` → 200 sur toutes les routes testées |
| 2 | **Critique** | **Identifiants admin « super_admin » codés en dur** dans `/admin/login` (retournaient un jeton sans aucune vérification de base). | présents dans le Worker |
| 3 | **Critique** | **Prix et quantité de crédits fournis par le navigateur** : 30 crédits pour 1 centime acceptés, session Stripe créée avec ce montant. | création de session : 200 au lieu de 400 |
| 4 | **Haute** | **Crédits attribués sur les métadonnées de la session**, sans vérifier le montant réellement payé, le palier, le mode, la devise, ni le client Stripe. | session « 9999 crédits » → solde 10 004 |
| 5 | **Haute** | **Aucun anti-doublon sur les achats de crédits** (le Pack avait un contrôle, mais non atomique). | même événement ×3 → 50 crédits au lieu de 20 ; 8 envois parallèles → crédité 8 fois |
| 6 | **Haute** | **Le renouvellement mensuel gratuit effaçait les crédits achetés** (Pack, crédits à l'unité, bonus feedback) : le solde était *remis* à la limite. Introduit par moi lors de la correction du renouvellement des crédits gratuits (cron du 28.09). Aucun client n'avait encore acheté, donc aucun dommage réel ; le prochain renouvellement (≥ 28.10) aurait touché un compte de test à 9 crédits (bonus feedback). | solde Pack 60 → 5 |
| 7 | **Haute** | **Chaque `customer.subscription.updated` rechargeait les crédits** au plafond du plan (carte changée, résiliation programmée…). | solde 40 → 100 |
| 8 | **Haute** | **`invoice.paid` rejouable** : un renvoi du même événement rechargeait de nouveau ; toute facture (même ponctuelle ou de proratisation) rechargeait. | solde 30 → 100 après rejeu |
| 9 | **Moyenne** | **Un prix Stripe inconnu rétrogradait un client au plan gratuit** ; un statut non actif (incomplete, past_due) accordait quand même le plan. | prix inconnu → plan retiré |
| 10 | **Moyenne** | **La fin d'un ancien abonnement rétrogradait un client ayant un autre abonnement actif** ; les crédits d'un Pack étaient plafonnés à 5 à la résiliation. | — |
| 11 | **Moyenne** | **Abonnement via Payment Link rattaché uniquement par l'email saisi chez Stripe** : si le client tape une autre adresse, il paie sans être passé Premium. | corrigé par `client_reference_id` |
| 12 | **Moyenne** | **Une page de succès attribuait « Premium » côté navigateur** (`swisscv_premium` posé à chaque visite de `success.html`) et affichait « paiement réussi » sans preuve. La page crédits affichait « N crédits ajoutés » d'après `?credits=` dans l'URL (modifiable, et injection HTML possible). La page Pack annonçait « activé » sur `?success=true`. | URL fabriquée → message de succès |
| 13 | **Moyenne** | **Retour de paiement des crédits et d'ajout de carte sur `swisscv-pro.pages.dev`** (autre domaine : l'acheteur y apparaît déconnecté). | — |
| 14 | **Moyenne** | **Parcours Premium cassé** : « Choisir Premium » n'emportait pas le plan ; le client devait retrouver la page crédits. | — |
| 15 | **Moyenne** | **Un client déjà abonné pouvait souscrire une seconde fois** au même plan. | — |
| 16 | **Moyenne (vie privée)** | **Contentsquare** (analyse d'usage) chargé sur 30 pages **sans consentement**, ce qui contredisait le bandeau mis en place à l'étape E. | — |
| 17 | **Basse** | Journaux contenant des adresses email complètes ; comparaison de signature Stripe non constante. | test « logs » en échec |

## 2. Fichiers et fonctions modifiés

**`index.js`** (non versionné ; copie de l'ancienne version conservée hors dépôt)
- Nouveaux : `CREDIT_PACKS`, `lookupCreditPack`, `timingSafeEqualStr`, `processCreditCheckout`, `linkSubscriptionCheckoutToUser`, `handleCheckoutStatus`, `requireAdmin`, `maskEmail`.
- Modifiés : `handleCreateCreditCheckout` (prix serveur, URLs canoniques), `handleCreateJobPackCheckout` (URL de retour avec `session_id`), `handleCreateSetupSession` (domaine canonique), `handleCreateCheckout` (garde « déjà abonné », `client_reference_id`), `handleCheckoutCompleted` (attribution atomique), `handleSubscriptionChange` (réécrit), `handleInvoicePaid` (raison de facturation + anti-rejeu), `handleSubscriptionCanceled` (abonnement concordant, Pack préservé), `handleStripeWebhook` (événements asynchrones), `verifyStripeSignature` (comparaison constante), `recordStripeLedger` (formes récentes de l'API Stripe), `resetFreeTierCredits` (ne réduit jamais), `/admin/login` (jeton signé 12 h, identifiants codés en dur supprimés), porte d'entrée `/admin/*` dans `fetch`, masquage des emails dans les journaux.

**`migrations/039_billing_idempotency.sql`** (à appliquer avant le Worker) : tables `processed_checkout_sessions` (clé = session Stripe, anti-doublon atomique) et `processed_stripe_events`.

**Pages** : `pricing.html`, `tarifs/index.html` (plan transmis), `login.html`, `confirm.html` (plan restauré après connexion / confirmation d'email), `credits.html` (paiement direct sans boucle, retour vérifié côté serveur, suppression du message injectable), `pack-recherche-emploi.html`, `success.html`, `succes/index.html` (vérification serveur, plus de drapeau Premium client), `modeles-cv/index.html`, 30 pages (Contentsquare retiré), `analytics.js` (Contentsquare chargé après consentement), 11 pages admin + `admin/js/session-guard.js` (retour à la connexion si le jeton est refusé), nouveau `checkout-intent.js`.

**Tests** : `tests/billing/` (voir le README).

## 3. Règles commerciales appliquées (à valider)

- Crédits récurrents : le solde **remonte** à l'allocation du plan sur `invoice.paid` de type création/renouvellement ; il n'est **jamais réduit** s'il est supérieur (crédits achetés, Pack). *Écart par rapport à l'ancien code, qui remettait le solde à la limite et effaçait donc les crédits achetés.*
- Abonnement créé ou plan relevé : même règle (remonte, ne réduit pas). Une simple modification ne touche pas aux crédits.
- Palier gratuit : renouvellement tous les 30 jours qui remonte un solde bas à 5 crédits, sans jamais réduire.
- Résiliation : la résiliation programmée garde l'accès jusqu'à la fin ; la résiliation effective repasse en gratuit (crédits plafonnés à 5, sauf comptes ayant acheté le Pack). Les deux sont distinguées dans `subscription_events`.
- Un achat n'élève plus `credits_monthly_limit`.

## 4. Tests

`node --test tests/billing/*.test.mjs` : **84 tests, 84 réussis, 0 échec** (3 exécutions consécutives identiques). Ils exécutent le vrai `index.js` sur une vraie base D1 locale (SQLite), avec Stripe, Resend et Supabase simulés.

| Fichier | Tests | Contenu |
|---|---|---|
| `credits.test.mjs` | 21 | montant falsifié, palier inconnu/énorme, quantités invalides (18 valeurs), jeton falsifié ; webhook : signature absente/fausse/ancienne/corps modifié ; rejeu ×3, même session sous autre événement, 8 envois parallèles ; montant ≠ palier, devise, mode, client étranger, utilisateur inconnu, paiement non confirmé puis asynchrone ; Pack ; statut de paiement |
| `subscriptions.test.mjs` | 25 | mises à jour sans recharge, résiliation programmée vs effective, prix inconnu, statuts non actifs, création/upgrade/downgrade, `invoice.paid` (cycle, rejeu, parallèle, proratisation, manuelle, plan gratuit, nouvelle forme d'API), ancien abonnement, Pack conservé, Payment Link avec autre email, garde « déjà abonné », renouvellement gratuit |
| `admin.test.mjs` | 9 | toutes les routes admin sans jeton / faux jeton ; élévation de privilèges ; jeton falsifié/expiré/sans claim ; jeton utilisateur ordinaire ; rôle rétrogradé ou banni ; admin valide ; préflight CORS ; connexion admin, mauvais mot de passe, identifiants codés en dur |
| `frontend.test.mjs` | 16 | pas de preuve par l'URL, vérification serveur, pas de boucle de redirection, pages de succès, plus de domaine `pages.dev` |
| `intent.test.mjs` | 6 | plan mémorisé (liste blanche, expiration, stockage bloqué, pas de redirection ouverte) |
| `marketing-regression.test.mjs` | 6 | étapes A à E toujours opérationnelles |
| `logs.test.mjs` | 1 | aucun secret ni email complet dans les journaux |

Un bug a été trouvé et corrigé par ces tests pendant le travail (stockage navigateur bloqué dans `checkout-intent.js`). Un contrôle visuel dans le navigateur a confirmé : « Choisir Premium » → connexion avec bandeau « Plan Premium sélectionné » et plan mémorisé. 

**Non testé (impossible ici)** : une vraie connexion admin avec mot de passe, un vrai paiement Stripe (test ou réel), le webhook Stripe réel, le comportement de `batch()` sur la D1 de production (documenté comme transactionnel, vérifié sur la D1 locale), l'envoi réel des emails. Aucune clé de test Stripe n'est disponible dans ce projet.

## 5. Vérifications manuelles dans Stripe (Dashboard)

1. **Webhook** → événements abonnés : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `invoice.paid`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`. Ajouter ceux qui manquent.
2. **Payment Links Premium et Pro** → « Après le paiement » : redirection vers `https://swisscv-pro.ch/success` ; vérifier qu'ils acceptent un `client_reference_id` (paramètre d'URL) et le code SWISS20.
3. **Mode test** (avec Stripe CLI `stripe listen` ou un lien de test) : un paiement de crédits, le Pack, un abonnement avec email différent, une résiliation programmée puis effective, un rejeu d'événement (« Renvoyer » dans le Dashboard) : le solde ne doit augmenter qu'une fois.
4. Recouper les **2 abonnements actifs** et les **5 comptes « client Stripe sans abonnement »** (abandons ou anciens abonnés).

## 6. Risques restants

1. **Rotation des secrets** : le Worker contient une clé RapidAPI de repli en clair et des valeurs de repli dans `TEMP_CONFIG`. Fichier non versionné, mais à faire passer en secrets Cloudflare puis à renouveler.
2. **Les identifiants admin codés en dur ont existé** et la route admin était ouverte : par prudence, vérifier dans `admin_logs` et les plans/rôles récents qu'aucun changement inattendu n'a eu lieu (à faire avec vous ; je n'ai pas lu les données personnelles).
3. Les jetons utilisateur durent 30 jours, sans révocation ni vérification du bannissement à chaque requête. Un compte banni garde son jeton jusqu'à expiration.
4. Route publique `/feedback/submit` : pas de limitation de débit (crédite 5 crédits ; dédoublonnage à confirmer).
5. Pas de limitation de débit sur `/auth/*`, `/track`, la création de sessions Stripe.
6. Le Worker ne traite pas encore `customer.subscription.paused`, `invoice.payment_failed` (relance, accès) ni les litiges (`charge.dispute.created`) : à définir commercialement.
7. L'ancien `index.js` n'est pas sous Git : un retour arrière repose sur `wrangler rollback` (versions du Worker) et sur la copie sauvegardée.
8. Les tests simulent Stripe : la validation en mode test Stripe reste nécessaire avant d'investir dans l'acquisition payante.

## 7. Plan de déploiement proposé (rien n'est fait)

Ordre, avec vérification entre chaque étape :
1. **Migration 039** (ajout de 2 tables, sans effet sur l'existant).
2. **Worker** (`npx wrangler deploy`). Noter l'identifiant de version avant, pour `wrangler rollback`. Juste après : se **reconnecter au back-office** (l'ancien jeton Supabase ne sera plus accepté, c'est voulu) et vérifier Dashboard, Utilisateurs, Marketing.
3. **Pages** (`wrangler pages deploy`).
4. Contrôles Stripe du §5, puis un paiement de test.

Recommandation : ne pas retarder les étapes 1 et 2 à cause de l'anomalie n°1, qui est exploitable aujourd'hui.
