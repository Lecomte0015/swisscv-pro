# SwissCV Pro

Application web professionnelle de création et analyse de CV avec IA, développée avec Cloudflare Workers, D1 Database et Supabase.

## 🚀 Fonctionnalités

### Pour les Utilisateurs
- ✅ **Analyse de CV par IA** - Analyse approfondie avec recommandations personnalisées
- ✅ **Génération de lettres de motivation** - Lettres personnalisées par IA
- ✅ **Recherche d'emploi** - Intégration API Adzuna
- ✅ **Suivi des candidatures** - Gestion complète des applications
- ✅ **Templates de CV** - Bibliothèque de templates professionnels
- ✅ **Optimisation CV** - Suggestions d'amélioration par IA
- ✅ **Système de notifications** - Alertes en temps réel

### Dashboard Admin
- ✅ **Gestion des utilisateurs** - Liste, modification de plan, suppression (soft delete)
- ✅ **Statistiques en temps réel** - Utilisateurs par plan, inscriptions, métriques
- ✅ **Analytics** - Graphiques d'inscriptions et d'activité
- ✅ **Authentification sécurisée** - JWT avec rôles admin

### Plans d'Abonnement
- **Free** - Fonctionnalités de base
- **Premium** - Analyses illimitées + optimisation IA
- **Pro** - Toutes fonctionnalités + support prioritaire

## 🛠️ Stack Technique

- **Backend** : Cloudflare Workers (Serverless)
- **Base de données** : Cloudflare D1 (SQLite) + Supabase
- **Authentification** : Supabase Auth + JWT
- **IA** : Anthropic Claude API
- **Paiements** : Stripe
- **Recherche d'emploi** : Adzuna API
- **Frontend** : HTML/CSS/JavaScript vanilla

## 📦 Structure du Projet

```
swisscv-deploy/
├── worker.js                 # Cloudflare Worker principal
├── wrangler.toml            # Configuration Cloudflare
├── migrations/              # Migrations D1
├── *.html                   # Pages frontend
├── css/                     # Styles
├── js/                      # Scripts frontend
└── templates/               # Templates de CV
```

## 🚀 Déploiement

### Prérequis
- Node.js 18+
- Compte Cloudflare
- Compte Supabase
- Clés API (Anthropic, Stripe, Adzuna)

### Installation

1. **Cloner le repo**
```bash
git clone https://github.com/Lecomte0015/swisscv-pro.git
cd swisscv-pro
```

2. **Installer les dépendances**
```bash
npm install -g wrangler
```

3. **Configurer les secrets**
```bash
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put JWT_SECRET
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put ADZUNA_APP_ID
wrangler secret put ADZUNA_APP_KEY
```

4. **Créer la base D1**
```bash
wrangler d1 create swisscv-db
```

5. **Exécuter les migrations**
```bash
wrangler d1 migrations apply swisscv-db --remote
```

6. **Déployer le Worker**
```bash
wrangler deploy
```

7. **Déployer les Pages**
```bash
wrangler pages deploy . --project-name=swisscv-pro
```

## 🔐 Admin Dashboard

Accès : `https://votre-domaine.pages.dev/admin-login.html`

Créer un admin :
```bash
wrangler d1 execute swisscv-db --remote --command "
INSERT INTO admins (email, password_hash, full_name, role) 
VALUES ('admin@swisscv.ch', 'hash', 'Admin', 'super_admin')
"
```

## 📊 Base de Données

### Tables Principales
- `users` - Utilisateurs avec plans d'abonnement
- `cv_analyses` - Analyses de CV
- `job_applications` - Candidatures
- `cover_letters` - Lettres de motivation
- `notifications` - Notifications utilisateurs
- `admins` - Administrateurs

## 🔒 Sécurité

- ✅ Authentification JWT
- ✅ Validation des entrées
- ✅ Rate limiting
- ✅ CORS configuré
- ✅ Secrets chiffrés
- ✅ Soft delete pour audit trail

## 📝 Licence

Propriétaire - Tous droits réservés

## 👨‍💻 Auteur

Développé par Dally Hermann

## 🐛 Support

Pour toute question ou bug, contactez : dallyhermann@gmail.com
