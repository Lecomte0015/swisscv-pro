-- Migration 017: Add email alerts to saved searches
-- Date: 2026-01-15
-- Description: Enable email notifications for new job matches

-- Add email alerts columns to saved_searches
ALTER TABLE saved_searches ADD COLUMN email_alerts INTEGER DEFAULT 1;
ALTER TABLE saved_searches ADD COLUMN last_alert_sent INTEGER;

-- Index for performance on cron job queries
CREATE INDEX IF NOT EXISTS idx_saved_searches_alerts 
ON saved_searches(email_alerts, last_alert_sent);

-- Add email preferences to users table
ALTER TABLE users ADD COLUMN email_notifications INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN email_frequency TEXT DEFAULT 'daily'; -- 'immediate', 'daily', 'weekly'

-- Index for user email preferences
CREATE INDEX IF NOT EXISTS idx_users_email_notifications 
ON users(email_notifications);
