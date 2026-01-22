#!/usr/bin/env python3
"""
Script pour mettre à jour le lien "Paramètres" dans le menu utilisateur
de toutes les pages pour pointer vers settings.html au lieu d'une alerte.
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

def update_settings_link(filename):
    """Met à jour le lien Paramètres pour pointer vers settings.html."""
    filepath = Path(filename)
    
    if not filepath.exists():
        print(f"  ⚠️  {filename} n'existe pas")
        return False
    
    content = filepath.read_text(encoding='utf-8')
    
    # Vérifier si le lien pointe déjà vers settings.html
    if 'href="settings.html" class="user-menu-item"' in content:
        print(f"  ℹ️  {filename} - Lien déjà mis à jour")
        return True
    
    # Pattern pour trouver le lien Paramètres avec l'alerte
    pattern = r'<a href="#" class="user-menu-item" onclick="alert\(\'Paramètres - À implémenter\'\); return false;">'
    
    # Remplacement
    replacement = '<a href="settings.html" class="user-menu-item">'
    
    if not re.search(pattern, content):
        print(f"  ⚠️  {filename} - Pattern non trouvé")
        return False
    
    # Remplacer
    content = re.sub(pattern, replacement, content)
    
    filepath.write_text(content, encoding='utf-8')
    print(f"  ✅ {filename} - Lien mis à jour")
    return True

def main():
    print("🔧 Mise à jour des liens Paramètres...\n")
    
    success_count = 0
    for page in PAGES:
        print(f"📄 {page}...")
        if update_settings_link(page):
            success_count += 1
    
    print(f"\n✅ {success_count}/{len(PAGES)} pages traitées!")

if __name__ == '__main__':
    main()
