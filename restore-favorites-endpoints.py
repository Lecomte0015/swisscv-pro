#!/usr/bin/env python3
"""
Rajouter les endpoints manquants au worker actuel
"""
import re

print("🔧 Ajout des endpoints favorites et saved searches...")

# Lire worker.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Ajouter la fonction handleGetFavorites
handleGetFavorites = """
// Handler pour récupérer les favoris
async function handleGetFavorites(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const favorites = await env.DB.prepare(`
            SELECT * FROM favorite_jobs 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `).bind(auth.userId).all();

        // Mapper les champs DB vers les champs frontend
        const mappedFavorites = (favorites.results || []).map(fav => {
            let jobData = {};
            if (fav.job_data) {
                try {
                    jobData = JSON.parse(fav.job_data);
                } catch (e) {
                    console.error('Error parsing job_data:', e);
                }
            }

            return {
                id: fav.id,
                job_offer_id: fav.job_offer_id,
                title: fav.job_title || jobData.title || 'Sans titre',
                company: fav.job_company || jobData.company || 'Entreprise non spécifiée',
                location: fav.job_location || jobData.location || 'Lieu non spécifié',
                description: jobData.description || '',
                source: jobData.source || 'Adzuna',
                url: jobData.url || jobData.redirect_url || '#',
                salary_min: jobData.salary_min,
                salary_max: jobData.salary_max,
                requirements: jobData.requirements,
                created_at: fav.created_at
            };
        });

        return jsonResponse({
            success: true,
            favorites: mappedFavorites
        });

    } catch (error) {
        console.error('❌ Erreur handleGetFavorites:', error);
        return jsonResponse({
            success: false,
            error: 'Failed to get favorites',
            details: error.message
        }, 500);
    }
}

"""

# 2. Trouver où insérer (avant handleGetSavedSearches)
marker = "async function handleGetSavedSearches"
pos = content.find(marker)

if pos != -1:
    # Insérer avant handleGetSavedSearches
    content = content[:pos] + handleGetFavorites + content[pos:]
    print("✅ Fonction handleGetFavorites ajoutée")
else:
    print("⚠️  handleGetSavedSearches non trouvé, ajout à la fin des fonctions")
    # Chercher export default
    export_pos = content.find("export default {")
    if export_pos != -1:
        content = content[:export_pos] + handleGetFavorites + "\n" + content[export_pos:]
        print("✅ Fonction handleGetFavorites ajoutée avant export default")

# 3. Ajouter les routes dans le router
routes_to_add = """
    // Favorites endpoints
    if (url.pathname === '/jobs/favorites' && request.method === 'GET') {
        return handleGetFavorites(request, env);
    }
    
"""

# Trouver où insérer les routes (après saved-searches)
route_marker = "if (url.pathname === '/saved-searches' && request.method === 'GET') return handleGetSavedSearches(request, env);"
route_pos = content.find(route_marker)

if route_pos != -1:
    # Trouver la fin de cette ligne
    end_of_line = content.find('\n', route_pos)
    content = content[:end_of_line+1] + routes_to_add + content[end_of_line+1:]
    print("✅ Route /jobs/favorites ajoutée")
else:
    print("⚠️  Route saved-searches non trouvée")

# Écrire
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ worker.js mis à jour!")
print("   - handleGetFavorites ajouté")
print("   - Route /jobs/favorites ajoutée")
print("\n🚀 Déployez avec 'npx wrangler deploy'")
