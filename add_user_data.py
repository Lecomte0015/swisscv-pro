#!/usr/bin/env python3
"""
Script pour ajouter le code qui met à jour le nom et l'email de l'utilisateur dans le menu.
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

# Code à ajouter après planBadge.className
USER_DATA_CODE = '''
                // Mettre à jour le nom et l'email de l'utilisateur dans le menu
                const userNameEl = document.querySelector('.user-menu-name');
                const userEmailEl = document.getElementById('userEmail');
                const userAvatarCircle = document.querySelector('.user-avatar-circle');

                if (userNameEl && u.name) {
                    userNameEl.textContent = u.name;
                }

                if (userEmailEl && u.email) {
                    userEmailEl.textContent = u.email;
                }

                // Mettre à jour l'avatar avec l'initiale du nom ou email
                if (userAvatarCircle) {
                    const initial = u.name ? u.name.charAt(0).toUpperCase() : 
                                   u.email ? u.email.charAt(0).toUpperCase() : 'U';
                    userAvatarCircle.textContent = initial;
                }
'''

def add_user_data_code(filename):
    """Ajoute le code de mise à jour des données utilisateur."""
    filepath = Path(filename)
    
    if not filepath.exists():
        print(f"  ⚠️  {filename} n'existe pas")
        return False
    
    content = filepath.read_text(encoding='utf-8')
    
    # Vérifier si le code existe déjà
    if 'Mettre à jour le nom et l\'email de l\'utilisateur' in content:
        print(f"  ℹ️  {filename} - Code déjà présent")
        return True
    
    # Chercher le pattern et ajouter après
    pattern = r"(planBadge\.className = `plan-badge \$\{tier\}`;)"
    
    if not re.search(pattern, content):
        print(f"  ⚠️  {filename} - Pattern non trouvé")
        return False
    
    # Ajouter le code
    content = re.sub(pattern, r'\1' + USER_DATA_CODE, content)
    
    filepath.write_text(content, encoding='utf-8')
    print(f"  ✅ {filename} - Code ajouté")
    return True

def main():
    print("🔧 Ajout du code de mise à jour des données utilisateur...\n")
    
    success_count = 0
    for page in PAGES:
        print(f"📄 {page}...")
        if add_user_data_code(page):
            success_count += 1
    
    print(f"\n✅ {success_count}/{len(PAGES)} pages traitées!")

if __name__ == '__main__':
    main()
