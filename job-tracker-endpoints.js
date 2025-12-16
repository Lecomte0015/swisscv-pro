// ===========================================
// JOB TRACKER - ENDPOINTS À AJOUTER DANS WORKER.JS
// À copier AVANT la section "MAIN ROUTER"
// ===========================================

// ========================================
// AJOUTER UNE CANDIDATURE
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

// ========================================
// RÉCUPÉRER KANBAN
// ========================================
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

// ========================================
// SUPPRIMER UNE CANDIDATURE
// ========================================
async function handleDeleteJobApplication(request, env, applicationId) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        // Vérifier que l'application appartient à l'utilisateur
        const app = await env.DB.prepare(`
            SELECT id FROM job_applications 
            WHERE id = ? AND user_id = ? AND deleted_at IS NULL
        `).bind(applicationId, auth.userId).first();

        if (!app) {
            return jsonResponse({ success: false, error: 'Application not found' }, 404);
        }

        // Soft delete
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
// METTRE À JOUR LE STATUT (DRAG & DROP)
// ========================================
async function handleUpdateJobApplicationStatus(request, env, applicationId) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const body = await request.json();
        const { status } = body;

        const validStatuses = ['a_consulter', 'interesse', 'postule', 'entretien', 'offre', 'refuse'];
        if (!validStatuses.includes(status)) {
            return jsonResponse({ success: false, error: 'Invalid status' }, 400);
        }

        // Vérifier que l'application appartient à l'utilisateur
        const app = await env.DB.prepare(`
            SELECT id, status, status_history FROM job_applications 
            WHERE id = ? AND user_id = ? AND deleted_at IS NULL
        `).bind(applicationId, auth.userId).first();

        if (!app) {
            return jsonResponse({ success: false, error: 'Application not found' }, 404);
        }

        // Mettre à jour l'historique
        let history = [];
        try {
            history = JSON.parse(app.status_history || '[]');
        } catch (e) {
            history = [];
        }

        history.push({
            status: status,
            timestamp: Math.floor(Date.now() / 1000)
        });

        await env.DB.prepare(`
            UPDATE job_applications 
            SET status = ?, 
                status_history = ?,
                last_status_change = unixepoch(),
                updated_at = unixepoch()
            WHERE id = ? AND user_id = ?
        `).bind(status, JSON.stringify(history), applicationId, auth.userId).run();

        return jsonResponse({
            success: true,
            message: 'Statut mis à jour'
        });

    } catch (error) {
        console.error('❌ Erreur handleUpdateJobApplicationStatus:', error);
        return jsonResponse({
            success: false,
            error: 'Failed to update status',
            details: error.message
        }, 500);
    }
}

// ===========================================
// ROUTES À AJOUTER DANS LE MAIN ROUTER
// ===========================================

/*
Dans la section MAIN ROUTER de worker.js, ajouter ces routes :

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
*/
