#!/usr/bin/env python3
"""
Nettoyer la duplication dans worker.js
"""

print("🔧 Nettoyage de la duplication...")

# Lire worker.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Trouver et supprimer les lignes 672-700 environ (la partie dupliquée)
# Ligne 672 est "}, 401);" qui est orpheline
# On doit supprimer de cette ligne jusqu'à la fin de la vieille fonction

# Chercher la ligne avec "}, 401);" orpheline
new_lines = []
skip_until_next_function = False
i = 0

while i < len(lines):
    line = lines[i]
    
    # Si on trouve "}, 401);" tout seul (ligne 672)
    if line.strip() == '}, 401);' and i > 600 and i < 700:
        print(f"✅ Trouvé duplication à la ligne {i+1}")
        # Sauter jusqu'à trouver la prochaine fonction async
        skip_until_next_function = True
        i += 1
        continue
    
    # Si on est en mode skip
    if skip_until_next_function:
        # Chercher la prochaine fonction async qui n'est pas handleGetApplicationStats
        if line.strip().startswith('async function') and 'handleGetApplicationStats' not in line:
            print(f"✅ Fin de duplication à la ligne {i+1}")
            skip_until_next_function = False
            new_lines.append(line)
        i += 1
        continue
    
    new_lines.append(line)
    i += 1

# Écrire
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"\n✅ Nettoyage terminé!")
print(f"   Lignes avant: {len(lines)}")
print(f"   Lignes après: {len(new_lines)}")
print(f"   Lignes supprimées: {len(lines) - len(new_lines)}")
