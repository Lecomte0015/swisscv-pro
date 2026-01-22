// ============================================
// GRAPHIQUES RÉELS - Endpoints Analytics
// À ajouter dans worker.js après handleAdminAnalyticsExport
// ============================================

// GET /admin/analytics/analyses-daily - Analyses CV par jour (7 derniers jours)
async function handleAdminAnalysesDaily(request, env) {
    try {
        const analyses = await env.DB.prepare(`
      SELECT 
        date(created_at, 'unixepoch') as date,
        COUNT(*) as count
      FROM cv_analyses
      WHERE created_at >= unixepoch('now', '-7 days')
      GROUP BY date(created_at, 'unixepoch')
      ORDER BY date
    `).all();

        // Remplir les jours manquants avec 0
        const today = new Date();
        const last7Days = [];
        const counts = {};

        // Créer map des counts existants
        if (analyses.results) {
            analyses.results.forEach(row => {
                counts[row.date] = row.count;
            });
        }

        // Générer les 7 derniers jours
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days.push({
                date: dateStr,
                count: counts[dateStr] || 0
            });
        }

        return new Response(JSON.stringify({
            dates: last7Days.map(d => d.date),
            counts: last7Days.map(d => d.count)
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('Get analyses daily error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to get analyses data',
            dates: [],
            counts: []
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}

// GET /admin/analytics/funnel - Funnel de conversion
async function handleAdminFunnel(request, env) {
    try {
        // Étape 1: Total utilisateurs inscrits
        const totalUsers = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL
    `).first();

        // Étape 2: Utilisateurs qui ont fait au moins 1 analyse
        const activeUsers = await env.DB.prepare(`
      SELECT COUNT(DISTINCT user_id) as count FROM cv_analyses
    `).first();

        // Étape 3: Utilisateurs Premium/Pro (conversions payantes)
        const paidUsers = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE subscription_tier IN ('premium', 'pro') AND deleted_at IS NULL
    `).first();

        // Étape 4: Utilisateurs Pro (conversion ultime)
        const proUsers = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE subscription_tier = 'pro' AND deleted_at IS NULL
    `).first();

        return new Response(JSON.stringify({
            labels: ['Inscrits', 'Actifs', 'Premium/Pro', 'Pro'],
            data: [
                totalUsers?.count || 0,
                activeUsers?.count || 0,
                paidUsers?.count || 0,
                proUsers?.count || 0
            ]
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('Get funnel error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to get funnel data',
            labels: ['Inscrits', 'Actifs', 'Premium/Pro', 'Pro'],
            data: [0, 0, 0, 0]
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}

// ============================================
// ROUTES À AJOUTER
// ============================================

/*
// Analytics - Graphiques réels
if (url.pathname === '/admin/analytics/analyses-daily' && request.method === 'GET') {
  return handleAdminAnalysesDaily(request, env);
}

if (url.pathname === '/admin/analytics/funnel' && request.method === 'GET') {
  return handleAdminFunnel(request, env);
}
*/
