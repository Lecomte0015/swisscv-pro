-- Migration: Create notifications table
-- Date: 2025-12-10
-- Description: Universal notification system for all users

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'team_invite', 'job_alert', 'application_update', 'system', 'team_activity'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT, -- JSON pour données spécifiques (team_id, job_id, etc.)
  read INTEGER DEFAULT 0, -- 0 = non lu, 1 = lu
  action_url TEXT, -- URL pour action (optionnel)
  action_label TEXT, -- Label du bouton d'action (ex: "Accepter", "Voir l'offre")
  created_at INTEGER NOT NULL,
  expires_at INTEGER, -- Optionnel, pour notifications temporaires
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
