#!/usr/bin/env bash
# Applique un fichier de migration SQL instruction par instruction (le --file multi-instructions échoue en non interactif).
# S'ARRÊTE à la première erreur. N'affiche aucun secret.
#
# Usage : scripts/d1-apply.sh <nom_base_d1> <fichier.sql> [fichier_wrangler.toml]
#   Production : scripts/d1-apply.sh swisscv-db migrations/039_billing_idempotency.sql
#   Test jetable : scripts/d1-apply.sh swisscv-staging-tmp migrations/039_billing_idempotency.sql wrangler.staging.toml
set -euo pipefail
DB="${1:?nom de la base D1}"; FILE="${2:?fichier SQL}"; CFG="${3:-}"
CFG_ARGS=(); [ -n "$CFG" ] && CFG_ARGS=(--config "$CFG")
python3 - "$FILE" <<'PY' > /tmp/d1_stmts_$$.txt
import re,sys
t=open(sys.argv[1],encoding='utf-8').read()
t=re.sub(r'--[^\n]*','',t)
for s in t.split(';'):
    s=' '.join(s.split())
    if s: print(s)
PY
N=0
while IFS= read -r stmt; do
  N=$((N+1))
  if npx wrangler d1 execute "$DB" --remote ${CFG_ARGS[@]+"${CFG_ARGS[@]}"} --command "$stmt" >/dev/null 2>/tmp/d1_err_$$.txt; then
    echo "OK  [$N] ${stmt:0:80}"
  else
    echo "ERREUR [$N] ${stmt:0:80}"; tail -3 /tmp/d1_err_$$.txt; rm -f /tmp/d1_stmts_$$.txt /tmp/d1_err_$$.txt; exit 1
  fi
done < /tmp/d1_stmts_$$.txt
rm -f /tmp/d1_stmts_$$.txt /tmp/d1_err_$$.txt
echo "Terminé : $N instruction(s) appliquée(s) sur $DB"
