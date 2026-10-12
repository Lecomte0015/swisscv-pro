-- Suivi marketing fiable (audit du 11.10.2026, AUDIT_MARKETING_2026-10-11.md)
-- Appliquer une instruction à la fois avec --command (le --file multi-ALTER échoue en non interactif).

-- Comptes internes (admin, test, système) exclus des indicateurs
ALTER TABLE users ADD COLUMN is_internal INTEGER DEFAULT 0;

-- Attribution "premier contact" — champs techniques uniquement, aucune donnée personnelle
ALTER TABLE users ADD COLUMN first_source TEXT;
ALTER TABLE users ADD COLUMN first_medium TEXT;
ALTER TABLE users ADD COLUMN first_campaign TEXT;
ALTER TABLE users ADD COLUMN first_referrer_host TEXT;
ALTER TABLE users ADD COLUMN first_landing_path TEXT;

-- Journal d'événements du funnel (jamais d'événement d'achat venant du navigateur)
CREATE TABLE IF NOT EXISTS funnel_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  anon_id TEXT,
  event_type TEXT NOT NULL,
  metadata TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_funnel_events_type_date ON funnel_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_funnel_events_user ON funnel_events(user_id);

-- Registre des paiements confirmés par webhook Stripe signé (stripe_event_id UNIQUE = anti-doublon)
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,
  user_id TEXT,
  kind TEXT NOT NULL,            -- subscription_invoice | credit_purchase | job_pack | refund
  amount INTEGER NOT NULL,       -- en centimes
  currency TEXT DEFAULT 'chf',
  plan TEXT,
  status TEXT DEFAULT 'paid',
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(created_at);

-- Historique daté des abonnements (donne les résiliations et le churn réel)
CREATE TABLE IF NOT EXISTS subscription_events (
  id TEXT PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,
  user_id TEXT,
  event TEXT NOT NULL,           -- created | canceled | updated
  plan TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_subscription_events_date ON subscription_events(created_at);

UPDATE users SET is_internal = 1
WHERE id = 'contact-form' OR email IN ('dallyhermann@gmail.com', 'dallyhermann6@gmail.com');
