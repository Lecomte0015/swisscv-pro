# Guide de Relance du Projet SwissCV Pro

## Fichiers Contenant les Clés API

Les clés API sont stockées dans ces fichiers (NON versionnés sur GitHub) :

1. **index.js** (lignes 10-11)
   ```javascript
   const ANTHROPIC_API_KEY = 'sk-ant-...';
   const ADZUNA_API_KEY = '...';
   ```

2. **worker.js** (copie de index.js)

## Après Clone du Repo

### 1. Récupérer les Clés API

Les clés sont stockées dans **Cloudflare Workers Secrets** :

```bash
cd /Users/dallyhermann/Desktop/swisscv-deploy

# Lister les secrets
npx wrangler secret list

# Les secrets sont :
# - ANTHROPIC_API_KEY
# - ADZUNA_API_KEY  
# - JWT_SECRET
```

### 2. Créer index.js et worker.js Localement

```bash
# Copier depuis le worker déployé
npx wrangler tail swisscv-pro --format=pretty

# OU récupérer depuis backup local (si disponible)
cp index-backup-brace.js index.js
cp index.js worker.js
```

### 3. Ajouter les Clés API

Éditer `index.js` et ajouter aux lignes 10-11 :

```javascript
// Ligne 10
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'sk-ant-api03-VOTRE_CLE_ICI';

// Ligne 11  
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY || 'VOTRE_CLE_ICI';
```

### 4. Copier vers worker.js

```bash
cp index.js worker.js
```

### 5. Déployer

```bash
# Worker
npx wrangler deploy

# Pages
npx wrangler pages deploy . --project-name=swisscv-pro
```

## Où Trouver les Clés API

### Anthropic API Key
1. Aller sur https://console.anthropic.com/
2. Settings → API Keys
3. Copier la clé `sk-ant-api03-...`

### Adzuna API Key
1. Aller sur https://developer.adzuna.com/
2. Dashboard → Your API Keys
3. Copier App ID et App Key

### JWT Secret
```bash
# Générer un nouveau secret
openssl rand -base64 32
```

## Configuration Cloudflare Secrets

```bash
# Définir les secrets (recommandé)
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put ADZUNA_API_KEY
npx wrangler secret put JWT_SECRET
```

Puis dans `index.js`, utiliser :
```javascript
const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
const ADZUNA_API_KEY = env.ADZUNA_API_KEY;
```

## Fichiers Importants NON Versionnés

- `index.js` - Worker principal avec clés API
- `worker.js` - Copie de index.js
- `*.backup` - Backups de fichiers
- `worker-*.js` - Backups worker

Ces fichiers sont dans `.gitignore` et ne seront JAMAIS poussés sur GitHub.

## Backup Local Recommandé

```bash
# Créer backup avec clés (LOCAL SEULEMENT)
tar -czf ~/swisscv-backup-with-secrets-$(date +%Y%m%d).tar.gz \
  index.js worker.js wrangler.toml

# Stocker dans un endroit sûr (pas sur GitHub !)
```

## En Cas de Perte des Clés

1. **Anthropic** : Générer nouvelle clé sur console.anthropic.com
2. **Adzuna** : Utiliser clés existantes du dashboard
3. **JWT_SECRET** : Générer nouveau avec `openssl rand -base64 32`
   - ⚠️ Cela invalidera tous les tokens utilisateurs existants

## Vérification

```bash
# Tester que le worker fonctionne
curl -X POST "https://swisscv-pro.dallyhermann-71e.workers.dev/jobs/search" \
  -H "Content-Type: application/json" \
  -d '{"keywords":"developer","location":"Geneva"}' | jq .

# Devrait retourner des offres d'emploi
```

---

**Important** : Ne JAMAIS commit `index.js` ou `worker.js` sur GitHub !
