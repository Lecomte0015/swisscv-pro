-- Créer la table job_applications si elle n'existe pas
CREATE TABLE IF NOT EXISTS job_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  job_url TEXT,
  status TEXT DEFAULT 'a_consulter',
  applied_date INTEGER DEFAULT (unixepoch()),
  deadline INTEGER,
  reminder_date INTEGER,
  status_history TEXT DEFAULT '[]',
  priority TEXT DEFAULT 'medium',
  salary_expectation INTEGER,
  last_status_change INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  deleted_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index
CREATE INDEX IF NOT EXISTS idx_job_applications_user ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_deleted ON job_applications(deleted_at);
CREATE INDEX IF NOT EXISTS idx_job_applications_created ON job_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_deadline ON job_applications(deadline);
CREATE INDEX IF NOT EXISTS idx_applications_reminder ON job_applications(reminder_date);
CREATE INDEX IF NOT EXISTS idx_applications_priority ON job_applications(priority);

-- Table notes
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
