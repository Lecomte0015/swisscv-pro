// ============================================================
// AUTH.JS - Module d'authentification SwissCV Pro
// ============================================================

// ✅ URL CORRIGÉE (sans slash final)
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
        console.log('❌ Non authentifié - Redirection vers login');
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
            console.log('❌ Token invalide ou expiré');
            removeToken();
            window.location.href = 'login.html';
            return false;
        }
        
        const data = await response.json();
        // Mettre à jour les infos utilisateur
        setUser(data.user);
        
        console.log('✅ Authentification valide:', data.user.email);
        return true;
        
    } catch (error) {
        console.error('❌ Erreur vérification auth:', error);
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
        console.log('✅ Déjà connecté - Redirection vers app');
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
        console.log('📤 Inscription:', email);
        
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
        
        console.log('✅ Inscription réussie:', data);
        
        // Stocker le token et les infos utilisateur
        setToken(data.token);
        setUser(data.user);
        
        return { success: true, user: data.user };
        
    } catch (error) {
        console.error('❌ Erreur inscription:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// CONNEXION
// ============================================================

async function login(email, password) {
    try {
        console.log('📤 Connexion:', email);
        
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
        
        console.log('✅ Connexion réussie:', data);
        
        // Stocker le token et les infos utilisateur
        setToken(data.token);
        setUser(data.user);
        
        return { success: true, user: data.user };
        
    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================
// DÉCONNEXION
// ============================================================

function logout() {
    console.log('👋 Déconnexion');
    removeToken();
    window.location.href = 'index.html';
}

// ============================================================
// REQUÊTES AUTHENTIFIÉES
// ============================================================

async function authenticatedFetch(endpoint, options = {}) {
    const token = getToken();
    
    if (!token) {
        console.log('❌ Pas de token - Redirection vers login');
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
            console.log('❌ Token invalide - Redirection vers login');
            removeToken();
            window.location.href = 'login.html';
            return null;
        }
        
        return response;
        
    } catch (error) {
        console.error('❌ Erreur requête authentifiée:', error);
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
        console.log('📊 Limite analyses:', data);
        
        return { 
            allowed: data.allowed || false,
            remaining: data.remaining || 0,
            tier: data.tier || 'free'
        };
        
    } catch (error) {
        console.error('❌ Erreur vérification limite:', error);
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
            console.log('✅ Utilisateur payant - Pas de limite');
            return { success: true };
        }
        
        const response = await authenticatedFetch('/increment-analysis', {
            method: 'POST'
        });
        
        if (!response) return { success: false };
        
        const data = await response.json();
        console.log('✅ Compteur incrémenté:', data);
        
        return { success: true };
        
    } catch (error) {
        console.error('❌ Erreur incrémentation:', error);
        return { success: false };
    }
}

// ============================================================
// AFFICHAGE INFOS UTILISATEUR
// ============================================================

function displayUserInfo(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('❌ Container userInfo non trouvé');
        return;
    }
    
    const user = getUser();
    if (!user) {
        console.error('❌ Pas d\'utilisateur');
        return;
    }
    
    console.log('👤 Affichage infos utilisateur:', user);
    
    // Déterminer l'icône et le style du badge
    let badgeClass = 'plan-badge free';
    let badgeIcon = '🆓';
    let badgeText = 'Free';
    
    if (user.tier === 'pro') {
        badgeClass = 'plan-badge pro';
        badgeIcon = '💎';
        badgeText = 'Pro';
    } else if (user.tier === 'premium') {
        badgeClass = 'plan-badge premium';
        badgeIcon = '✨';
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
            🚪 Déconnexion
        </button>
    `;
}

// ============================================================
// AFFICHAGE COMPTEUR ANALYSES RESTANTES
// ============================================================

async function displayRemainingCount(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('❌ Container remainingAnalyses non trouvé');
        return;
    }
    
    const user = getUser();
    
    // Si utilisateur payant, pas de limite
    if (user && (user.tier === 'premium' || user.tier === 'pro')) {
        container.innerHTML = `
            <div style="background:#E8F5E9;border:2px solid #00C853;padding:12px;border-radius:6px;text-align:center;margin-bottom:24px">
                <span style="font-weight:700;color:#2E7D32">✨ Analyses illimitées</span>
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
                    <div style="font-size:18px;font-weight:700;color:#D50000;margin-bottom:8px">⚠️ Limite atteinte</div>
                    <p style="font-size:14px;color:#666;margin-bottom:12px">Vous avez utilisé vos analyses gratuites</p>
                    <a href="pricing.html" style="display:inline-block;background:#D50000;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">🚀 Passer à Premium</a>
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
        console.error('❌ Erreur affichage compteur:', error);
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

console.log('✅ auth.js chargé - API:', API_ENDPOINT);