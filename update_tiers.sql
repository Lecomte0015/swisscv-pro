-- Script pour mettre à jour manuellement les tiers des utilisateurs
-- À exécuter après avoir identifié les emails des utilisateurs Premium/Pro

-- EXEMPLE: Mettre à jour un utilisateur vers Premium
-- UPDATE users SET subscription_tier = 'premium' WHERE email = 'user@example.com';

-- EXEMPLE: Mettre à jour un utilisateur vers Pro
-- UPDATE users SET subscription_tier = 'pro' WHERE email = 'user@example.com';

-- ============================================
-- INSTRUCTIONS
-- ============================================
-- 1. Identifiez les emails des utilisateurs qui ont payé via Stripe
-- 2. Décommentez et modifiez les lignes ci-dessous
-- 3. Exécutez ce script avec: npx wrangler d1 execute swisscv-db --remote --file=update_tiers.sql

-- ============================================
-- METTEZ À JOUR ICI VOS UTILISATEURS
-- ============================================

-- Utilisateurs Premium (CHF 9/mois)
-- UPDATE users SET subscription_tier = 'premium', subscription_status = 'active' WHERE email = 'email1@example.com';
-- UPDATE users SET subscription_tier = 'premium', subscription_status = 'active' WHERE email = 'email2@example.com';

-- Utilisateurs Pro (CHF 29/mois)
-- UPDATE users SET subscription_tier = 'pro', subscription_status = 'active' WHERE email = 'email3@example.com';
-- UPDATE users SET subscription_tier = 'pro', subscription_status = 'active' WHERE email = 'email4@example.com';

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Après exécution, vérifiez avec:
-- SELECT email, subscription_tier, subscription_status FROM users WHERE subscription_tier != 'free';
