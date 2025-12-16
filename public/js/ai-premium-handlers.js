// ============================================================
// AI PREMIUM FEATURES - À intégrer dans worker.js
// ============================================================

// Vérifier les limites d'usage IA par tier
async function checkAIUsageLimit(env, userId, feature) {
    const user = await getUser(env.DB, userId);

    // Quotas par tier
    const limits = {
        'free': 3,
        'premium': 50,
        'pro': -1  // Illimité
    };

    const limit = limits[user.subscription_tier] || 3;

    // Pro = illimité
    if (limit === -1) {
        return { allowed: true, remaining: -1 };
    }

    // Compter l'usage ce mois
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartTimestamp = Math.floor(monthStart.getTime() / 1000);

    const usage = await env.DB.prepare(`
    SELECT COUNT(*) as count
    FROM ai_usage
    WHERE user_id = ? AND feature = ? AND created_at >= ?
  `).bind(userId, feature, monthStartTimestamp).first();

    const usageCount = usage?.count || 0;
    const allowed = usageCount < limit;
    const remaining = Math.max(0, limit - usageCount);

    return { allowed, remaining, used: usageCount, limit };
}

// Enregistrer l'usage IA
async function trackAIUsage(env, userId, feature, tokensUsed = 0) {
    const id = crypto.randomUUID();
    const costEstimate = (tokensUsed / 1000000) * 0.25; // Estimation Claude Haiku

    await env.DB.prepare(`
    INSERT INTO ai_usage (id, user_id, feature, tokens_used, cost_estimate, created_at)
    VALUES (?, ?, ?, ?, ?, unixepoch())
  `).bind(id, userId, feature, tokensUsed, costEstimate).run();
}

// Optimiser CV pour une offre spécifique
async function handleOptimizeCV(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        // Vérifier quota
        const usageCheck = await checkAIUsageLimit(env, auth.userId, 'cv_optimization');
        if (!usageCheck.allowed) {
            return jsonResponse({
                success: false,
                error: 'Limite mensuelle atteinte',
                limitReached: true,
                remaining: 0,
                limit: usageCheck.limit
            }, 403);
        }

        const body = await request.json();
        const { cvText, jobDescription } = body;

        if (!cvText || !jobDescription) {
            return jsonResponse({ success: false, error: 'CV et description requis' }, 400);
        }

        const config = getConfig(env);

        const prompt = `Tu es un expert en optimisation de CV pour le marché suisse. Analyse ce CV et cette offre d'emploi, puis fournis des suggestions concrètes d'optimisation.

CV:
${cvText}

OFFRE D'EMPLOI:
${jobDescription}

Réponds UNIQUEMENT avec ce format JSON exact (sans markdown, sans \`\`\`json):
{
  "matchScore": <nombre entre 0 et 100>,
  "keywordsToAdd": ["mot-clé 1", "mot-clé 2", "mot-clé 3"],
  "sectionsToImprove": [
    {"section": "Expérience", "suggestion": "Ajouter des métriques quantifiables"},
    {"section": "Compétences", "suggestion": "Mettre en avant X, Y, Z"}
  ],
  "missingSkills": ["compétence 1", "compétence 2"],
  "strengthsToEmphasize": ["force 1", "force 2"],
  "overallAdvice": "Conseil général en 2-3 phrases"
}`;

        const response = await fetch(`https://api.anthropic.com/v1/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 2000,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            throw new Error('Erreur API Anthropic');
        }

        const data = await response.json();
        let analysisText = data.content[0].text;

        // Nettoyer le JSON
        analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const analysis = JSON.parse(analysisText);

        // Tracker l'usage
        const tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || 0;
        await trackAIUsage(env, auth.userId, 'cv_optimization', tokensUsed);

        return jsonResponse({
            success: true,
            analysis,
            remaining: usageCheck.remaining - 1
        });

    } catch (error) {
        console.error('❌ Erreur handleOptimizeCV:', error);
        return jsonResponse({
            success: false,
            error: 'Erreur lors de l\'optimisation',
            details: error.message
        }, 500);
    }
}

// Analyse comparative CV vs Offre
async function handleCompareCV(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const usageCheck = await checkAIUsageLimit(env, auth.userId, 'cv_comparison');
        if (!usageCheck.allowed) {
            return jsonResponse({
                success: false,
                error: 'Limite mensuelle atteinte',
                limitReached: true
            }, 403);
        }

        const body = await request.json();
        const { cvText, jobDescription } = body;

        if (!cvText || !jobDescription) {
            return jsonResponse({ success: false, error: 'CV et description requis' }, 400);
        }

        const config = getConfig(env);

        const prompt = `Tu es un expert en recrutement. Compare ce CV avec cette offre d'emploi et fournis une analyse détaillée.

CV:
${cvText}

OFFRE:
${jobDescription}

Réponds UNIQUEMENT avec ce format JSON exact:
{
  "matchScore": <nombre entre 0 et 100>,
  "strengths": [
    {"title": "Force 1", "description": "Explication"},
    {"title": "Force 2", "description": "Explication"}
  ],
  "gaps": [
    {"title": "Manque 1", "description": "Explication", "severity": "high|medium|low"},
    {"title": "Manque 2", "description": "Explication", "severity": "high|medium|low"}
  ],
  "recommendations": [
    "Action concrète 1",
    "Action concrète 2",
    "Action concrète 3"
  ],
  "verdict": "Résumé global en 2-3 phrases"
}`;

        const response = await fetch(`https://api.anthropic.com/v1/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 2000,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            throw new Error('Erreur API Anthropic');
        }

        const data = await response.json();
        let analysisText = data.content[0].text;
        analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const analysis = JSON.parse(analysisText);

        const tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || 0;
        await trackAIUsage(env, auth.userId, 'cv_comparison', tokensUsed);

        return jsonResponse({
            success: true,
            analysis,
            remaining: usageCheck.remaining - 1
        });

    } catch (error) {
        console.error('❌ Erreur handleCompareCV:', error);
        return jsonResponse({
            success: false,
            error: 'Erreur lors de l\'analyse',
            details: error.message
        }, 500);
    }
}

// Statistiques d'usage IA
async function handleGetAIUsage(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthStartTimestamp = Math.floor(monthStart.getTime() / 1000);

        const usage = await env.DB.prepare(`
      SELECT feature, COUNT(*) as count, SUM(tokens_used) as tokens
      FROM ai_usage
      WHERE user_id = ? AND created_at >= ?
      GROUP BY feature
    `).bind(auth.userId, monthStartTimestamp).all();

        const user = await getUser(env.DB, auth.userId);
        const limits = { 'free': 3, 'premium': 50, 'pro': -1 };
        const limit = limits[user.subscription_tier] || 3;

        return jsonResponse({
            success: true,
            usage: usage.results || [],
            limit,
            tier: user.subscription_tier
        });

    } catch (error) {
        console.error('❌ Erreur handleGetAIUsage:', error);
        return jsonResponse({ success: false, error: 'Erreur' }, 500);
    }
}
