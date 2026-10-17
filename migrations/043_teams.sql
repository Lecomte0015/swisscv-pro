-- 043 — Équipes du plan Pro (lot 1)
-- Les tables teams / team_members / team_invitations existaient déjà en production (créées à la main, jamais
-- versionnées). Ce fichier les documente à l'identique (CREATE ... IF NOT EXISTS : sans effet sur la base de prod)
-- et ajoute le suivi de consommation des crédits partagés de l'équipe.

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'pro',
  max_members INTEGER DEFAULT 5,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  invited_by TEXT,
  joined_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS team_invitations (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  invited_by TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  created_at INTEGER DEFAULT (unixepoch()),
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES users(id)
);

-- Crédits pris sur le pot commun de l'équipe (compte du propriétaire), par membre.
-- amount est diminué si l'opération échoue et que les crédits sont rendus.
CREATE TABLE IF NOT EXISTS team_credit_usage (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id, status);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team ON team_invitations(team_id, status);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_credit_usage_team ON team_credit_usage(team_id, created_at);
