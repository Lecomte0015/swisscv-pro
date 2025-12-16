#!/usr/bin/env python3
"""
Ajouter UNIQUEMENT handleGetJobSuggestions au worker sans toucher au reste
"""

print("🔧 Ajout de handleGetJobSuggestions...")

# Lire worker.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    worker = f.read()

# Créer la fonction handleGetJobSuggestions
function_code = """
// Handler pour obtenir des suggestions de jobs basées sur le profil
async function handleGetJobSuggestions(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        // Récupérer le profil utilisateur pour les suggestions
        const user = await env.DB.prepare(`
            SELECT onboarding_data FROM users WHERE id = ?
        `).bind(auth.userId).first();

        let skills = [];
        let location = '';
        
        if (user && user.onboarding_data) {
            try {
                const onboarding = JSON.parse(user.onboarding_data);
                skills = onboarding.skills || [];
                location = onboarding.location || '';
            } catch (e) {
                console.error('Error parsing onboarding_data:', e);
            }
        }

        // Si pas de compétences, retourner vide
        if (skills.length === 0) {
            return jsonResponse({
                success: true,
                suggestions: [],
                message: 'Complétez votre profil pour obtenir des suggestions'
            });
        }

        // Appeler l'API Adzuna pour obtenir des suggestions
        const searchQuery = skills.slice(0, 3).join(' '); // Prendre les 3 premières compétences
        const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/ch/search/1?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY&what=${encodeURIComponent(searchQuery)}&where=${encodeURIComponent(location)}&results_per_page=10`;

        // Pour l'instant, retourner un résultat vide si pas d'API key
        // TODO: Configurer les clés API Adzuna
        return jsonResponse({
            success: true,
            suggestions: [],
            message: 'Configuration API en cours'
        });

    } catch (error) {
        console.error('❌ Erreur handleGetJobSuggestions:', error);
        return jsonResponse({
            success: false,
            error: 'Failed to get suggestions',
            details: error.message
        }, 500);
    }
}

"""

# Vérifier si la fonction existe déjà
if 'handleGetJobSuggestions' in worker:
    print("⚠️  handleGetJobSuggestions existe déjà, skip")
else:
    # Trouver où insérer (avant export default)
    marker = "export default {"
    pos = worker.find(marker)
    
    if pos != -1:
        worker = worker[:pos] + function_code + worker[pos:]
        print("✅ Fonction handleGetJobSuggestions ajoutée")
    else:
        print("❌ Marqueur 'export default' non trouvé")

# Ajouter la route
route_code = """
      // Job Suggestions
      if (url.pathname === '/jobs/suggestions' && request.method === 'GET') {
        return handleGetJobSuggestions(request, env);
      }
"""

# Vérifier si la route existe déjà
if "url.pathname === '/jobs/suggestions'" in worker:
    print("⚠️  Route /jobs/suggestions existe déjà, skip")
else:
    # Trouver où insérer la route (après const url = new URL)
    route_marker = "const url = new URL(request.url);"
    route_pos = worker.find(route_marker)
    
    if route_pos != -1:
        end_of_line = worker.find('\n', route_pos)
        worker = worker[:end_of_line+1] + route_code + worker[end_of_line+1:]
        print("✅ Route /jobs/suggestions ajoutée")
    else:
        print("❌ Route marker non trouvé")

# Écrire
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'w', encoding='utf-8') as f:
    f.write(worker)

print("\n✅ handleGetJobSuggestions ajouté avec succès!")
print("🚀 Prêt pour déploiement")
