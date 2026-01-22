// ==========================================
// EMAIL NOTIFICATION ENDPOINTS
// SwissCV Pro - Email Alerts System
// Date: 2026-01-15
// ==========================================
// These endpoints are ISOLATED and do NOT affect existing functionality

// Import email templates
import { JOB_ALERT_TEMPLATE, FEATURE_ANNOUNCEMENT_TEMPLATE, generateJobCardsHTML } from './email-templates-alerts.js';

// ==========================================
// 1. TOGGLE EMAIL ALERTS FOR SAVED SEARCH
// ==========================================
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

        // Update saved search email alerts setting
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
        return jsonResponse({
            success: false,
            error: 'Internal server error',
            details: error.message
        }, 500);
    }
}

// ==========================================
// 2. UPDATE USER EMAIL PREFERENCES
// ==========================================
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
        return jsonResponse({
            success: false,
            error: 'Internal server error',
            details: error.message
        }, 500);
    }
}

// ==========================================
// 3. SEND EMAIL VIA SENDGRID
// ==========================================
async function sendEmail(env, to, subject, htmlContent) {
    const config = getConfig(env);

    // Check if SendGrid is configured
    if (!config.SENDGRID_API_KEY) {
        console.warn('⚠️ SendGrid API key not configured, email not sent');
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
            console.error(`❌ SendGrid error for ${to}:`, errorText);
            return false;
        }
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return false;
    }
}

