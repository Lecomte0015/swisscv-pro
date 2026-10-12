#!/usr/bin/env bash
# Supprime l'environnement de test (noms vérifiés : jamais la production).
set -euo pipefail
cd "$(dirname "$0")/../.."
npx wrangler delete --name swisscv-pro-staging --force 2>&1 | grep -E "Successfully|✘|ERROR" || true
npx wrangler d1 delete swisscv-staging-tmp -y 2>&1 | grep -E "Deleted|✘|ERROR" || true
rm -f wrangler.staging.toml
echo "Environnement de test supprimé."
