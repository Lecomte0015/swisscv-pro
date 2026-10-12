-- Campagnes email marketing (12.10.2026) : désinscription, campagnes, suivi d'envoi par destinataire.
ALTER TABLE users ADD COLUMN marketing_opt_out INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN marketing_opt_out_at INTEGER;

CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'classique',
  content_json TEXT NOT NULL DEFAULT '{}',
  audience_json TEXT NOT NULL DEFAULT '{}',
  daily_cap INTEGER NOT NULL DEFAULT 80,
  status TEXT NOT NULL DEFAULT 'draft',      -- draft | sending | sent | cancelled
  total_recipients INTEGER NOT NULL DEFAULT 0,
  created_by TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  started_at INTEGER,
  completed_at INTEGER
);

-- Une ligne par destinataire et par campagne : la clé primaire garantit qu'une personne ne reçoit jamais deux fois la même campagne
CREATE TABLE IF NOT EXISTS marketing_sends (
  campaign_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',    -- pending | sending | sent | failed | skipped
  resend_id TEXT,
  error TEXT,
  claimed_at INTEGER,
  sent_at INTEGER,
  PRIMARY KEY (campaign_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_marketing_sends_status ON marketing_sends(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_marketing_sends_sent_at ON marketing_sends(sent_at);
