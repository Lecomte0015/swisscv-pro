-- Vérifier structure table cv_analyses
PRAGMA table_info(cv_analyses);

-- Vérifier les données existantes
SELECT 
  id,
  user_id,
  score,
  ats_score,
  created_at,
  datetime(created_at, 'unixepoch') as date_readable
FROM cv_analyses 
ORDER BY created_at DESC 
LIMIT 5;

-- Compter total analyses
SELECT COUNT(*) as total_analyses FROM cv_analyses;
