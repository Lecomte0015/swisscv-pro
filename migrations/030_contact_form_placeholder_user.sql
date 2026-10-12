-- Migration 030: Utilisateur système pour le formulaire de contact public
-- support_tickets.user_id a une contrainte FOREIGN KEY vers users(id).
-- Le formulaire de contact est public (pas de compte requis), donc on lui
-- attache un utilisateur placeholder au lieu de violer la contrainte.

INSERT OR IGNORE INTO users (id, email, subscription_tier, created_at, updated_at)
VALUES ('contact-form', 'contact-form@swisscv-pro.ch', 'free', unixepoch(), unixepoch());
