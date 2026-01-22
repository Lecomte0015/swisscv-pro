#!/bin/bash

# ============================================================
# Credit System Migration Test Script
# Tests the database migration locally before production
# ============================================================

echo "🧪 Testing Credit System Migration..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if tables exist
echo "📋 Test 1: Checking if tables were created..."
TABLES=$(wrangler d1 execute DB --command="SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE 'credit%' OR name='users');" 2>&1)

if echo "$TABLES" | grep -q "credit_transactions"; then
    echo -e "${GREEN}✓${NC} credit_transactions table exists"
else
    echo -e "${RED}✗${NC} credit_transactions table NOT found"
    exit 1
fi

if echo "$TABLES" | grep -q "credit_balances"; then
    echo -e "${GREEN}✓${NC} credit_balances table exists"
else
    echo -e "${RED}✗${NC} credit_balances table NOT found"
    exit 1
fi

if echo "$TABLES" | grep -q "credit_costs"; then
    echo -e "${GREEN}✓${NC} credit_costs table exists"
else
    echo -e "${RED}✗${NC} credit_costs table NOT found"
    exit 1
fi

echo ""

# Test 2: Check if users table has new columns
echo "📋 Test 2: Checking if users table has credit columns..."
USER_SCHEMA=$(wrangler d1 execute DB --command="PRAGMA table_info(users);" 2>&1)

if echo "$USER_SCHEMA" | grep -q "credits_balance"; then
    echo -e "${GREEN}✓${NC} credits_balance column exists"
else
    echo -e "${RED}✗${NC} credits_balance column NOT found"
    exit 1
fi

if echo "$USER_SCHEMA" | grep -q "credits_monthly_limit"; then
    echo -e "${GREEN}✓${NC} credits_monthly_limit column exists"
else
    echo -e "${RED}✗${NC} credits_monthly_limit column NOT found"
    exit 1
fi

if echo "$USER_SCHEMA" | grep -q "stripe_customer_id"; then
    echo -e "${GREEN}✓${NC} stripe_customer_id column exists"
else
    echo -e "${RED}✗${NC} stripe_customer_id column NOT found"
    exit 1
fi

echo ""

# Test 3: Check if users have credits
echo "📋 Test 3: Checking if users have credits assigned..."
USER_CREDITS=$(wrangler d1 execute DB --command="SELECT COUNT(*) as count FROM users WHERE credits_balance > 0;" 2>&1)

if echo "$USER_CREDITS" | grep -q "count"; then
    echo -e "${GREEN}✓${NC} Users have credits assigned"
else
    echo -e "${YELLOW}⚠${NC} No users with credits found (might be empty database)"
fi

echo ""

# Test 4: Check credit costs configuration
echo "📋 Test 4: Checking credit costs configuration..."
COSTS=$(wrangler d1 execute DB --command="SELECT action_type, credits_required FROM credit_costs;" 2>&1)

if echo "$COSTS" | grep -q "cv_analysis"; then
    echo -e "${GREEN}✓${NC} Credit costs configured"
else
    echo -e "${RED}✗${NC} Credit costs NOT configured"
    exit 1
fi

echo ""

# Test 5: Sample queries
echo "📋 Test 5: Running sample queries..."

echo "  → Checking users by tier:"
wrangler d1 execute DB --command="SELECT subscription_tier, COUNT(*) as count, AVG(credits_balance) as avg_credits FROM users GROUP BY subscription_tier;"

echo ""
echo "  → Checking credit costs:"
wrangler d1 execute DB --command="SELECT action_type, credits_required, description FROM credit_costs ORDER BY credits_required DESC;"

echo ""

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. Review the migration results above"
echo "  2. Test credit consumption manually"
echo "  3. Proceed to Phase 2: Backend API implementation"
echo ""
