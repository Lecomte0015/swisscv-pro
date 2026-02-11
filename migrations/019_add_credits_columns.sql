-- Migration 019: Add credit columns to users table
-- Run each statement separately

-- Add credits_balance column
ALTER TABLE users ADD COLUMN credits_balance INTEGER DEFAULT 5;

-- Add credits_monthly_limit column
ALTER TABLE users ADD COLUMN credits_monthly_limit INTEGER DEFAULT 5;

-- Add credits_last_reset_at column
ALTER TABLE users ADD COLUMN credits_last_reset_at INTEGER;
