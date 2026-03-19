-- ============================================
-- Migration 027: Email séquence post-analyse
-- Email 2 (ATS éducation) envoyé J+2 après analyse
-- ============================================

ALTER TABLE users ADD COLUMN analysis_edu_email_sent INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_edu_email
  ON users(analysis_edu_email_sent, analysis_reminder_sent);
