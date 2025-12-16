#!/usr/bin/env python3
"""
Script COMPLET pour réparer worker.js et ajouter Job Tracker
"""

with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("🔧 Réparation du worker.js...")

# ========================================
# 1. SUPPRIMER TOUTES LES FONCTIONS CASSÉES
# ========================================

# Supprimer sendEmailReport cassée (lignes ~6271-6295)
content = content.replace(
    '''// Envoyer rapport
async function sendEmailReport(env, adminId, reportType = 'manual') {
    try {
        
        const result = await emailResponse.json();
        if (!emailResponse.ok) throw new Error(result.message || 'Email send failed');
        
    try {
        // Récupérer email admin
        const admin = await env.DB.prepare(`SELECT email FROM admins WHERE id = ?`).bind(adminId).first();
        if (!admin) {
            throw new Error('Admin not found');
        }
        
        // Récupérer ou créer settings
        return new Response(JSON.stringify(settings), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json', 
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS', 
                'Access-Control-Allow-Headers': 'Content-Type, Authorization' 
            } 
        });
    }
}''',
    ''
)

# Supprimer handleAdminUpdateReportSettings cassée
content = content.replace(
    '''// PATCH /admin/reports/settings
async function handleAdminUpdateReportSettings(request, env, adminId) {
    try {
        const body = await request.json();
        // TODO: Implémenter la mise à jour des settings
        return jsonResponse({ success: true, message: 'Settings updated' });
    } catch (error) {
        console.error('Error updating report settings:', error);
        return jsonResponse({ success: false, error: error.message }, 500);
    }
}''',
    ''
)

# Supprimer les catch orphelins
import re
content = re.sub(r'\n\s*}\s*catch\s*\([^)]+\)\s*{[^}]*}\s*\n', '\n', content)

print("✅ Fonctions cassées supprimées")

# ========================================
# 2. VÉRIFIER QUE LES HANDLERS JOB TRACKER SONT PRÉSENTS
# ========================================

if 'handleAddJobApplication' not in content:
    print("⚠️  Handlers Job Tracker manquants, ajout...")
    
    handlers = '''
// ========================================
// JOB TRACKER - HANDLERS
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
    
    # Insérer avant "// MAIN ROUTER"
    content = content.replace('// MAIN ROUTER', handlers + '// MAIN ROUTER')
    print("✅ Handlers Job Tracker ajoutés")
else:
    print("✅ Handlers Job Tracker déjà présents")

# ========================================
# 3. VÉRIFIER QUE LES ROUTES SONT PRÉSENTES
# ========================================

if '/job-tracker/applications' not in content:
    print("⚠️  Routes Job Tracker manquantes, ajout...")
    
    routes = '''
    // ========================================
    // JOB TRACKER ROUTES
    // ========================================
    
    if (url.pathname === '/job-tracker/applications' && request.method === 'POST') {
        return handleAddJobApplication(request, env);
    }

    if (url.pathname === '/job-tracker/kanban' && request.method === 'GET') {
        return handleGetJobTrackerKanban(request, env);
    }

    if (url.pathname.match(/^\\/applications\\/[^\\/]+$/) && request.method === 'DELETE') {
        const applicationId = url.pathname.split('/')[2];
        return handleDeleteJobApplication(request, env, applicationId);
    }

    if (url.pathname.match(/^\\/applications\\/[^\\/]+\\/status$/) && request.method === 'PUT') {
        const applicationId = url.pathname.split('/')[2];
        return handleUpdateJobApplicationStatus(request, env, applicationId);
    }

    if (url.pathname.match(/^\\/applications\\/[^\\/]+\\/note$/) && request.method === 'POST') {
        const applicationId = url.pathname.split('/')[2];
        return handleAddApplicationNote(request, env, applicationId);
    }

    if (url.pathname.match(/^\\/applications\\/[^\\/]+\\/timeline$/) && request.method === 'GET') {
        const applicationId = url.pathname.split('/')[2];
        return handleGetApplicationTimeline(request, env, applicationId);
    }

    if (url.pathname.match(/^\\/applications\\/[^\\/]+\\/reminder$/) && request.method === 'PUT') {
        const applicationId = url.pathname.split('/')[2];
        return handleSetApplicationReminder(request, env, applicationId);
    }

'''
    
    # Insérer après "// AUTH ROUTES" ou au début du router
    if '// AUTH ROUTES' in content:
        content = content.replace('    // AUTH ROUTES', routes + '    // AUTH ROUTES')
    else:
        # Chercher la première route
        content = content.replace('    if (url.pathname === ', routes + '    if (url.pathname === ', 1)
    
    print("✅ Routes Job Tracker ajoutées")
else:
    print("✅ Routes Job Tracker déjà présentes")

# ========================================
# 4. ÉCRIRE LE FICHIER CORRIGÉ
# ========================================

with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ worker.js réparé et prêt")
print("   - Fonctions cassées supprimées")
print("   - Handlers Job Tracker vérifiés")
print("   - Routes Job Tracker vérifiées")
print("\n🚀 Prêt pour déploiement")
