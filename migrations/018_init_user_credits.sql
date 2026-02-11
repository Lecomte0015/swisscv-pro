-- ============================================
-- Migration 018: Initialize credits for all existing users
-- ============================================

-- Update FREE users (5 credits)
UPDATE users
SET credits_balance = 5,
    credits_monthly_limit = 5,
    credits_last_reset_at = unixepoch(),
    updated_at = unixepoch()
WHERE subscription_tier = 'free' OR subscription_tier IS NULL;

-- Update PREMIUM users (100 credits)
UPDATE users
SET credits_balance = 100,
    credits_monthly_limit = 100,
    credits_last_reset_at = unixepoch(),
    updated_at = unixepoch()
WHERE subscription_tier = 'premium';

-- Update PRO users (200 credits)
UPDATE users
SET credits_balance = 200,
    credits_monthly_limit = 200,
    credits_last_reset_at = unixepoch(),
    updated_at = unixepoch()
WHERE subscription_tier = 'pro';

-- Set default tier to 'free' for users without a tier
UPDATE users
SET subscription_tier = 'free'
WHERE subscription_tier IS NULL OR subscription_tier = '';

-- Verify the updates
SELECT subscription_tier, COUNT(*) as count,
       AVG(credits_balance) as avg_credits,
       AVG(credits_monthly_limit) as avg_limit
FROM users
GROUP BY subscription_tier;
