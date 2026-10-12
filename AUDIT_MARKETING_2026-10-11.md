# Audit du suivi marketing — SwissCV Pro (11.10.2026)

Statut : **audit en lecture seule, rien n'a été modifié**. Les corrections ci-dessous attendent validation.
Sources : code (`index.js`, pages HTML), base D1 `swisscv-db` en lecture seule, comptes de la base au 11.10.2026.
Non vérifié : Stripe (aucun connecteur disponible → à recouper avec le dashboard Stripe), données GA4 / Search Console (non accessibles depuis ici).

---

## 1. Synthèse

1. **Le taux de conversion affiché (1,3 %) est faux, et le MRR affiché (27 CHF) aussi.** Ils comptent le compte administrateur du fondateur comme client payant et divisent par tous les comptes (y compris le compte système et les comptes de test). Réalité : **2 clients payants sur 223 inscrits réels = 0,9 %**, MRR au plus **18 CHF** (2 × 9 CHF, moins si le code SWISS20 a été utilisé).
2. **Aucune source d'acquisition n'est conservée.** Ni UTM, ni referrer, ni page d'arrivée ne sont enregistrés à l'inscription. Il est impossible aujourd'hui de dire quel canal (SEO, Facebook, direct) a amené quel inscrit, donc quel canal convertit.
3. **Le suivi GA4 ne couvre pas le parcours qui compte.** La balise n'est présente que sur 6 pages sur ~40 (accueil, analyse CV, page de succès, 3 pages SEO). Elle est absente de l'inscription/connexion, de la page tarifs, de la page crédits, de la page Pack et de la recherche d'offres.
4. **L'événement `purchase` de GA4 est un faux.** `success.html` envoie `purchase` à 9,00 CHF à chaque chargement de la page, sans lien avec Stripe (identifiant = horodatage). Tout visiteur de cette page, ou tout rechargement, compte comme un achat.
5. **Aucun registre des paiements.** Il n'existe pas de table de paiements. Le revenu des abonnements (`invoice.paid`) n'est jamais enregistré, les résiliations ne laissent aucune trace datée, et `subscription_status` n'est jamais renseigné par le webhook (vide pour les 2 clients réels).
6. **Le funnel de vente est presque invisible.** Seul le Pack est suivi côté serveur (`job_pack_events`). Consultation des tarifs, clic « Choisir Premium », démarrage du paiement Premium ou d'un achat de crédits : rien n'est enregistré.
7. **Deux anomalies de paiement à traiter en priorité (hors périmètre « marketing » mais bloquantes)** : voir §6.

**Diagnostic de la faible conversion (ce que les données permettent de dire) :**
- L'activation est correcte : 96 des 223 inscrits (43 %) ont fait au moins une analyse, dont 90 dans les 24 h. Cohorte de septembre : 17/25 (68 %).
- La rétention d'usage est faible : seulement 38 inscrits (17 %) ont fait 2 analyses ou plus.
- Les fonctionnalités à forte valeur sont presque inutilisées hors fondateur : candidature 1-clic (1 utilisateur), candidatures en masse (1), lettres de motivation (6), générateur de CV (1).
- Le tunnel de vente se perd avant le paiement : Pack = 16 consultations par 7 comptes, 1 clic, 1 démarrage de paiement, **0 achat**. Achats de crédits à l'unité : **0 depuis l'ouverture** (aucune ligne `credit_purchase` dans `credit_transactions`).
- Le flux est de ~5 inscriptions/semaine (S34 à S40 : 5, 5, 10, 4, 4, 6, 3) : à ce volume, 2 clients payants correspondent à 0,9 %, ce qui reste dans la fourchette basse normale d'un freemium, mais l'échantillon est trop petit pour conclure sur un canal.

---

## 2. Phase 1 — Audit détaillé

### 2.1 Outils d'analytics existants

| Outil | État |
|---|---|
| GA4 `G-VE7PJZTF8L` | Sur 6 pages seulement : `index`, `app`, `success`, `accueil/`, `analyseur-cv/`, `succes/`. Absent partout ailleurs. |
| Événements GA4 envoyés | `cv_analyzed`, `cv_analysis_error` (app), `template_download` (modeles-cv), `purchase` (faux, voir §1.4), `premium_activated` |
| Événements manquants | `sign_up`, `login`, `view_pricing`, `begin_checkout`, `purchase` réel, `job_search`, `pack_view`… |
| Suivi serveur (D1) | `cv_analyses`, `credit_transactions`, `ai_usage`, `email_logs` (envoi/ouverture/clic), `job_pack_events`, `metrics_snapshots` (1 ligne/jour : total, premium, pro, mrr) |
| Autres outils (Clarity, Plausible, pixel Meta…) | Aucun |
| Consentement cookies | **Aucun bandeau ni mécanisme.** `cookies.html` décrit un cookie `cookie_consent` qui n'est créé nulle part. GA4 se charge sans consentement préalable (point de conformité nLPD/RGPD). |

