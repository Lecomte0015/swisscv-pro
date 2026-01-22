-- Migration 011: Support Tickets System
-- Création du système de tickets de support pour le back-office admin

-- Table principale des tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- open, in_progress, resolved
    priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
    assigned_to INTEGER, -- admin_id
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON support_tickets(created_at);

-- Table des réponses aux tickets
CREATE TABLE IF NOT EXISTS ticket_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    admin_id INTEGER,
    message TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id),
    FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- Index pour les réponses
CREATE INDEX IF NOT EXISTS idx_replies_ticket ON ticket_replies(ticket_id);
