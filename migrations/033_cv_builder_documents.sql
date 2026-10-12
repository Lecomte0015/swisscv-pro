-- ============================================================
-- Migration 033: CV Builder — sauvegarde et historique
-- ============================================================

CREATE TABLE IF NOT EXISTS cv_builder_documents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'classique-1',
  name TEXT NOT NULL DEFAULT 'Mon CV',
  data TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  deleted_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cv_builder_docs_user ON cv_builder_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_builder_docs_deleted ON cv_builder_documents(deleted_at);
CREATE INDEX IF NOT EXISTS idx_cv_builder_docs_updated ON cv_builder_documents(updated_at DESC);
