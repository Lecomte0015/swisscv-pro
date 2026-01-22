# SwissCV Pro

Plateforme complète d'aide à la recherche d'emploi avec analyse CV par IA, génération de lettres de motivation, et suivi des candidatures.

## 🎯 Fonctionnalités

### ✅ Opérationnelles
- **Recherche d'Offres** : Recherche via API Adzuna avec filtres avancés
- **Recherches Sauvegardées** : Sauvegarde et exécution de recherches personnalisées
- **Analyse CV** : Analyse par IA (Claude) avec suggestions d'amélioration
- **Génération Lettres** : Lettres de motivation personnalisées par IA
- **Job Tracker** : Suivi des candidatures avec statuts et notes
- **Authentification** : Système JWT avec tiers gratuit/premium/pro

## 🚀 Déploiement

### Worker Cloudflare
```bash
npx wrangler deploy
```

**Version actuelle** : `09c35271-de9f-4f1a-a7ab-a30ae1aac790`  
**URL** : https://swisscv-pro.dallyhermann-71e.workers.dev

### Pages Cloudflare
```bash
npx wrangler pages deploy . --project-name=swisscv-pro
```

**URL** : https://swisscv-pro.pages.dev  
**Domaine** : https://swisscv-pro.ch

## 🔧 Configuration

### Secrets Cloudflare
```bash
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put ADZUNA_API_KEY
npx wrangler secret put JWT_SECRET
```

### Fichiers Locaux (Non Versionnés)
- `index.js` - Worker principal avec clés API
- `worker.js` - Copie de index.js
- Voir `RELANCE_PROJET.md` pour instructions complètes

## 📚 Documentation

- **RELANCE_PROJET.md** - Guide de relance après clone
- **session_summary.md** - Résumé session debugging 15h
- **walkthrough.md** - Guide détaillé des fixes appliqués

## 🐛 Problèmes Résolus (16 Dec 2025)

Après 15+ heures de debugging :

1. **Redirection Login** : Fonction `authenticatedFetch` dupliquée dans job-search.html
2. **Recherches Sauvegardées** : Route analytics piégeait routes suivantes
3. **Exécution Recherches** : Endpoint `/searches/{id}/execute` manquant

Voir `walkthrough.md` pour détails complets.

## 🛠️ Stack Technique

- **Backend** : Cloudflare Workers
- **Frontend** : HTML/CSS/JavaScript vanilla
- **Database** : Cloudflare D1 (SQLite)
- **IA** : Claude 3.5 Sonnet (Anthropic)
- **API Jobs** : Adzuna

## 📝 License

Propriétaire - SwissCV Pro
