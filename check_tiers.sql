-- Vérifier les tiers des utilisateurs
SELECT 
    email,
    subscription_tier,
    subscription_status,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 20;
