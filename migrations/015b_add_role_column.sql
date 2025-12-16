-- Migration 015b: Ajouter colonne role_id à admins
-- Séparé car ALTER TABLE peut échouer si la colonne existe déjà

ALTER TABLE admins ADD COLUMN role_id INTEGER DEFAULT 1 REFERENCES admin_roles(id);

-- Définir l'admin existant comme super_admin
UPDATE admins SET role_id = 1 WHERE email = 'dallyhermann@gmail.com';
