# Credit System Migration Guide

## Overview
This migration adds the credit-based billing system to SwissCV Pro.

## Files Created
- `001_add_credit_system.sql` - Main migration script
- `002_credit_costs_config.sql` - Credit costs configuration

## Migration Steps

### 1. Backup Database
```bash
# Backup your D1 database before running migrations
wrangler d1 export DB --output=backup_$(date +%Y%m%d).sql
```

### 2. Run Migration
```bash
# Apply the migration to your D1 database
wrangler d1 execute DB --file=migrations/001_add_credit_system.sql
```

### 3. Verify Migration
```bash
# Check that tables were created
wrangler d1 execute DB --command="SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'credit%';"

# Check user credits
wrangler d1 execute DB --command="SELECT id, email, credits_balance, credits_monthly_limit FROM users LIMIT 5;"
```

## What This Migration Does

### Tables Created
1. **credit_transactions** - Tracks all credit usage
2. **credit_balances** - Caches current balances (optional)

### Columns Added to `users`
- `credits_balance` - Current credit balance
- `credits_monthly_limit` - Monthly credit quota
- `credits_last_reset_at` - Last reset timestamp
- `stripe_customer_id` - Stripe customer reference
- `stripe_subscription_id` - Stripe subscription reference

### Data Migration
- All existing users receive credits based on their tier:
  - Free: 5 credits
  - Premium: 100 credits
  - Pro: 200 credits

## Rollback

If you need to rollback:
```bash
wrangler d1 execute DB --file=migrations/rollback_001.sql
```

## Testing

After migration, test with:
```bash
# Check a specific user
wrangler d1 execute DB --command="SELECT * FROM users WHERE email='test@example.com';"

# Check credit transactions table
wrangler d1 execute DB --command="SELECT COUNT(*) FROM credit_transactions;"
```

## Next Steps
1. Deploy backend API endpoints
2. Configure Stripe webhooks
3. Update frontend to display credits
