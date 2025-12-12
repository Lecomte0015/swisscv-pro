-- ============================================================
-- Migration 005: Job Tracker Improvements
-- Adds: Statistics, Timeline, Notes, Reminders
-- ============================================================

-- Ajouter nouvelles colonnes à job_applications
ALTER TABLE job_applications ADD COLUMN deadline INTEGER;
ALTER TABLE job_applications ADD COLUMN reminder_date INTEGER;
ALTER TABLE job_applications ADD COLUMN status_history TEXT DEFAULT '[]';
ALTER TABLE job_applications ADD COLUMN priority TEXT DEFAULT 'medium';
ALTER TABLE job_applications ADD COLUMN salary_expectation INTEGER;
ALTER TABLE job_applications ADD COLUMN last_status_change INTEGER;

-- Initialiser last_status_change avec applied_date pour les lignes existantes
UPDATE job_applications SET last_status_change = applied_date WHERE last_status_change IS NULL;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_applications_deadline ON job_applications(deadline);
CREATE INDEX IF NOT EXISTS idx_applications_reminder ON job_applications(reminder_date);
CREATE INDEX IF NOT EXISTS idx_applications_priority ON job_applications(priority);

-- Table pour l'historique des notes (séparée pour meilleure structure)
CREATE TABLE IF NOT EXISTS application_notes (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  note_text TEXT NOT NULL,
  tags TEXT DEFAULT '[]',
  created_at INTEGER NOT NULL,
  FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_notes_application ON application_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_notes_created ON application_notes(created_at);
