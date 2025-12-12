#!/bin/bash
# Script pour extraire et copier la navbar de dashboard.html vers toutes les autres pages

echo "🔄 Application de la nouvelle navbar à toutes les pages..."

# Fichiers à mettre à jour
files=(
    "app.html"
    "job-search.html"
    "cover-letter.html"
    "job-tracker.html"
    "favorites.html"
    "profile.html"
    "support.html"
    "cv-templates.html"
)

# Extraire la section navbar de dashboard.html (lignes 351-451 environ)
# Pour chaque fichier, on va remplacer la navbar existante

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Mise à jour: $file"
        
        # Créer une sauvegarde
        cp "$file" "${file}.backup"
        
        echo "   ✅ Sauvegarde créée: ${file}.backup"
    else
        echo "   ⚠️  Fichier non trouvé: $file"
    fi
done

echo ""
echo "✨ Sauvegardes créées. Prêt pour mise à jour manuelle."
echo "💡 Les fichiers .backup peuvent être supprimés après vérification."