### 2.2 Événements : ce qui est réellement enregistré

| Étape | Enregistré côté serveur | Enregistré côté GA4 |
|---|---|---|
| Visite / source | Non | Oui sur 6 pages (session et source natives GA4, non reliées aux comptes) |
| Inscription | `users.created_at` seulement (pas de source) | Non |
| Première analyse CV | Oui (`cv_analyses`) | Oui (`cv_analyzed`) |
| Utilisation des fonctions | Oui (`credit_transactions.action_type`) | Non |
| Consultation des tarifs | Non | Non (page sans balise) |
| Consultation des offres d'emploi | Partiel (`job_search_history` : 1 utilisateur ; `saved_searches` : 30) | Non |
| Démarrage paiement Premium | **Non** (Payment Link Stripe, aucun log) | Non |
| Démarrage paiement crédits | Non (le client Stripe est créé à ce moment, voir §2.3) | Non |
| Démarrage paiement Pack | Oui (`checkout_started`) | Non |
| Achat confirmé abonnement | Aucun registre (seulement `subscription_tier` mis à jour + email admin) | Faux événement |
| Achat confirmé crédits | Oui (`credit_transactions`, `metadata.amount_paid`) | Non |
| Achat confirmé Pack | Oui (`purchased`, dédoublonné par `session_id`) | Non |
| Activation Pack | Prévue (`activated`), 0 occurrence | Non |
| Résiliation | Aucun registre daté (seul `email_logs` garde 1 résiliation faite par l'admin) | Non |

### 2.3 Paiements et abonnements réellement actifs (état D1)

| Compte | Plan | Lien Stripe | Compte réel ? |
|---|---|---|---|
| dallyhermann@gmail.com | premium | aucun (passé Premium à la main, `subscription_status='active'` posé à la main) | **Fondateur / admin** |
| aelmacin@yahoo.com | premium | client + abonnement | Client payant |
| patriciamonteiro7@gmail.com | premium | client + abonnement | Client payant |
| 5 comptes `free` | free | client Stripe créé, **sans abonnement** | Abandons de paiement ou anciens abonnés (indiscernable aujourd'hui) |

Comptes à exclure des indicateurs : `contact-form` (compte système), `dallyhermann@gmail.com` (admin), `dallyhermann6@gmail.com` (test), 1 compte banni.
Base : **226 lignes → 223 inscrits réels** (dont 1 banni).

Autres constats :
- Les abonnements Premium/Pro passent par des **Payment Links Stripe** (lien avec `prefilled_email`). L'acheteur peut changer l'email dans Stripe ; le rattachement repose alors sur un second essai par email via l'API Stripe. Aucune trace n'est gardée de la tentative.
- Le webhook traite : `customer.subscription.created/updated/deleted`, `invoice.paid`, `checkout.session.completed`. Signature vérifiée (OK).
- `customer.subscription.deleted` repasse l'utilisateur en `free` sans écrire d'historique (ni date, ni motif, ni plan quitté).

### 2.4 Calcul du taux de conversion affiché dans l'administration

Route `GET /admin/metrics` (`index.js`, ~l.5298), affichée dans `admin-analytics.html` :

```
taux = (utilisateurs premium + utilisateurs pro) / COUNT(*) de la table users × 100
```

Défauts :
- **Numérateur** : compte les lignes dont `subscription_tier` vaut premium/pro, donc inclut le compte du fondateur (3 au lieu de 2) et tout compte passé Premium à la main.
- **Dénominateur** : compte toutes les lignes, y compris le compte système `contact-form`, les comptes de test et le compte banni (226 au lieu de 223).
- **Aucune période** : c'est un ratio global tous temps confondus, sans cohorte.
- **Résultat affiché : 3 / 226 = 1,3 %. Résultat correct : 2 / 223 = 0,9 %.**
- **MRR** : `premium × 9 + pro × 29` en dur → 27 CHF affiché. Ignore le code SWISS20 (−20 %), les remboursements, et compte l'admin. `metrics_snapshots` enregistre ce même chiffre faux chaque jour (historique inclus).
- **Churn / LTV** : la route active renvoie « N/D » (correct). Une seconde route `/admin/metrics` plus bas dans `index.js` (jamais atteinte car masquée par la première) contient un churn codé en dur à 2,1 % ; code mort à supprimer.

### 2.5 Sources d'acquisition et UTM

- Aucun paramètre `utm_*`, `gclid`, `fbclid`, ni `document.referrer` n'est lu dans le frontend (seule occurrence : `confirm.html`, pour tester Supabase).
- La table `users` n'a aucune colonne de source, de campagne ou de page d'arrivée.
- L'inscription se fait sur `login.html`, qui n'a pas la balise GA4 : même la source native de GA4 est perdue à cet endroit.
- Les URL de retour Stripe pour les crédits pointent vers `swisscv-pro.pages.dev` (autre domaine que `swisscv-pro.ch`), ce qui casse aussi la continuité de session (voir §6).

---

## 3. Corrections prioritaires

| # | Priorité | Correction | Touche la facturation ? |
|---|---|---|---|
| P0-1 | Critique | Valider côté serveur le prix et le nombre de crédits des achats à l'unité (aujourd'hui fournis par le navigateur) | **Oui → validation requise** |
| P0-2 | Haute | Retourner vers `swisscv-pro.ch` (et non `pages.dev`) après paiement de crédits | Oui (URL de retour uniquement) → validation |
| P1-1 | Haute | Corriger le taux de conversion et le MRR (exclure admin/test/système, compter les abonnements Stripe actifs) | Non |
| P1-2 | Haute | Supprimer le faux événement `purchase` de `success.html` | Non |
| P1-3 | Haute | Capturer source/UTM à l'inscription | Non |
| P1-4 | Haute | Registre des paiements et des abonnements alimenté par les webhooks (dédoublonné) | Non (lecture seule du flux existant) |
| P2-1 | Moyenne | Tracer le funnel de vente (tarifs vus, clic Premium, paiement démarré/abandonné) | Non |
| P2-2 | Moyenne | Bandeau de consentement + GA4 sur toutes les pages publiques | Non |
| P2-3 | Moyenne | Tableau de bord marketing dans l'admin | Non |
| P3 | Basse | Supprimer le code mort `/admin/metrics` (churn 2,1 %) ; poser `subscription_status` depuis Stripe | Non |

---

## 4. Plan technique proposé (Phases 2 à 4)

### 4.1 Capture de la source (P1-3)
- Petit script `attribution.js`, inclus sur les pages publiques : lit `utm_source`, `utm_medium`, `utm_campaign`, l'**hôte** du referrer (pas l'URL complète) et le chemin de la page d'arrivée, et les garde en `localStorage` en « premier contact » (jamais écrasé).
- À l'inscription, ces champs partent avec la requête d'inscription ; le serveur les valide (liste blanche, longueur limitée, valeurs normalisées) et les écrit dans de nouvelles colonnes de `users` : `first_source`, `first_medium`, `first_campaign`, `first_referrer_host`, `first_landing_path`.
- Source « organic / direct / social / email / referral » dérivée côté serveur si pas d'UTM (ex. referrer `google.*` → organic, `facebook.*` → social).
- Les comptes existants restent « inconnu » (non reconstituables).
- **Aucune donnée personnelle ni contenu de CV** : uniquement ces 5 champs techniques.

