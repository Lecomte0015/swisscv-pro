-- ============================================================
-- SwissCV Pro - Credit System Migration
-- Phase 1: Add Credit System Tables and Columns
-- ============================================================

-- ============================================================
-- 1. CREATE credit_transactions TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'cv_analysis', 'cover_letter', 'interview_prep', 'job_search'
  credits_used INTEGER NOT NULL,
  credits_before INTEGER NOT NULL,
  credits_after INTEGER NOT NULL,
  metadata TEXT, -- JSON avec détails (ex: CV ID, job ID, analysis ID)
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_date ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_action ON credit_transactions(action_type);

-- ============================================================
-- 2. CREATE credit_balances TABLE (Optional - for caching)
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_balances (
  user_id TEXT PRIMARY KEY,
  current_balance INTEGER DEFAULT 0,
  monthly_limit INTEGER DEFAULT 5,
  last_reset_at INTEGER DEFAULT (unixepoch()),
  next_reset_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 3. ADD COLUMNS TO users TABLE
-- ============================================================

-- Add credit-related columns to users table
ALTER TABLE users ADD COLUMN credits_balance INTEGER DEFAULT 5;
ALTER TABLE users ADD COLUMN credits_monthly_limit INTEGER DEFAULT 5;
ALTER TABLE users ADD COLUMN credits_last_reset_at INTEGER DEFAULT (unixepoch());
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;

-- Create index for Stripe customer lookup
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- ============================================================
-- 4. MIGRATE EXISTING USERS
-- ============================================================

-- Set initial credits based on current subscription tier
UPDATE users 
SET 
  credits_balance = CASE subscription_tier
    WHEN 'free' THEN 5
    WHEN 'premium' THEN 100
    WHEN 'pro' THEN 200
    ELSE 5
  END,
  credits_monthly_limit = CASE subscription_tier
    WHEN 'free' THEN 5
    WHEN 'premium' THEN 100
    WHEN 'pro' THEN 200
    ELSE 5
  END,
  credits_last_reset_at = unixepoch()
WHERE credits_balance IS NULL;

-- ============================================================
-- 5. POPULATE credit_balances TABLE (if using)
-- ============================================================

INSERT INTO credit_balances (user_id, current_balance, monthly_limit, last_reset_at)
SELECT 
  id,
  credits_balance,
  credits_monthly_limit,
  credits_last_reset_at
FROM users
WHERE id NOT IN (SELECT user_id FROM credit_balances);

-- ============================================================
-- 6. VERIFICATION QUERIES
-- ============================================================

-- Check users with credits
-- SELECT id, email, subscription_tier, credits_balance, credits_monthly_limit FROM users LIMIT 10;

-- Check credit transactions
-- SELECT COUNT(*) as transaction_count FROM credit_transactions;

-- Check credit balances
-- SELECT COUNT(*) as balance_count FROM credit_balances;

-- ============================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================

-- To rollback this migration, run:
-- DROP TABLE IF EXISTS credit_transactions;
-- DROP TABLE IF EXISTS credit_balances;
-- ALTER TABLE users DROP COLUMN credits_balance;
-- ALTER TABLE users DROP COLUMN credits_monthly_limit;
-- ALTER TABLE users DROP COLUMN credits_last_reset_at;
-- ALTER TABLE users DROP COLUMN stripe_customer_id;
-- ALTER TABLE users DROP COLUMN stripe_subscription_id;
