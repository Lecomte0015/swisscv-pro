#!/usr/bin/env python3
"""
Script pour copier la navbar sur TOUTES les pages front-office manquantes.
"""

import re
from pathlib import Path

# Pages front-office manquantes
PAGES = [
    'cv-templates.html',
    'cv-optimizer.html'
]

# Navbar HTML complète
NAVBAR_HTML = '''    <nav class="navbar">
        <a href="index.html" class="navbar-brand">SwissCV Pro</a>
        <div class="navbar-burger" onclick="toggleMobileMenu()">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div class="navbar-menu" id="navbarMenu">
            <a href="dashboard.html" class="navbar-link">Dashboard</a>

            <!-- Menu Outils CV (Tous les plans) -->
            <div class="navbar-dropdown" id="cvToolsMenu">
                <button class="dropdown-toggle" onclick="toggleDropdown(event, this)">
                    🎯 Outils CV <span class="arrow">▼</span>
                </button>
                <div class="dropdown-menu">
                    <a href="app.html" class="dropdown-item">Analyser CV</a>
                    <a href="cv-templates.html" class="dropdown-item">📄 Templates</a>
                    <a href="cover-letter.html" class="dropdown-item">Lettre</a>
                </div>
            </div>

            <a href="job-search.html" class="navbar-link">Offres</a>
            <a href="interview-prep.html" class="navbar-link">🎯 Entretien</a>


            <!-- Menu Suivi -->
            <div class="navbar-dropdown">
                <button class="dropdown-toggle" onclick="toggleDropdown(event, this)">
                    📊 Suivi <span class="arrow">▼</span>
                </button>
                <div class="dropdown-menu">
                    <a href="favorites.html" class="dropdown-item">⭐ Favoris <span id="favoritesBadge"
                            style="display:none; background:#FFD700; color:#000; padding:2px 6px; border-radius:10px; font-size:11px; margin-left:4px;">0</span></a>
                    <a href="job-tracker.html" class="dropdown-item">Tracker</a>
                </div>
            </div>

            <!-- Menu Utilisateur Dropdown -->
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
            </div>
        </div>
    </nav>'''

CSS_LINK = '    <link rel="stylesheet" href="public/css/user-menu.css">'

NAVBAR_JS = '''        function toggleMobileMenu() {
            const m = document.getElementById('navbarMenu');
            const b = document.querySelector('.navbar-burger');
            m.classList.toggle('active');
            b.classList.toggle('active');
        }

        function toggleDropdown(event, button) {
            if (window.innerWidth <= 1024) {
                event.preventDefault();
                event.stopPropagation();
                const dropdown = button.closest('.navbar-dropdown');
                dropdown.classList.toggle('active');
            }
        }

        // Toggle user dropdown
        function toggleUserDropdown(event) {
            event.stopPropagation();
            const dropdown = document.getElementById('userMenuDropdown');
            dropdown.classList.toggle('show');
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            const dropdown = document.getElementById('userMenuDropdown');
            const avatar = document.getElementById('userAvatarBtn');
            if (dropdown && avatar && !avatar.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });

        document.querySelectorAll('.navbar-link, .navbar-btn, .dropdown-item').forEach(l => {
            l.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    const m = document.getElementById('navbarMenu');
                    const b = document.querySelector('.navbar-burger');
                    m.classList.remove('active');
                    b.classList.remove('active');
                }
            });
        });'''


def update_page(filename):
    """Met à jour une page avec la nouvelle navbar."""
    filepath = Path(filename)
    
    if not filepath.exists():
        print(f"  ⚠️  {filename} n'existe pas")
        return False
    
    content = filepath.read_text(encoding='utf-8')
    
    # Ajouter CSS si manquant
    if 'user-menu.css' not in content:
        content = content.replace('</head>', f'{CSS_LINK}\n</head>')
        print(f"  ✅ CSS ajouté à {filename}")
    
    # Remplacer la navbar
    navbar_pattern = r'<nav class="navbar">.*?</nav>'
    
    if not re.search(navbar_pattern, content, re.DOTALL):
        print(f"  ⚠️  Navbar non trouvée dans {filename}")
        return False
    
    # Créer la navbar personnalisée pour cette page
    page_navbar = NAVBAR_HTML
    
    # Marquer le lien actif selon la page
    if filename == 'cv-templates.html':
        page_navbar = page_navbar.replace('href="cv-templates.html" class="dropdown-item"', 
                                         'href="cv-templates.html" class="dropdown-item active"')
    elif filename == 'cv-optimizer.html':
        # Pas de lien direct pour cv-optimizer
        pass
    
    # Remplacer la navbar
    content = re.sub(navbar_pattern, page_navbar, content, flags=re.DOTALL)
    
    # Vérifier si les fonctions JS existent déjà
    has_toggle_mobile = 'function toggleMobileMenu()' in content
    has_toggle_dropdown = 'function toggleDropdown(' in content
    has_toggle_user = 'function toggleUserDropdown(' in content
    
    # Si les fonctions n'existent pas, les ajouter après <script>
    if not (has_toggle_mobile and has_toggle_dropdown and has_toggle_user):
        script_pattern = r'(<nav class="navbar">.*?</nav>\s*<script>)'
        if re.search(script_pattern, content, re.DOTALL):
            content = re.sub(script_pattern, r'\1\n' + NAVBAR_JS + '\n', content, flags=re.DOTALL)
            print(f"  ✅ JavaScript ajouté à {filename}")
    
    # Sauvegarder
    filepath.write_text(content, encoding='utf-8')
    print(f"  ✅ {filename} mis à jour")
    return True


def main():
    print("🔧 Mise à jour de la navbar sur les pages manquantes...\n")
    
    success_count = 0
    for page in PAGES:
        print(f"📄 Traitement de {page}...")
        if update_page(page):
            success_count += 1
        print()
    
    print(f"\n✅ {success_count}/{len(PAGES)} pages mises à jour!")


if __name__ == '__main__':
    main()
