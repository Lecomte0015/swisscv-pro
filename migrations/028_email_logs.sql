-- ============================================
-- Migration 028: Table de logs emails
-- Tracking envoi, ouverture et clics emails
-- ============================================

CREATE TABLE IF NOT EXISTS email_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'unknown',
  subject TEXT,
  resend_id TEXT,
  sent_at TEXT DEFAULT (datetime('now')),
  opened_at TEXT,
  clicked_at TEXT,
  status TEXT DEFAULT 'sent'
);

CREATE INDEX IF NOT EXISTS idx_email_logs_email ON email_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(template_type, sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent ON email_logs(sent_at);
