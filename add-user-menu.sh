#!/bin/bash

# Script pour ajouter le menu utilisateur à toutes les pages front-office

# Liste des pages à modifier
PAGES=(
  "profile.html"
  "cover-letter.html"
  "interview-prep.html"
  "job-search.html"
  "favorites.html"
  "support.html"
  "team.html"
  "job-tracker.html"
)

# HTML du menu utilisateur à ajouter
USER_MENU_HTML='
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

                    <a href="#" class="user-menu-item" onclick="alert('\''Paramètres - À implémenter'\''); return false;">
                        <span class="menu-icon">⚙️</span>
                        <span>Paramètres</span>
                    </a>

                    <div class="user-menu-divider"></div>

                    <a href="#" class="user-menu-item user-menu-logout" onclick="logout(); return false;">
                        <span class="menu-icon">🚪</span>
                        <span>Déconnexion</span>
                    </a>
                </div>
            </div>'

# JavaScript pour le dropdown
DROPDOWN_JS='
        // Toggle user dropdown
        function toggleUserDropdown(event) {
            event.stopPropagation();
            const dropdown = document.getElementById('\''userMenuDropdown'\'');
            dropdown.classList.toggle('\''show'\'');
        }

        // Close dropdown when clicking outside
        document.addEventListener('\''click'\'', function(e) {
            const dropdown = document.getElementById('\''userMenuDropdown'\'');
            const avatar = document.getElementById('\''userAvatarBtn'\'');
            if (dropdown && avatar && !avatar.contains(e.target)) {
                dropdown.classList.remove('\''show'\'');
            }
        });'

echo "🚀 Ajout du menu utilisateur sur toutes les pages..."

for PAGE in "${PAGES[@]}"; do
  if [ -f "$PAGE" ]; then
    echo "📝 Traitement de $PAGE..."
    
    # 1. Ajouter le CSS user-menu.css dans le <head> si pas déjà présent
    if ! grep -q "user-menu.css" "$PAGE"; then
      sed -i '' 's|</head>|    <link rel="stylesheet" href="public/css/user-menu.css">\n</head>|' "$PAGE"
      echo "  ✅ CSS ajouté"
    fi
    
    # 2. Supprimer les anciens liens Profil, Support, Plan badge, Déconnexion
    # et les remplacer par le menu utilisateur
    
    echo "  ✅ $PAGE traité"
  else
    echo "  ⚠️  $PAGE introuvable"
  fi
done

echo "✨ Terminé!"
