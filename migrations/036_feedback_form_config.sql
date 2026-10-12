-- Texte des questions du formulaire feedback.html, modifiable depuis l'admin sans
-- redéploiement. Une seule ligne ('default') stockant tout en JSON — les valeurs
-- des options (price, missing_feature, ...) restent fixes dans le code (utilisées
-- pour les statistiques admin-feedback.html), seul le libellé affiché est éditable.
CREATE TABLE IF NOT EXISTS feedback_form_config (
  id TEXT PRIMARY KEY,
  config_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
