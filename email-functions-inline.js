// ==========================================
// EMAIL NOTIFICATION SYSTEM - INLINE FUNCTIONS
// Added: 2026-01-15
// ==========================================

// Email Templates
const JOB_ALERT_TEMPLATE = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;background-color:#f5f5f5}.container{background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#D50000 0%,#B80000 100%);color:white;padding:30px;text-align:center}.header h1{margin:0 0 10px 0;font-size:24px}.header p{margin:0;font-size:14px;opacity:0.9}.content{padding:30px}.job-card{background:#FAFAFA;border-left:4px solid #D50000;padding:20px;margin:15px 0;border-radius:6px}.job-title{font-size:18px;font-weight:600;color:#D50000;margin:0 0 10px 0}.job-meta{font-size:14px;color:#666;margin:5px 0}.job-company{font-weight:600;color:#333}.job-salary{color:#059669;font-weight:600;margin-top:10px}.cta-button{display:inline-block;background:#D50000;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;margin:10px 0;font-weight:600}.tips{background:#F0F9FF;border-left:4px solid #0284C7;padding:20px;margin:20px 0;border-radius:6px}.tips h3{margin:0 0 10px 0;color:#0284C7}.footer{text-align:center;padding:20px;color:#999;font-size:13px;border-top:1px solid #E6E6E6}.footer a{color:#D50000;text-decoration:none}</style></head><body><div class="container"><div class="header"><h1>🎯 Nouvelles offres d'emploi !</h1><p>{{JOB_COUNT}} nouvelles offres correspondent à "{{SEARCH_NAME}}"</p></div><div class="content"><p>Bonjour {{USER_NAME}},</p><p>Nous avons trouvé <strong>{{JOB_COUNT}} nouvelles offres</strong> qui correspondent à votre recherche sauvegardée <strong>"{{SEARCH_NAME}}"</strong> :</p>{{JOBS_HTML}}<center style="margin-top:30px;"><a href="https://swisscv-pro.ch/app/job-search.html?search={{SEARCH_ID}}" class="cta-button">🔍 Voir toutes les offres ({{TOTAL_COUNT}})</a></center><div class="tips"><h3>💡 Conseil SwissCV Pro</h3><p>Pour maximiser vos chances :</p><ul style="margin:10px 0;"><li>Analysez votre CV avec notre outil pour chaque offre</li><li>Adaptez vos mots-clés selon le score ATS</li><li>Générez une lettre de motivation personnalisée</li></ul></div><p style="font-size:13px;color:#999;margin-top:30px;">Vous recevez cet email car vous avez activé les alertes pour la recherche "{{SEARCH_NAME}}". <a href="https://swisscv-pro.ch/app/profile.html#notifications" style="color:#D50000;">Gérer mes préférences</a></p></div><div class="footer"><p><strong>SwissCV Pro</strong> — Votre assistant carrière pour le marché suisse</p><p><a href="https://swisscv-pro.ch">swisscv-pro.ch</a> • <a href="mailto:contact@swisscv-pro.ch">contact@swisscv-pro.ch</a></p></div></div></body></html>`;

// Helper: Generate job cards HTML
function generateJobCardsHTML(jobs) {
    return jobs.map(job => {
        const escapeHtml = (text) => {
            if (!text) return '';
            return String(text).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
        };

        return `<div class="job-card"><h2 class="job-title">${escapeHtml(job.title)}</h2><p class="job-meta"><span class="job-company">📍 ${escapeHtml(job.company)}</span> • ${escapeHtml(job.location)}</p><p style="margin:10px 0;color:#666;">${escapeHtml(job.description.substring(0, 150))}...</p>${job.salary ? `<p class="job-salary">💰 ${job.salary}</p>` : ''}<a href="${job.url}" class="cta-button">Voir l'offre</a></div>`;
    }).join('');
}

// Send email via SendGrid
async function sendEmailNotification(env, to, subject, htmlContent) {
    const config = getConfig(env);

    if (!config.SENDGRID_API_KEY) {
        console.warn('⚠️ SendGrid API key not configured');
        return false;
    }

    try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalizations: [{
                    to: [{ email: to }]
                }],
                from: {
                    email: 'alerts@swisscv-pro.ch',
                    name: 'SwissCV Pro Alertes'
                },
                subject: subject,
                content: [{
                    type: 'text/html',
                    value: htmlContent
                }]
            })
        });

        if (response.ok) {
            console.log(`✅ Email sent to ${to}: ${subject}`);
            return true;
        } else {
            const errorText = await response.text();
            console.error(`❌ SendGrid error:`, errorText);
            return false;
        }
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return false;
    }
}

