// ============================================
// USER MENU - Avatar avec Badge Tier + Dropdown
// ============================================

const API_BASE = 'https://swisscv-pro.dallyhermann-71e.workers.dev';

// Initialiser le menu utilisateur
async function initUserMenu() {
    console.log('Initialisation menu utilisateur...');

    try {
        // Récupérer les données utilisateur
        const userData = await fetchUserData();

        if (!userData) {
            console.error('Impossible de récupérer les données utilisateur');
            return;
        }

        console.log('Données utilisateur récupérées:', userData);

        // Créer le menu utilisateur
        createUserMenu(userData);

        // Ajouter les event listeners
        setupUserMenuListeners();

    } catch (error) {
        console.error('Erreur initialisation menu utilisateur:', error);
    }
}

// Récupérer les données utilisateur depuis l'API
async function fetchUserData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token manquant');
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
        console.error('Erreur récupération données:', error);
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
                    <span class="menu-icon"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                    <span>Mon Profil</span>
                </a>
                
                ${tier === 'premium' || tier === 'pro' ? `
                <a href="team.html" class="user-menu-item">
                    <span class="menu-icon"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></span>
                    <span>Mon Équipe</span>
                </a>
                ` : ''}
                
                <a href="support.html" class="user-menu-item">
                    <span class="menu-icon"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></span>
                    <span>Support</span>
                </a>
                
                <a href="#" class="user-menu-item" onclick="openSettings(); return false;">
                    <span class="menu-icon"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>
                    <span>Paramètres</span>
                </a>
                
                <div class="user-menu-divider"></div>
                
                <a href="#" class="user-menu-item user-menu-logout" onclick="logout(); return false;">
                    <span class="menu-icon"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
                    <span>Déconnexion</span>
                </a>
            </div>
        </div>
    `;

    // Trouver l'élément où insérer le menu (dans la navbar)
    const navbarMenu = document.querySelector('.navbar-menu');
    if (!navbarMenu) {
        console.error('.navbar-menu introuvable');
        return;
    }

    console.log('.navbar-menu trouvé');

    // Créer un conteneur temporaire
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = userMenuHTML;

    // POUR TEST: Ajouter à la fin sans supprimer les anciens liens
    navbarMenu.appendChild(tempDiv.firstElementChild);

    console.log('Menu utilisateur ajouté avec succès!');
}

// Configurer les event listeners
function setupUserMenuListeners() {
    const menuButton = document.getElementById('userMenuButton');
    const menuDropdown = document.getElementById('userMenuDropdown');

    if (!menuButton || !menuDropdown) {
        console.error('Éléments menu introuvables');
        return;
    }

    console.log('Event listeners configurés');

    // Toggle dropdown au clic
    menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        menuDropdown.classList.toggle('show');
        console.log('Dropdown toggled');
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
// NOTE : ce fichier est chargé après auth.js sur la plupart des pages, donc cette
// définition écrasait la sienne (correcte) au runtime. Elle effaçait les mauvaises
// clés localStorage ('token'/'user' au lieu de 'swisscv_token'/'swisscv_user'), ce qui
// laissait le vrai token de session actif après un clic sur "Déconnexion". Corrigé pour
// réutiliser removeToken() d'auth.js quand elle est disponible.
function logout() {
    if (typeof removeToken === 'function') {
        removeToken();
    } else {
        localStorage.removeItem('swisscv_token');
        localStorage.removeItem('swisscv_user');
    }
    window.location.href = 'index.html';
}

// Auto-initialisation si le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserMenu);
} else {
    initUserMenu();
}
