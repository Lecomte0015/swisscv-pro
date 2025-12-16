/**
 * Email Reports System
 * Génération et envoi automatique de rapports statistiques par email
 */

// Template HTML pour le rapport email
function generateReportHTML(stats, reportType) {
    const period = reportType === 'weekly' ? 'cette semaine' : 'ce mois';
    const date = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport SwissCV - ${reportType}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #667eea; }
        .header h1 { color: #667eea; margin: 0; font-size: 28px; }
        .header p { color: #666; margin: 10px 0 0; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0; }
        .stat-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-box .number { font-size: 32px; font-weight: bold; margin: 0; }
        .stat-box .label { font-size: 14px; opacity: 0.9; margin: 5px 0 0; }
        .section { margin: 30px 0; }
        .section h2 { color: #333; font-size: 20px; margin-bottom: 15px; }
        .metric { display: flex; justify-content: space-between; padding: 12px; background: #f8f9fa; border-radius: 6px; margin-bottom: 10px; }
        .metric-label { color: #666; }
        .metric-value { font-weight: bold; color: #667eea; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
        .cta { text-align: center; margin: 30px 0; }
        .cta a { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 SwissCV Admin</h1>
            <p>Rapport ${reportType === 'weekly' ? 'Hebdomadaire' : 'Mensuel'} - ${date}</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-box">
                <p class="number">${stats.new_users || 0}</p>
                <p class="label">Nouveaux Utilisateurs</p>
            </div>
            <div class="stat-box">
                <p class="number">${stats.total_analyses || 0}</p>
                <p class="label">Analyses CV</p>
            </div>
            <div class="stat-box">
                <p class="number">${stats.open_tickets || 0}</p>
                <p class="label">Tickets Ouverts</p>
            </div>
            <div class="stat-box">
                <p class="number">€${stats.mrr || 0}</p>
                <p class="label">MRR</p>
            </div>
        </div>
        
        <div class="section">
            <h2>📊 Détails ${period}</h2>
            <div class="metric">
                <span class="metric-label">Total Utilisateurs</span>
                <span class="metric-value">${stats.total_users || 0}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Utilisateurs Premium</span>
                <span class="metric-value">${stats.premium_users || 0}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Tickets Résolus</span>
                <span class="metric-value">${stats.resolved_tickets || 0}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Taux de Conversion</span>
                <span class="metric-value">${stats.conversion_rate || 0}%</span>
            </div>
        </div>
        
        <div class="cta">
            <a href="https://swisscv-pro.pages.dev/admin-dashboard.html">Voir le Dashboard</a>
        </div>
        
        <div class="footer">
            <p>Ce rapport a été généré automatiquement par SwissCV Admin</p>
            <p>Pour modifier vos préférences, connectez-vous au dashboard admin</p>
        </div>
    </div>
</body>
</html>
    `.trim();
}

// Collecter les statistiques pour le rapport
async function collectReportStats(env, reportType) {
    const now = Math.floor(Date.now() / 1000);
    const periodStart = reportType === 'weekly'
        ? now - (7 * 24 * 60 * 60)  // 7 jours
        : now - (30 * 24 * 60 * 60); // 30 jours

    try {
        // Stats utilisateurs
        const userStats = await env.DB.prepare(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN subscription_tier = 'premium' OR subscription_tier = 'pro' THEN 1 ELSE 0 END) as premium_users,
                SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as new_users
            FROM users
        `).bind(periodStart).first();

        // Stats analyses CV
        const analysisStats = await env.DB.prepare(`
            SELECT COUNT(*) as total_analyses
            FROM cv_analyses
            WHERE created_at >= ?
        `).bind(periodStart).first();

        // Stats tickets support
        const ticketStats = await env.DB.prepare(`
            SELECT 
                SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_tickets,
                SUM(CASE WHEN status = 'resolved' AND updated_at >= ? THEN 1 ELSE 0 END) as resolved_tickets
            FROM support_tickets
        `).bind(periodStart).first();

        // MRR approximatif (premium = 9€, pro = 19€)
        const mrr = (userStats.premium_users || 0) * 14; // Moyenne

        // Taux de conversion
        const conversion_rate = userStats.total_users > 0
            ? ((userStats.premium_users / userStats.total_users) * 100).toFixed(1)
            : 0;

        return {
            ...userStats,
            ...analysisStats,
            ...ticketStats,
            mrr,
            conversion_rate
        };
    } catch (error) {
        console.error('Error collecting stats:', error);
        return {
            total_users: 0,
            premium_users: 0,
            new_users: 0,
            total_analyses: 0,
            open_tickets: 0,
            resolved_tickets: 0,
            mrr: 0,
            conversion_rate: 0
        };
    }
}

// Envoyer un rapport email (utilise Resend par défaut)
async function sendEmailReport(env, adminId, reportType = 'manual') {
    try {
        // Récupérer config email admin
        const settings = await env.DB.prepare(`
            SELECT email FROM email_report_settings WHERE admin_id = ? AND enabled = 1
        `).bind(adminId).first();

        if (!settings) {
            throw new Error('Email reports not enabled for this admin');
        }

        // Collecter stats
        const stats = await collectReportStats(env, reportType);

        // Générer HTML
        const htmlContent = generateReportHTML(stats, reportType);

        // Envoyer via Resend (nécessite clé API dans env.RESEND_API_KEY)
        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'SwissCV Admin <admin@swisscv.com>',
                to: [settings.email],
                subject: `📊 Rapport ${reportType === 'weekly' ? 'Hebdomadaire' : 'Mensuel'} SwissCV`,
                html: htmlContent
            })
        });

        const result = await emailResponse.json();

        if (!emailResponse.ok) {
            throw new Error(result.message || 'Email send failed');
        }

        // Logger succès
        await env.DB.prepare(`
            INSERT INTO email_report_history (admin_id, report_type, status, stats_snapshot)
            VALUES (?, ?, 'success', ?)
        `).bind(adminId, reportType, JSON.stringify(stats)).run();

        // Mettre à jour last_sent
        await env.DB.prepare(`
            UPDATE email_report_settings SET last_sent = ? WHERE admin_id = ?
        `).bind(Math.floor(Date.now() / 1000), adminId).run();

        return { success: true, stats };
    } catch (error) {
        console.error('Error sending email report:', error);

        // Logger échec
        await env.DB.prepare(`
            INSERT INTO email_report_history (admin_id, report_type, status, error_message)
            VALUES (?, ?, 'failed', ?)
        `).bind(adminId, reportType, error.message).run();

        return { success: false, error: error.message };
    }
}

// POST /admin/reports/send - Envoi manuel
async function handleAdminSendReport(request, env, adminId) {
    try {
        const result = await sendEmailReport(env, adminId, 'manual');

        if (result.success) {
            return new Response(JSON.stringify({
                success: true,
                message: 'Rapport envoyé avec succès',
                stats: result.stats
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({
                error: result.error
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// GET /admin/reports/settings
async function handleAdminGetReportSettings(request, env, adminId) {
    try {
        const settings = await env.DB.prepare(`
            SELECT id, frequency, email, last_sent, enabled, created_at
            FROM email_report_settings WHERE admin_id = ?
        `).bind(adminId).first();

        const history = await env.DB.prepare(`
            SELECT id, report_type, sent_at, status, error_message
            FROM email_report_history 
            WHERE admin_id = ?
            ORDER BY sent_at DESC
            LIMIT 10
        `).bind(adminId).all();

        return new Response(JSON.stringify({
            settings: settings || null,
            history: history.results
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// PATCH /admin/reports/settings
async function handleAdminUpdateReportSettings(request, env, adminId) {
    try {
        const body = await request.json();
        const { frequency, enabled } = body;

        if (frequency && !['weekly', 'monthly', 'disabled'].includes(frequency)) {
            return new Response(JSON.stringify({
                error: 'Invalid frequency. Must be: weekly, monthly, or disabled'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Mettre à jour
        await env.DB.prepare(`
            UPDATE email_report_settings 
            SET frequency = COALESCE(?, frequency),
                enabled = COALESCE(?, enabled),
                updated_at = ?
            WHERE admin_id = ?
        `).bind(frequency, enabled, Math.floor(Date.now() / 1000), adminId).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sendEmailReport,
        handleAdminSendReport,
        handleAdminGetReportSettings,
        handleAdminUpdateReportSettings
    };
}
