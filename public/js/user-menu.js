// ============================================
// USER MENU - Avatar avec Badge Tier + Dropdown
// ============================================

const API_BASE = 'https://swisscv-pro.dallyhermann-71e.workers.dev';

// Initialiser le menu utilisateur
async function initUserMenu() {
    console.log('🚀 Initialisation menu utilisateur...');

    try {
        // Récupérer les données utilisateur
        const userData = await fetchUserData();

        if (!userData) {
            console.error('❌ Impossible de récupérer les données utilisateur');
            return;
        }

        console.log('✅ Données utilisateur récupérées:', userData);

        // Créer le menu utilisateur
        createUserMenu(userData);

        // Ajouter les event listeners
        setupUserMenuListeners();

    } catch (error) {
        console.error('❌ Erreur initialisation menu utilisateur:', error);
    }
}

// Récupérer les données utilisateur depuis l'API
async function fetchUserData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ Token manquant');
            return null;
        }

        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur API');
        }

        const data = await response.json();

        return {
            firstName: data.user?.firstName || data.user?.first_name || '',
            lastName: data.user?.lastName || data.user?.last_name || '',
            email: data.user?.email || '',
            tier: data.user?.tier || 'free'
        };

    } catch (error) {
        console.error('❌ Erreur récupération données:', error);
        return null;
    }
}

// Générer les initiales depuis le nom
function generateInitials(firstName, lastName, email) {
    // Si on a prénom et nom
    if (firstName && lastName) {
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }

    // Si on a seulement le prénom
    if (firstName) {
        return firstName.substring(0, 2).toUpperCase();
    }

    // Si on a seulement le nom
    if (lastName) {
        return lastName.substring(0, 2).toUpperCase();
    }

    // Fallback sur email
    if (email) {
        return email.charAt(0).toUpperCase();
    }

    // Fallback par défaut
    return 'U';
}

// Créer le menu utilisateur dans la navbar
function createUserMenu(userData) {
    const { firstName, lastName, email, tier } = userData;

    // Générer les initiales
    const initials = generateInitials(firstName, lastName, email);

    // Déterminer le badge tier
    const tierBadge = tier === 'premium' ? 'Premium' :
        tier === 'pro' ? 'Pro' : 'Free';

    // Déterminer la couleur du badge
    const tierColor = tier === 'premium' ? '#f59e0b' :
        tier === 'pro' ? '#ec4899' : '#9ca3af';

    // Créer le HTML du menu utilisateur
    const userMenuHTML = `
        <div class="user-menu-container">
            <button class="user-menu-button" id="userMenuButton">
                <div class="user-avatar">${initials}</div>
                <span class="user-tier-badge" style="background: ${tierColor};">${tierBadge}</span>
                <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
            
            <div class="user-menu-dropdown" id="userMenuDropdown">
                <div class="user-menu-header">
                    <div class="user-menu-name">${firstName || lastName || 'Utilisateur'}</div>
                    <div class="user-menu-email">${email}</div>
                </div>
                
                <div class="user-menu-divider"></div>
                
                <a href="profile.html" class="user-menu-item">
                    <span class="menu-icon">👤</span>
                    <span>Mon Profil</span>
                </a>
                
                ${tier === 'premium' || tier === 'pro' ? `
                <a href="team.html" class="user-menu-item">
                    <span class="menu-icon">💼</span>
                    <span>Mon Équipe</span>
                </a>
                ` : ''}
                
                <a href="support.html" class="user-menu-item">
                    <span class="menu-icon">💬</span>
                    <span>Support</span>
                </a>
                
                <a href="#" class="user-menu-item" onclick="openSettings(); return false;">
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
    `;

    // Trouver l'élément où insérer le menu (dans la navbar)
    const navbarMenu = document.querySelector('.navbar-menu');
    if (!navbarMenu) {
        console.error('❌ .navbar-menu introuvable');
        return;
    }

    console.log('✅ .navbar-menu trouvé');

    // Créer un conteneur temporaire
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = userMenuHTML;

    // POUR TEST: Ajouter à la fin sans supprimer les anciens liens
    navbarMenu.appendChild(tempDiv.firstElementChild);

    console.log('✅ Menu utilisateur ajouté avec succès!');
}

// Configurer les event listeners
function setupUserMenuListeners() {
    const menuButton = document.getElementById('userMenuButton');
    const menuDropdown = document.getElementById('userMenuDropdown');

    if (!menuButton || !menuDropdown) {
        console.error('❌ Éléments menu introuvables');
        return;
    }

    console.log('✅ Event listeners configurés');

    // Toggle dropdown au clic
    menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        menuDropdown.classList.toggle('show');
        console.log('🔄 Dropdown toggled');
    });

    // Fermer le dropdown si on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!menuButton.contains(e.target) && !menuDropdown.contains(e.target)) {
            menuDropdown.classList.remove('show');
        }
    });
}

// Fonction pour ouvrir les paramètres (à implémenter)
function openSettings() {
    alert('Paramètres - À implémenter');
}

// Fonction de déconnexion
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Auto-initialisation si le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserMenu);
} else {
    initUserMenu();
}
