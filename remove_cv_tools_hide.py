#!/usr/bin/env python3
"""
Script pour supprimer la logique JavaScript qui cache le menu Outils CV pour les utilisateurs Free.
Le menu Outils CV doit être visible pour TOUS les plans.
"""

import re
from pathlib import Path

PAGES = [
    'app.html',
    'dashboard.html',
    'job-search.html',
    'interview-prep.html',
    'profile.html',
    'cover-letter.html',
    'favorites.html',
    'support.html',
    'team.html',
    'job-tracker.html',
    'cv-templates.html'
]

def remove_cv_tools_hide_logic(filename):
    """Supprime la logique qui cache le menu Outils CV."""
    filepath = Path(filename)
    
    if not filepath.exists():
        print(f"  ⚠️  {filename} n'existe pas")
        return False
    
    content = filepath.read_text(encoding='utf-8')
    
    # Pattern pour trouver et supprimer la logique de cache du menu Outils CV
    # On cherche le bloc if/else qui cache cvToolsMenu pour Free
    pattern = r'''                // Pour Premium/Pro: Cacher lien direct et afficher menu Outils CV
                if \(tier === 'premium' \|\| tier === 'pro'\) \{
                    if \(analyseLink\) analyseLink\.style\.display = 'none';
                    if \(cvToolsMenu\) cvToolsMenu\.style\.display = 'inline-block';
                \} else \{
                    // Pour Free: Afficher lien direct et cacher menu Outils CV
                    if \(analyseLink\) analyseLink\.style\.display = 'inline-block';
                    if \(cvToolsMenu\) cvToolsMenu\.style\.display = 'none';
                \}'''
    
    # Remplacement: Outils CV toujours visible, pas de lien direct Analyse
    replacement = '''                // Menu Outils CV visible pour tous les plans
                if (cvToolsMenu) cvToolsMenu.style.display = 'inline-block';
                if (analyseLink) analyseLink.style.display = 'none';'''
    
    if not re.search(pattern, content):
        print(f"  ℹ️  {filename} - Logique non trouvée ou déjà modifiée")
        return True
    
    # Supprimer la logique
    content = re.sub(pattern, replacement, content)
    
    filepath.write_text(content, encoding='utf-8')
    print(f"  ✅ {filename} - Logique de cache supprimée")
    return True

def main():
    print("🔧 Suppression de la logique qui cache Outils CV...\n")
    
    success_count = 0
    for page in PAGES:
        print(f"📄 {page}...")
        if remove_cv_tools_hide_logic(page):
            success_count += 1
    
    print(f"\n✅ {success_count}/{len(PAGES)} pages traitées!")

if __name__ == '__main__':
    main()
