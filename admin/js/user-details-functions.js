// ============================================
// FONCTIONS MODAL DÉTAILS UTILISATEUR ENRICHIE
// À remplacer dans admin-users.html
// ============================================

// Fonction principale - Remplace viewUser() actuelle
async function viewUser(userId, email) {
    try {
        // Afficher modal avec loading
        showModal(
            `👁️ Détails - ${email}`,
            '<div class="loading-state">⏳ Chargement...</div>',
            [{ text: 'Fermer', class: 'btn-cancel', action: closeModal }]
        );

        // Fetch données complètes
        const response = await fetch(`${API_BASE}/admin/users/${userId}/details`, {
            headers: { 'Authorization': `Bearer ${getAdminToken()}` }
        });

        if (!response.ok) throw new Error('Failed to load user details');

        const data = await response.json();

        // Construire contenu modal avec tabs
        const content = buildUserDetailsModal(data);

        showModal(
            `👁️ Détails - ${data.user.email}`,
            content,
            [{ text: 'Fermer', class: 'btn-cancel', action: closeModal }]
        );

        // Initialiser tabs (tab overview active par défaut)
        window.currentUserData = data;

    } catch (error) {
        console.error('Error loading user details:', error);
        showModal(
            '❌ Erreur',
            'Impossible de charger les détails utilisateur',
            [{ text: 'Fermer', class: 'btn-cancel', action: closeModal }]
        );
    }
}

// Construire HTML modal avec tabs
function buildUserDetailsModal(data) {
    return `
        <div class="modal-tabs">
            <button class="modal-tab active" onclick="switchUserTab('overview')">Vue d'ensemble</button>
            <button class="modal-tab" onclick="switchUserTab('analyses')">Analyses CV (${data.cv_analyses.length})</button>
            <button class="modal-tab" onclick="switchUserTab('activity')">Activité (${data.recent_activity.length})</button>
            <button class="modal-tab" onclick="switchUserTab('payments')">Paiements (${data.payments.length})</button>
        </div>
        
        <div class="tab-content" id="userTabContent">
            ${buildOverviewTab(data)}
        </div>
    `;
}

// Tab 1: Vue d'ensemble
function buildOverviewTab(data) {
    const tierBadge = `<span class="badge ${data.user.subscription_tier}">${data.user.subscription_tier.toUpperCase()}</span>`;
    const signupDate = new Date(data.user.created_at * 1000).toLocaleDateString('fr-FR');
    const lastLogin = data.user.last_login ? new Date(data.user.last_login * 1000).toLocaleDateString('fr-FR') : 'Jamais';

    return `
        <div style="margin-bottom: 20px;">
            <p><strong>Email:</strong> ${data.user.email}</p>
            <p><strong>Plan:</strong> ${tierBadge}</p>
            <p><strong>Inscrit le:</strong> ${signupDate}</p>
            <p><strong>Dernier login:</strong> ${lastLogin}</p>
        </div>

        <h4 style="margin-bottom: 12px;">Statistiques</h4>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="label">Total Analyses CV</div>
                <div class="value">${data.stats.total_analyses}</div>
            </div>
            <div class="stat-item">
                <div class="label">Total Candidatures</div>
                <div class="value">${data.stats.total_job_applications}</div>
            </div>
            <div class="stat-item">
                <div class="label">Inscrit depuis</div>
                <div class="value">${data.stats.days_since_signup} jours</div>
            </div>
            <div class="stat-item">
                <div class="label">Dernier login</div>
                <div class="value">${data.stats.days_since_last_login !== null ? data.stats.days_since_last_login + ' jours' : 'Jamais'}</div>
            </div>
        </div>
    `;
}

// Tab 2: Analyses CV
function buildAnalysesTab(data) {
    if (data.cv_analyses.length === 0) {
        return '<div class="empty-state">📄 Aucune analyse CV pour le moment</div>';
    }

    const rows = data.cv_analyses.map(analysis => {
        const date = new Date(analysis.created_at * 1000).toLocaleDateString('fr-FR');
        const statusBadge = analysis.status === 'completed' ?
            '<span class="badge premium">Complété</span>' :
            '<span class="badge free">En cours</span>';

        return `
            <tr>
                <td>${date}</td>
                <td>${statusBadge}</td>
                <td>#${analysis.id}</td>
            </tr>
        `;
    }).join('');

    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>ID</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

// Tab 3: Activité
function buildActivityTab(data) {
    if (data.recent_activity.length === 0) {
        return '<div class="empty-state">🔄 Aucune activité récente</div>';
    }

    const items = data.recent_activity.map(activity => {
        const icon = activity.type === 'login' ? '🔐' :
            activity.type === 'analysis' ? '📄' : '💼';
        const time = formatTimeAgo(activity.created_at);

        return `
            <div class="activity-item">
                <div class="activity-icon">${icon}</div>
                <div class="activity-content">
                    <div>${activity.description}</div>
                    <div class="activity-time">${time}</div>
                </div>
            </div>
        `;
    }).join('');

    return `<div class="activity-timeline">${items}</div>`;
}

// Tab 4: Paiements
function buildPaymentsTab(data) {
    if (data.payments.length === 0) {
        return '<div class="empty-state">💳 Aucun paiement enregistré</div>';
    }

    const rows = data.payments.map(payment => {
        const date = new Date(payment.created_at * 1000).toLocaleDateString('fr-FR');
        const statusBadge = payment.status === 'paid' ?
            '<span class="badge premium">Payé</span>' :
            '<span class="badge free">En attente</span>';

        return `
            <tr>
                <td>${date}</td>
                <td>${payment.amount}€</td>
                <td><span class="badge ${payment.tier}">${payment.tier.toUpperCase()}</span></td>
                <td>${statusBadge}</td>
            </tr>
        `;
    }).join('');

    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Montant</th>
                    <th>Plan</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

// Changer de tab
function switchUserTab(tabName) {
    if (!window.currentUserData) return;

    // Mettre à jour tabs actives
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Mettre à jour contenu
    const content = document.getElementById('userTabContent');
    const data = window.currentUserData;

    switch (tabName) {
        case 'overview':
            content.innerHTML = buildOverviewTab(data);
            break;
        case 'analyses':
            content.innerHTML = buildAnalysesTab(data);
            break;
        case 'activity':
            content.innerHTML = buildActivityTab(data);
            break;
        case 'payments':
            content.innerHTML = buildPaymentsTab(data);
            break;
    }
}

// Helper: Format "il y a X temps"
function formatTimeAgo(timestamp) {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 60) return 'Il y a quelques secondes';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR');
}
