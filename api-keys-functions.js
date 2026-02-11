// ============================================================
// API Keys Management Functions
// Isolated module for API & Bulk Analysis feature
// ============================================================

/**
 * Generate a new API key for a user
 * @param {string} userId - User ID
 * @param {string} keyName - Name given by user to the key
 * @param {Object} env - Environment with DB access
 * @returns {Promise<Object>} - { id, key, prefix }
 */
async function generateApiKey(userId, keyName, env) {
    try {
        // Generate secure random key
        const randomBytes = crypto.getRandomValues(new Uint8Array(32));
        const keySecret = btoa(String.fromCharCode(...randomBytes))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        const apiKey = `sk_live_${keySecret}`;

        // Hash the key for storage (never store plain text)
        const encoder = new TextEncoder();
        const data = encoder.encode(apiKey);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Store in database
        const keyId = crypto.randomUUID();
        const keyPrefix = apiKey.substring(0, 12) + '...';

        await env.DB.prepare(`
      INSERT INTO api_keys (id, user_id, key_hash, key_prefix, name, created_at)
      VALUES (?, ?, ?, ?, ?, unixepoch())
    `).bind(keyId, userId, keyHash, keyPrefix, keyName).run();

        console.log('✅ API key generated:', keyPrefix);

        // Return the key IN PLAIN TEXT (only time it's visible!)
        return {
            id: keyId,
            key: apiKey, // Show to user ONCE
            prefix: keyPrefix
        };
    } catch (error) {
        console.error('❌ Error generating API key:', error);
        throw error;
    }
}

/**
 * Verify an API key and return user data
 * @param {string} apiKey - API key to verify
 * @param {Object} env - Environment with DB access
 * @returns {Promise<Object|null>} - User data or null if invalid
 */
async function verifyApiKey(apiKey, env) {
    try {
        // Hash the provided key
        const encoder = new TextEncoder();
        const data = encoder.encode(apiKey);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Look up in database
        const result = await env.DB.prepare(`
      SELECT 
        ak.id as key_id,
        ak.user_id,
        ak.name as key_name,
        u.email,
        u.subscription_tier as tier,
        u.credits_balance,
        u.credits_monthly_limit
      FROM api_keys ak
      JOIN users u ON ak.user_id = u.id
      WHERE ak.key_hash = ? AND ak.revoked_at IS NULL
    `).bind(keyHash).first();

        if (!result) {
            console.log('❌ Invalid API key');
            return null;
        }

        // Update last_used_at
        await env.DB.prepare(`
      UPDATE api_keys SET last_used_at = unixepoch() WHERE id = ?
    `).bind(result.key_id).run();

        console.log('✅ API key verified for user:', result.email);

        return result;
    } catch (error) {
        console.error('❌ Error verifying API key:', error);
        return null;
    }
}

/**
 * Log API usage
 * @param {Object} params - { apiKeyId, userId, endpoint, method, statusCode, creditsUsed, responseTimeMs, errorMessage }
 * @param {Object} env - Environment with DB access
 */
async function logApiUsage(params, env) {
    try {
        const {
            apiKeyId,
            userId,
            endpoint,
            method,
            statusCode,
            creditsUsed = 0,
            responseTimeMs = 0,
            errorMessage = null
        } = params;

        await env.DB.prepare(`
      INSERT INTO api_usage_logs 
      (id, api_key_id, user_id, endpoint, method, status_code, credits_used, response_time_ms, error_message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())
    `).bind(
            crypto.randomUUID(),
            apiKeyId,
            userId,
            endpoint,
            method,
            statusCode,
            creditsUsed,
            responseTimeMs,
            errorMessage
        ).run();

        console.log(`📊 API usage logged: ${method} ${endpoint} - ${statusCode}`);
    } catch (error) {
        console.error('❌ Error logging API usage:', error);
        // Don't throw - logging failure shouldn't break the API call
    }
}

/**
 * Deduct credits from user balance
 * @param {string} userId - User ID
 * @param {number} credits - Number of credits to deduct
 * @param {string} actionType - Type of action (for transaction log)
 * @param {Object} env - Environment with DB access
 * @returns {Promise<boolean>} - Success status
 */
async function deductCredits(userId, credits, actionType, env) {
    try {
        // Get current balance
        const user = await env.DB.prepare(`
      SELECT credits_balance FROM users WHERE id = ?
    `).bind(userId).first();

        if (!user || user.credits_balance < credits) {
            console.log('❌ Insufficient credits');
            return false;
        }

        const newBalance = user.credits_balance - credits;

        // Update balance
        await env.DB.prepare(`
      UPDATE users SET credits_balance = ? WHERE id = ?
    `).bind(newBalance, userId).run();

        // Log transaction
        await env.DB.prepare(`
      INSERT INTO credit_transactions 
      (id, user_id, action_type, credits_used, credits_before, credits_after, created_at)
      VALUES (?, ?, ?, ?, ?, ?, unixepoch())
    `).bind(
            crypto.randomUUID(),
            userId,
            actionType,
            credits,
            user.credits_balance,
            newBalance
        ).run();

        console.log(`💳 Credits deducted: ${credits} (${user.credits_balance} → ${newBalance})`);
        return true;
    } catch (error) {
        console.error('❌ Error deducting credits:', error);
        return false;
    }
}

// Export functions
export {
    generateApiKey,
    verifyApiKey,
    logApiUsage,
    deductCredits
};
