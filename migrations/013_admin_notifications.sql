-- Migration 013: Admin Notifications
-- Système de notifications temps réel pour les admins

CREATE TABLE IF NOT EXISTS admin_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch())
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_notif_admin ON admin_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_notif_read ON admin_notifications(read);
CREATE INDEX IF NOT EXISTS idx_notif_created ON admin_notifications(created_at);

-- Données de test
INSERT INTO admin_notifications (admin_id, type, title, message, link) VALUES
(1, 'new_user', 'Nouvel utilisateur', 'user@example.com vient de s''inscrire', '/admin-users.html'),
(1, 'urgent_ticket', 'Ticket urgent', 'Nouveau ticket priorité haute #42', '/admin-support.html'),
(NULL, 'system_info', 'Système', 'Mise à jour disponible', NULL);
