-- ============================================================
-- API & Bulk Analysis System
-- Migration 017: API Keys and Usage Tracking
-- ============================================================

-- ============================================================
-- 1. API Keys Table
-- ============================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL, -- ex: "sk_live_abc..."
  name TEXT, -- nom donné par l'utilisateur
  last_used_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  revoked_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_revoked ON api_keys(revoked_at);

-- ============================================================
-- 2. API Usage Logs Table
-- ============================================================
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id TEXT PRIMARY KEY,
  api_key_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  credits_used INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  error_message TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_api_logs_key ON api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_user ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_date ON api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_usage_logs(endpoint);

-- ============================================================
-- 3. Bulk Analysis Jobs Table
-- ============================================================
CREATE TABLE IF NOT EXISTS bulk_analysis_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  total_files INTEGER NOT NULL,
  processed_files INTEGER DEFAULT 0,
  failed_files INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  results_url TEXT, -- URL du fichier CSV/Excel généré
  export_format TEXT DEFAULT 'csv', -- csv, excel, json
  created_at INTEGER DEFAULT (unixepoch()),
  started_at INTEGER,
  completed_at INTEGER,
  error_message TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bulk_jobs_user ON bulk_analysis_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_jobs_status ON bulk_analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_bulk_jobs_date ON bulk_analysis_jobs(created_at);

-- ============================================================
-- 4. Bulk Analysis Results Table
-- ============================================================
CREATE TABLE IF NOT EXISTS bulk_analysis_results (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  cv_score INTEGER,
  ats_score INTEGER,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  analysis_data TEXT, -- JSON avec résultats complets
  error_message TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (job_id) REFERENCES bulk_analysis_jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bulk_results_job ON bulk_analysis_results(job_id);
CREATE INDEX IF NOT EXISTS idx_bulk_results_status ON bulk_analysis_results(status);

-- ============================================================
-- 5. Verification Queries
-- ============================================================

-- Vérifier les tables créées
-- SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%api%' OR name LIKE '%bulk%';

-- Compter les clés API par utilisateur
-- SELECT u.email, COUNT(ak.id) as api_keys_count
-- FROM users u
-- LEFT JOIN api_keys ak ON u.id = ak.user_id AND ak.revoked_at IS NULL
-- WHERE u.tier = 'pro'
-- GROUP BY u.id;

-- Statistiques d'utilisation API
-- SELECT 
--   DATE(created_at, 'unixepoch') as date,
--   endpoint,
--   COUNT(*) as requests,
--   SUM(credits_used) as total_credits,
--   AVG(response_time_ms) as avg_response_time
-- FROM api_usage_logs
-- GROUP BY date, endpoint
-- ORDER BY date DESC;

-- ============================================================
-- ROLLBACK (si nécessaire)
-- ============================================================

-- DROP TABLE IF EXISTS bulk_analysis_results;
-- DROP TABLE IF EXISTS bulk_analysis_jobs;
-- DROP TABLE IF EXISTS api_usage_logs;
-- DROP TABLE IF EXISTS api_keys;
