#!/usr/bin/env python3
"""
Script pour retirer le lien "Analyse CV" standalone de la navbar.
On garde seulement celui dans le menu Outils CV.
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
    'job-tracker.html'
]

def remove_standalone_analyse(filename):
    """Retire le lien Analyse CV standalone."""
    filepath = Path(filename)
    
    if not filepath.exists():
        print(f"  ⚠️  {filename} n'existe pas")
        return False
    
    content = filepath.read_text(encoding='utf-8')
    
    # Pattern pour trouver et supprimer la ligne Analyse CV standalone
    # <a href="app.html" class="navbar-link" id="analyseLink">📊 Analyse CV</a>
    pattern = r'\s*<a href="app\.html" class="navbar-link[^"]*" id="analyseLink">📊 Analyse CV</a>\s*\n'
    
    if not re.search(pattern, content):
        print(f"  ℹ️  {filename} - Lien standalone non trouvé")
        return True
    
    # Supprimer le lien
    content = re.sub(pattern, '\n', content)
    
    filepath.write_text(content, encoding='utf-8')
    print(f"  ✅ {filename} - Lien Analyse CV standalone supprimé")
    return True

def main():
    print("🔧 Suppression du lien Analyse CV standalone...\n")
    
    success_count = 0
    for page in PAGES:
        print(f"📄 {page}...")
        if remove_standalone_analyse(page):
            success_count += 1
    
    print(f"\n✅ {success_count}/{len(PAGES)} pages traitées!")

if __name__ == '__main__':
    main()
