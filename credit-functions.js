// ============================================
// CREDIT SYSTEM - BACKEND FUNCTIONS
// ============================================

// Credit costs configuration
const CREDIT_COSTS = {
    'cv_analysis': 1,
    'cover_letter': 2,
    'interview_prep': 1,
    'job_search': 0, // Gratuit pour encourager l'engagement
    'cv_template': 0,
    'job_tracker': 0
};

/**
 * Get credit cost for an action type
 */
function getCreditCost(actionType) {
    return CREDIT_COSTS[actionType] || 0;
}

/**
 * Validate if user has enough credits
 * POST /credits/validate
 */
async function handleValidateCredits(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const body = await request.json();
        const { action_type } = body;

        if (!action_type) {
            return jsonResponse({ success: false, error: 'action_type is required' }, 400);
        }

        const cost = getCreditCost(action_type);

        // Get user's current balance
        const user = await env.DB.prepare(
            'SELECT credits_balance, credits_monthly_limit, subscription_tier FROM users WHERE id = ?'
        ).bind(auth.userId).first();

        if (!user) {
            return jsonResponse({ success: false, error: 'User not found' }, 404);
        }

        const hasEnough = user.credits_balance >= cost;

        return jsonResponse({
            success: true,
            has_enough_credits: hasEnough,
            current_balance: user.credits_balance,
            required_credits: cost,
            monthly_limit: user.credits_monthly_limit,
            tier: user.subscription_tier
        });

    } catch (error) {
        console.error('Error validating credits:', error);
        return jsonResponse({ success: false, error: 'Internal server error' }, 500);
    }
}

/**
 * Consume credits after successful action
 * POST /credits/consume
 */
async function handleConsumeCredits(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const body = await request.json();
        const { action_type, metadata } = body;

        if (!action_type) {
            return jsonResponse({ success: false, error: 'action_type is required' }, 400);
        }

        const cost = getCreditCost(action_type);

        // If action is free, just log it
        if (cost === 0) {
            return jsonResponse({
                success: true,
                credits_consumed: 0,
                message: 'Action is free, no credits consumed'
            });
        }

        // Get current balance
        const user = await env.DB.prepare(
            'SELECT credits_balance FROM users WHERE id = ?'
        ).bind(auth.userId).first();

        if (!user) {
            return jsonResponse({ success: false, error: 'User not found' }, 404);
        }

        // Check if user has enough credits
        if (user.credits_balance < cost) {
            return jsonResponse({
                success: false,
                error: 'Insufficient credits',
                current_balance: user.credits_balance,
                required: cost
            }, 402); // Payment Required
        }

        const newBalance = user.credits_balance - cost;

        // Update user balance
        await env.DB.prepare(
            'UPDATE users SET credits_balance = ?, updated_at = unixepoch() WHERE id = ?'
        ).bind(newBalance, auth.userId).run();

        // Record transaction
        const transactionId = crypto.randomUUID();
        await env.DB.prepare(`
      INSERT INTO credit_transactions 
      (id, user_id, action_type, credits_used, credits_before, credits_after, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())
    `).bind(
            transactionId,
            auth.userId,
            action_type,
            cost,
            user.credits_balance,
            newBalance,
            JSON.stringify(metadata || {})
        ).run();

        console.log(`✅ Credits consumed: ${cost} for ${action_type} by user ${auth.userId}`);

        return jsonResponse({
            success: true,
            credits_consumed: cost,
            new_balance: newBalance,
            transaction_id: transactionId
        });

    } catch (error) {
        console.error('Error consuming credits:', error);
        return jsonResponse({ success: false, error: 'Transaction failed' }, 500);
    }
}

/**
 * Get user's credit balance
 * GET /credits/balance
 */
async function handleGetCreditBalance(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const user = await env.DB.prepare(`
      SELECT 
        credits_balance, 
        credits_monthly_limit, 
        credits_last_reset_at, 
        subscription_tier,
        stripe_customer_id,
        stripe_subscription_id
      FROM users 
      WHERE id = ?
    `).bind(auth.userId).first();

        if (!user) {
            return jsonResponse({ success: false, error: 'User not found' }, 404);
        }

        // Calculate next reset date (30 days from last reset)
        const lastReset = user.credits_last_reset_at || Math.floor(Date.now() / 1000);
        const nextReset = lastReset + (30 * 24 * 60 * 60); // 30 days

        return jsonResponse({
            success: true,
            balance: user.credits_balance,
            monthly_limit: user.credits_monthly_limit,
            last_reset: user.credits_last_reset_at,
            next_reset: nextReset,
            tier: user.subscription_tier,
            has_subscription: !!user.stripe_subscription_id
        });

    } catch (error) {
        console.error('Error getting credit balance:', error);
        return jsonResponse({ success: false, error: 'Internal server error' }, 500);
    }
}

/**
 * Get credit transaction history
 * GET /credits/history
 */
async function handleGetCreditHistory(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = parseInt(url.searchParams.get('offset') || '0');

        const transactions = await env.DB.prepare(`
      SELECT 
        id, 
        action_type, 
        credits_used, 
        credits_before,
        credits_after, 
        created_at, 
        metadata
      FROM credit_transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(auth.userId, limit, offset).all();

        // Get total count
        const countResult = await env.DB.prepare(
            'SELECT COUNT(*) as total FROM credit_transactions WHERE user_id = ?'
        ).bind(auth.userId).first();

        return jsonResponse({
            success: true,
            transactions: transactions.results || [],
            total: countResult?.total || 0,
            limit,
            offset
        });

    } catch (error) {
        console.error('Error getting credit history:', error);
        return jsonResponse({ success: false, error: 'Internal server error' }, 500);
    }
}

/**
 * Get credit usage statistics
 * GET /credits/stats
 */
async function handleGetCreditStats(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        // Get usage by action type
        const byAction = await env.DB.prepare(`
      SELECT 
        action_type,
        COUNT(*) as count,
        SUM(credits_used) as total_credits
      FROM credit_transactions
      WHERE user_id = ?
      GROUP BY action_type
      ORDER BY total_credits DESC
    `).bind(auth.userId).all();

        // Get usage over last 30 days
        const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
        const recent = await env.DB.prepare(`
      SELECT 
        DATE(created_at, 'unixepoch') as date,
        SUM(credits_used) as credits_used
      FROM credit_transactions
      WHERE user_id = ? AND created_at >= ?
      GROUP BY DATE(created_at, 'unixepoch')
      ORDER BY date ASC
    `).bind(auth.userId, thirtyDaysAgo).all();

        // Get current user info
        const user = await env.DB.prepare(
            'SELECT credits_balance, credits_monthly_limit FROM users WHERE id = ?'
        ).bind(auth.userId).first();

        return jsonResponse({
            success: true,
            stats: {
                by_action: byAction.results || [],
                last_30_days: recent.results || [],
                current_balance: user?.credits_balance || 0,
                monthly_limit: user?.credits_monthly_limit || 0,
                usage_percentage: user ? Math.round(((user.credits_monthly_limit - user.credits_balance) / user.credits_monthly_limit) * 100) : 0
            }
        });

    } catch (error) {
        console.error('Error getting credit stats:', error);
        return jsonResponse({ success: false, error: 'Internal server error' }, 500);
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleValidateCredits,
        handleConsumeCredits,
        handleGetCreditBalance,
        handleGetCreditHistory,
        handleGetCreditStats,
        getCreditCost,
        CREDIT_COSTS
    };
}
