#!/usr/bin/env python3
"""
Script pour ajouter le lien CSS user-menu.css sur toutes les pages.
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
    'job-tracker.html'
]

CSS_LINK = '    <link rel="stylesheet" href="public/css/user-menu.css">'

def add_css_link(filename):
    """Ajoute le lien CSS user-menu.css avant </head>."""
    filepath = Path(filename)
    
    if not filepath.exists():
        print(f"  ⚠️  {filename} n'existe pas")
        return False
    
    content = filepath.read_text(encoding='utf-8')
    
    # Vérifier si le lien existe déjà
    if 'user-menu.css' in content:
        print(f"  ℹ️  {filename} a déjà le lien CSS")
        return True
    
    # Ajouter avant </head>
    content = content.replace('</head>', f'{CSS_LINK}\n</head>')
    
    filepath.write_text(content, encoding='utf-8')
    print(f"  ✅ Lien CSS ajouté à {filename}")
    return True

def main():
    print("🔧 Ajout du lien CSS user-menu.css...\n")
    
    success_count = 0
    for page in PAGES:
        print(f"📄 {page}...")
        if add_css_link(page):
            success_count += 1
    
    print(f"\n✅ {success_count}/{len(PAGES)} pages mises à jour!")

if __name__ == '__main__':
    main()
