// ===========================================
// JOB TRACKER - NEW FEATURES HANDLERS
// À intégrer dans worker.js avant MAIN ROUTER
// ===========================================

// Statistiques globales
async function handleGetApplicationStats(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const statusCounts = await env.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM job_applications
      WHERE user_id = ?
      GROUP BY status
    `).bind(auth.userId).all();

        const total = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM job_applications WHERE user_id = ?
    `).bind(auth.userId).first();

        const avgResponse = await env.DB.prepare(`
      SELECT AVG(last_status_change - applied_date) as avg_time
      FROM job_applications
      WHERE user_id = ? AND status != 'to_review' AND last_status_change IS NOT NULL
    `).bind(auth.userId).first();

        const weeklyTrend = await env.DB.prepare(`
      SELECT 
        DATE(applied_date, 'unixepoch') as date,
        COUNT(*) as count
      FROM job_applications
      WHERE user_id = ? AND applied_date >= unixepoch() - 604800
      GROUP BY DATE(applied_date, 'unixepoch')
      ORDER BY date ASC
    `).bind(auth.userId).all();

        return jsonResponse({
            success: true,
            stats: {
                total: total?.count || 0,
                by_status: statusCounts.results || [],
                avg_response_time: avgResponse?.avg_time || 0,
                weekly_trend: weeklyTrend.results || []
            }
        });
    } catch (error) {
        console.error('❌ Erreur handleGetApplicationStats:', error);
        return jsonResponse({ success: false, error: 'Failed to get stats', details: error.message }, 500);
    }
}

// Ajouter une note
async function handleAddApplicationNote(request, env, applicationId) {
    const auth = await authenticateRequest(request, env);
    if (!auth) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const body = await request.json();
        const { note_text, tags } = body;
        if (!note_text || !note_text.trim()) return jsonResponse({ success: false, error: 'Note text required' }, 400);

        const app = await env.DB.prepare(`SELECT id FROM job_applications WHERE id = ? AND user_id = ?`).bind(applicationId, auth.userId).first();
        if (!app) return jsonResponse({ success: false, error: 'Application not found' }, 404);

        const noteId = crypto.randomUUID();
        await env.DB.prepare(`
      INSERT INTO application_notes (id, application_id, user_id, note_text, tags, created_at)
      VALUES (?, ?, ?, ?, ?, unixepoch())
    `).bind(noteId, applicationId, auth.userId, note_text.trim(), JSON.stringify(tags || [])).run();

        return jsonResponse({ success: true, note_id: noteId });
    } catch (error) {
        console.error('❌ Erreur handleAddApplicationNote:', error);
        return jsonResponse({ success: false, error: 'Failed to add note', details: error.message }, 500);
    }
}

// Timeline
async function handleGetApplicationTimeline(request, env, applicationId) {
    const auth = await authenticateRequest(request, env);
    if (!auth) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const app = await env.DB.prepare(`
      SELECT status_history, applied_date, last_status_change
      FROM job_applications WHERE id = ? AND user_id = ?
    `).bind(applicationId, auth.userId).first();
        if (!app) return jsonResponse({ success: false, error: 'Application not found' }, 404);

        let history = [];
        try { history = JSON.parse(app.status_history || '[]'); } catch (e) { }

        const notes = await env.DB.prepare(`
      SELECT id, note_text, tags, created_at
      FROM application_notes WHERE application_id = ? ORDER BY created_at DESC
    `).bind(applicationId).all();

        return jsonResponse({
            success: true,
            timeline: { status_history: history, notes: notes.results || [], applied_date: app.applied_date, last_update: app.last_status_change }
        });
    } catch (error) {
        console.error('❌ Erreur handleGetApplicationTimeline:', error);
        return jsonResponse({ success: false, error: 'Failed to get timeline', details: error.message }, 500);
    }
}

// Rappel
async function handleSetApplicationReminder(request, env, applicationId) {
    const auth = await authenticateRequest(request, env);
    if (!auth) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const body = await request.json();
        const { deadline, reminder_date } = body;

        const app = await env.DB.prepare(`SELECT id FROM job_applications WHERE id = ? AND user_id = ?`).bind(applicationId, auth.userId).first();
        if (!app) return jsonResponse({ success: false, error: 'Application not found' }, 404);

        await env.DB.prepare(`
      UPDATE job_applications SET deadline = ?, reminder_date = ?, updated_at = unixepoch()
      WHERE id = ? AND user_id = ?
    `).bind(deadline || null, reminder_date || null, applicationId, auth.userId).run();

        return jsonResponse({ success: true, message: 'Reminder set' });
    } catch (error) {
        console.error('❌ Erreur handleSetApplicationReminder:', error);
        return jsonResponse({ success: false, error: 'Failed to set reminder', details: error.message }, 500);
    }
}

// Liste rappels
async function handleGetActiveReminders(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const now = Math.floor(Date.now() / 1000);
        const reminders = await env.DB.prepare(`
      SELECT id, job_title, company, deadline, reminder_date, status
      FROM job_applications
      WHERE user_id = ? AND (reminder_date IS NOT NULL OR deadline IS NOT NULL)
        AND (reminder_date >= ? OR deadline >= ?)
      ORDER BY COALESCE(reminder_date, deadline) ASC
    `).bind(auth.userId, now, now).all();

        return jsonResponse({ success: true, reminders: reminders.results || [] });
    } catch (error) {
        console.error('❌ Erreur handleGetActiveReminders:', error);
        return jsonResponse({ success: false, error: 'Failed to get reminders', details: error.message }, 500);
    }
}
