// ============================================
// NOTIFICATIONS UI - Badge & Dropdown
// À inclure dans toutes les pages admin
// ============================================

const NOTIFICATIONS_API = 'https://swisscv-pro.dallyhermann-71e.workers.dev';
let notificationsInterval = null;

// Initialiser notifications
function initNotifications() {
    loadNotifications();
    // Auto-refresh toutes les 30s
    notificationsInterval = setInterval(loadNotifications, 30000);
}

// Charger notifications
async function loadNotifications() {
    try {
        const response = await fetch(`${NOTIFICATIONS_API}/admin/notifications`, {
            headers: { 'Authorization': `Bearer ${getAdminToken()}` }
        });

        if (!response.ok) return;

        const data = await response.json();
        updateNotificationsBadge(data.unread_count);
        updateNotificationsDropdown(data.notifications);

    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Mettre à jour badge (tous les badges)
function updateNotificationsBadge(count) {
    const badges = document.querySelectorAll('.notifications-badge');

    badges.forEach(badge => {
        if (count > 0) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    });
}

// Mettre à jour dropdown (tous les dropdowns)
function updateNotificationsDropdown(notifications) {
    const lists = document.querySelectorAll('#notificationsList');

    lists.forEach(list => {
        if (!list) return;

        if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
            list.innerHTML = '<div class="notifications-empty">🔔 Aucune notification</div>';
            return;
        }

        list.innerHTML = notifications.map(notif => {
            const time = formatTimeAgo(notif.created_at);
            return `
                <div class="notification-item" data-notif-id="${notif.id}" data-notif-link="${notif.link || ''}">
                    <div class="notification-type ${notif.type}">${notif.type.replace('_', ' ')}</div>
                    <div class="notification-title">${notif.title}</div>
                    <div class="notification-message">${notif.message}</div>
                    <div class="notification-time">${time}</div>
                </div>
            `;
        }).join('');
    });
}

// Toggle dropdown avec délégation d'événements
document.addEventListener('click', function (event) {
    // Vérifier si click sur bouton notifications
    if (event.target.closest('.notifications-bell')) {
        event.preventDefault();
        event.stopPropagation();

        const container = event.target.closest('.notifications-container');
        if (!container) return;

        const dropdown = container.querySelector('.notifications-dropdown');
        if (!dropdown) return;

        dropdown.classList.toggle('show');
        return;
    }

    // Gérer click sur notification
    const notificationItem = event.target.closest('.notification-item');
    if (notificationItem) {
        const notifId = notificationItem.dataset.notifId;
        const notifLink = notificationItem.dataset.notifLink;
        if (notifId) {
            handleNotificationClick(notifId, notifLink);
        }
        return;
    }

    // Fermer dropdown si click outside
    const openDropdowns = document.querySelectorAll('.notifications-dropdown.show');
    openDropdowns.forEach(dropdown => {
        const container = dropdown.closest('.notifications-container');
        if (container && !container.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });
});

// Gérer click sur notification
async function handleNotificationClick(notifId, link) {
    try {
        // Marquer comme lu
        await fetch(`${NOTIFICATIONS_API}/admin/notifications/${notifId}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${getAdminToken()}` }
        });

        // Recharger notifications
        await loadNotifications();

        // Rediriger si lien
        if (link) {
            window.location.href = link;
        }

    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// Fermer dropdown si click outside
document.addEventListener('click', function (event) {
    const container = document.querySelector('.notifications-container');
    const dropdown = document.getElementById('notificationsDropdown');

    if (container && dropdown && !container.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Helper formatTimeAgo (si pas déjà défini)
if (typeof formatTimeAgo === 'undefined') {
    function formatTimeAgo(timestamp) {
        const now = Math.floor(Date.now() / 1000);
        const diff = now - timestamp;

        if (diff < 60) return 'À l\'instant';
        if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
        return new Date(timestamp * 1000).toLocaleDateString('fr-FR');
    }
}
