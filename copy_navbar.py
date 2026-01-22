#!/usr/bin/env python3
"""
Script pour copier la navbar correcte d'app.html vers toutes les autres pages.
"""

import re
from pathlib import Path

# Pages à mettre à jour
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

# Navbar HTML complète (extraite d'app.html)
NAVBAR_HTML = '''    <nav class="navbar">
        <a href="index.html" class="navbar-brand">SwissCV Pro</a>
        <div class="navbar-burger" onclick="toggleMobileMenu()">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div class="navbar-menu" id="navbarMenu">
            <a href="dashboard.html" class="navbar-link">Dashboard</a>
            <a href="app.html" class="navbar-link" id="analyseLink">📊 Analyse CV</a>

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

# JavaScript nécessaire
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
    
    # Trouver et remplacer la navbar
    # Pattern: de <nav class="navbar"> jusqu'à </nav>
    navbar_pattern = r'<nav class="navbar">.*?</nav>'
    
    if not re.search(navbar_pattern, content, re.DOTALL):
        print(f"  ⚠️  Navbar non trouvée dans {filename}")
        return False
    
    # Créer la navbar personnalisée pour cette page
    page_navbar = NAVBAR_HTML
    
    # Marquer le lien actif selon la page
    if filename == 'dashboard.html':
        page_navbar = page_navbar.replace('href="dashboard.html" class="navbar-link"', 
                                         'href="dashboard.html" class="navbar-link active"')
    elif filename == 'job-search.html':
        page_navbar = page_navbar.replace('href="job-search.html" class="navbar-link"', 
                                         'href="job-search.html" class="navbar-link active"')
    elif filename == 'interview-prep.html':
        page_navbar = page_navbar.replace('href="interview-prep.html" class="navbar-link"', 
                                         'href="interview-prep.html" class="navbar-link active"')
    elif filename == 'profile.html':
        page_navbar = page_navbar.replace('href="profile.html" class="user-menu-item"', 
                                         'href="profile.html" class="user-menu-item active"')
    elif filename == 'cover-letter.html':
        page_navbar = page_navbar.replace('href="cover-letter.html" class="dropdown-item"', 
                                         'href="cover-letter.html" class="dropdown-item active"')
    elif filename == 'favorites.html':
        page_navbar = page_navbar.replace('href="favorites.html" class="dropdown-item"', 
                                         'href="favorites.html" class="dropdown-item active"')
    elif filename == 'support.html':
        page_navbar = page_navbar.replace('href="support.html" class="user-menu-item"', 
                                         'href="support.html" class="user-menu-item active"')
    elif filename == 'team.html':
        # Team n'a pas de lien direct dans la navbar
        pass
    elif filename == 'job-tracker.html':
        page_navbar = page_navbar.replace('href="job-tracker.html" class="dropdown-item"', 
                                         'href="job-tracker.html" class="dropdown-item active"')
    
    # Remplacer la navbar
    content = re.sub(navbar_pattern, page_navbar, content, flags=re.DOTALL)
    
    # Vérifier si les fonctions JS existent déjà
    has_toggle_mobile = 'function toggleMobileMenu()' in content
    has_toggle_dropdown = 'function toggleDropdown(' in content
    has_toggle_user = 'function toggleUserDropdown(' in content
    
    # Si les fonctions n'existent pas, les ajouter après <script>
    if not (has_toggle_mobile and has_toggle_dropdown and has_toggle_user):
        # Trouver le premier <script> après la navbar
        script_pattern = r'(<nav class="navbar">.*?</nav>\s*<script>)'
        if re.search(script_pattern, content, re.DOTALL):
            content = re.sub(script_pattern, r'\1\n' + NAVBAR_JS + '\n', content, flags=re.DOTALL)
            print(f"  ✅ JavaScript ajouté à {filename}")
    
    # Sauvegarder
    filepath.write_text(content, encoding='utf-8')
    print(f"  ✅ {filename} mis à jour")
    return True


def main():
    print("🔧 Mise à jour de la navbar sur toutes les pages...\n")
    
    success_count = 0
    for page in PAGES:
        print(f"📄 Traitement de {page}...")
        if update_page(page):
            success_count += 1
        print()
    
    print(f"\n✅ {success_count}/{len(PAGES)} pages mises à jour avec succès!")


if __name__ == '__main__':
    main()
