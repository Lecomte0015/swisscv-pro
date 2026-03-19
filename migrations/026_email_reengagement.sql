-- ============================================
-- Migration 026: Re-engagement & post-analyse email tracking
-- ============================================

-- Email A : users existants sans analyse (0 analyse)
ALTER TABLE users ADD COLUMN reengagement_email_sent INTEGER DEFAULT 0;

-- Email B : rappel post-analyse (score + crédits restants)
ALTER TABLE users ADD COLUMN analysis_reminder_sent INTEGER DEFAULT 0;

-- Email C : J+14 toujours free
ALTER TABLE users ADD COLUMN j14_upgrade_sent INTEGER DEFAULT 0;

-- Index pour les requêtes cron
CREATE INDEX IF NOT EXISTS idx_users_reengagement
  ON users(reengagement_email_sent, created_at);

CREATE INDEX IF NOT EXISTS idx_users_analysis_reminder
  ON users(analysis_reminder_sent);
