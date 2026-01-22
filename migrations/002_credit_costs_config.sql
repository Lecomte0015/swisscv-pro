-- ============================================================
-- Credit Costs Configuration
-- Defines the cost in credits for each action type
-- ============================================================

-- Create a configuration table for credit costs
CREATE TABLE IF NOT EXISTS credit_costs (
  action_type TEXT PRIMARY KEY,
  credits_required INTEGER NOT NULL,
  description TEXT,
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Insert default credit costs
INSERT OR REPLACE INTO credit_costs (action_type, credits_required, description) VALUES
  ('cv_analysis', 1, 'Analyse complète du CV avec score ATS et recommandations'),
  ('cover_letter', 2, 'Génération de lettre de motivation personnalisée avec IA'),
  ('interview_prep', 1, 'Préparation d''entretien avec questions et réponses'),
  ('job_search', 0, 'Recherche d''offres d''emploi (gratuit pour encourager l''engagement)'),
  ('cv_template', 0, 'Accès aux templates de CV (gratuit)'),
  ('job_tracker', 0, 'Suivi des candidatures (gratuit)');

-- Verification query
-- SELECT * FROM credit_costs ORDER BY credits_required DESC;
