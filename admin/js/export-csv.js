// ============================================
// EXPORT CSV ANALYTICS
// À ajouter dans worker.js après les fonctions support
// ============================================

// GET /admin/analytics/export - Export CSV des analytics
async function handleAdminAnalyticsExport(request, env) {
    try {
        // Récupérer toutes les données
        const metrics = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN subscription_tier = 'free' THEN 1 END) as free_users,
        COUNT(CASE WHEN subscription_tier = 'premium' THEN 1 END) as premium_users,
        COUNT(CASE WHEN subscription_tier = 'pro' THEN 1 END) as pro_users
      FROM users WHERE deleted_at IS NULL
    `).first();

        const analyses = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM cv_analyses
    `).first();

        // Inscriptions par jour (30 derniers jours)
        const registrations = await env.DB.prepare(`
      SELECT 
        date(created_at, 'unixepoch') as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= unixepoch('now', '-30 days')
      GROUP BY date(created_at, 'unixepoch')
      ORDER BY date
    `).all();

        // Générer CSV
        let csv = 'Métrique,Valeur\n';
        csv += `Total Utilisateurs,${metrics.total_users}\n`;
        csv += `Utilisateurs Free,${metrics.free_users}\n`;
        csv += `Utilisateurs Premium,${metrics.premium_users}\n`;
        csv += `Utilisateurs Pro,${metrics.pro_users}\n`;
        csv += `Total Analyses CV,${analyses.total}\n`;
        csv += `\nInscriptions par Jour (30 derniers jours)\n`;
        csv += `Date,Nombre\n`;

        if (registrations.results) {
            registrations.results.forEach(row => {
                csv += `${row.date},${row.count}\n`;
            });
        }

        return new Response(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="analytics-${new Date().toISOString().split('T')[0]}.csv"`,
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('Export CSV error:', error);
        return new Response(JSON.stringify({ error: 'Failed to export CSV', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}

// ============================================
// ROUTE À AJOUTER
// ============================================

/*
if (url.pathname === '/admin/analytics/export' && request.method === 'GET') {
  return handleAdminAnalyticsExport(request, env);
}
*/
