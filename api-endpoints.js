// ============================================================
// API Endpoints Handlers
// Handlers for API & Bulk Analysis feature endpoints
// ============================================================

/**
 * Handle POST /api/v1/keys - Create new API key
 */
async function handleCreateApiKey(request, env, authenticateRequest, generateApiKey, jsonResponse) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        // Check if user is Pro
        const user = await env.DB.prepare(`
      SELECT subscription_tier FROM users WHERE id = ?
    `).bind(auth.userId).first();

        if (!user || user.subscription_tier !== 'pro') {
            return jsonResponse({
                success: false,
                error: 'API access requires Pro plan'
            }, 403);
        }

        const body = await request.json();
        const { name } = body;

        if (!name || name.trim().length === 0) {
            return jsonResponse({
                success: false,
                error: 'Key name is required'
            }, 400);
        }

        // Generate API key
        const keyData = await generateApiKey(auth.userId, name.trim(), env);

        return jsonResponse({
            success: true,
            message: 'API key created successfully. Save it now, you won\'t be able to see it again!',
            api_key: keyData.key,
            key_id: keyData.id,
            key_prefix: keyData.prefix
        });
    } catch (error) {
        console.error('❌ Error creating API key:', error);
        return jsonResponse({
            success: false,
            error: 'Failed to create API key'
        }, 500);
    }
}

/**
 * Handle GET /api/v1/keys - List user's API keys
 */