### 4.2 Journal d'événements serveur (P2-1)
Nouvelle table `funnel_events` : `id`, `user_id` (nullable), `anon_id` (identifiant aléatoire anonyme stocké en localStorage, jamais lié à un email), `event_type`, `metadata` (JSON court, liste blanche), `created_at`.
Événements : `signup`, `first_analysis`, `pricing_viewed`, `premium_cta_clicked`, `checkout_started` (plan : premium/pro/credits/pack), `job_search_used`, `feature_used` (déjà couvert par `credit_transactions`).
Les événements d'achat ne viennent **jamais** du navigateur (voir 4.3).

### 4.3 Registre des paiements fiable (P1-4)
Nouvelle table `payments` : `stripe_event_id` (**UNIQUE** → anti-doublon), `user_id`, `kind` (`subscription_invoice`, `credit_purchase`, `job_pack`, `refund`), `amount`, `currency`, `plan`, `status`, `created_at`.
Nouvelle table `subscription_events` : `stripe_event_id` UNIQUE, `user_id`, `event` (`created`, `canceled`, `updated`), `plan`, `created_at` (donne enfin les résiliations datées et le churn réel).
Alimentées dans les gestionnaires de webhook existants (`invoice.paid`, `checkout.session.completed`, `customer.subscription.*`) par un simple ajout : **la logique Premium/Pack actuelle n'est pas modifiée**. Renseigne aussi `users.subscription_status`.
Un « achat confirmé » = une ligne `payments` issue d'un webhook signé. Un clic sur le bouton de paiement reste un `checkout_started`, jamais un achat.
Rattrapage de l'historique (2 abonnements, 0 achat de crédits, 0 Pack) possible en lisant l'API Stripe une fois, avec votre accord.

