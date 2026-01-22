// ============================================
// STRIPE WEBHOOK HANDLERS
// Credit System - Subscription Management
// ============================================

/**
 * Main Stripe webhook handler
 * POST /stripe/webhook
 */
async function handleStripeWebhook(request, env) {
    try {
        const sig = request.headers.get('stripe-signature');
        const body = await request.text();

        // TODO: Verify signature in production
        // const config = getConfig(env);
        // const event = stripe.webhooks.constructEvent(body, sig, config.STRIPE_WEBHOOK_SECRET);

        // For now, parse the event directly
        const event = JSON.parse(body);

        console.log('📥 Stripe webhook received:', event.type);

        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                return await handleSubscriptionChange(event.data.object, env);

            case 'invoice.paid':
                return await handleInvoicePaid(event.data.object, env);

            case 'customer.subscription.deleted':
                return await handleSubscriptionCanceled(event.data.object, env);

            case 'checkout.session.completed':
                return await handleCheckoutCompleted(event.data.object, env);

            default:
                console.log('ℹ️ Unhandled event type:', event.type);
                return jsonResponse({ received: true });
        }

    } catch (error) {
        console.error('❌ Stripe webhook error:', error);
        return jsonResponse({ success: false, error: error.message }, 500);
    }
}

/**
 * Handle subscription creation or update
 */
async function handleSubscriptionChange(subscription, env) {
    try {
        const customerId = subscription.customer;
        const subscriptionId = subscription.id;

        // Map Stripe price IDs to tiers and credits
        const planMapping = {
            // TODO: Replace with your actual Stripe Price IDs
            'price_premium_monthly': { tier: 'premium', credits: 100 },
            'price_pro_monthly': { tier: 'pro', credits: 200 },
            'price_premium_yearly': { tier: 'premium', credits: 100 },
            'price_pro_yearly': { tier: 'pro', credits: 200 }
        };

        const priceId = subscription.items.data[0]?.price?.id;
        const plan = planMapping[priceId] || { tier: 'free', credits: 5 };

        console.log(`🔄 Subscription change: ${customerId} → ${plan.tier} (${plan.credits} credits)`);

        // Update user in database
        const result = await env.DB.prepare(`
      UPDATE users 
      SET subscription_tier = ?,
          credits_monthly_limit = ?,
          credits_balance = ?,
          stripe_subscription_id = ?,
          updated_at = unixepoch()
      WHERE stripe_customer_id = ?
    `).bind(
            plan.tier,
            plan.credits,
            plan.credits, // Reset to new quota
            subscriptionId,
            customerId
        ).run();

        if (result.changes === 0) {
            console.warn('⚠️ No user found with stripe_customer_id:', customerId);
        }

        return jsonResponse({
            success: true,
            message: 'Subscription updated',
            tier: plan.tier,
            credits: plan.credits
        });

    } catch (error) {
        console.error('❌ Error handling subscription change:', error);
        return jsonResponse({ success: false, error: error.message }, 500);
    }
}

/**
 * Handle invoice paid (monthly reset)
 */
async function handleInvoicePaid(invoice, env) {
    try {
        const customerId = invoice.customer;

        console.log(`💳 Invoice paid for customer: ${customerId}`);

        // Reset credits to monthly limit
        const result = await env.DB.prepare(`
      UPDATE users 
      SET credits_balance = credits_monthly_limit,
          credits_last_reset_at = unixepoch(),
          updated_at = unixepoch()
      WHERE stripe_customer_id = ?
    `).bind(customerId).run();

        if (result.changes > 0) {
            console.log(`✅ Credits reset for customer: ${customerId}`);

            // Get user info for logging
            const user = await env.DB.prepare(
                'SELECT id, email, credits_monthly_limit FROM users WHERE stripe_customer_id = ?'
            ).bind(customerId).first();

            if (user) {
                // Log the reset as a transaction
                await env.DB.prepare(`
          INSERT INTO credit_transactions 
          (id, user_id, action_type, credits_used, credits_before, credits_after, metadata, created_at)
          VALUES (?, ?, 'monthly_reset', 0, ?, ?, '{"reason":"monthly_billing"}', unixepoch())
        `).bind(
                    crypto.randomUUID(),
                    user.id,
                    0, // credits_before (doesn't matter for reset)
                    user.credits_monthly_limit // credits_after
                ).run();
            }
        }

        return jsonResponse({ success: true, message: 'Credits reset' });

    } catch (error) {
        console.error('❌ Error handling invoice paid:', error);
        return jsonResponse({ success: false, error: error.message }, 500);
    }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(subscription, env) {
    try {
        const customerId = subscription.customer;

        console.log(`❌ Subscription canceled for customer: ${customerId}`);

        // Downgrade to free tier
        await env.DB.prepare(`
      UPDATE users 
      SET subscription_tier = 'free',
          credits_monthly_limit = 5,
          credits_balance = CASE 
            WHEN credits_balance > 5 THEN 5 
            ELSE credits_balance 
          END,
          stripe_subscription_id = NULL,
          updated_at = unixepoch()
      WHERE stripe_customer_id = ?
    `).bind(customerId).run();

        return jsonResponse({ success: true, message: 'Downgraded to free' });

    } catch (error) {
        console.error('❌ Error handling subscription canceled:', error);
        return jsonResponse({ success: false, error: error.message }, 500);
    }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutCompleted(session, env) {
    try {
        const customerId = session.customer;
        const customerEmail = session.customer_email || session.customer_details?.email;

        console.log(`✅ Checkout completed: ${customerEmail}`);

        // Link Stripe customer to user
        if (customerEmail) {
            await env.DB.prepare(`
        UPDATE users 
        SET stripe_customer_id = ?,
            updated_at = unixepoch()
        WHERE email = ? AND stripe_customer_id IS NULL
      `).bind(customerId, customerEmail).run();
        }

        return jsonResponse({ success: true, message: 'Customer linked' });

    } catch (error) {
        console.error('❌ Error handling checkout completed:', error);
        return jsonResponse({ success: false, error: error.message }, 500);
    }
}

/**
 * Create Stripe checkout session
 * POST /stripe/create-checkout
 */
async function handleCreateCheckout(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const body = await request.json();
        const { plan } = body; // 'premium' or 'pro'

        if (!plan || !['premium', 'pro'].includes(plan)) {
            return jsonResponse({ success: false, error: 'Invalid plan' }, 400);
        }

        // Get user
        const user = await env.DB.prepare(
            'SELECT email, stripe_customer_id FROM users WHERE id = ?'
        ).bind(auth.userId).first();

        if (!user) {
            return jsonResponse({ success: false, error: 'User not found' }, 404);
        }

        // TODO: Integrate with Stripe SDK
        // For now, return a placeholder
        const checkoutUrl = `https://buy.stripe.com/test_${plan}?prefilled_email=${encodeURIComponent(user.email)}`;

        return jsonResponse({
            success: true,
            checkout_url: checkoutUrl,
            message: 'Redirect user to this URL'
        });

    } catch (error) {
        console.error('❌ Error creating checkout:', error);
        return jsonResponse({ success: false, error: error.message }, 500);
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleStripeWebhook,
        handleSubscriptionChange,
        handleInvoicePaid,
        handleSubscriptionCanceled,
        handleCheckoutCompleted,
        handleCreateCheckout
    };
}
