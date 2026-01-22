-- Migration: Favoris d'offres d'emploi
-- Date: 2025-12-10

CREATE TABLE IF NOT EXISTS favorite_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  job_offer_id TEXT NOT NULL,
  job_title TEXT,
  job_company TEXT,
  job_location TEXT,
  job_data TEXT, -- JSON complet de l'offre
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_favorite_jobs_user ON favorite_jobs(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorite_jobs_unique ON favorite_jobs(user_id, job_offer_id);
