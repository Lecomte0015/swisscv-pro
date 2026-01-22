# Credit System - Quick Start Guide

## 🚀 What's Been Implemented

### ✅ Phase 1: Database (COMPLETE)
- Created `credit_transactions` table
- Created `credit_balances` table
- Added credit columns to `users` table
- Migration scripts ready in `migrations/`

### ✅ Phase 2: Backend API (COMPLETE)
- `/credits/validate` - Check if user has enough credits
- `/credits/consume` - Deduct credits after action
- `/credits/balance` - Get current balance
- `/credits/history` - Transaction history
- `/credits/stats` - Usage statistics

### ✅ Phase 3: Stripe Integration (COMPLETE)
- `/stripe/webhook` - Handle Stripe events
- `/stripe/create-checkout` - Create checkout sessions
- Automatic monthly credit reset
- Subscription management

### 🔄 Phase 4: Frontend (IN PROGRESS)
- Need to add credit display to UI
- Need to add validation before actions
- Need to create "Insufficient Credits" modal

## 📋 Next Steps

### 1. Run Database Migration

```bash
cd /Users/dallyhermann/Desktop/swisscv-deploy

# Apply migrations
wrangler d1 execute DB --file=migrations/001_add_credit_system.sql
wrangler d1 execute DB --file=migrations/002_credit_costs_config.sql

# Test migration
./migrations/test_migration.sh
```

### 2. Configure Stripe

Follow the guide in `STRIPE_CONFIGURATION.md`:
1. Create products in Stripe Dashboard
2. Copy Price IDs
3. Update `stripe-webhooks.js` with your Price IDs
4. Configure webhook endpoint
5. Test with Stripe test cards

### 3. Deploy Backend

```bash
# Deploy the updated worker
wrangler deploy

# Or publish
wrangler publish
```

### 4. Test Backend Endpoints

```bash
# Get your auth token first (login to get token)
TOKEN="your_jwt_token_here"

# Test validate credits
curl -X POST https://swisscv-pro.dallyhermann-71e.workers.dev/credits/validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action_type": "cv_analysis"}'

# Test get balance
curl https://swisscv-pro.dallyhermann-71e.workers.dev/credits/balance \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Frontend Integration (Next Phase)

See `implementation_plan.md` Phase 4 for details on:
- Adding credit display to navbar
- Implementing validation before actions
- Creating modals for insufficient credits

## 📊 Credit Costs

| Action | Credits | Status |
|--------|---------|--------|
| CV Analysis | 1 | ✅ Configured |
| Cover Letter | 2 | ✅ Configured |
| Interview Prep | 1 | ✅ Configured |
| Job Search | 0 (Free) | ✅ Configured |
| CV Templates | 0 (Free) | ✅ Configured |

## 🎯 Monthly Limits

| Plan | Credits/Month | Price |
|------|---------------|-------|
| Free | 5 | CHF 0 |
| Premium | 100 | CHF 9 |
| Pro | 200 | CHF 29 |

## 🔍 Monitoring

### Check Credit Usage

```bash
# View user balances
wrangler d1 execute DB --command="SELECT email, subscription_tier, credits_balance, credits_monthly_limit FROM users ORDER BY credits_balance DESC LIMIT 10;"

# View recent transactions
wrangler d1 execute DB --command="SELECT u.email, ct.action_type, ct.credits_used, ct.created_at FROM credit_transactions ct JOIN users u ON ct.user_id = u.id ORDER BY ct.created_at DESC LIMIT 20;"

# View credit stats by action
wrangler d1 execute DB --command="SELECT action_type, COUNT(*) as count, SUM(credits_used) as total_credits FROM credit_transactions GROUP BY action_type;"
```

### Monitor Worker Logs

```bash
# Real-time logs
wrangler tail

# Look for:
# ✅ Credits consumed: X for action_type by user_id
# 💳 Invoice paid for customer: cus_xxx
# 🔄 Subscription change: cus_xxx → premium (100 credits)
```

## ⚠️ Important Notes

1. **Migration**: Run database migrations BEFORE deploying the new worker
2. **Stripe**: Configure Stripe products and webhooks BEFORE going live
3. **Testing**: Test thoroughly in Stripe test mode first
4. **Monitoring**: Watch credit consumption patterns after launch
5. **Documentation**: Update user-facing docs about the new credit system

## 🐛 Troubleshooting

### Credits not deducting
- Check `/credits/consume` is being called after successful actions
- Verify user has `credits_balance` column populated
- Check transaction logs

### Stripe webhook not working
- Verify webhook URL is correct
- Check webhook secret is set in environment
- Test with `stripe trigger` command
- Review Cloudflare Worker logs

### Migration failed
- Check database connection
- Verify D1 binding name is `DB`
- Review migration script syntax
- Use rollback script if needed

## 📚 Files Reference

- `migrations/001_add_credit_system.sql` - Main migration
- `migrations/002_credit_costs_config.sql` - Credit costs
- `migrations/MIGRATION_GUIDE.md` - Migration instructions
- `credit-functions.js` - Credit management functions
- `stripe-webhooks.js` - Stripe webhook handlers
- `STRIPE_CONFIGURATION.md` - Stripe setup guide
- `implementation_plan.md` - Complete implementation plan

## ✅ Ready to Continue?

The backend is complete! Next step is Phase 4: Frontend Integration.

Would you like me to:
1. Start implementing the frontend (credit display, validation, modals)?
2. Help you test the backend first?
3. Create user documentation?
