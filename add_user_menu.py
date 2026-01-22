#!/usr/bin/env python3
"""
Script pour ajouter le menu utilisateur à toutes les pages front-office
"""

import re

# Liste des pages à modifier
PAGES = [
    "profile.html",
    "cover-letter.html",
    "interview-prep.html",
    "job-search.html",
    "favorites.html",
    "support.html",
    "team.html",
    "job-tracker.html"
]

# HTML du menu utilisateur
USER_MENU_HTML = '''            <!-- Menu Utilisateur Dropdown -->
            <div class="user-avatar-btn" id="userAvatarBtn">
                <div class="user-avatar-circle" onclick="toggleUserDropdown(event)">U</div>
                
                <div class="user-menu-dropdown" id="userMenuDropdown">
                    <div class="user-menu-header">
                        <div class="user-menu-name">Utilisateur</div>
                        <div class="user-menu-email" id="userEmail">email@example.com</div>
                        <span class="user-menu-badge">Free</span>
                    </div>

                    <div class="user-menu-divider"></div>

                    <a href="profile.html" class="user-menu-item">
                        <span class="menu-icon">👤</span>
                        <span>Mon Profil</span>
                    </a>

                    <a href="support.html" class="user-menu-item">
                        <span class="menu-icon">💬</span>
                        <span>Support</span>
                    </a>

                    <a href="#" class="user-menu-item" onclick="alert('Paramètres - À implémenter'); return false;">
                        <span class="menu-icon">⚙️</span>
                        <span>Paramètres</span>
                    </a>

                    <div class="user-menu-divider"></div>

                    <a href="#" class="user-menu-item user-menu-logout" onclick="logout(); return false;">
                        <span class="menu-icon">🚪</span>
                        <span>Déconnexion</span>
                    </a>
                </div>
            </div>'''

# JavaScript pour le dropdown
DROPDOWN_JS = '''
        // Toggle user dropdown
        function toggleUserDropdown(event) {
            event.stopPropagation();
            const dropdown = document.getElementById('userMenuDropdown');
            dropdown.classList.toggle('show');
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            const dropdown = document.getElementById('userMenuDropdown');
            const avatar = document.getElementById('userAvatarBtn');
            if (dropdown && avatar && !avatar.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });'''

def add_user_menu_to_page(filename):
    """Ajoute le menu utilisateur à une page"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Ajouter le CSS user-menu.css dans le <head> si pas déjà présent
        if 'user-menu.css' not in content:
            content = content.replace('</head>', '    <link rel="stylesheet" href="public/css/user-menu.css">\n</head>')
            print(f"  ✅ CSS ajouté à {filename}")
        
        # 2. Remplacer les anciens liens par le menu utilisateur
        # Pattern pour trouver: Profil, Support, Équipe (optionnel), Plan badge, Déconnexion
        pattern = r'(<a href="profile\.html".*?</a>\s*<a href="support\.html".*?</a>\s*(?:<a href="team\.html".*?</a>\s*)?<span class="plan-badge.*?</span>\s*<button class="navbar-btn".*?</button>)'
        
        if re.search(pattern, content, re.DOTALL):
            content = re.sub(pattern, USER_MENU_HTML, content, flags=re.DOTALL)
            print(f"  ✅ Menu utilisateur ajouté à {filename}")
        else:
            print(f"  ⚠️  Pattern non trouvé dans {filename}")
        
        # 3. Ajouter les fonctions JavaScript si pas déjà présentes
        if 'toggleUserDropdown' not in content:
            # Trouver le dernier </script> avant </body>
            content = content.replace('</script>\n\n</body>', '</script>' + DROPDOWN_JS + '\n    </script>\n\n</body>')
            print(f"  ✅ JavaScript ajouté à {filename}")
        
        # 4. Ajouter notifications.js si pas déjà présent
        if 'notifications.js' not in content:
            content = content.replace('</body>', '    <script src="public/js/notifications.js"></script>\n    <script>initNotifications();</script>\n</body>')
            print(f"  ✅ notifications.js ajouté à {filename}")
        
        # Écrire le fichier modifié
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True
    except FileNotFoundError:
        print(f"  ❌ {filename} introuvable")
        return False
    except Exception as e:
        print(f"  ❌ Erreur sur {filename}: {e}")
        return False

def main():
    print("🚀 Ajout du menu utilisateur sur toutes les pages...\n")
    
    success_count = 0
    for page in PAGES:
        print(f"📝 Traitement de {page}...")
        if add_user_menu_to_page(page):
            success_count += 1
        print()
    
    print(f"✨ Terminé! {success_count}/{len(PAGES)} pages modifiées")

if __name__ == "__main__":
    main()
