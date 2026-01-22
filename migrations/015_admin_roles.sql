-- Migration 015: Admin Roles & Permissions
-- Système de rôles avec permissions granulaires

-- Table des rôles
CREATE TABLE IF NOT EXISTS admin_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    permissions TEXT NOT NULL, -- JSON array
    description TEXT,
    created_at INTEGER DEFAULT (unixepoch())
);

-- Ajouter colonne role_id à admins (si elle n'existe pas déjà)
-- Note: SQLite ne supporte pas ALTER TABLE IF NOT EXISTS, donc on ignore l'erreur si la colonne existe
-- ALTER TABLE admins ADD COLUMN role_id INTEGER DEFAULT 1 REFERENCES admin_roles(id);

-- Rôles prédéfinis avec permissions
INSERT INTO admin_roles (id, name, display_name, permissions, description) VALUES
(1, 'super_admin', 'Super Administrateur', '["*"]', 'Accès complet à toutes les fonctionnalités'),
(2, 'admin', 'Administrateur', '["users.view","users.edit","users.delete","support.view","support.manage","analytics.view","analytics.export","logs.view","settings.manage"]', 'Gestion complète sauf création d''autres admins'),
(3, 'support', 'Support Client', '["users.view","users.edit","support.view","support.manage","analytics.view"]', 'Gestion du support et consultation des utilisateurs'),
(4, 'viewer', 'Observateur', '["users.view","analytics.view","support.view","logs.view"]', 'Consultation uniquement, aucune modification');

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role_id);

-- Définir l'admin existant comme super_admin
-- UPDATE admins SET role_id = 1 WHERE email = 'dallyhermann@gmail.com';