// ==========================================
// 4. CHECK NEW JOBS FOR ALERTS (CRON JOB)
// ==========================================
async function checkNewJobsForAlerts(env) {
    console.log('🔔 Checking new jobs for email alerts...');

    try {
        // Get all saved searches with email alerts enabled
        const searches = await env.DB.prepare(`
      SELECT ss.*, u.email, u.full_name
      FROM saved_searches ss
      JOIN users u ON ss.user_id = u.id
      WHERE ss.email_alerts = 1 
        AND u.email_notifications = 1
    `).all();

        console.log(`Found ${searches.results.length} searches with alerts enabled`);

        for (const search of searches.results) {
            try {
                // Calculate time since last alert (default: 24h ago)
                const lastCheck = search.last_alert_sent || (Math.floor(Date.now() / 1000) - 86400);

                // Call Adzuna API
                const config = getConfig(env);
                const keywords = encodeURIComponent(search.keywords || '');
                const location = encodeURIComponent(search.location || '');

                const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/ch/search/1?app_id=${config.ADZUNA_APP_ID}&app_key=${config.ADZUNA_APP_KEY}&what=${keywords}&where=${location}&results_per_page=10&sort_by=date`;

                const response = await fetch(adzunaUrl);
                if (!response.ok) {
                    console.error(`❌ Adzuna API error for search "${search.name}"`);
                    continue;
                }

                const data = await response.json();

                // Filter jobs posted since last check
                const newJobs = (data.results || []).filter(job => {
                    const jobDate = new Date(job.created).getTime() / 1000;
                    return jobDate > lastCheck;
                });

                console.log(`Found ${newJobs.length} new jobs for search "${search.name}"`);

                // Send email if new jobs found
                if (newJobs.length > 0) {
                    await sendJobAlertEmail(env, search, newJobs);

                    // Update last_alert_sent
                    await env.DB.prepare(`
            UPDATE saved_searches 
            SET last_alert_sent = unixepoch() 
            WHERE id = ?
          `).bind(search.id).run();

                    // Create in-app notification
                    await createNotification(
                        env,
                        search.user_id,
                        'job_alert',
                        `${newJobs.length} nouvelles offres`,
                        `${newJobs.length} nouvelles offres correspondent à votre recherche "${search.name}"`,
                        `/app/job-search.html?search=${search.id}`
                    );
                }
            } catch (searchError) {
                console.error(`❌ Error processing search "${search.name}":`, searchError);
                // Continue with next search
            }
        }

        console.log('✅ Job alerts check completed');
    } catch (error) {
        console.error('❌ Error in checkNewJobsForAlerts:', error);
    }
}

// ==========================================
// 5. SEND JOB ALERT EMAIL
// ==========================================
async function sendJobAlertEmail(env, search, jobs) {
    try {
        // Prepare jobs data
        const jobsData = jobs.slice(0, 5).map(job => ({
            title: job.title,
            company: job.company.display_name,
            location: job.location.display_name,
            description: job.description || '',
            salary: job.salary_min && job.salary_max
                ? `CHF ${Math.round(job.salary_min).toLocaleString()} - ${Math.round(job.salary_max).toLocaleString()}`
                : null,
            url: job.redirect_url
        }));

        // Generate HTML for job cards
        const jobsHtml = generateJobCardsHTML(jobsData);

        // Replace template variables
        const emailHtml = JOB_ALERT_TEMPLATE
            .replace(/{{USER_NAME}}/g, search.full_name || 'Cher utilisateur')
            .replace(/{{SEARCH_NAME}}/g, search.name)
            .replace(/{{JOB_COUNT}}/g, jobs.length)
            .replace(/{{TOTAL_COUNT}}/g, jobs.length)
            .replace(/{{SEARCH_ID}}/g, search.id)
            .replace('{{JOBS_HTML}}', jobsHtml);

        // Send email
        const subject = `🎯 ${jobs.length} nouvelles offres : ${search.name}`;
        await sendEmail(env, search.email, subject, emailHtml);

    } catch (error) {
        console.error('❌ Error sending job alert email:', error);
    }
}

// ==========================================
// 6. SEND FEATURE ANNOUNCEMENT (ADMIN)
// ==========================================
async function handleSendFeatureAnnouncement(request, env) {
    // Require admin authentication
    const adminAuth = await requireAdmin(request, env);
    if (!adminAuth.authorized) {
        return adminAuth.response;
    }

    try {
        const body = await request.json();
        const { feature_title, feature_description, feature_steps, feature_url, target_tiers } = body;

        if (!feature_title || !feature_description) {
            return jsonResponse({
                success: false,
                error: 'feature_title and feature_description required'
            }, 400);
        }

        // Get users based on target tiers (default: all)
        const tiers = target_tiers || ['free', 'premium', 'pro'];
        const placeholders = tiers.map(() => '?').join(',');

        const users = await env.DB.prepare(`
      SELECT email, full_name 
      FROM users 
      WHERE subscription_tier IN (${placeholders})
        AND email_notifications = 1
    `).bind(...tiers).all();

        console.log(`📧 Sending feature announcement to ${users.results.length} users`);

        // Prepare email HTML
        const stepsHtml = feature_steps
            ? `<ol>${feature_steps.map(step => `<li>${step}</li>`).join('')}</ol>`
            : '';

        let sentCount = 0;
        let failedCount = 0;

        // Send to each user
        for (const user of users.results) {
            try {
                const emailHtml = FEATURE_ANNOUNCEMENT_TEMPLATE
                    .replace(/{{USER_NAME}}/g, user.full_name || 'Cher utilisateur')
                    .replace(/{{FEATURE_TITLE}}/g, feature_title)
                    .replace(/{{FEATURE_DESCRIPTION}}/g, feature_description)
                    .replace(/{{FEATURE_STEPS}}/g, stepsHtml)
                    .replace(/{{FEATURE_URL}}/g, feature_url || 'https://swisscv-pro.ch');

                const success = await sendEmail(
                    env,
                    user.email,
                    `🎉 Nouvelle fonctionnalité : ${feature_title}`,
                    emailHtml
                );

                if (success) {
                    sentCount++;
                } else {
                    failedCount++;
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (userError) {
                console.error(`❌ Error sending to ${user.email}:`, userError);
                failedCount++;
            }
        }

        return jsonResponse({
            success: true,
            message: `Feature announcement sent`,
            sent: sentCount,
            failed: failedCount,
            total: users.results.length
        });

    } catch (error) {
        console.error('❌ Error sending feature announcement:', error);
        return jsonResponse({
            success: false,
            error: 'Internal server error',
            details: error.message
        }, 500);
    }
}

// Export functions for use in main worker
export {
    handleToggleEmailAlerts,
    handleUpdateEmailPreferences,
    checkNewJobsForAlerts,
    handleSendFeatureAnnouncement
};
