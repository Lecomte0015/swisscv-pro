-- ============================================
-- Migration 025: Email Automation Tracking
-- Colonnes pour suivre les emails automatiques
-- et éviter les doublons d'envoi
-- ============================================

-- Suivi des emails d'automation (0 = pas envoyé, timestamp = date d'envoi)
ALTER TABLE users ADD COLUMN j3_reminder_sent INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN j7_upgrade_sent INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN credits_depleted_email_sent INTEGER DEFAULT 0;

-- Index pour les requêtes de la cron (performances)
CREATE INDEX IF NOT EXISTS idx_users_j3_reminder
  ON users(created_at, j3_reminder_sent, subscription_tier);

CREATE INDEX IF NOT EXISTS idx_users_j7_upgrade
  ON users(created_at, j7_upgrade_sent, subscription_tier);
