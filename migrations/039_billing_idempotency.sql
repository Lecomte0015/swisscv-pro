-- Sécurisation des achats (mission du 11.10.2026).
-- Appliquer une instruction à la fois avec --command.

-- Une session Stripe Checkout (crédits / Pack) ne peut créditer qu'une seule fois :
-- la clé primaire fait échouer toute seconde tentative, y compris en concurrence.
CREATE TABLE IF NOT EXISTS processed_checkout_sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,            -- credit_purchase | job_pack
  credits INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_processed_sessions_user ON processed_checkout_sessions(user_id);

-- Événements Stripe déjà traités pour les opérations qui ajoutent des crédits (invoice.paid).
CREATE TABLE IF NOT EXISTS processed_stripe_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);
