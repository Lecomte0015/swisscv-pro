-- Migration: Add letter usage tracking
-- Date: 2025-12-25
-- Purpose: Track weekly letter generation limits per tier

CREATE TABLE IF NOT EXISTS letter_usage (
  user_id TEXT PRIMARY KEY,
  letters_this_week INTEGER DEFAULT 0,
  week_start_date INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_letter_usage_user ON letter_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_letter_usage_week ON letter_usage(week_start_date);
