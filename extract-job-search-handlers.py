#!/usr/bin/env python3
"""
Extraire les handlers job-search depuis worker-new-clean.js et les ajouter au worker actuel
"""
import re

print("🔧 Extraction des handlers depuis worker-new-clean.js...")

# Lire worker-new-clean.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker-new-clean.js', 'r', encoding='utf-8') as f:
    source = f.read()

# Lire worker.js actuel
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    worker = f.read()

# Liste des handlers à extraire
handlers_to_extract = [
    'handleGetJobSuggestions',
    'handleJobMatch',
    'handleSaveSearch',
    'handleExecuteSavedSearch',
    'handleDeleteSavedSearch',
    'handleRemoveFavorite',
    'handleTrackJob',
    'handleGenerateCoverLetter',
    'handleCompareCV'
]

extracted_functions = []

for handler_name in handlers_to_extract:
    # Chercher la fonction
    pattern = rf'async function {handler_name}\([^)]*\)[^{{]*\{{' 
    match = re.search(pattern, source)
    
    if match:
        start = match.start()
        # Trouver la fin de la fonction (compter les accolades)
        brace_count = 0
        i = match.end() - 1  # Commence à l'accolade ouvrante
        
        while i < len(source):
            if source[i] == '{':
                brace_count += 1
            elif source[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    # Fin de la fonction
                    end = i + 1
                    function_code = source[start:end]
                    extracted_functions.append(function_code)
                    print(f"✅ Extrait: {handler_name}")
                    break
            i += 1
    else:
        print(f"⚠️  Non trouvé: {handler_name}")

# Ajouter les fonctions au worker
if extracted_functions:
    # Trouver où insérer (avant export default)
    marker = "export default {"
    pos = worker.find(marker)
    
    if pos != -1:
        functions_block = '\n\n'.join(extracted_functions)
        worker = worker[:pos] + functions_block + "\n\n" + worker[pos:]
        print(f"\n✅ {len(extracted_functions)} fonctions ajoutées au worker")
    else:
        print("❌ Marqueur 'export default' non trouvé")

# Écrire
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'w', encoding='utf-8') as f:
    f.write(worker)

print("\n✅ Extraction terminée!")
print(f"Total: {len(extracted_functions)} handlers ajoutés")
