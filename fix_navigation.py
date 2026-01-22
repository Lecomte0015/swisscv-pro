#!/usr/bin/env python3
"""
Script pour corriger la navigation dupliquée "Analyse CV" dans tous les fichiers HTML.
- FREE users: Voir lien direct "Analyse CV"
- Premium/Pro users: Voir menu "Outils CV" avec Analyse CV dedans
"""

import re
import os

# Fichiers à modifier
files_to_fix = [
    'app.html',
    'job-search.html',
    'interview-prep.html',
    'profile.html'
]

def fix_navigation(filepath):
    """Applique le fix de navigation à un fichier HTML"""
    
    if not os.path.exists(filepath):
        print(f"❌ Fichier non trouvé: {filepath}")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Ajouter ID au lien Analyse CV
    content = re.sub(
        r'<a href="app\.html" class="navbar-link">📊 Analyse CV</a>',
        '<a href="app.html" class="navbar-link" id="analyseLink">📊 Analyse CV</a>',
        content
    )
    
    # 2. Trouver et modifier le script de navigation
    # Chercher la fonction qui gère cvToolsMenu
    pattern = r'(const cvToolsMenu = document\.getElementById\("cvToolsMenu"\);[\s\S]*?)(// Afficher lien Équipe pour Pro)'
    
    replacement = r'''\1const analyseLink = document.getElementById("analyseLink");

                // Pour Premium/Pro: Cacher lien direct et afficher menu Outils CV
                if (tier === 'premium' || tier === 'pro') {
                    if (analyseLink) analyseLink.style.display = 'none';
                    if (cvToolsMenu) cvToolsMenu.style.display = 'inline-block';
                } else {
                    // Pour Free: Afficher lien direct et cacher menu Outils CV
                    if (analyseLink) analyseLink.style.display = 'inline-block';
                    if (cvToolsMenu) cvToolsMenu.style.display = 'none';
                }

                \2'''
    
    content = re.sub(pattern, replacement, content)
    
    # Si le fichier a changé, le sauvegarder
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ {filepath} - Corrigé")
        return True
    else:
        print(f"⚠️  {filepath} - Aucun changement nécessaire")
        return False

if __name__ == '__main__':
    print("🔧 Correction de la navigation dupliquée...\n")
    
    fixed_count = 0
    for filepath in files_to_fix:
        if fix_navigation(filepath):
            fixed_count += 1
    
    print(f"\n✅ {fixed_count}/{len(files_to_fix)} fichiers corrigés")
