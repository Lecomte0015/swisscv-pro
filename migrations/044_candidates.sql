-- 044 — Dossiers candidats (plan Pro, lot 2)
-- Un conseiller d'une équipe Pro suit des candidats (personnes accompagnées). Visibilité : le conseiller du dossier
-- + le propriétaire et les admins de l'équipe. Consentement attesté par le conseiller à la création.
-- Conservation : suppression automatique 12 mois après la dernière activité (avertissement 30 jours avant).

CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  counsellor_id TEXT NOT NULL,          -- conseiller responsable du dossier (users.id)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  target_job TEXT,
  status TEXT DEFAULT 'en_cours',       -- en_cours | en_poste | archive
  consent_at INTEGER NOT NULL,          -- date de l'attestation de consentement
  consent_by TEXT NOT NULL,             -- users.id de la personne qui a attesté
  consent_version TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  last_activity_at INTEGER DEFAULT (unixepoch()),
  deletion_warned_at INTEGER
);

-- Lettres de motivation et candidatures 1 clic générées pour un candidat (le texte n'est conservé que dans ce cas)
CREATE TABLE IF NOT EXISTS candidate_documents (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  kind TEXT NOT NULL,                   -- letter | application
  title TEXT,
  content TEXT NOT NULL,                -- JSON
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS candidate_notes (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Suivi des candidatures du candidat (séparé du suivi personnel du conseiller)
CREATE TABLE IF NOT EXISTS candidate_applications (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  job_url TEXT,
  status TEXT DEFAULT 'a_postuler',     -- a_postuler | postule | entretien | offre | refuse
  applied_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Rattachement des analyses et des CV du générateur à un candidat (NULL = usage personnel)
ALTER TABLE cv_analyses ADD COLUMN candidate_id TEXT;
ALTER TABLE cv_builder_documents ADD COLUMN candidate_id TEXT;

CREATE INDEX IF NOT EXISTS idx_candidates_team ON candidates(team_id, counsellor_id);
CREATE INDEX IF NOT EXISTS idx_candidates_activity ON candidates(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_candidate_documents_c ON candidate_documents(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_notes_c ON candidate_notes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_applications_c ON candidate_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_cv_analyses_candidate ON cv_analyses(candidate_id);
CREATE INDEX IF NOT EXISTS idx_cv_builder_documents_candidate ON cv_builder_documents(candidate_id);
