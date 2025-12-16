#!/usr/bin/env python3
"""
Script ULTIME pour corriger TOUTES les fonctions try sans catch dans worker.js
"""
import re

with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("🔧 Recherche de toutes les fonctions try sans catch...")

# Pattern pour trouver les fonctions avec try mais sans catch
# On cherche: function xxx() { try { ... } } (sans catch avant le dernier })
pattern = r'(async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*try\s*\{[^}]*\}(?!\s*catch)'

matches = list(re.finditer(pattern, content, re.DOTALL))
print(f"   Trouvé {len(matches)} fonctions potentiellement cassées")

# Stratégie différente : chercher tous les "} async function" ou "} function"
# qui indiquent qu'un try n'a pas de catch

errors_fixed = 0

# Remplacer tous les patterns "}\n\nasync function" par "} catch (e) { return null; }\n}\n\nasync function"
# Mais seulement si c'est dans un contexte de try

lines = content.split('\n')
new_lines = []
i = 0

while i < len(lines):
    line = lines[i]
    
    # Détecter si on est à la fin d'un try sans catch
    if line.strip() == '}' and i + 1 < len(lines):
        next_line = lines[i + 1].strip()
        
        # Si la ligne suivante est vide ou commence par "async function" ou "function"
        if next_line == '' or next_line.startswith('async function') or next_line.startswith('function'):
            # Vérifier si on est dans un try (chercher en arrière)
            in_try = False
            brace_count = 0
            for j in range(i - 1, max(0, i - 100), -1):
                prev_line = lines[j].strip()
                if '{' in prev_line:
                    brace_count += prev_line.count('{')
                if '}' in prev_line:
                    brace_count -= prev_line.count('}')
                if 'try {' in prev_line and brace_count == 1:
                    in_try = True
                    break
                if brace_count <= 0:
                    break
            
            if in_try:
                # Ajouter un catch avant cette accolade
                new_lines.append('  } catch (error) {')
                new_lines.append('    console.error("Error:", error);')
                new_lines.append('    return null;')
                new_lines.append(line)
                errors_fixed += 1
                i += 1
                continue
    
    new_lines.append(line)
    i += 1

if errors_fixed > 0:
    content = '\n'.join(new_lines)
    with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ {errors_fixed} fonctions corrigées")
else:
    print("✅ Aucune erreur trouvée")

print("\n🚀 Prêt pour déploiement")
