#!/usr/bin/env python3
"""
Script pour copier le code de fermeture du menu utilisateur depuis app.html vers toutes les autres pages.
"""

import re
from pathlib import Path

PAGES = [
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

# Code à ajouter
USER_MENU_CLOSE_CODE = '''
        // Close user menu when clicking on menu items
        document.querySelectorAll('.user-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const dropdown = document.getElementById('userMenuDropdown');
                if (dropdown) {
                    dropdown.classList.remove('show');
                }
            });
        });
'''

def add_user_menu_close(filename):
    """Ajoute le code de fermeture du menu utilisateur."""
    filepath = Path(filename)
    
    if not filepath.exists():
        print(f"  ⚠️  {filename} n'existe pas")
        return False
    
    content = filepath.read_text(encoding='utf-8')
    
    # Vérifier si le code existe déjà
    if 'Close user menu when clicking on menu items' in content:
        print(f"  ℹ️  {filename} - Code déjà présent")
        return True
    
    # Chercher le pattern et ajouter après
    pattern = r"(        document\.querySelectorAll\('\.navbar-link, \.navbar-btn, \.dropdown-item'\)\.forEach\([^}]+\}\)\s*\}\);)"
    
    if not re.search(pattern, content, re.DOTALL):
        print(f"  ⚠️  {filename} - Pattern non trouvé")
        return False
    
    # Ajouter le code
    content = re.sub(pattern, r'\1' + USER_MENU_CLOSE_CODE, content, flags=re.DOTALL)
    
    filepath.write_text(content, encoding='utf-8')
    print(f"  ✅ {filename} - Code ajouté")
    return True

def main():
    print("🔧 Ajout du code de fermeture du menu utilisateur...\n")
    
    success_count = 0
    for page in PAGES:
        print(f"📄 {page}...")
        if add_user_menu_close(page):
            success_count += 1
    
    print(f"\n✅ {success_count}/{len(PAGES)} pages traitées!")

if __name__ == '__main__':
    main()
