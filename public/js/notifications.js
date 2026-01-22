// ========================================
// NOTIFICATION SYSTEM - Frontend Component
// ========================================

/**
 * Initialiser le système de notifications
 * À appeler au chargement de chaque page
 */
async function initNotifications() {
  // Créer le badge de notification dans la navbar
  createNotificationBadge();

  // Charger les notifications
  await loadNotifications();

  // Rafraîchir toutes les 5 secondes pour des mises à jour plus rapides
  setInterval(loadNotifications, 5000);
}

/**
 * Créer le badge de notification dans la navbar
 */
function createNotificationBadge() {
  const navbar = document.querySelector('.navbar-menu');
  if (!navbar) return;

  // Trouver le menu utilisateur
  const userMenu = document.querySelector('.user-avatar-btn');

  const notifBell = document.createElement('div');
  notifBell.className = 'notification-bell';
  notifBell.innerHTML = `
    <button class="notif-btn" onclick="toggleNotificationModal()" title="Notifications">
      🔔
      <span class="notif-count" id="notifCount" style="display: none;">0</span>
    </button>
  `;

  // Insérer avant le menu utilisateur
  if (userMenu) {
    userMenu.parentNode.insertBefore(notifBell, userMenu);
  } else {
    navbar.appendChild(notifBell);
  }

  // Ajouter les styles
  addNotificationStyles();

  // Créer la modal
  createNotificationModal();
}

/**
 * Ajouter les styles CSS pour les notifications
 */
function addNotificationStyles() {
  if (document.getElementById('notification-styles')) return;

  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    .notification-bell {
      position: relative;
      display: inline-block;
      margin-right: 16px;
    }

    .notif-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      position: relative;
      padding: 8px;
      border-radius: 50%;
      transition: background 0.2s;
    }

    .notif-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .notif-count {
      position: absolute;
      top: 4px;
      right: 4px;
      background: #ff4444;
      color: white;
      border-radius: 10px;
      padding: 2px 6px;
      font-size: 11px;
      font-weight: bold;
      min-width: 18px;
      text-align: center;
    }

    .notification-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      align-items: flex-start;
      justify-content: center;
      padding-top: 80px;
    }

    .notification-modal.show {
      display: flex;
    }

    .notification-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .notification-header {
      padding: 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .notification-header h2 {
      margin: 0;
      font-size: 20px;
    }

    .notification-actions {
      display: flex;
      gap: 12px;
    }

    .notification-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }

    .notification-item {
      background: white;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .notification-item:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .notification-item.unread {
      background: #f0f8ff;
      border-left: 4px solid #4CAF50;
    }

    .notification-title {
      font-weight: bold;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .notification-type-badge {
      font-size: 18px;
    }

    .notification-message {
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .notification-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }

    .notification-time {
      font-size: 12px;
      color: #999;
    }

    .notification-btn {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }

    .notification-btn:hover {
      background: #45a049;
    }

    .notification-delete {
      background: #ff4444;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .notification-empty {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .btn-mark-all {
      background: none;
      border: 1px solid #ddd;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }

    .btn-mark-all:hover {
      background: #f5f5f5;
    }

    .modal-close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
    }
  `;

  document.head.appendChild(style);
}

/**
 * Créer la modal de notifications
 */
function createNotificationModal() {
  const modal = document.createElement('div');
  modal.id = 'notificationModal';
  modal.className = 'notification-modal';
  modal.innerHTML = `
    <div class="notification-content">
      <div class="notification-header">
        <h2>🔔 Notifications</h2>
        <div class="notification-actions">
          <button class="btn-mark-all" onclick="markAllAsRead()">Tout marquer comme lu</button>
          <button class="modal-close-btn" onclick="toggleNotificationModal()">&times;</button>
        </div>
      </div>
      <div class="notification-list" id="notificationList">
        <div class="notification-empty">Chargement...</div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Fermer en cliquant à l'extérieur
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      toggleNotificationModal();
    }
  });
}

/**
 * Charger les notifications depuis l'API
 */
async function loadNotifications() {
  try {
    const response = await authenticatedFetch('/notifications');
    const data = await response.json();

    if (data.success) {
      updateNotificationBadge(data.unread_count);
      displayNotifications(data.notifications);
    }
  } catch (error) {
    // console.error('❌ Erreur chargement notifications:', error);
  }
}

/**
 * Mettre à jour le badge de compteur
 */
function updateNotificationBadge(count) {
  const badge = document.getElementById('notifCount');
  if (!badge) {
    // console.error('❌ Badge element not found!');
    return;
  }

  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
}

/**
 * Afficher les notifications dans la modal
 */
