# Pack Recherche d'Emploi — Fiche produit

Statut : **en production** (déployé le 21.08.2026). Voir [PACK_IMPLEMENTATION_PLAN.md](PACK_IMPLEMENTATION_PLAN.md) pour l'audit technique complet.

## Positionnement

Pas "des crédits" — une solution : *"Aide-moi à améliorer mes candidatures et à augmenter mes chances de décrocher un emploi."* Complète l'offre existante (Gratuit / Premium), ne les remplace pas.

## Prix

**CHF 19.90, paiement unique.** Aucun abonnement, aucun renouvellement automatique. Prix fixé par estimation manuelle (pas encore validé par des données `ai_usage` réelles — voir section "Ce qui reste à vérifier" ci-dessous).

Prix centralisé dans une seule constante (`JOB_PACK_CONFIG` dans `index.js`) — modifier le prix ne demande qu'un seul changement, redéployé.

## Contenu

55 crédits sans expiration, utilisables sur toutes les fonctionnalités IA existantes (à titre indicatif : 20 analyses CV + 10 lettres + 5 candidatures 1-clic, ou toute autre combinaison — pas de compartimentage forcé, le système de crédits existant est réutilisé tel quel).

## Différence avec Gratuit

Gratuit : 5 crédits offerts une fois à l'inscription (pas de renouvellement mensuel réel malgré ce qui est affiché ailleurs sur le site — voir limite connue ci-dessous), sert à découvrir le produit.

## Différence avec Premium

Premium : abonnement CHF 9.–/mois, 100 crédits renouvelés chaque mois, pensé pour une recherche active et continue. Pack : paiement unique, pensé pour une recherche ponctuelle (2 semaines à quelques mois). Les deux ne sont pas exclusifs — un utilisateur peut acheter le Pack puis passer à Premium plus tard.

## Stratégie de conversion

Le Pack ne remplace pas Premium, il capte un segment différent (recherche ponctuelle vs. continue). Point d'entrée principal : bannière sur `credits.html`, plus les 6 pages SEO déjà publiées (`cv-suisse`, `modele-cv-suisse`, `cv-ats`, `analyse-cv`, `adapter-cv-offre-emploi`, `lettre-motivation-suisse`) qui peuvent pointer vers le Pack en plus de l'essai gratuit.

## Stratégie d'upsell / downsell

**Non implémenté en V1** (scope volontairement réduit — voir plan d'implémentation). Le tableau comparatif sur la page de vente sert de point de contact statique entre les trois offres ; un upsell comportemental (ex. "vous approchez la fin de votre pack") pourra être ajouté une fois qu'il y a des achats réels à observer.

## KPI

Trackés dès maintenant via la table `job_pack_events` (`viewed`, `cta_clicked`, côté client ; `checkout_started`, `purchased`, `activated`, côté serveur) et `credit_transactions` (action_type `job_pack_purchase`). Pas de dashboard dédié en V1 — à construire une fois qu'il y a du volume à visualiser. Requêtes de suivi manuel :

```sql
-- Taux de clic / conversion
SELECT event_type, COUNT(*) FROM job_pack_events GROUP BY event_type;

-- Packs vendus et revenu
SELECT COUNT(*), SUM(-credits_used) FROM credit_transactions WHERE action_type = 'job_pack_purchase';
```

## Ce qui reste à vérifier avant de considérer le prix comme définitif

Le prix de CHF 19.90 a été fixé par estimation manuelle des coûts IA (modèles/tokens utilisés), pas encore par mesure réelle. Le tracking `ai_usage` est branché depuis le 21.08.2026 — dans quelques jours, relancer :

```bash
npx wrangler d1 execute swisscv-db --remote --command "SELECT feature, COUNT(*) n, AVG(cost_estimate) avg_cost_usd FROM ai_usage GROUP BY feature;"
```

pour confirmer que la marge réelle correspond à l'estimation (voir calcul détaillé dans le plan d'implémentation).

## Tests effectués

- Checkout non authentifié → 401 ✅
- Événement de tracking invalide → 400 rejeté ✅
- Événement de tracking valide → enregistré en base, `user_id` NULL accepté pour visiteur anonyme ✅
- Page de vente : JSON-LD valide, balises HTML/SVG équilibrées, FAQ interactive fonctionnelle, tableau comparatif responsive (scroll horizontal mobile) ✅
- Protection anti-double-traitement webhook (`json_extract` sur `session_id` dans `job_pack_events`) en place, pas encore testée avec un vrai double envoi Stripe ⏳
- Achat réel de bout en bout (paiement → webhook → crédits → email) : **pas encore testé avec une vraie carte** ⏳ — à faire par toi lors du premier achat réel ou via le mode test Stripe si activé

## Non fait volontairement en V1 (voir plan d'implémentation pour le détail)

Tests A/B prix/positionnement, dashboard KPI dédié, onboarding personnalisé métier/secteur/région, upsell/downsell comportemental, pages SEO supplémentaires dédiées au Pack.
