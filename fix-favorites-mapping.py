#!/usr/bin/env python3
"""
Script pour corriger handleGetFavorites dans worker.js
Problème: Les favoris affichent "undefined" car les noms de champs ne correspondent pas
"""
import re

print("🔧 Correction de handleGetFavorites...")

# Lire le fichier worker.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Trouver et remplacer la fonction handleGetFavorites
# Pattern pour trouver la fonction complète
pattern = r'async function handleGetFavorites\(request, env\) \{[^}]*\{[^}]*\}[^}]*\}'

# Nouvelle implémentation corrigée
new_function = '''async function handleGetFavorites(request, env) {
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

        // ✅ Mapper les champs de la DB vers les champs attendus par le frontend
        const mappedFavorites = (favorites.results || []).map(fav => {
            // Parser job_data JSON si disponible
            let jobData = {};
            if (fav.job_data) {
                try {
                    jobData = JSON.parse(fav.job_data);
                } catch (e) {
                    console.error('Error parsing job_data:', e);
                }
            }

            // Retourner avec les bons noms de champs
            return {
                id: fav.id,
                job_offer_id: fav.job_offer_id,
                // Mapper job_title → title, job_company → company, etc.
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
}'''

# Chercher la fonction existante
match = re.search(
    r'async function handleGetFavorites\(request, env\) \{.*?\n\}(?=\n\n|\nasync|\nfunction)',
    content,
    re.DOTALL
)

if match:
    print(f"✅ Fonction handleGetFavorites trouvée à la position {match.start()}")
    # Remplacer
    content = content[:match.start()] + new_function + content[match.end():]
    print("✅ Fonction remplacée")
else:
    print("❌ Fonction handleGetFavorites non trouvée")
    print("Recherche d'un pattern alternatif...")
    
    # Essayer un pattern plus simple
    match = re.search(
        r'async function handleGetFavorites\([^)]*\)[^{]*\{',
        content
    )
    
    if match:
        print(f"✅ Début de fonction trouvé à {match.start()}")
        # Trouver la fin de la fonction (accolade fermante correspondante)
        start = match.end() - 1  # Position de l'accolade ouvrante
        brace_count = 1
        pos = start + 1
        
        while pos < len(content) and brace_count > 0:
            if content[pos] == '{':
                brace_count += 1
            elif content[pos] == '}':
                brace_count -= 1
            pos += 1
        
        if brace_count == 0:
            print(f"✅ Fin de fonction trouvée à {pos}")
            content = content[:match.start()] + new_function + content[pos:]
            print("✅ Fonction remplacée")
        else:
            print("❌ Impossible de trouver la fin de la fonction")
            exit(1)
    else:
        print("❌ Fonction handleGetFavorites introuvable")
        exit(1)

# Écrire le fichier corrigé
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ worker.js corrigé!")
print("   - handleGetFavorites mappe maintenant les champs correctement")
print("   - job_title → title")
print("   - job_company → company")
print("   - job_location → location")
print("   - Parse job_data JSON pour les détails complets")
print("\n🚀 Prêt pour déploiement avec 'npx wrangler deploy'")
