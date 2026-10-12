-- Migration 029: Job alerts columns for saved_searches
ALTER TABLE saved_searches ADD COLUMN email_alerts INTEGER DEFAULT 0;
ALTER TABLE saved_searches ADD COLUMN last_alert_sent INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_saved_searches_alerts ON saved_searches(email_alerts, last_alert_sent);