### 4.4 Comptes internes
Colonne `users.is_internal` (admin, test, système) renseignée une fois pour : `contact-form`, `dallyhermann@gmail.com`, `dallyhermann6@gmail.com`. Tous les indicateurs la filtrent par défaut (case « inclure les comptes internes » dans l'admin).

### 4.5 Tableau de bord marketing (Phase 3)
Nouvelle page `admin-marketing.html` (même shell que les autres pages admin, menu burger inclus) alimentée par une route `GET /admin/marketing/funnel?from=…&to=…` :
visiteurs par source (GA4, voir note), inscriptions par source, taux d'activation, taux de consultation des offres, achats confirmés, conversion en client payant par source, revenu récurrent réel, résiliations, performance du Pack (vues → clics → paiements démarrés → achats → activations).
Le taux de conversion de `admin-analytics.html` est remplacé par la formule documentée ci-dessous.

### 4.6 GA4 et consentement (P1-2, P2-2)
- Retirer le faux `purchase` et le `premium_activated` inconditionnel de `success.html`.
- Script commun `analytics.js` + bandeau de consentement : GA4 chargé en **Consent Mode v2 « refusé par défaut »**, activé seulement après acceptation. Événements `sign_up`, `view_pricing`, `begin_checkout`.
- Aucun contenu de CV, aucun email, aucun nom dans les événements.
- Option : envoi d'un `purchase` GA4 depuis le webhook (Measurement Protocol) pour que GA4 reflète les vrais achats — demande une clé d'API GA4 de votre part.

---

## 5. Définitions et formules (Phase 4)

Toutes les formules excluent `is_internal` et les comptes bannis, sauf mention contraire. Fuseau : Europe/Zurich. Période : choisie dans l'admin (7 j / 30 j / 90 j / personnalisée).

| Indicateur | Formule | Période |
|---|---|---|
| Inscrits | comptes créés dans la période | `created_at` dans la période |
| Taux d'activation | inscrits de la période ayant ≥ 1 analyse **dans les 7 jours suivant l'inscription** ÷ inscrits de la période | cohorte |
| Taux de consultation des offres | inscrits de la période ayant utilisé la recherche d'offres au moins une fois ÷ inscrits de la période | cohorte |
| Conversion en client payant (cohorte) | inscrits de la période devenus clients payants (≥ 1 ligne `payments` hors remboursement) ÷ inscrits de la période | cohorte, mesurée à ce jour |
| Conversion globale | clients Premium/Pro avec abonnement Stripe actif ÷ inscrits réels | instantané |
| Achats confirmés | lignes `payments` (hors `refund`) sur la période, dédoublonnées par `stripe_event_id` | date du paiement |
| Revenu récurrent réel (MRR) | somme du montant mensuel normalisé des abonnements Stripe **actifs** (remises comprises) | instantané |
| Résiliations | événements `canceled` dans `subscription_events` | période |
| Churn mensuel | résiliations du mois ÷ abonnements actifs en début de mois | mois |
| Pack : taux d'achat | achats Pack ÷ consultations uniques de la page Pack | période |

Anti-double comptage : identifiants Stripe uniques en base ; événements « premier contact » écrits une seule fois par utilisateur ; consultations comptées par `anon_id`/jour.
Limite connue : visiteurs par source viennent de GA4 uniquement (non reliés aux comptes), et uniquement après consentement.

---

## 6. Anomalies découvertes pendant l'audit (à traiter indépendamment du marketing)

1. **Prix des crédits fourni par le navigateur (critique).** `handleCreateCreditCheckout` (`index.js`, ~l.3986) lit `credits` et `amount` dans le corps de la requête et crée la session Stripe avec ces valeurs, sans table de prix côté serveur. Un utilisateur connecté qui modifie la requête peut payer un montant minimal et recevoir un nombre de crédits arbitraire. Le Pack, lui, est correctement fixé côté serveur (`JOB_PACK_CONFIG`). **Je n'ai rien testé ni exploité.** Correction proposée : table de prix côté serveur (2 / 5 / 8 CHF → crédits associés, à confirmer avec vous). Touche la facturation → validation requise.
2. **Retour de paiement sur un autre domaine.** Les achats de crédits (et l'ajout de carte) renvoient vers `swisscv-pro.pages.dev`, qui ne redirige pas vers `swisscv-pro.ch`. Le `localStorage` (connexion) n'y existe pas : l'acheteur revient sur un site où il paraît déconnecté. Cela peut expliquer en partie les **0 achat de crédits** depuis l'ouverture. Correction : remplacer l'URL de base par `https://swisscv-pro.ch` (comme pour le Pack).
3. **`customer.subscription.updated` recharge les crédits.** Chaque mise à jour d'abonnement (y compris une simple demande de résiliation en fin de période) remet le solde au plafond du plan. À corriger en ne rechargeant que sur `invoice.paid`.
4. **Pas de dédoublonnage des achats de crédits** si Stripe renvoie le webhook (le Pack est protégé, pas les crédits). Réglé par la table `payments` (§4.3).
5. **Statut non renseigné.** `subscription_status` reste vide pour les clients réels.

---

## 7. Décisions attendues de votre part

1. Valider le plan §4 (tables `funnel_events`, `payments`, `subscription_events`, colonnes d'attribution, `is_internal`, page `admin-marketing.html`) — je propose de procéder par étapes, chacune déployée et vérifiée avant la suivante :
   - Étape A : formule corrigée (conversion/MRR) + comptes internes + suppression du faux `purchase`. Aucun risque sur la facturation.
   - Étape B : attribution (UTM/source) à l'inscription.
   - Étape C : registre des paiements via webhooks (aucune modification de la logique Premium/Pack).
   - Étape D : funnel de vente + tableau de bord marketing.
   - Étape E : bandeau de consentement + GA4 complet.
2. Autoriser séparément les deux corrections de facturation (§6.1 table de prix serveur, §6.2 URL de retour) et me confirmer les paliers de crédits (2 / 5 / 8 CHF → combien de crédits ?).
3. Me dire si vous voulez un rattrapage de l'historique depuis l'API Stripe (nécessite une lecture ponctuelle avec votre clé).
4. Recouper dans le dashboard Stripe : abonnements actifs (2 attendus), remises SWISS20 utilisées, et les 5 comptes « client Stripe sans abonnement ».

---

## 8. Mise en œuvre (11.10.2026, après validation du plan)

| Étape | État | Détail |
|---|---|---|
| A — Formules, comptes internes, faux `purchase` | **Livrée** | `/admin/metrics` et le snapshot quotidien excluent internes/bannis et ne comptent qu'un abonnement Stripe réellement lié. Faux `purchase` et `premium_activated` retirés de `success.html` et `succes/index.html`. Route `/admin/metrics` dupliquée (churn codé en dur) supprimée. |
| B — Attribution | **Livrée** | `analytics.js` capture source/UTM/hôte du referrer/page d'arrivée (premier contact) ; envoyés à l'inscription et validés côté serveur. Valable uniquement pour les inscriptions faites à partir de maintenant. |
| C — Registre des paiements | **Livrée** | Tables `payments` et `subscription_events`, alimentées par les webhooks signés (anti-doublon). Logique Premium/Pack inchangée. Pas de rattrapage de l'historique (non autorisé). |
| D — Funnel + tableau de bord | **Livrée** | `/track`, événements serveur, route `/admin/marketing/funnel`, page `admin-marketing.html`, lien dans tous les menus admin. |
| E — Consentement + GA4 | **Livrée** | Bandeau Accepter/Refuser ; GA4 chargé seulement après « Accepter » ; GA4 retiré des 6 pages où il se chargeait sans consentement ; `sign_up` et `begin_checkout` ajoutés ; `cookies.html` mis à jour avec un bouton « Modifier mon choix ». |

Choix de confidentialité appliqués : Google Analytics = opt-in strict ; attribution first-party anonyme = active tant que le visiteur n'a pas cliqué « Refuser » (supprimée et désactivée après refus) ; identifiant anonyme et événements `/track` identifiés = seulement après « Accepter » (sans choix : événement agrégé sans identifiant ; après refus : rien).

Vérifié en production : bandeau affiché, aucune requête vers Google avant consentement, GA4 chargé après « Accepter », attribution enregistrée avec UTM, effacée après « Refuser », `/track` (insertion, dédoublonnage, rejet d'un événement non autorisé, CORS), requêtes SQL du tableau de bord sur les vraies données, logique du registre Stripe avec événements simulés. Non vérifié de bout en bout : une vraie inscription et un vrai paiement (création de compte/paiement interdits à l'assistant).

### Point supplémentaire découvert
Sur `pricing.html`, « Choisir Premium » mène à `login.html` sans mémoriser le plan : après connexion, l'utilisateur arrive sur l'application, pas sur le paiement. Un client décidé doit retrouver seul la page crédits pour payer. À corriger (non facturation, mais parcours d'achat) — à valider.
