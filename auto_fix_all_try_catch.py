#!/usr/bin/env python3
"""
Script automatique pour réparer TOUS les try/catch dans worker-full-to-fix.js
"""

import re

def fix_all_try_catch():
    with open('worker-full-to-fix.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        fixed_lines.append(line)
        
        # Détecter "try {" au début d'un bloc
        if re.search(r'^\s*try\s*{', line):
            # Compter les accolades pour trouver la fin du try
            brace_count = line.count('{') - line.count('}')
            j = i + 1
            found_catch = False
            
            # Parcourir jusqu'à la fermeture du try
            while j < len(lines) and brace_count > 0:
                brace_count += lines[j].count('{') - lines[j].count('}')
                fixed_lines.append(lines[j])
                
                # Vérifier si la ligne suivante est un catch
                if j + 1 < len(lines) and re.search(r'^\s*}\s*catch', lines[j + 1]):
                    found_catch = True
                
                if brace_count == 0:
                    # On a fermé le try
                    if not found_catch and j + 1 < len(lines):
                        # Vérifier si la ligne suivante est un catch
                        next_line = lines[j + 1].strip()
                        if not next_line.startswith('} catch') and not next_line.startswith('catch'):
                            # Pas de catch, on en ajoute un
                            indent = ' ' * (len(lines[j]) - len(lines[j].lstrip()))
                            fixed_lines.append(f"{indent}} catch (error) {{")
                            fixed_lines.append(f"{indent}  console.error('Auto-fixed error:', error);")
                    break
                
                j += 1
            
            i = j
        
        i += 1
    
    # Sauvegarder
    fixed_content = '\n'.join(fixed_lines)
    
    with open('worker-auto-fixed.js', 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print(f"✅ Fichier réparé automatiquement")
    print(f"📝 Sauvegardé dans worker-auto-fixed.js")
    print(f"📊 {len(fixed_lines)} lignes")

if __name__ == '__main__':
    fix_all_try_catch()
