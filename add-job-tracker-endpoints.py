#!/usr/bin/env python3
"""
Script pour ajouter les endpoints Job Tracker dans worker.js
"""

# Lire le fichier worker.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Les fonctions handlers à ajouter AVANT le MAIN ROUTER
handlers_code = '''
// ========================================
// JOB TRACKER - HANDLERS
// ========================================

// Ajouter une candidature
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

// Récupérer le Kanban
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

// Supprimer une candidature
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

// Mettre à jour le statut (drag & drop)
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

        const app = await env.DB.prepare(`
            SELECT id, status, status_history FROM job_applications 
            WHERE id = ? AND user_id = ? AND deleted_at IS NULL
        `).bind(applicationId, auth.userId).first();

        if (!app) {
            return jsonResponse({ success: false, error: 'Application not found' }, 404);
        }

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

'''

# Les routes à ajouter dans le MAIN ROUTER
routes_code = '''
    // ========================================
    // JOB TRACKER ROUTES
    // ========================================
    
    // Ajouter une candidature
    if (url.pathname === '/job-tracker/applications' && request.method === 'POST') {
        return handleAddJobApplication(request, env);
    }

    // Récupérer le Kanban
    if (url.pathname === '/job-tracker/kanban' && request.method === 'GET') {
        return handleGetJobTrackerKanban(request, env);
    }

    // Supprimer une candidature
    if (url.pathname.match(/^\\/applications\\/[^\\/]+$/) && request.method === 'DELETE') {
        const applicationId = url.pathname.split('/')[2];
        return handleDeleteJobApplication(request, env, applicationId);
    }

    // Mettre à jour le statut (drag & drop)
    if (url.pathname.match(/^\\/applications\\/[^\\/]+\\/status$/) && request.method === 'PUT') {
        const applicationId = url.pathname.split('/')[2];
        return handleUpdateJobApplicationStatus(request, env, applicationId);
    }

    // Ajouter une note
    if (url.pathname.match(/^\\/applications\\/[^\\/]+\\/note$/) && request.method === 'POST') {
        const applicationId = url.pathname.split('/')[2];
        return handleAddApplicationNote(request, env, applicationId);
    }

    // Timeline
    if (url.pathname.match(/^\\/applications\\/[^\\/]+\\/timeline$/) && request.method === 'GET') {
        const applicationId = url.pathname.split('/')[2];
        return handleGetApplicationTimeline(request, env, applicationId);
    }

    // Rappel
    if (url.pathname.match(/^\\/applications\\/[^\\/]+\\/reminder$/) && request.method === 'PUT') {
        const applicationId = url.pathname.split('/')[2];
        return handleSetApplicationReminder(request, env, applicationId);
    }

    // Statistiques
    if (url.pathname === '/job-tracker/stats' && request.method === 'GET') {
        return handleGetApplicationStats(request, env);
    }

    // Rappels actifs
    if (url.pathname === '/job-tracker/reminders' && request.method === 'GET') {
        return handleGetActiveReminders(request, env);
    }

'''

# Trouver la ligne "// MAIN ROUTER"
lines = content.split('\n')
main_router_line = None

for i, line in enumerate(lines):
    if '// MAIN ROUTER' in line:
        main_router_line = i
        break

if main_router_line is None:
    print("❌ Impossible de trouver '// MAIN ROUTER'")
    exit(1)

# Insérer les handlers AVANT le MAIN ROUTER
lines.insert(main_router_line, handlers_code)

# Trouver où insérer les routes (après "// MAIN ROUTER" et après "const url = new URL(request.url);")
# On cherche la première route existante
route_insert_line = None
for i in range(main_router_line + 10, min(main_router_line + 100, len(lines))):
    if 'if (url.pathname ===' in lines[i] or 'if (url.pathname.startsWith' in lines[i]:
        route_insert_line = i
        break

if route_insert_line:
    lines.insert(route_insert_line, routes_code)
else:
    print("⚠️  Impossible de trouver où insérer les routes, ajout après MAIN ROUTER")
    lines.insert(main_router_line + 15, routes_code)

# Écrire le fichier modifié
new_content = '\n'.join(lines)

with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Endpoints Job Tracker ajoutés dans worker.js")
print(f"   - Handlers insérés à la ligne {main_router_line}")
print(f"   - Routes insérées à la ligne {route_insert_line if route_insert_line else main_router_line + 15}")
print("\n🚀 Prochaine étape : Déployer le worker avec 'npx wrangler deploy'")
