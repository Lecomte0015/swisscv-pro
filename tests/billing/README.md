# Tests facturation

Exécutent le **vrai** `index.js` contre une **vraie base D1 locale** (Miniflare/SQLite) avec Stripe, Resend et Supabase simulés.
Aucun appel réseau, aucune clé réelle, aucun paiement, aucune écriture en production.

```bash
node --test tests/billing/*.test.mjs
# Optionnel : tester une autre version du Worker (ex. avant correctifs)
WORKER_PATH=/chemin/vers/index.js node --test tests/billing/*.test.mjs
```

Ne pas lancer `node --test tests/billing/` (dossier entier) sur le disque externe : les fichiers `._*` créés par macOS font échouer le lanceur.

| Fichier | Couvre |
|---|---|
| `credits.test.mjs` | prix serveur, quantités invalides, signature, rejeu, concurrence, montants falsifiés, Pack, statut de paiement |
| `subscriptions.test.mjs` | `subscription.updated/deleted`, `invoice.paid`, Payment Link, checkout Premium, renouvellement du palier gratuit |
| `frontend.test.mjs` | retours de paiement (pas de preuve par l'URL), pages de succès, auto-checkout sans boucle |
| `intent.test.mjs` | mémorisation du plan choisi (liste blanche, expiration, stockage bloqué) |
| `marketing-regression.test.mjs` | étapes A à E du suivi marketing toujours fonctionnelles |
| `logs.test.mjs` | pas de secret ni d'email complet dans les journaux |
