# Campagnes email du back-office — étape 1 (12.10.2026)

**Statut : construit et testé, NON DÉPLOYÉ.** Production actuelle : Worker `047053e0-2325-430c-9b5b-e0ff523d7604`, pages `4cb87f04`.
Périmètre validé : éditeur + envoi + désinscription + historique (étape 1). Codes promo : étape suivante (crédits bonus d'abord). Aucun prix, crédit ni facturation modifié.

## Ce que le fondateur obtient

Un nouvel onglet **Marketing → Campagnes email** dans le back-office :
1. **Modèles** : Classique SwissCV, Pâques, Noël, Nouvel An, Saint-Valentin, Offre / code promo, Annonce. Mise en page, logo, police (Inter, repli Arial/Helvetica) et bouton rouge de la marque ; seul le bandeau change selon la fête. Chaque modèle arrive avec un texte français prêt à modifier.
2. **Contenu** modifiable : nom interne, sujet, texte d'aperçu, titre, texte (paragraphes, variable `{{prenom}}`), bouton (texte + lien https), code promo affiché (texte), signature. **Aperçu en direct** ordinateur / mobile, rendu par le serveur (identique à l'email réellement envoyé).
3. **Destinataires** avec compteur avant envoi et exemples masqués : utilisateurs actifs (≥ 1 analyse), gratuits actifs, abonnés Premium/Pro, actifs devenus inactifs (X jours), tous les inscrits (avec avertissement : adresses non vérifiées). **Toujours exclus** : désinscrits, comptes bannis, comptes internes, compte système.
4. **Test** envoyé uniquement à l'adresse de l'administrateur connecté (sujet précédé de [TEST]).
5. **Envoi** avec fenêtre de confirmation (« Envoyer à N personnes ? ») : le nombre confirmé doit correspondre exactement au nombre réel, sinon refus. Envoi par lots, **plafond journalier réglable** (quota du fournisseur), reprise automatique le lendemain par le cron, boutons *Reprendre* et *Arrêter l'envoi*.
6. **Suivi** : envoyés, en attente, échecs, ignorés, ouvertures, clics (via le webhook Resend déjà en place) ; liste des campagnes avec historique.
7. **Désinscription** : lien dans chaque email vers une page `https://swisscv-pro.ch/unsubscribe` (confirmation par bouton, réabonnement possible) + en-têtes `List-Unsubscribe` « un clic » reconnus par Gmail et Apple Mail. Jeton signé par compte (aucun accès à un autre compte).

## Fichiers

- `index.js` : `MKT_THEMES`, `renderMarketingEmail`, `mktCleanContent/Audience`, `mktAudienceQuery`, `processMarketingCampaign` (réservation atomique + plafond dans la requête), `resumeMarketingCampaigns` (cron), `handleMarketingRoutes` (routes `/admin/campaigns*` protégées par la porte admin, `/marketing/*` publiques et limitées en débit).
- `migrations/042_marketing_campaigns.sql` : colonnes `users.marketing_opt_out(_at)`, tables `marketing_campaigns`, `marketing_sends` (clé primaire campagne+utilisateur : jamais deux fois le même email).
- `admin-campaigns.html` (nouvelle page), `unsubscribe.html` (page publique), `admin/js/admin-shell.js` (entrée de menu), `robots.txt`.
- Tests : `tests/billing/campaigns.test.mjs` (17 tests) ; serveur de démonstration local `tests/billing/devserver.mjs` (jamais déployé).

## Garde-fous (tous testés)

- Un destinataire ne peut pas recevoir deux fois la même campagne, même avec lancements ou reprises simultanés.
- Une personne qui se désinscrit pendant un envoi échelonné est ignorée avant son tour.
- Un lot refusé temporairement (429 / 5xx) n'envoie rien et sera repris ; un refus définitif est marqué en échec et jamais réessayé ; une réponse perdue n'est jamais rejouée automatiquement (pas de doublon).
- Contenu saisi échappé (aucune injection HTML) ; liens du bouton uniquement en https ; code promo limité à lettres, chiffres, tirets.
- Journal d'audit : création, test, envoi, arrêt, suppression.

## Résultats des contrôles

- Tests locaux : 129/129 (dont 18 sur les campagnes).
- Préproduction (Worker + base D1 jetables, clé Resend factice, aucun email réel possible) : **87/87**, dont les 16 contrôles campagnes (lancements simultanés, doublons, plafond sur la vraie requête D1, reprises simultanées, arrêt, désinscription). L'environnement de test est supprimé.
- Défaut trouvé et corrigé pendant ces contrôles : avec une clé Resend refusée (401/403), tous les destinataires étaient marqués « échec » définitivement. Désormais ils restent en attente, l'envoi s'arrête, l'incident s'affiche dans la page de la campagne et l'envoi reprend dès que la clé est corrigée. L'arrêt d'une campagne ne peut plus être contourné par un envoi en cours.

## À savoir avant de s'en servir

1. **Base légale** : LCD suisse (art. 3) et RGPD exigent consentement ou relation client existante + désinscription claire. Le lien est dans chaque email. Recommandation : 1 à 2 campagnes par mois, première campagne sur un petit groupe, et ajouter ultérieurement une case d'acceptation à l'inscription.
2. **Quota Resend** : régler « Maximum d'emails par jour » selon votre abonnement (valeur par défaut 80, les emails automatiques consomment aussi le quota).
3. **« Tous les inscrits »** inclut des adresses jamais vérifiées (comptes sans analyse) : plus de rebonds, risque pour la réputation du domaine. Préférer « actifs ».
4. **Le champ « code promo »** affiche un texte dans l'email ; l'activation automatique du code dans l'application (crédits offerts) est l'étape suivante.
5. **Ouvertures** : fiables seulement si le suivi des ouvertures est activé sur le domaine dans Resend.

## Mise en production (à autoriser)

```bash
cd /Volumes/EVERDRIVE/swisscv-deploy
./scripts/d1-apply.sh swisscv-db migrations/042_marketing_campaigns.sql   # 1) migration (additive)
npx wrangler deploy                                                        # 2) Worker
./scripts/build-public.sh && npx wrangler pages deploy dist --project-name swisscv-pro --branch main --commit-dirty=true   # 3) pages
```
Retour arrière : Worker `npx wrangler rollback 047053e0-2325-430c-9b5b-e0ff523d7604 -y` ; pages : déploiement `4cb87f04` (tableau de bord Cloudflare) ; la migration n'a pas à être annulée (ajouts seulement, sans effet sur l'ancien Worker).
