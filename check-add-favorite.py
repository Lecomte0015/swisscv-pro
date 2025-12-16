#!/usr/bin/env python3
"""
Script pour vérifier et afficher handleAddFavorite
"""
import re

print("🔍 Recherche de handleAddFavorite...")

# Lire le fichier worker.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Trouver la fonction handleAddFavorite
match = re.search(
    r'async function handleAddFavorite\([^)]*\)[^{]*\{',
    content
)

if match:
    print(f"✅ Fonction trouvée à la position {match.start()}")
    
    # Trouver la fin de la fonction
    start = match.end() - 1
    brace_count = 1
    pos = start + 1
    
    while pos < len(content) and brace_count > 0:
        if content[pos] == '{':
            brace_count += 1
        elif content[pos] == '}':
            brace_count -= 1
        pos += 1
    
    if brace_count == 0:
        function_code = content[match.start():pos]
        print("\n" + "="*60)
        print("FONCTION ACTUELLE:")
        print("="*60)
        print(function_code)
        print("="*60)
        
        # Vérifier si elle sauve job_data
        if 'job_data' in function_code:
            print("\n✅ La fonction sauvegarde job_data")
        else:
            print("\n⚠️  La fonction ne sauvegarde PAS job_data")
            print("   Elle doit sauvegarder le JSON complet de l'offre")
else:
    print("❌ Fonction handleAddFavorite non trouvée")
