#!/bin/bash

# ============================================
# CREDIT SYSTEM DEPLOYMENT SCRIPT
# Deploys the complete credit-based billing system
# ============================================

set -e  # Exit on error

echo "🚀 SwissCV Pro - Credit System Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Database Migration
echo -e "${YELLOW}📊 Step 1/4: Database Migration${NC}"
echo "Applying credit system migrations..."

wrangler d1 execute DB --file=migrations/001_add_credit_system.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Main migration applied${NC}"
else
    echo -e "${RED}❌ Main migration failed${NC}"
    exit 1
fi

wrangler d1 execute DB --file=migrations/002_credit_costs_config.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Credit costs configured${NC}"
else
    echo -e "${RED}❌ Credit costs configuration failed${NC}"
    exit 1
fi

echo ""

# Step 2: Verify Migration
echo -e "${YELLOW}🔍 Step 2/4: Verifying Migration${NC}"
echo "Checking database tables..."

TABLE_CHECK=$(wrangler d1 execute DB --command="SELECT name FROM sqlite_master WHERE type='table' AND name='credit_transactions';" 2>&1)

if echo "$TABLE_CHECK" | grep -q "credit_transactions"; then
    echo -e "${GREEN}✅ credit_transactions table exists${NC}"
else
    echo -e "${RED}❌ credit_transactions table NOT found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database migration verified${NC}"
echo ""

# Step 3: Deploy Worker
echo -e "${YELLOW}🔧 Step 3/4: Deploying Cloudflare Worker${NC}"
echo "Publishing updated worker with credit system..."

wrangler deploy
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Worker deployed successfully${NC}"
else
    echo -e "${RED}❌ Worker deployment failed${NC}"
    exit 1
fi

echo ""

# Step 4: Deploy Frontend
echo -e "${YELLOW}🎨 Step 4/4: Deploying Frontend${NC}"
echo "Publishing frontend pages..."

wrangler pages deploy . --project-name=swisscv-pro
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend deployed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend deployment failed (may need manual deployment)${NC}"
fi

echo ""

# Final Summary
echo "=========================================="
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "=========================================="
echo ""
echo "✅ Database migrations applied"
echo "✅ Worker deployed with credit system"
echo "✅ Frontend updated with credit display"
echo ""
echo "📋 Next Steps:"
echo "  1. Configure Stripe products (see STRIPE_CONFIGURATION.md)"
echo "  2. Set up Stripe webhooks"
echo "  3. Test credit flow with test account"
echo "  4. Monitor credit consumption"
echo ""
echo "🔗 URLs:"
echo "  Worker: https://swisscv-pro.dallyhermann-71e.workers.dev"
echo "  Frontend: https://swisscv-pro.pages.dev"
echo ""
echo "📚 Documentation:"
echo "  - CREDIT_SYSTEM_QUICKSTART.md"
echo "  - STRIPE_CONFIGURATION.md"
echo "  - implementation_plan.md"
echo ""
