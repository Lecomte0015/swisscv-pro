// ============================================
// NOTIFICATIONS ADMIN - Temps Réel
// À ajouter dans worker.js
// ============================================

// GET /admin/notifications - Liste notifications non lues
async function handleAdminNotifications(request, env) {
    try {
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '20');

        // Récupérer notifications non lues (read = 0)
        const notifications = await env.DB.prepare(`
      SELECT id, admin_id, type, title, message, link, created_at
      FROM admin_notifications
      WHERE read = 0
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(limit).all();

        return new Response(JSON.stringify({
            notifications: notifications.results || [],
            unread_count: notifications.results?.length || 0
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to get notifications',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}

// PATCH /admin/notifications/:id/read - Marquer comme lu
async function handleAdminMarkNotificationRead(request, env, notificationId) {
    try {
        await env.DB.prepare(`
      UPDATE admin_notifications
      SET read = 1
      WHERE id = ?
    `).bind(notificationId).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Mark notification read error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to mark notification as read',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}

// Helper pour créer une notification
async function createNotification(env, adminId, type, title, message, link = null) {
    try {
        await env.DB.prepare(`
      INSERT INTO admin_notifications (admin_id, type, title, message, link)
      VALUES (?, ?, ?, ?, ?)
    `).bind(adminId, type, title, message, link).run();

        console.log(`[NOTIFICATION] Created: ${type} for admin ${adminId || 'all'}`);
    } catch (e) {
        console.error('Failed to create notification:', e);
    }
}

// ============================================
// ROUTES À AJOUTER
// ============================================

/*
// Admin notifications
if (url.pathname === '/admin/notifications' && request.method === 'GET') {
  return handleAdminNotifications(request, env);
}

if (url.pathname.match(/^\/admin\/notifications\/([^\/]+)\/read$/) && request.method === 'PATCH') {
  const notificationId = url.pathname.split('/')[3];
  return handleAdminMarkNotificationRead(request, env, notificationId);
}
*/

// ============================================
// EXEMPLES D'UTILISATION
// ============================================

/*
// Créer notification pour nouvel utilisateur
await createNotification(env, null, 'new_user', 'Nouvel utilisateur', `${email} vient de s'inscrire`, '/admin-users.html');

// Créer notification pour ticket urgent
await createNotification(env, null, 'urgent_ticket', 'Ticket urgent', `Nouveau ticket priorité haute #${ticketId}`, '/admin-support.html');

// Créer notification système
await createNotification(env, null, 'system_error', 'Erreur système', 'Échec de synchronisation avec Stripe', null);
*/
