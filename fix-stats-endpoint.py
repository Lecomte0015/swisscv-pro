#!/usr/bin/env python3
"""
Corriger l'endpoint /applications/stats dans worker.js
Le problème: le code utilise 'await' mais n'est pas dans une fonction async
"""
import re

print("🔧 Correction de l'endpoint /applications/stats...\n")

# Lire worker.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Trouver le bloc problématique
old_code = """    // Job Tracker - Stats
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
    }"""

# Nouveau code avec une fonction handler dédiée
new_code = """    // Job Tracker - Stats
    if (url.pathname === '/applications/stats' && request.method === 'GET') {
        return handleGetApplicationStats(request, env);
    }"""

# Remplacer
if old_code in content:
    print("✅ Code problématique trouvé")
    content = content.replace(old_code, new_code)
    print("✅ Remplacé par un appel à handleGetApplicationStats")
else:
    print("⚠️  Code exact non trouvé, recherche alternative...")
    # Chercher juste le début
    pattern = r"// Job Tracker - Stats\s+if \(url\.pathname === '/applications/stats'"
    if re.search(pattern, content):
        print("✅ Trouvé le début du bloc")
        # Utiliser une approche plus flexible
        content = re.sub(
            r"(// Job Tracker - Stats\s+if \(url\.pathname === '/applications/stats' && request\.method === 'GET'\) \{)[^}]*(\})",
            r"\1\n        return handleGetApplicationStats(request, env);\n    \2",
            content,
            flags=re.DOTALL
        )
        print("✅ Code remplacé")

# Maintenant ajouter la fonction handler avant les routes
handler_function = """
// Handler pour les stats des candidatures
async function handleGetApplicationStats(request, env) {
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
        console.error('❌ Error getting stats:', error);
        return jsonResponse({ 
            success: false, 
            error: 'Failed to get stats',
            details: error.message 
        }, 500);
    }
}

"""

# Trouver où insérer la fonction (avant les routes, après les autres handlers)
marker = "// Handler pour les stats des candidatures"
if marker not in content:
    # Chercher un bon endroit pour insérer (après handleGetJobTrackerKanban)
    insert_marker = "async function handleGetJobTrackerKanban"
    pos = content.find(insert_marker)
    
    if pos != -1:
        # Trouver la fin de cette fonction
        start = pos
        brace_count = 0
        i = pos
        found_first_brace = False
        
        while i < len(content):
            if content[i] == '{':
                brace_count += 1
                found_first_brace = True
            elif content[i] == '}':
                brace_count -= 1
                if found_first_brace and brace_count == 0:
                    # Fin de la fonction
                    insert_pos = i + 1
                    # Insérer après le saut de ligne
                    while insert_pos < len(content) and content[insert_pos] in ['\n', '\r']:
                        insert_pos += 1
                    content = content[:insert_pos] + handler_function + content[insert_pos:]
                    print("✅ Fonction handleGetApplicationStats ajoutée")
                    break
            i += 1
    else:
        print("⚠️  Impossible de trouver l'emplacement d'insertion")
else:
    print("✅ Fonction handleGetApplicationStats déjà présente")

# Écrire le fichier
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ worker.js corrigé!")
print("   - Fonction async handleGetApplicationStats créée")
print("   - Route /applications/stats mise à jour")
print("\n🚀 Déployez avec 'npx wrangler deploy'")
