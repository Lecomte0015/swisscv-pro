-- CORRECTION : Mettre à jour le hash du mot de passe admin
-- Le hash précédent était incorrect

UPDATE admins 
SET password_hash = 'sjeCSGNf7g4EotzLQ7yS1/tAZoRR1BHIl+ouS47C6LY='
WHERE email = 'dallyhermann@gmail.com';

-- Vérifier la mise à jour
SELECT email, password_hash, created_at FROM admins WHERE email = 'dallyhermann@gmail.com';
