-- Migration 012: Admin Audit Logs
-- Traçabilité complète des actions admin

CREATE TABLE IF NOT EXISTS admin_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details TEXT,
    ip_address TEXT,
    created_at INTEGER DEFAULT (unixepoch())
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_logs_created ON admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_target ON admin_logs(target_type, target_id);

-- Exemples de données pour test
INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address) VALUES
(1, 'admin.login', NULL, NULL, '{"success": true}', '127.0.0.1'),
(1, 'user.update', 'user', '6e149d2e-3f9d-48c9-a9bf-4b405c1f0e7a', '{"field": "subscription_tier", "old": "free", "new": "premium"}', '127.0.0.1'),
(1, 'user.delete', 'user', '7f259e3f-4g5a-59d0-b0c8-5c516d2g1f1b', '{"reason": "spam"}', '127.0.0.1');