function displayNotifications(notifications) {
  const list = document.getElementById('notificationList');
  if (!list) return;

  if (notifications.length === 0) {
    list.innerHTML = '<div class="notification-empty">📭 Aucune notification</div>';
    return;
  }

  list.innerHTML = notifications.map(notif => `
    <div class="notification-item ${notif.read ? '' : 'unread'}" onclick="handleNotificationClick('${notif.id}', '${notif.link || ''}', ${notif.read})">
      <div class="notification-title">
        <span class="notification-type-badge">${getNotificationIcon(notif.type)}</span>
        <span>${notif.title}</span>
      </div>
      <div class="notification-message">${notif.message}</div>
      <div class="notification-footer">
        <span class="notification-time">${formatNotificationTime(notif.created_at)}</span>
        <div style="display: flex; gap: 8px;">
          ${notif.link && notif.action_label ? `
            <button class="notification-btn" onclick="event.stopPropagation(); handleNotificationAction('${notif.id}', '${notif.link}', ${JSON.stringify(notif.data).replace(/"/g, '&quot;')})">
              ${notif.action_label}
            </button>
          ` : ''}
          <button class="notification-delete" onclick="event.stopPropagation(); deleteNotification('${notif.id}')">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Obtenir l'icône selon le type de notification
 */
function getNotificationIcon(type) {
  const icons = {
    'team_invite': '👥',
    'job_alert': '💼',
    'application_update': '📝',
    'system': '⚙️',
    'team_activity': '🎉'
  };
  return icons[type] || '📬';
}

/**
 * Formater le temps de la notification
 */
function formatNotificationTime(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return `Il y a ${Math.floor(diff / 86400)}j`;
}

/**
 * Gérer le clic sur une notification
 */
async function handleNotificationClick(notifId, actionUrl, isRead) {

  if (!isRead) {
    await markNotificationAsRead(notifId);
  }

  // Rediriger vers l'URL d'action si elle existe
  if (actionUrl && actionUrl !== 'null' && actionUrl !== '' && actionUrl !== 'undefined') {
    window.location.href = actionUrl;
  } else {
  }
}

/**
 * Afficher un message de succès
 */
function showSuccess(message) {
  // Utiliser la fonction globale si elle existe, sinon alert
  const globalShowSuccess = window.parent?.showSuccess || window.top?.showSuccess;
  if (globalShowSuccess && globalShowSuccess !== showSuccess) {
    globalShowSuccess(message);
  } else {
    alert(message);
  }
}

/**
 * Afficher un message d'erreur
 */
function showError(message) {
  // Utiliser la fonction globale si elle existe, sinon alert
  const globalShowError = window.parent?.showError || window.top?.showError;
  if (globalShowError && globalShowError !== showError) {
    globalShowError(message);
  } else {
    alert(message);
  }
}

/**
 * Gérer l'action d'une notification (ex: Accepter invitation)
 */
async function handleNotificationAction(notifId, actionUrl, data) {
  try {
    if (actionUrl === '/teams/accept-invitation' && data && data.token) {
      // Accepter l'invitation d'équipe via le bon endpoint
      const response = await authenticatedFetch(`/teams/invitations/${data.token}/accept`, {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('✅ Invitation acceptée ! Bienvenue dans l\'équipe !');
        await deleteNotification(notifId);
        await loadNotifications();
        // Rediriger vers la page équipe
        setTimeout(() => window.location.href = '/team.html', 1500);
      } else {
        showError(result.error || 'Erreur lors de l\'acceptation');
      }
    } else if (actionUrl) {
      // Redirection simple
      window.location.href = actionUrl;
    }
  } catch (error) {
    // console.error('Erreur action notification:', error);
    showError('Erreur lors de l\'action');
  }
}

/**
 * Marquer une notification comme lue
 */
async function markNotificationAsRead(notifId) {
  try {
    const response = await authenticatedFetch(`/notifications/${notifId}/read`, {
      method: 'POST'
    });
    await loadNotifications();
  } catch (error) {
    // console.error('❌ Erreur marquer comme lu:', error);
  }
}

/**
 * Marquer toutes les notifications comme lues
 */
async function markAllAsRead() {
  try {
    const response = await authenticatedFetch('/notifications/mark-all-read', {
      method: 'POST'
    });
    await loadNotifications();
  } catch (error) {
    // console.error('❌ Erreur marquer tout comme lu:', error);
  }
}

/**
 * Supprimer une notification
 */
async function deleteNotification(notifId) {
  try {
    await authenticatedFetch(`/notifications/${notifId}`, {
      method: 'DELETE'
    });
    await loadNotifications();
  } catch (error) {
    // console.error('Erreur suppression notification:', error);
  }
}

/**
 * Toggle la modal de notifications
 */
function toggleNotificationModal() {
  const modal = document.getElementById('notificationModal');
  if (!modal) return;

  modal.classList.toggle('show');

  if (modal.classList.contains('show')) {
    loadNotifications();
  }
}

// Exposer les fonctions globalement pour les onclick HTML
window.toggleNotificationModal = toggleNotificationModal;
window.markAllAsRead = markAllAsRead;
window.handleNotificationClick = handleNotificationClick;
window.markNotificationAsRead = markNotificationAsRead;
window.deleteNotification = deleteNotification;

// Initialiser au chargement de la page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNotifications);
} else {
  initNotifications();
}

