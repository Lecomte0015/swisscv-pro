#!/usr/bin/env python3
"""
Vérifier quels endpoints job-tracker existent dans worker.js
"""
import re

print("🔍 Vérification des endpoints job-tracker...\n")

# Lire worker.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    worker_content = f.read()

# Endpoints utilisés dans job-tracker.html
endpoints_needed = [
    '/applications/stats',
    '/job-tracker/kanban',
    '/jobs/update-status',
    '/jobs/delete/',
    '/applications/.*/timeline',
    '/applications/.*/note',
    '/applications/.*/reminder',
    '/job-tracker/applications'
]

print("Endpoints requis par job-tracker.html:")
print("="*60)

for endpoint in endpoints_needed:
    # Chercher dans worker.js
    if '.*/.' in endpoint:
        # Pattern regex
        pattern = endpoint.replace('/', '\\/').replace('.*', '[^\\/]+')
        found = bool(re.search(pattern, worker_content))
    else:
        found = endpoint in worker_content
    
    status = "✅" if found else "❌"
    print(f"{status} {endpoint}")

print("\n" + "="*60)
print("\nRecherche des routes job-tracker dans worker.js:")
print("="*60)

# Trouver toutes les routes job-tracker
job_tracker_routes = re.findall(r"url\.pathname[^)]*(?:/job-tracker|/applications|/jobs/update|/jobs/delete)[^)]*", worker_content)
for route in set(job_tracker_routes[:20]):  # Limiter à 20 pour lisibilité
    print(f"  {route}")
