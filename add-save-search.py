#!/usr/bin/env python3
"""
Ajouter les endpoints manquants pour job-search:
1. /searches/save - Sauvegarder une recherche
2. Vérifier /jobs/search - Recherche de jobs
"""

print("🔧 Ajout des endpoints job-search manquants...")

# Lire worker.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    worker = f.read()

# 1. Fonction handleSaveSearch
handleSaveSearch = """
// Handler pour sauvegarder une recherche
async function handleSaveSearch(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const body = await request.json();
        const { name, criteria } = body;

        if (!name || !criteria) {
            return jsonResponse({ success: false, error: 'name and criteria are required' }, 400);
        }

        const searchId = crypto.randomUUID();
        const now = Math.floor(Date.now() / 1000);

        await env.DB.prepare(`
            INSERT INTO saved_searches (id, user_id, name, criteria, created_at)
            VALUES (?, ?, ?, ?, ?)
        `).bind(searchId, auth.userId, name, JSON.stringify(criteria), now).run();

        return jsonResponse({
            success: true,
            search_id: searchId,
            message: 'Recherche sauvegardée'
        });

    } catch (error) {
        console.error('❌ Erreur handleSaveSearch:', error);
        return jsonResponse({
            success: false,
            error: 'Failed to save search',
            details: error.message
        }, 500);
    }
}

"""

# Vérifier si handleSaveSearch existe
if 'async function handleSaveSearch' not in worker:
    # Trouver où insérer (avant export default)
    marker = "export default {"
    pos = worker.find(marker)
    
    if pos != -1:
        worker = worker[:pos] + handleSaveSearch + worker[pos:]
        print("✅ Fonction handleSaveSearch ajoutée")
    else:
        print("❌ Marqueur 'export default' non trouvé")
else:
    print("⚠️  handleSaveSearch existe déjà")

# 2. Ajouter la route /searches/save
route_save = """
      // Save Search
      if (url.pathname === '/searches/save' && request.method === 'POST') {
        return handleSaveSearch(request, env);
      }
"""

if "url.pathname === '/searches/save'" not in worker:
    # Trouver où insérer la route
    route_marker = "const url = new URL(request.url);"
    route_pos = worker.find(route_marker)
    
    if route_pos != -1:
        end_of_line = worker.find('\n', route_pos)
        worker = worker[:end_of_line+1] + route_save + worker[end_of_line+1:]
        print("✅ Route /searches/save ajoutée")
    else:
        print("❌ Route marker non trouvé")
else:
    print("⚠️  Route /searches/save existe déjà")

# Écrire
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'w', encoding='utf-8') as f:
    f.write(worker)

print("\n✅ Endpoints ajoutés!")
print("   - handleSaveSearch")
print("   - Route /searches/save")