async function handleListApiKeys(request, env, authenticateRequest, jsonResponse) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const keys = await env.DB.prepare(`
      SELECT 
        id,
        key_prefix,
        name,
        last_used_at,
        created_at,
        revoked_at
      FROM api_keys
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).bind(auth.userId).all();

        return jsonResponse({
            success: true,
            keys: keys.results || []
        });
    } catch (error) {
        console.error('❌ Error listing API keys:', error);
        return jsonResponse({
            success: false,
            error: 'Failed to list API keys'
        }, 500);
    }
}

/**
 * Handle DELETE /api/v1/keys/:id - Revoke API key
 */
async function handleRevokeApiKey(request, env, keyId, authenticateRequest, jsonResponse) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        // Verify key belongs to user
        const key = await env.DB.prepare(`
      SELECT id FROM api_keys WHERE id = ? AND user_id = ?
    `).bind(keyId, auth.userId).first();

        if (!key) {
            return jsonResponse({
                success: false,
                error: 'API key not found'
            }, 404);
        }

        // Revoke key
        await env.DB.prepare(`
      UPDATE api_keys SET revoked_at = unixepoch() WHERE id = ?
    `).bind(keyId).run();

        return jsonResponse({
            success: true,
            message: 'API key revoked successfully'
        });
    } catch (error) {
        console.error('❌ Error revoking API key:', error);
        return jsonResponse({
            success: false,
            error: 'Failed to revoke API key'
        }, 500);
    }
}

/**
 * Handle POST /api/v1/analyze - Analyze CV via API
 */
async function handleApiAnalyze(request, env, config, verifyApiKey, logApiUsage, deductCredits, jsonResponse) {
    const startTime = Date.now();

    // 1. Verify API key
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return jsonResponse({
            success: false,
            error: 'Missing API key. Use: Authorization: Bearer YOUR_API_KEY'
        }, 401);
    }

    const apiKey = authHeader.substring(7);
    const keyData = await verifyApiKey(apiKey, env);

    if (!keyData) {
        return jsonResponse({
            success: false,
            error: 'Invalid or revoked API key'
        }, 401);
    }

    // 2. Check if user is Pro
    if (keyData.tier !== 'pro') {
        await logApiUsage({
            apiKeyId: keyData.key_id,
            userId: keyData.user_id,
            endpoint: '/api/v1/analyze',
            method: 'POST',
            statusCode: 403,
            creditsUsed: 0,
            responseTimeMs: Date.now() - startTime,
            errorMessage: 'Not Pro tier'
        }, env);

        return jsonResponse({
            success: false,
            error: 'API access requires Pro plan'
        }, 403);
    }

    // 3. Check credits
    if (keyData.credits_balance < 1) {
        await logApiUsage({
            apiKeyId: keyData.key_id,
            userId: keyData.user_id,
            endpoint: '/api/v1/analyze',
            method: 'POST',
            statusCode: 402,
            creditsUsed: 0,
            responseTimeMs: Date.now() - startTime,
            errorMessage: 'Insufficient credits'
        }, env);

        return jsonResponse({
            success: false,
            error: 'Insufficient credits',
            credits_remaining: keyData.credits_balance
        }, 402);
    }

    // 4. Parse request body
    let body;
    try {
        body = await request.json();
    } catch (error) {
        return jsonResponse({
            success: false,
            error: 'Invalid JSON body'
        }, 400);
    }

    const { cv_text, format = 'json' } = body;

    if (!cv_text || typeof cv_text !== 'string' || cv_text.trim().length === 0) {
        return jsonResponse({
            success: false,
            error: 'Missing or invalid cv_text parameter'
        }, 400);
    }

    try {
        // 5. Analyze CV (reuse existing function - we'll need to import it)
        // For now, return a mock response
        const analysis = {
            score: 85,
            ats_score: 78,
            strengths: [
                'Expérience pertinente',
                'Compétences techniques solides',
                'Formation adaptée'
            ],
            improvements: [
                'Ajouter des chiffres concrets',
                'Optimiser les mots-clés',
                'Structurer les sections'
            ],
            swiss_advice: [
                'Ajouter une photo professionnelle',
                'Mentionner le permis de travail',
                'Préciser les niveaux de langues'
            ]
        };

        // 6. Deduct credits
        const deducted = await deductCredits(keyData.user_id, 1, 'cv_analysis_api', env);

        if (!deducted) {
            throw new Error('Failed to deduct credits');
        }

        // 7. Log usage
        await logApiUsage({
            apiKeyId: keyData.key_id,
            userId: keyData.user_id,
            endpoint: '/api/v1/analyze',
            method: 'POST',
            statusCode: 200,
            creditsUsed: 1,
            responseTimeMs: Date.now() - startTime
        }, env);

        // 8. Return result
        return jsonResponse({
            success: true,
            data: analysis,
            credits_used: 1,
            credits_remaining: keyData.credits_balance - 1,
            response_time_ms: Date.now() - startTime
        });
    } catch (error) {
        console.error('❌ Error analyzing CV via API:', error);

        await logApiUsage({
            apiKeyId: keyData.key_id,
            userId: keyData.user_id,
            endpoint: '/api/v1/analyze',
            method: 'POST',
            statusCode: 500,
            creditsUsed: 0,
            responseTimeMs: Date.now() - startTime,
            errorMessage: error.message
        }, env);

        return jsonResponse({
            success: false,
            error: 'Failed to analyze CV',
            details: error.message
        }, 500);
    }
}

/**
 * Handle GET /api/v1/usage - Get API usage statistics
 */
async function handleApiUsageStats(request, env, authenticateRequest, jsonResponse) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        // Get usage stats for last 30 days
        const stats = await env.DB.prepare(`
      SELECT 
        DATE(created_at, 'unixepoch') as date,
        endpoint,
        COUNT(*) as requests,
        SUM(credits_used) as credits_used,
        AVG(response_time_ms) as avg_response_time
      FROM api_usage_logs
      WHERE user_id = ? 
        AND created_at >= unixepoch('now', '-30 days')
      GROUP BY DATE(created_at, 'unixepoch'), endpoint
      ORDER BY date DESC
    `).bind(auth.userId).all();

        // Get total stats
        const totals = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(credits_used) as total_credits,
        AVG(response_time_ms) as avg_response_time
      FROM api_usage_logs
      WHERE user_id = ?
    `).bind(auth.userId).first();

        return jsonResponse({
            success: true,
            daily_stats: stats.results || [],
            totals: totals || { total_requests: 0, total_credits: 0, avg_response_time: 0 }
        });
    } catch (error) {
        console.error('❌ Error getting API usage stats:', error);
        return jsonResponse({
            success: false,
            error: 'Failed to get usage statistics'
        }, 500);
    }
}

// Export handlers
export {
    handleCreateApiKey,
    handleListApiKeys,
    handleRevokeApiKey,
    handleApiAnalyze,
    handleApiUsageStats
};
