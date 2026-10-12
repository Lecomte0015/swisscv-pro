#!/usr/bin/env bash
# Crée l'environnement de test JETABLE (Worker swisscv-pro-staging + base D1 swisscv-staging-tmp), sans aucun lien avec la production.
# Usage : tests/staging/setup.sh <schema.json> <fichier_env_de_sortie>
#   schema.json = résultat de `wrangler d1 execute swisscv-db --remote --json --command "SELECT name, sql FROM sqlite_master WHERE type='table'"`
set -euo pipefail
cd "$(dirname "$0")/../.."
SCHEMA="${1:?schema.json}"; OUT="${2:?fichier env de sortie}"
DBN=swisscv-staging-tmp
npx wrangler d1 create $DBN 2>&1 | grep -E "Successfully|already" || true
DBID=$(npx wrangler d1 list 2>&1 | grep "$DBN" | grep -oE "[0-9a-f]{8}-[0-9a-f-]{27}" | head -1)
[ -n "$DBID" ] || { echo "base de test introuvable"; exit 1; }
[ "$DBID" != "b3ec1eb9-5e18-4e92-a0e4-7fa47e1fa3e0" ] || { echo "REFUS : identifiant de la production"; exit 1; }
JWT=$(openssl rand -hex 32); WH=whsec_$(openssl rand -hex 24)
printf 'STAGING_JWT_SECRET=%s\nSTAGING_WEBHOOK_SECRET=%s\nSTAGING_DB_NAME=%s\nSTAGING_DB_ID=%s\n' "$JWT" "$WH" "$DBN" "$DBID" > "$OUT"; chmod 600 "$OUT"
cat > wrangler.staging.toml <<TOML
name = "swisscv-pro-staging"
main = "index.js"
compatibility_date = "2025-11-14"
[[d1_databases]]
binding = "DB"
database_name = "$DBN"
database_id = "$DBID"
[vars]
ENVIRONMENT = "staging"
JWT_SECRET = "$JWT"
STRIPE_WEBHOOK_SECRET = "$WH"
STRIPE_SECRET_KEY = "sk_test_staging_dummy_not_a_real_key"
SUPABASE_URL = "https://supabase.invalid"
SUPABASE_ANON_KEY = "staging-dummy"
SUPABASE_SERVICE_ROLE_KEY = "staging-dummy"
ANTHROPIC_API_KEY = "staging-dummy"
RAPIDAPI_KEY = "staging-dummy"
ADZUNA_APP_ID = "staging-dummy"
ADZUNA_APP_KEY = "staging-dummy"
RESEND_API_KEY = "re_staging_dummy_invalid_key"
TOML
python3 - "$SCHEMA" > /tmp/staging_stmts_$$.txt <<'PY'
import json,re,sys
d=json.load(open(sys.argv[1]))[0]['results']
for t in ['users','credit_transactions','job_pack_events','email_logs','free_usage','cv_analyses','saved_searches','admin_logs','metrics_snapshots','feedback_responses','ai_usage','cv_builder_documents','job_applications']:
    sql=[r['sql'] for r in d if r['name']==t][0]
    print(' '.join(re.sub(r'--[^\n]*','',sql).split()))
PY
while IFS= read -r line; do npx wrangler d1 execute $DBN --remote --config wrangler.staging.toml --command "$line" >/dev/null 2>&1 || { echo "ECHEC table : ${line:0:50}"; exit 1; }; done < /tmp/staging_stmts_$$.txt; rm -f /tmp/staging_stmts_$$.txt
for m in 038_marketing_tracking 039_billing_idempotency 040_feedback_single_credit 041_rate_limits 042_marketing_campaigns; do ./scripts/d1-apply.sh $DBN migrations/$m.sql wrangler.staging.toml | tail -1; done
npx wrangler deploy index.js --config wrangler.staging.toml 2>&1 | grep -E "^Uploaded|^Deployed|Current Version|✘|ERROR"
echo "Environnement de test prêt. Variables dans $OUT (hors dépôt)."
