// ============================================================
// AUTH.JS - Module d'authentification SwissCV Pro
// ============================================================

// URL CORRIGÉE (sans slash final)
const API_ENDPOINT = 'https://swisscv-pro.dallyhermann-71e.workers.dev';

// ============================================================
// GESTION DU TOKEN JWT
// ============================================================

function getToken() {
    return localStorage.getItem('swisscv_token');
}

function setToken(token) {
    localStorage.setItem('swisscv_token', token);
}

function removeToken() {
    localStorage.removeItem('swisscv_token');
    localStorage.removeItem('swisscv_user');
}

function getUser() {
    const userStr = localStorage.getItem('swisscv_user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
}

function setUser(user) {
    localStorage.setItem('swisscv_user', JSON.stringify(user));
}

// ============================================================
// VÉRIFICATION D'AUTHENTIFICATION
// ============================================================

function isAuthenticated() {
    const token = getToken();
    const user = getUser();
    return !!(token && user);
}

// ============================================================
// PROTECTION DE PAGE
// ============================================================

async function requireAuth() {
    if (!isAuthenticated()) {
        console.log('Non authentifié - Redirection vers login');
        window.location.href = 'login.html';
        return false;
    }
    
    // Vérifier que le token est toujours valide
    try {
        const response = await fetch(`${API_ENDPOINT}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        
        if (!response.ok) {
            console.log('Token invalide ou expiré');
            removeToken();
            window.location.href = 'login.html';
            return false;
        }
        
        const data = await response.json();
        // Mettre à jour les infos utilisateur
        setUser(data.user);
        
        console.log('Authentification valide:', data.user.email);
        return true;
        
    } catch (error) {
        console.error('Erreur vérification auth:', error);
        removeToken();
        window.location.href = 'login.html';
        return false;
    }
}

// ============================================================
// REDIRECTION SI DÉJÀ CONNECTÉ
// ============================================================

function redirectIfAuthenticated() {
    if (isAuthenticated()) {
        console.log('Déjà connecté - Redirection vers app');
        window.location.href = 'app.html';
        return true;
    }
    return false;
}

// ============================================================
// INSCRIPTION
// ============================================================

async function signup(email, password) {
    try {
        console.log('Inscription:', email);
        
        const response = await fetch(`${API_ENDPOINT}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de l\'inscription');
        }
        
        console.log('Inscription réussie:', data);
        
        // Stocker le token et les infos utilisateur
        setToken(data.token);
        setUser(data.user);
        
        return { success: true, user: data.user };
        
    } catch (error) {
        console.error('Erreur inscription:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// CONNEXION
// ============================================================

async function login(email, password) {
    try {
        console.log('Connexion:', email);
        
        const response = await fetch(`${API_ENDPOINT}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Email ou mot de passe incorrect');
        }
        
        console.log('Connexion réussie:', data);
        
        // Stocker le token et les infos utilisateur
        setToken(data.token);
        setUser(data.user);
        
        return { success: true, user: data.user };
        
    } catch (error) {
        console.error('Erreur connexion:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// DÉCONNEXION
// ============================================================

function logout() {
    console.log('Déconnexion');
    removeToken();
    window.location.href = 'index.html';
}

// ============================================================
// REQUÊTES AUTHENTIFIÉES
// ============================================================

async function authenticatedFetch(endpoint, options = {}) {
    const token = getToken();
    
    if (!token) {
        console.log('Pas de token - Redirection vers login');
        window.location.href = 'login.html';
        return null;
    }
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_ENDPOINT}${endpoint}`, mergedOptions);
        
        // Si 401 (non autorisé), le token est invalide
        if (response.status === 401) {
            console.log('Token invalide - Redirection vers login');
            removeToken();
            window.location.href = 'login.html';
            return null;
        }
        
        return response;
        
    } catch (error) {
        console.error('Erreur requête authentifiée:', error);
        throw error;
    }
}

// ============================================================
// VÉRIFICATION LIMITE ANALYSES
// ============================================================

async function canAnalyze() {
    try {
        const response = await authenticatedFetch('/check-limit', {
            method: 'POST'
        });
        
        if (!response) return { allowed: false };
        
        const data = await response.json();
        console.log('Limite analyses:', data);
        
        return { 
            allowed: data.allowed || false,
            remaining: data.remaining || 0,
            tier: data.tier || 'free'
        };
        
    } catch (error) {
        console.error('Erreur vérification limite:', error);
        return { allowed: false };
    }
}

// ============================================================
// INCRÉMENTER COMPTEUR ANALYSES
// ============================================================

async function incrementAnalysisCount() {
    try {
        const user = getUser();
        
        // Si utilisateur payant, pas besoin d'incrémenter
        if (user && (user.tier === 'premium' || user.tier === 'pro')) {
            console.log('Utilisateur payant - Pas de limite');
            return { success: true };
        }
        
        const response = await authenticatedFetch('/increment-analysis', {
            method: 'POST'
        });
        
        if (!response) return { success: false };
        
        const data = await response.json();
        console.log('Compteur incrémenté:', data);
        
        return { success: true };
        
    } catch (error) {
        console.error('Erreur incrémentation:', error);
        return { success: false };
    }
}

// ============================================================
// AFFICHAGE INFOS UTILISATEUR
// ============================================================

function displayUserInfo(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container userInfo non trouvé');
        return;
    }
    
    const user = getUser();
    if (!user) {
        console.error('Pas d\'utilisateur');
        return;
    }
    
    console.log('Affichage infos utilisateur:', user);
    
    // Déterminer l'icône et le style du badge
    let badgeClass = 'plan-badge free';
    let badgeIcon = '🆓';
    let badgeText = 'Free';
    
    if (user.tier === 'pro') {
        badgeClass = 'plan-badge pro';
        badgeIcon = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3L8 9l4 12 4-12-3-6"/><path d="M2 9h20"/></svg>';
        badgeText = 'Pro';
    } else if (user.tier === 'premium') {
        badgeClass = 'plan-badge premium';
        badgeIcon = '<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z"/></svg>';
        badgeText = 'Premium';
    }
    
    container.innerHTML = `
        <span style="font-size: 14px; color: #666; margin-right: 12px;">
            ${user.email}
        </span>
        <span class="${badgeClass}">
            <span>${badgeIcon}</span>
            <span>${badgeText}</span>
        </span>
        <button onclick="logout()" class="btn-dashboard" style="margin-left: 12px;">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Déconnexion
        </button>
    `;
}

// ============================================================
// AFFICHAGE COMPTEUR ANALYSES RESTANTES
// ============================================================

async function displayRemainingCount(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container remainingAnalyses non trouvé');
        return;
    }
    
    const user = getUser();
    
    // Si utilisateur payant, pas de limite
    if (user && (user.tier === 'premium' || user.tier === 'pro')) {
        container.innerHTML = `
            <div style="background:#E8F5E9;border:2px solid #00C853;padding:12px;border-radius:6px;text-align:center;margin-bottom:24px">
                <span style="font-weight:700;color:#2E7D32"><svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z"/></svg> Analyses illimitées</span>
            </div>
        `;
        return;
    }
    
    // Récupérer le nombre d'analyses restantes
    try {
        const result = await canAnalyze();
        const remaining = result.remaining || 0;
        
        if (remaining === 0) {
            container.innerHTML = `
                <div style="background:#FFEBEE;border:2px solid #D50000;padding:16px;border-radius:8px;text-align:center;margin-bottom:24px">
                    <div style="font-size:18px;font-weight:700;color:#D50000;margin-bottom:8px"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Limite atteinte</div>
                    <p style="font-size:14px;color:#666;margin-bottom:12px">Vous avez utilisé vos analyses gratuites</p>
                    <a href="pricing.html" style="display:inline-block;background:#D50000;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg> Passer à Premium</a>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="background:#FFF3E0;border:2px solid #FFB300;padding:12px;border-radius:6px;text-align:center;margin-bottom:24px">
                    <span style="font-weight:700;color:#E65100">${remaining} analyse${remaining > 1 ? 's' : ''} gratuite${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}</span>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Erreur affichage compteur:', error);
        container.innerHTML = '';
    }
}

// ============================================================
// VÉRIFICATION SI UTILISATEUR PAYANT
// ============================================================

function isPaidUser() {
    const user = getUser();
    if (!user) return false;
    return user.tier === 'premium' || user.tier === 'pro';
}

// ============================================================
// EXPORT DES FONCTIONS
// ============================================================

// Rendre les fonctions disponibles globalement
window.getToken = getToken;
window.setToken = setToken;
window.removeToken = removeToken;
window.getUser = getUser;
window.setUser = setUser;
window.isAuthenticated = isAuthenticated;
window.requireAuth = requireAuth;
window.redirectIfAuthenticated = redirectIfAuthenticated;
window.signup = signup;
window.login = login;
window.logout = logout;
window.authenticatedFetch = authenticatedFetch;
window.canAnalyze = canAnalyze;
window.incrementAnalysisCount = incrementAnalysisCount;
window.displayUserInfo = displayUserInfo;
window.displayRemainingCount = displayRemainingCount;
window.isPaidUser = isPaidUser;

console.log('auth.js chargé - API:', API_ENDPOINT);