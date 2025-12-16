#!/usr/bin/env python3
"""
Script ultime pour réparer worker-full-to-fix.js
Répare TOUS les try/catch déséquilibrés
"""

import re

def repair_worker():
    with open('worker-full-to-fix.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    
    # Parcourir ligne par ligne et équilibrer les try/catch
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Détecter un try sans catch
        if 'try {' in line:
            # Chercher le catch correspondant
            brace_count = 0
            found_catch = False
            j = i
            
            while j < len(lines):
                if '{' in lines[j]:
                    brace_count += lines[j].count('{')
                if '}' in lines[j]:
                    brace_count -= lines[j].count('}')
                
                if 'catch' in lines[j] and j > i:
                    found_catch = True
                    break
                
                # Si on ferme le try sans trouver de catch
                if brace_count == 0 and j > i:
                    if not found_catch:
                        # Ajouter un catch avant la fermeture
                        lines.insert(j, '  } catch (error) {')
                        lines.insert(j + 1, '    console.error("Error:", error);')
                        lines.insert(j + 2, '    return jsonResponse({ success: false, error: error.message }, 500);')
                    break
                
                j += 1
        
        i += 1
    
    # Sauvegarder
    repaired = '\n'.join(lines)
    
    with open('worker-repaired.js', 'w', encoding='utf-8') as f:
        f.write(repaired)
    
    print(f"✅ Worker réparé : {len(lines)} lignes")
    print(f"📝 Sauvegardé dans worker-repaired.js")

if __name__ == '__main__':
    repair_worker()
