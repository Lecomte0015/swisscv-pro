#!/usr/bin/env python3
"""
Script pour ajouter le code JavaScript qui ferme le menu utilisateur 
quand on clique sur un lien du menu sur mobile.
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

# JavaScript à ajouter après le code existant de fermeture des dropdowns
JS_TO_ADD = '''
        // Close user menu when clicking on menu items (mobile)
        document.querySelectorAll('.user-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const dropdown = document.getElementById('userMenuDropdown');
                if (dropdown) {
                    dropdown.classList.remove('show');
                }
            });
        });'''

def add_user_menu_close_logic(filename):
    """Ajoute la logique de fermeture du menu utilisateur sur mobile."""
    filepath = Path(filename)
    
    if not filepath.exists():
        print(f"  ⚠️  {filename} n'existe pas")
        return False
    
    content = filepath.read_text(encoding='utf-8')
    
    # Vérifier si le code existe déjà
    if 'Close user menu when clicking on menu items' in content:
        print(f"  ℹ️  {filename} - Code déjà présent")
        return True
    
    # Trouver le pattern où ajouter le code (après le code de fermeture des dropdowns navbar)
    pattern = r"(document\.querySelectorAll\('\.navbar-link, \.navbar-btn, \.dropdown-item'\)\.forEach\(l => \{[^}]+\}\);)"
    
    if not re.search(pattern, content):
        print(f"  ⚠️  {filename} - Pattern non trouvé")
        return False
    
    # Ajouter le code après
    content = re.sub(pattern, r'\1' + JS_TO_ADD, content)
    
    filepath.write_text(content, encoding='utf-8')
    print(f"  ✅ {filename} - Code ajouté")
    return True

def main():
    print("🔧 Ajout du code de fermeture du menu utilisateur sur mobile...\n")
    
    success_count = 0
    for page in PAGES:
        print(f"📄 {page}...")
        if add_user_menu_close_logic(page):
            success_count += 1
    
    print(f"\n✅ {success_count}/{len(PAGES)} pages traitées!")

if __name__ == '__main__':
    main()
