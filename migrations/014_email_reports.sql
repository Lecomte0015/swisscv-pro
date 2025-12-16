-- Migration 014: Email Reports System
-- Configuration et historique des rapports email automatisés

-- Table pour configuration des rapports email
CREATE TABLE IF NOT EXISTS email_report_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    frequency TEXT NOT NULL CHECK(frequency IN ('weekly', 'monthly', 'disabled')),
    email TEXT NOT NULL,
    last_sent INTEGER,
    enabled INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- Table pour historique des envois
CREATE TABLE IF NOT EXISTS email_report_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    report_type TEXT NOT NULL CHECK(report_type IN ('weekly', 'monthly', 'manual')),
    sent_at INTEGER DEFAULT (unixepoch()),
    status TEXT NOT NULL CHECK(status IN ('success', 'failed')),
    error_message TEXT,
    stats_snapshot TEXT, -- JSON avec les stats envoyées
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_email_settings_admin ON email_report_settings(admin_id);
CREATE INDEX IF NOT EXISTS idx_email_settings_enabled ON email_report_settings(enabled);
CREATE INDEX IF NOT EXISTS idx_email_history_admin ON email_report_history(admin_id);
CREATE INDEX IF NOT EXISTS idx_email_history_sent ON email_report_history(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_history_status ON email_report_history(status);

-- Configuration par défaut pour admin existant
INSERT INTO email_report_settings (admin_id, frequency, email, enabled)
SELECT id, 'weekly', email, 1 
FROM admins 
WHERE email = 'dallyhermann@gmail.com'
AND NOT EXISTS (SELECT 1 FROM email_report_settings WHERE admin_id = admins.id);
