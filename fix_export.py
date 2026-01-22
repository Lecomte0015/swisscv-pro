#!/usr/bin/env python3
# Script pour ajouter le scheduled handler correctement

# Lire le fichier
with open('index.js.broken', 'r') as f:
    lines = f.readlines()

# Supprimer les lignes 3741-3750 (index 3740-3749)
del lines[3740:3750]

# Modifier la ligne 3455 (index 3454) pour ajouter une virgule
lines[3454] = lines[3454].rstrip() + ',\n'

# Insérer le scheduled handler après la ligne 3455 (index 3455)
scheduled_handler = [
    '  \n',
    '  async scheduled(event, env, ctx) {\n',
    '    await handleScheduled(event, env, ctx);\n',
    '  }\n'
]
lines[3455:3455] = scheduled_handler

# Écrire le fichier
with open('index.js', 'w') as f:
    f.writelines(lines)

print(f"✅ Fichier modifié: {len(lines)} lignes")
print(f"Lignes 3453-3465:")
for i in range(3452, min(3465, len(lines))):
    print(f"{i+1}: {lines[i]}", end='')
