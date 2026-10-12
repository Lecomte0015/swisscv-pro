-- Ajout de 2 questions au formulaire feedback.html : usage réel des
-- fonctionnalités premium (Candidature 1-clic / en masse) et score NPS.
ALTER TABLE feedback_responses ADD COLUMN usage_features TEXT;
ALTER TABLE feedback_responses ADD COLUMN nps_score INTEGER;
