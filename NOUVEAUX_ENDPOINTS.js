// ========================================
// NOUVEAUX ENDPOINTS À AJOUTER AU WORKER
// ========================================
// Ces endpoints ont été créés entre le 9 et le 13 décembre
// Copier-coller ces fonctions dans worker.js AVANT "// MAIN ROUTER"

// ========================================
// 1. JOB TRACKER ENDPOINTS
// ========================================

async function handleAddJobApplication(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const body = await request.json();
        const { job_title, company, job_url, status } = body;

        if (!job_title || !company) {
            return jsonResponse({ success: false, error: 'job_title and company are required' }, 400);
        }

        const validStatuses = ['a_consulter', 'interesse', 'postule', 'entretien', 'offre', 'refuse'];
        const finalStatus = validStatuses.includes(status) ? status : 'a_consulter';

        const appId = crypto.randomUUID();
        const now = Math.floor(Date.now() / 1000);

        await env.DB.prepare(`
            INSERT INTO job_applications (
                id, user_id, job_title, company, job_url, status, 
                applied_date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            appId,
            auth.userId,
            job_title.trim(),
            company.trim(),
            job_url || null,
            finalStatus,
            now,
            now,
            now
        ).run();

        return jsonResponse({
            success: true,
            application_id: appId,
            message: 'Candidature ajoutée'
        });

    } catch (error) {
        console.error('❌ Erreur handleAddJobApplication:', error);
        return jsonResponse({
            success: false,
            error: 'Failed to add application',
            details: error.message
        }, 500);
    }
}

async function handleGetJobTrackerKanban(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const applications = await env.DB.prepare(`
            SELECT 
                id, job_title, company, job_url, status, 
                applied_date, deadline, reminder_date, 
                created_at, updated_at
            FROM job_applications
            WHERE user_id = ? AND deleted_at IS NULL
            ORDER BY created_at DESC
        `).bind(auth.userId).all();

        return jsonResponse({
            success: true,
            kanban: applications.results || []
        });

    } catch (error) {
        console.error('❌ Erreur handleGetJobTrackerKanban:', error);
        return jsonResponse({
            success: false,
            error: 'Failed to get kanban',
            details: error.message
        }, 500);
    }
}

async function handleDeleteJobApplication(request, env, applicationId) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const app = await env.DB.prepare(`
            SELECT id FROM job_applications 
            WHERE id = ? AND user_id = ? AND deleted_at IS NULL
        `).bind(applicationId, auth.userId).first();

        if (!app) {
            return jsonResponse({ success: false, error: 'Application not found' }, 404);
        }

        await env.DB.prepare(`
            UPDATE job_applications 
            SET deleted_at = unixepoch(), updated_at = unixepoch()
            WHERE id = ? AND user_id = ?
        `).bind(applicationId, auth.userId).run();

        return jsonResponse({
            success: true,
            message: 'Candidature supprimée'
        });

    } catch (error) {
        console.error('❌ Erreur handleDeleteJobApplication:', error);
        return jsonResponse({
            success: false,
            error: 'Failed to delete application',
            details: error.message
        }, 500);
    }
}

// ========================================
// 2. ROUTES À AJOUTER DANS LE MAIN ROUTER
// ========================================
// Copier ces lignes dans la section MAIN ROUTER

/*
    // Job Tracker
    if (url.pathname === '/job-tracker/applications' && request.method === 'POST') {
        return handleAddJobApplication(request, env);
    }

    if (url.pathname === '/job-tracker/kanban' && request.method === 'GET') {
        return handleGetJobTrackerKanban(request, env);
    }

    if (url.pathname.match(/^\/applications\/[^\/]+$/) && request.method === 'DELETE') {
        const applicationId = url.pathname.split('/')[2];
        return handleDeleteJobApplication(request, env, applicationId);
    }

    if (url.pathname.match(/^\/applications\/[^\/]+\/status$/) && request.method === 'PUT') {
        const applicationId = url.pathname.split('/')[2];
        return handleUpdateJobApplicationStatus(request, env, applicationId);
    }

    if (url.pathname.match(/^\/applications\/[^\/]+\/note$/) && request.method === 'POST') {
        const applicationId = url.pathname.split('/')[2];
        return handleAddApplicationNote(request, env, applicationId);
    }

    if (url.pathname.match(/^\/applications\/[^\/]+\/timeline$/) && request.method === 'GET') {
        const applicationId = url.pathname.split('/')[2];
        return handleGetApplicationTimeline(request, env, applicationId);
    }

    if (url.pathname.match(/^\/applications\/[^\/]+\/reminder$/) && request.method === 'PUT') {
        const applicationId = url.pathname.split('/')[2];
        return handleSetApplicationReminder(request, env, applicationId);
    }

    if (url.pathname === '/job-tracker/stats' && request.method === 'GET') {
        return handleGetApplicationStats(request, env);
    }

    if (url.pathname === '/job-tracker/reminders' && request.method === 'GET') {
        return handleGetActiveReminders(request, env);
    }

    // Favorites
    if (url.pathname === '/jobs/favorites' && request.method === 'GET') {
        return handleGetFavorites(request, env);
    }

    // Notifications
    if (url.pathname === '/notifications' && request.method === 'GET') {
        return handleGetNotifications(request, env);
    }

    // Analytics
    if (url.pathname === '/api/analytics/overview' && request.method === 'GET') {
        return handleGetAnalyticsOverview(request, env);
    }
*/

// ========================================
// INSTRUCTIONS D'INSTALLATION
// ========================================
/*
1. Ouvrir worker.js
2. Chercher "// MAIN ROUTER"
3. AVANT cette ligne, copier toutes les fonctions ci-dessus
4. DANS le MAIN ROUTER (après "const url = new URL(request.url);"), 
   copier les routes commentées
5. Sauvegarder
6. Déployer avec: npx wrangler deploy
*/