// Toggle email alerts for saved search
async function handleToggleEmailAlerts(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const body = await request.json();
        const { search_id, enabled } = body;

        if (!search_id) {
            return jsonResponse({ success: false, error: 'search_id required' }, 400);
        }

        const result = await env.DB.prepare(`
      UPDATE saved_searches 
      SET email_alerts = ? 
      WHERE id = ? AND user_id = ?
    `).bind(enabled ? 1 : 0, search_id, auth.userId).run();

        if (result.changes === 0) {
            return jsonResponse({ success: false, error: 'Search not found' }, 404);
        }

        return jsonResponse({
            success: true,
            message: enabled ? 'Alertes email activées' : 'Alertes email désactivées'
        });
    } catch (error) {
        console.error('❌ Error toggling email alerts:', error);
        return jsonResponse({ success: false, error: 'Internal server error' }, 500);
    }
}

// Update user email preferences
async function handleUpdateEmailPreferences(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const body = await request.json();
        const { email_notifications, email_frequency } = body;

        const updates = [];
        const params = [];

        if (email_notifications !== undefined) {
            updates.push('email_notifications = ?');
            params.push(email_notifications ? 1 : 0);
        }

        if (email_frequency && ['immediate', 'daily', 'weekly'].includes(email_frequency)) {
            updates.push('email_frequency = ?');
            params.push(email_frequency);
        }

        if (updates.length === 0) {
            return jsonResponse({ success: false, error: 'No valid fields to update' }, 400);
        }

        params.push(auth.userId);

        await env.DB.prepare(`
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...params).run();

        return jsonResponse({
            success: true,
            message: 'Préférences email mises à jour'
        });
    } catch (error) {
        console.error('❌ Error updating email preferences:', error);
        return jsonResponse({ success: false, error: 'Internal server error' }, 500);
    }
}

// Check new jobs and send email alerts (CRON JOB)
async function checkNewJobsForAlerts(env) {
    console.log('🔔 Checking new jobs for email alerts...');

    try {
        const searches = await env.DB.prepare(`
      SELECT ss.*, u.email, u.full_name
      FROM saved_searches ss
      JOIN users u ON ss.user_id = u.id
      WHERE ss.email_alerts = 1 
        AND (u.email_notifications IS NULL OR u.email_notifications = 1)
    `).all();

        console.log(`Found ${searches.results.length} searches with alerts enabled`);

        for (const search of searches.results) {
            try {
                const lastCheck = search.last_alert_sent || (Math.floor(Date.now() / 1000) - 86400);
                const config = getConfig(env);
                const keywords = encodeURIComponent(search.keywords || '');
                const location = encodeURIComponent(search.location || '');

                const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/ch/search/1?app_id=${config.ADZUNA_APP_ID}&app_key=${config.ADZUNA_APP_KEY}&what=${keywords}&where=${location}&results_per_page=10&sort_by=date`;

                const response = await fetch(adzunaUrl);
                if (!response.ok) continue;

                const data = await response.json();
                const newJobs = (data.results || []).filter(job => {
                    const jobDate = new Date(job.created).getTime() / 1000;
                    return jobDate > lastCheck;
                });

                console.log(`Found ${newJobs.length} new jobs for search "${search.name}"`);

                if (newJobs.length > 0) {
                    const jobsData = newJobs.slice(0, 5).map(job => ({
                        title: job.title,
                        company: job.company.display_name,
                        location: job.location.display_name,
                        description: job.description || '',
                        salary: job.salary_min && job.salary_max
                            ? `CHF ${Math.round(job.salary_min).toLocaleString()} - ${Math.round(job.salary_max).toLocaleString()}`
                            : null,
                        url: job.redirect_url
                    }));

                    const jobsHtml = generateJobCardsHTML(jobsData);
                    const emailHtml = JOB_ALERT_TEMPLATE
                        .replace(/{{USER_NAME}}/g, search.full_name || 'Cher utilisateur')
                        .replace(/{{SEARCH_NAME}}/g, search.name)
                        .replace(/{{JOB_COUNT}}/g, newJobs.length)
                        .replace(/{{TOTAL_COUNT}}/g, newJobs.length)
                        .replace(/{{SEARCH_ID}}/g, search.id)
                        .replace('{{JOBS_HTML}}', jobsHtml);

                    await sendEmailNotification(env, search.email, `🎯 ${newJobs.length} nouvelles offres : ${search.name}`, emailHtml);

                    await env.DB.prepare(`UPDATE saved_searches SET last_alert_sent = unixepoch() WHERE id = ?`).bind(search.id).run();

                    await createNotification(env, search.user_id, 'job_alert', `${newJobs.length} nouvelles offres`, `${newJobs.length} nouvelles offres correspondent à votre recherche "${search.name}"`, `/app/job-search.html?search=${search.id}`);
                }
            } catch (searchError) {
                console.error(`❌ Error processing search "${search.name}":`, searchError);
            }
        }

        console.log('✅ Job alerts check completed');
    } catch (error) {
        console.error('❌ Error in checkNewJobsForAlerts:', error);
    }
}
