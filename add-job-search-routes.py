#!/usr/bin/env python3
"""
Ajouter les routes pour les handlers job-search
"""

print("🔧 Ajout des routes job-search...")

# Lire worker.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    worker = f.read()

# Routes à ajouter
routes = """
      // Job Search - Saved Searches
      if (url.pathname === '/searches/save' && request.method === 'POST') {
        return handleSaveSearch(request, env);
      }
      if (url.pathname.match(/^\\/searches\\/[^\\/]+\\/execute$/) && request.method === 'POST') {
        const searchId = url.pathname.split('/')[2];
        return handleExecuteSavedSearch(request, env, searchId);
      }
      if (url.pathname.match(/^\\/searches\\/[^\\/]+$/) && request.method === 'DELETE') {
        const searchId = url.pathname.split('/')[2];
        return handleDeleteSavedSearch(request, env, searchId);
      }

      // Job Search - Favorites
      if (url.pathname.match(/^\\/jobs\\/[^\\/]+\\/favorite$/) && request.method === 'POST') {
        return handleAddFavorite(request, env);
      }
      if (url.pathname.match(/^\\/jobs\\/[^\\/]+\\/favorite$/) && request.method === 'DELETE') {
        const jobId = url.pathname.split('/')[2];
        return handleRemoveFavorite(request, env, jobId);
      }

      // Job Search - Features
      if (url.pathname === '/jobs/match' && request.method === 'POST') {
        return handleJobMatch(request, env);
      }
      if (url.pathname === '/jobs/track' && request.method === 'POST') {
        return handleTrackJob(request, env);
      }
      if (url.pathname === '/generate-cover-letter' && request.method === 'POST') {
        return handleGenerateCoverLetter(request, env);
      }
      if (url.pathname === '/ai/compare-cv' && request.method === 'POST') {
        return handleCompareCV(request, env);
      }
"""

# Trouver où insérer (après const url = new URL)
marker = "const url = new URL(request.url);"
pos = worker.find(marker)

if pos != -1:
    end_of_line = worker.find('\n', pos)
    worker = worker[:end_of_line+1] + routes + worker[end_of_line+1:]
    print("✅ Routes job-search ajoutées")
else:
    print("❌ Marqueur non trouvé")

# Écrire
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'w', encoding='utf-8') as f:
    f.write(worker)

print("\n✅ Routes ajoutées!")
