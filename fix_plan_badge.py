#!/usr/bin/env python3
"""
Script pour ajouter id="planBadge" au badge du plan utilisateur sur toutes les pages.
"""

import re
from pathlib import Path

PAGES = [
    'app.html',
    'dashboard.html',
    'job-search.html',
    'interview-prep.html',
    'cover-letter.html',
    'favorites.html',
    'support.html',
    'team.html',
    'job-tracker.html',
    'cv-templates.html'
]

def add_plan_badge_id(filename):
    """Ajoute id="planBadge" au badge du plan."""
    filepath = Path(filename)
    
    if not filepath.exists():
        print(f"  ⚠️  {filename} n'existe pas")
        return False
    
    content = filepath.read_text(encoding='utf-8')
    
    # Vérifier si l'ID existe déjà
    if 'id="planBadge"' in content:
        print(f"  ℹ️  {filename} - ID planBadge déjà présent")
        return True
    
    # Pattern pour trouver le badge sans ID
    pattern = r'<span class="user-menu-badge">Free</span>'
    replacement = '<span class="user-menu-badge" id="planBadge">Free</span>'
    
    if pattern not in content:
        print(f"  ⚠️  {filename} - Badge non trouvé")
        return False
    
    # Ajouter l'ID
    content = content.replace(pattern, replacement)
    
    filepath.write_text(content, encoding='utf-8')
    print(f"  ✅ {filename} - ID planBadge ajouté")
    return True

def main():
    print("🔧 Ajout de l'ID planBadge au badge utilisateur...\n")
    
    success_count = 0
    for page in PAGES:
        print(f"📄 {page}...")
        if add_plan_badge_id(page):
            success_count += 1
    
    print(f"\n✅ {success_count}/{len(PAGES)} pages traitées!")

if __name__ == '__main__':
    main()
