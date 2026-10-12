-- ============================================================
-- Migration 032: Pack Recherche d'Emploi
-- Extension du système de crédits existant (pas de nouvelle table de crédits)
-- ============================================================

ALTER TABLE users ADD COLUMN has_job_pack INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN job_pack_purchased_at INTEGER;
ALTER TABLE users ADD COLUMN job_pack_reminder_sent INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS job_pack_events (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  event_type TEXT NOT NULL, -- 'viewed','cta_clicked','checkout_started','purchased','activated'
  metadata TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_job_pack_events_user ON job_pack_events(user_id);
CREATE INDEX IF NOT EXISTS idx_job_pack_events_type ON job_pack_events(event_type);
