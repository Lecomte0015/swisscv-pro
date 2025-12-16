#!/usr/bin/env python3
"""
Ajouter les 4 endpoints manquants à worker-auto-repaired.js
"""
import re

print("🔧 Ajout des endpoints manquants...")

# Le worker.js est déjà worker-auto-repaired.js maintenant
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Ajouter /saved-searches (GET)
if '/saved-searches' not in content:
    # Trouver handleGetSavedSearches
    if 'handleGetSavedSearches' in content:
        # Ajouter la route
        route_add = """
      if (url.pathname === '/saved-searches' && request.method === 'GET') {
        return handleGetSavedSearches(request, env);
      }
"""
        # Chercher où insérer (après /searches/save)
        marker = "if (url.pathname === '/searches/save'"
        pos = content.find(marker)
        if pos != -1:
            # Trouver la fin de ce bloc if
            end = content.find('\n', content.find('}', pos))
            content = content[:end+1] + route_add + content[end+1:]
            print("✅ Route /saved-searches ajoutée")

# 2. Ajouter /searches/:id/execute (POST)
if '/searches/' not in content or 'execute' not in content:
    route_execute = """
      if (url.pathname.match(/^\\/searches\\/[^\\/]+\\/execute$/) && request.method === 'POST') {
        const searchId = url.pathname.split('/')[2];
        return handleExecuteSavedSearch(request, env, searchId);
      }
"""
    # Insérer après /saved-searches
    marker = "if (url.pathname === '/saved-searches'"
    pos = content.find(marker)
    if pos != -1:
        end = content.find('\n', content.find('}', pos))
        content = content[:end+1] + route_execute + content[end+1:]
        print("✅ Route /searches/:id/execute ajoutée")

# 3. Ajouter /jobs/:id/favorite (POST et DELETE)
if '/favorite' not in content:
    route_favorite = """
      if (url.pathname.match(/^\\/jobs\\/[^\\/]+\\/favorite$/) && request.method === 'POST') {
        const jobId = url.pathname.split('/')[2];
        return handleAddFavorite(request, env);
      }
      if (url.pathname.match(/^\\/jobs\\/[^\\/]+\\/favorite$/) && request.method === 'DELETE') {
        const jobId = url.pathname.split('/')[2];
        return handleRemoveFavorite(request, env, jobId);
      }
"""
    # Insérer après /jobs/favorites
    marker = "if (url.pathname === '/jobs/favorites'"
    pos = content.find(marker)
    if pos != -1:
        end = content.find('\n', content.find('}', pos))
        content = content[:end+1] + route_favorite + content[end+1:]
        print("✅ Routes /jobs/:id/favorite (POST/DELETE) ajoutées")

# Écrire
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ Tous les endpoints ajoutés!")
print("\n🔍 Vérification finale...")
