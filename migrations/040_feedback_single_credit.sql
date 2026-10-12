-- Une réponse au questionnaire ne crédite qu'une fois par compte (audit du 11.10.2026).
-- Index unique partiel : au plus une ligne credited = 1 par user_id.
CREATE UNIQUE INDEX IF NOT EXISTS uq_feedback_one_credit_per_user ON feedback_responses(user_id) WHERE credited = 1;
