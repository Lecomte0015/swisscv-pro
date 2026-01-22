-- ============================================================
-- ROLLBACK SCRIPT for Credit System Migration
-- Use this to undo the credit system migration if needed
-- ============================================================

-- WARNING: This will delete all credit-related data!
-- Make sure to backup your database before running this.

-- Drop indexes first
DROP INDEX IF EXISTS idx_credit_transactions_user;
DROP INDEX IF EXISTS idx_credit_transactions_date;
DROP INDEX IF EXISTS idx_credit_transactions_action;
DROP INDEX IF EXISTS idx_users_stripe_customer;

-- Drop tables
DROP TABLE IF EXISTS credit_transactions;
DROP TABLE IF EXISTS credit_balances;
DROP TABLE IF EXISTS credit_costs;

-- Remove columns from users table
-- Note: SQLite doesn't support DROP COLUMN directly
-- We need to recreate the table without these columns

-- 1. Create backup of users table
CREATE TABLE users_backup AS SELECT * FROM users;

-- 2. Drop original users table
DROP TABLE users;

-- 3. Recreate users table without credit columns
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  supabase_id TEXT UNIQUE NOT NULL,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT,
  profile_completed INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- 4. Copy data back (excluding credit columns)
INSERT INTO users (id, email, supabase_id, subscription_tier, subscription_status, profile_completed, created_at, updated_at)
SELECT id, email, supabase_id, subscription_tier, subscription_status, profile_completed, created_at, updated_at
FROM users_backup;

-- 5. Drop backup table
DROP TABLE users_backup;

-- 6. Recreate original indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_supabase ON users(supabase_id);

-- Verification
-- SELECT COUNT(*) as user_count FROM users;
-- SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'credit%';
