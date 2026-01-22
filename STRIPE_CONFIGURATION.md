# Stripe Configuration Guide

## Overview
This guide shows how to configure Stripe for the credit-based billing system.

## Step 1: Create Stripe Products

### In Stripe Dashboard (https://dashboard.stripe.com)

1. **Go to Products** → Click "Add Product"

2. **Create Premium Plan**
   - Name: `SwissCV Pro - Premium`
   - Description: `100 crédits par mois pour analyses CV et lettres illimitées`
   - Pricing:
     - Price: `CHF 9.00`
     - Billing period: `Monthly`
     - Copy the **Price ID** (e.g., `price_1234abcd...`)

3. **Create Pro Plan**
   - Name: `SwissCV Pro - Pro`
   - Description: `200 crédits par mois avec fonctionnalités équipe`
   - Pricing:
     - Price: `CHF 29.00`
     - Billing period: `Monthly`
     - Copy the **Price ID**

## Step 2: Update Price IDs in Code

Edit `stripe-webhooks.js` (already integrated in `index.js`):

```javascript
const planMapping = {
  'price_YOUR_PREMIUM_ID': { tier: 'premium', credits: 100 },
  'price_YOUR_PRO_ID': { tier: 'pro', credits: 200 }
};
```

Replace `price_YOUR_PREMIUM_ID` and `price_YOUR_PRO_ID` with your actual Stripe Price IDs.

## Step 3: Configure Webhook

### Create Webhook Endpoint

1. Go to **Developers** → **Webhooks** → **Add endpoint**

2. **Endpoint URL**: `https://swisscv-pro.dallyhermann-71e.workers.dev/stripe/webhook`

3. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `checkout.session.completed`

4. **Copy the Signing Secret** (starts with `whsec_...`)

### Add Webhook Secret to Environment

```bash
# Add to .dev.vars for local development
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Add to Cloudflare Worker secrets for production
wrangler secret put STRIPE_WEBHOOK_SECRET
# Paste your secret when prompted
```

## Step 4: Create Checkout Links

### Option A: Using Stripe Payment Links

1. Go to **Payment Links** → **Create payment link**
2. Select your Premium product
3. Copy the link (e.g., `https://buy.stripe.com/test_xxxxx`)
4. Update `pricing.html` buttons to use this link

### Option B: Using Stripe Checkout API (Recommended)

The endpoint `/stripe/create-checkout` is already implemented.

Update `pricing.html`:

```javascript
async function subscribeToPlan(plan) {
  const response = await authenticatedFetch('/stripe/create-checkout', {
    method: 'POST',
    body: JSON.stringify({ plan }) // 'premium' or 'pro'
  });
  
  const data = await response.json();
  if (data.success) {
    window.location.href = data.checkout_url;
  }
}
```

## Step 5: Test in Test Mode

### Test Cards

Use these test cards in Stripe test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

Any future expiry date and any 3-digit CVC.

### Test Webhook Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local worker
stripe listen --forward-to http://localhost:8787/stripe/webhook

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.paid
```

## Step 6: Verify Integration

### Test Flow

1. **Create account** → User gets 5 free credits
2. **Subscribe to Premium** → User gets 100 credits
3. **Use credits** → Balance decreases
4. **Wait for monthly billing** → Credits reset to 100
5. **Cancel subscription** → Downgrade to 5 credits

### Check Database

```bash
# Verify user credits
wrangler d1 execute DB --command="SELECT email, subscription_tier, credits_balance, credits_monthly_limit FROM users LIMIT 5;"

# Check transactions
wrangler d1 execute DB --command="SELECT * FROM credit_transactions ORDER BY created_at DESC LIMIT 10;"
```

## Step 7: Go Live

### Switch to Production Mode

1. In Stripe Dashboard, toggle from **Test mode** to **Live mode**
2. Create new products with live prices
3. Update Price IDs in code
4. Create new webhook endpoint with live URL
5. Update `STRIPE_SECRET_KEY` in Cloudflare secrets:

```bash
wrangler secret put STRIPE_SECRET_KEY
# Paste your LIVE secret key (sk_live_...)
```

## Troubleshooting

### Webhook not receiving events

1. Check webhook URL is correct
2. Verify webhook secret is set
3. Check Cloudflare Worker logs: `wrangler tail`
4. Test with Stripe CLI: `stripe trigger <event>`

### Credits not resetting

1. Verify `invoice.paid` webhook is configured
2. Check `stripe_customer_id` is set in users table
3. Review webhook logs in Stripe Dashboard

### Subscription not updating

1. Verify Price IDs match in `planMapping`
2. Check user has `stripe_customer_id`
3. Review `customer.subscription.updated` events

## Security Notes

- ✅ Always verify webhook signatures in production
- ✅ Use HTTPS for webhook endpoints
- ✅ Never expose Stripe secret keys in frontend
- ✅ Validate all user inputs
- ✅ Log all subscription changes

## Next Steps

1. Test complete flow in test mode
2. Configure email notifications for subscription changes
3. Add billing portal for users to manage subscriptions
4. Monitor credit usage analytics
