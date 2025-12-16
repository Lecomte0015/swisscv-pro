#!/usr/bin/env python3
"""
Ajouter les routes job-tracker manquantes dans worker.js
"""
import re

print("🔧 Ajout des routes job-tracker manquantes...\n")

# Lire worker.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Routes à ajouter (après les routes existantes job-tracker)
routes_to_add = '''
    // Job Tracker - Update Status
    if (url.pathname === '/jobs/update-status' && request.method === 'POST') {
        const body = await request.json();
        const { jobId, status } = body;
        if (!jobId || !status) {
            return jsonResponse({ success: false, error: 'Missing jobId or status' }, 400);
        }
        // Rediriger vers le bon endpoint
        const appId = jobId;
        return handleUpdateJobApplicationStatus(request, env, appId);
    }

    // Job Tracker - Delete Job
    if (url.pathname.match(/^\\/jobs\\/delete\\/[^\\/]+$/) && request.method === 'DELETE') {
        const jobId = url.pathname.split('/')[3];
        return handleDeleteJobApplication(request, env, jobId);
    }

    // Job Tracker - Stats
    if (url.pathname === '/applications/stats' && request.method === 'GET') {
        const auth = await authenticateRequest(request, env);
        if (!auth) {
            return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
        }
        
        try {
            const apps = await env.DB.prepare(`
                SELECT status, COUNT(*) as count 
                FROM job_applications 
                WHERE user_id = ? AND deleted_at IS NULL 
                GROUP BY status
            `).bind(auth.userId).all();
            
            const stats = {
                total: 0,
                a_consulter: 0,
                interesse: 0,
                postule: 0,
                entretien: 0,
                offre: 0,
                refuse: 0
            };
            
            apps.results.forEach(row => {
                stats[row.status] = row.count;
                stats.total += row.count;
            });
            
            return jsonResponse({ success: true, stats });
        } catch (error) {
            console.error('Error getting stats:', error);
            return jsonResponse({ success: false, error: 'Failed to get stats' }, 500);
        }
    }

'''

# Trouver où insérer (après la route /job-tracker/applications)
marker = "if (url.pathname === '/job-tracker/applications' && request.method === 'POST') {"
pos = content.find(marker)

if pos == -1:
    print("❌ Impossible de trouver le marqueur pour insérer les routes")
    exit(1)

# Trouver la fin de ce bloc if
# Compter les accolades pour trouver la fin
start_pos = pos
brace_count = 0
i = pos
in_block = False

while i < len(content):
    if content[i] == '{':
        brace_count += 1
        in_block = True
    elif content[i] == '}':
        brace_count -= 1
        if in_block and brace_count == 0:
            # Trouvé la fin du bloc
            insert_pos = i + 1
            break
    i += 1

if brace_count != 0:
    print("❌ Impossible de trouver la fin du bloc")
    exit(1)

print(f"✅ Position d'insertion trouvée: {insert_pos}")

# Insérer les nouvelles routes
content = content[:insert_pos] + '\n' + routes_to_add + content[insert_pos:]

print("✅ Routes ajoutées:")
print("   - /jobs/update-status (POST)")
print("   - /jobs/delete/:id (DELETE)")
print("   - /applications/stats (GET)")

# Écrire le fichier
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ worker.js mis à jour!")
print("\n🚀 Déployez avec 'npx wrangler deploy'")
