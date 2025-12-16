#!/usr/bin/env python3
"""
Intégrer NOUVEAUX_ENDPOINTS.js dans worker.js de manière sûre
"""
import re

print("🔧 Intégration des endpoints depuis NOUVEAUX_ENDPOINTS.js...")

# Lire NOUVEAUX_ENDPOINTS.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/NOUVEAUX_ENDPOINTS.js', 'r', encoding='utf-8') as f:
    nouveaux = f.read()

# Lire worker.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    worker = f.read()

# Extraire les fonctions (lignes 11-131)
functions_start = nouveaux.find('async function handleAddJobApplication')
functions_end = nouveaux.find('// ========================================\n// 2. ROUTES')
functions_to_add = nouveaux[functions_start:functions_end].strip()

# Vérifier si les fonctions existent déjà
if 'handleAddJobApplication' in worker:
    print("⚠️  handleAddJobApplication existe déjà, skip")
else:
    # Trouver où insérer (avant export default ou MAIN ROUTER)
    marker = "// MAIN ROUTER" if "// MAIN ROUTER" in worker else "export default {"
    pos = worker.find(marker)
    
    if pos != -1:
        worker = worker[:pos] + functions_to_add + "\n\n" + worker[pos:]
        print("✅ Fonctions job-tracker ajoutées")
    else:
        print("❌ Marqueur non trouvé")

# Maintenant ajouter les routes
# Extraire les routes (lignes 139-195 sans les commentaires)
routes_section = nouveaux[nouveaux.find('// Job Tracker'):nouveaux.find('// ========================================\n// INSTRUCTIONS')]

# Nettoyer les commentaires /* */ et extraire les routes
routes = []
in_comment = False
for line in routes_section.split('\n'):
    line = line.strip()
    if line.startswith('/*'):
        in_comment = True
        continue
    if line.startswith('*/'):
        in_comment = False
        continue
    if not in_comment and line and not line.startswith('//'):
        routes.append('      ' + line)

routes_to_add = '\n'.join(routes)

# Trouver où insérer les routes dans le router
# Chercher "const url = new URL(request.url);"
router_marker = "const url = new URL(request.url);"
router_pos = worker.find(router_marker)

if router_pos != -1:
    # Trouver la fin de cette ligne
    end_of_line = worker.find('\n', router_pos)
    # Insérer après
    worker = worker[:end_of_line+1] + "\n" + routes_to_add + "\n" + worker[end_of_line+1:]
    print("✅ Routes job-tracker ajoutées")
else:
    print("⚠️  Router marker non trouvé")

# Écrire
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'w', encoding='utf-8') as f:
    f.write(worker)

print("\n✅ Intégration terminée!")
print("🔍 Vérification de la syntaxe...")
