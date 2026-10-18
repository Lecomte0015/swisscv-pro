-- 045 — Version du moteur d'analyse (audit du 18.10.2026, lot 4)
-- Les scores du moteur v2 (grille de critères, calculés par le serveur) ne sont pas comparables aux anciens :
-- la version est conservée pour l'indiquer dans l'historique. NULL = ancien moteur. Migration non destructive.
ALTER TABLE cv_analyses ADD COLUMN engine_version TEXT;
CREATE INDEX IF NOT EXISTS idx_funnel_events_user_type ON funnel_events(user_id, event_type, created_at);
