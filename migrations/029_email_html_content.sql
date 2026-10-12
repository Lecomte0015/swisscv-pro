-- ============================================
-- Migration 029: Stockage HTML emails
-- Permet d'afficher le contenu d'un email
-- envoyé dans le back-office
-- ============================================

ALTER TABLE email_logs ADD COLUMN html_content TEXT;
