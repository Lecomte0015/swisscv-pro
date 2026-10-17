#!/usr/bin/env bash
# Construit dist/ : UNIQUEMENT ce qui doit être public sur swisscv-pro.ch.
# Avant ce script, `wrangler pages deploy .` publiait aussi index.js (code du Worker), wrangler.toml, les .md, migrations/, etc.
# Usage :  scripts/build-public.sh   puis   npx wrangler pages deploy dist --project-name swisscv-pro --branch main
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist && mkdir dist

# Fichiers racine publics (liste blanche)
for f in *.html _headers _redirects robots.txt sitemap.xml analytics.js checkout-intent.js sync-user.js favicon.ico site.webmanifest; do
  [ -f "$f" ] && cp "$f" dist/
done
# Dossiers publics (liste blanche)
for d in accueil analyseur-cv modeles-cv modeles-emails succes tarifs admin public templates brand; do
  [ -d "$d" ] && cp -R "$d" dist/
done
# Nettoyage : fichiers parasites du disque externe / macOS et documents internes éventuels
find dist \( -name '._*' -o -name '.DS_Store' -o -name '*.md' -o -name '*.sql' -o -name '*.map' \) -type f -delete 2>/dev/null || true

# Garde-fous : rien de sensible ne doit se retrouver dans dist/
FORBIDDEN=$(find dist \( -name 'index.js' -path 'dist/index.js' -o -name 'wrangler*.toml' -o -name 'package*.json' -o -name 'env.example' -o -name 'CLAUDE.md' -o -path 'dist/migrations*' -o -path 'dist/tests*' -o -path 'dist/scripts*' -o -path 'dist/node_modules*' \) | head)
if [ -n "$FORBIDDEN" ]; then echo "ERREUR : fichiers interdits dans dist/ :"; echo "$FORBIDDEN"; exit 1; fi
if grep -rIlE "sk_live_|sk_test_[A-Za-z0-9]{10,}|whsec_[A-Za-z0-9]{10,}|sk-ant-|re_[A-Za-z0-9]{20,}" dist >/dev/null 2>&1; then echo "ERREUR : motif de secret détecté dans dist/"; exit 1; fi
echo "dist/ prêt : $(find dist -type f | wc -l | tr -d ' ') fichiers, $(du -sh dist | cut -f1)"
