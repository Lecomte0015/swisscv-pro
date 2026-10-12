-- Réponses au formulaire de feedback envoyé aux utilisateurs free ayant déjà
-- analysé un CV : pourquoi ils ne sont pas passés Premium.
CREATE TABLE IF NOT EXISTS feedback_responses (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT NOT NULL,
  blocker_reason TEXT NOT NULL,
  quality_rating TEXT,
  missing_feature TEXT,
  comment TEXT,
  credited INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_responses_created_at ON feedback_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_email ON feedback_responses(email);
