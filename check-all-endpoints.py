#!/usr/bin/env python3
"""
Vérifier quels endpoints existent dans worker.js
"""

print("🔍 Vérification des endpoints dans worker.js...\n")

# Lire worker.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    worker_content = f.read()

# Endpoints requis par job-search.html
endpoints = [
    '/jobs/favorites',
    '/saved-searches',
    '/searches/.*/execute',
    '/searches/.*',  # DELETE
    '/searches/save',
    '/jobs/suggestions',
    '/jobs/.*/favorite',  # POST
    '/jobs/.*/favorite',  # DELETE
    '/jobs/search',
    '/jobs/match',
    '/jobs/track',
    '/generate-cover-letter',
    '/analyses/history',
    '/ai/compare-cv'
]

print("Endpoints requis par job-search.html:")
print("="*70)

missing = []
for endpoint in endpoints:
    # Nettoyer pour la recherche
    search_pattern = endpoint.replace('.*', '[^/]+')
    
    if search_pattern in worker_content or endpoint.replace('.*', '') in worker_content:
        print(f"✅ {endpoint}")
    else:
        print(f"❌ {endpoint} - MANQUANT")
        missing.append(endpoint)

print("\n" + "="*70)
print(f"\nRésumé: {len(endpoints) - len(missing)}/{len(endpoints)} endpoints trouvés")
print(f"Manquants: {len(missing)}")

if missing:
    print("\nEndpoints manquants:")
    for m in missing:
        print(f"  - {m}")
