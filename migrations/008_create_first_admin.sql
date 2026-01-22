-- Créer le premier compte admin
-- À exécuter dans Supabase SQL Editor APRÈS la migration 007

INSERT INTO admins (email, password_hash, full_name, role)
VALUES (
    'dallyhermann@gmail.com',
    'vvECLWDqZBjnQvjqCvOqZYZtXLABRBLxPWPPvPDdmMI=',
    'Dally Hermann',
    'admin'
);

-- Vérifier que le compte a été créé
SELECT * FROM admins WHERE email = 'dallyhermann@gmail.com';
