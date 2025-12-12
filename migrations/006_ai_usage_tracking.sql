-- ============================================================
-- Migration 006: AI Usage Tracking
-- Track AI API usage per user for quota management
-- ============================================================

-- Table pour tracker l'usage IA
CREATE TABLE IF NOT EXISTS ai_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  feature TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost_estimate REAL DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_feature ON ai_usage(feature);

-- Vue pour statistiques mensuelles par user
CREATE VIEW IF NOT EXISTS ai_usage_monthly AS
SELECT 
  user_id,
  feature,
  strftime('%Y-%m', datetime(created_at, 'unixepoch')) as month,
  COUNT(*) as usage_count,
  SUM(tokens_used) as total_tokens,
  SUM(cost_estimate) as total_cost
FROM ai_usage
GROUP BY user_id, feature, month;
