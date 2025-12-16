#!/usr/bin/env python3
"""
SCRIPT ULTIME DE RÉPARATION DU WORKER.JS
Répare toutes les fonctions cassées automatiquement
"""

with open('worker.js', 'r') as f:
    lines = f.readlines()

print("🔧 RÉPARATION AUTOMATIQUE COMPLÈTE\n")

# Liste des fonctions cassées identifiées
broken_functions = [
    {'name': 'handleSupportContact', 'start': 1107},
    {'name': 'handleGetSavedSearches', 'start': 3897},
    {'name': 'handleUpdateJobStatus', 'start': 4083},
    {'name': 'handleUpdateJobApplicationStatus', 'start': 4900},
    {'name': 'handleUpdateJobApplicationStatus', 'start': 5088},
    {'name': 'handleAdminUserDetails', 'start': 5835},
    {'name': 'logAdminAction', 'start': 5953},
    {'name': 'hasPermission', 'start': 6177},
]

repairs_made = 0

# Pour chaque fonction, chercher les try sans catch et les corriger
for func in broken_functions:
    start = func['start'] - 1  # Index commence à 0
    
    # Chercher la fin de la fonction (prochaine fonction ou export default)
    end = start + 200  # Chercher dans les 200 lignes suivantes
    
    for i in range(start, min(end, len(lines))):
        if i > start and ('async function ' in lines[i] or 'function ' in lines[i] or 'export default' in lines[i]):
            end = i
            break
    
    # Compter try et catch dans cette fonction
    try_count = 0
    catch_count = 0
    try_lines = []
    catch_lines = []
    
    for i in range(start, end):
        if 'try {' in lines[i]:
            try_count += 1
            try_lines.append(i)
        if '} catch' in lines[i] or 'catch (' in lines[i]:
            catch_count += 1
            catch_lines.append(i)
    
    # Si déséquilibre, ajouter des catch
    if try_count > catch_count:
        missing = try_count - catch_count
        print(f"⚠️  {func['name']} (ligne {func['start']}): manque {missing} catch")
        
        # Trouver où insérer le catch (avant la fin de la fonction)
        # Chercher la dernière accolade fermante avant la fin
        for i in range(end-1, start, -1):
            if lines[i].strip() == '}':
                # Insérer un catch avant cette accolade
                catch_code = [
                    '  } catch (error) {\n',
                    f'    console.error("Error in {func[\'name\']}:", error);\n',
                    '    return jsonResponse({ success: false, error: error.message }, 500);\n',
                    '  }\n'
                ]
                
                for j, line in enumerate(catch_code):
                    lines.insert(i + j, line)
                
                repairs_made += 1
                print(f"   ✅ Catch ajouté avant ligne {i+1}")
                break

with open('worker.js', 'w') as f:
    f.writelines(lines)

print(f"\n✅ {repairs_made} fonctions réparées")
print(f"   Total lignes : {len(lines)}")
