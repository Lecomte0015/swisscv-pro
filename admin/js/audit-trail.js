// ============================================
// AUDIT TRAIL - Logging des Actions Admin
// À ajouter dans worker.js
// ============================================

// Fonction helper pour logger les actions
async function logAdminAction(env, adminId, action, targetType = null, targetId = null, details = {}, ipAddress = null) {
    try {
        await env.DB.prepare(`
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
            adminId,
            action,
            targetType,
            targetId,
            JSON.stringify(details),
            ipAddress
        ).run();

        console.log(`[AUDIT] ${action} by admin ${adminId}`);
    } catch (e) {
        console.error('Failed to log admin action:', e);
        // Ne pas bloquer l'action si le log échoue
    }
}

// GET /admin/logs - Liste des logs avec filtres
async function handleAdminLogs(request, env) {
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const adminId = url.searchParams.get('admin_id') || '';
        const action = url.searchParams.get('action') || '';
        const dateFrom = url.searchParams.get('date_from') || '';
        const dateTo = url.searchParams.get('date_to') || '';
        const limit = 50;
        const offset = (page - 1) * limit;

        // Construire query avec filtres
        let query = `
      SELECT 
        l.id,
        l.admin_id,
        l.action,
        l.target_type,
        l.target_id,
        l.details,
        l.ip_address,
        l.created_at,
        a.email as admin_email
      FROM admin_logs l
      LEFT JOIN admins a ON l.admin_id = a.id
      WHERE 1=1
    `;

        const params = [];

        if (adminId) {
            query += ` AND l.admin_id = ?`;
            params.push(adminId);
        }

        if (action) {
            query += ` AND l.action LIKE ?`;
            params.push(`%${action}%`);
        }

        if (dateFrom) {
            query += ` AND l.created_at >= ?`;
            params.push(new Date(dateFrom).getTime() / 1000);
        }

        if (dateTo) {
            query += ` AND l.created_at <= ?`;
            params.push(new Date(dateTo).getTime() / 1000);
        }

        query += ` ORDER BY l.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const logs = await env.DB.prepare(query).bind(...params).all();

        // Count total
        let countQuery = `SELECT COUNT(*) as total FROM admin_logs l WHERE 1=1`;
        const countParams = [];

        if (adminId) {
            countQuery += ` AND l.admin_id = ?`;
            countParams.push(adminId);
        }
        if (action) {
            countQuery += ` AND l.action LIKE ?`;
            countParams.push(`%${action}%`);
        }
        if (dateFrom) {
            countQuery += ` AND l.created_at >= ?`;
            countParams.push(new Date(dateFrom).getTime() / 1000);
        }
        if (dateTo) {
            countQuery += ` AND l.created_at <= ?`;
            countParams.push(new Date(dateTo).getTime() / 1000);
        }

        const { total } = await env.DB.prepare(countQuery).bind(...countParams).first();

        return new Response(JSON.stringify({
            logs: logs.results || [],
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Get admin logs error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to get logs',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}

// ============================================
// ROUTE À AJOUTER
// ============================================

/*
// Admin logs
if (url.pathname === '/admin/logs' && request.method === 'GET') {
  return handleAdminLogs(request, env);
}
*/

// ============================================
// EXEMPLES D'UTILISATION
// ============================================

/*
// Dans handleAdminLogin (après login réussi)
await logAdminAction(env, admin.id, 'admin.login', null, null, { success: true }, request.headers.get('CF-Connecting-IP'));

// Dans handleAdminUpdateUser (après modification)
await logAdminAction(env, adminId, 'user.update', 'user', userId, { 
  field: 'subscription_tier', 
  old: oldTier, 
  new: newTier 
}, request.headers.get('CF-Connecting-IP'));

// Dans handleAdminDeleteUser (après suppression)
await logAdminAction(env, adminId, 'user.delete', 'user', userId, { 
  email: user.email 
}, request.headers.get('CF-Connecting-IP'));

// Dans handleAdminUpdateTicket (après modification ticket)
await logAdminAction(env, adminId, 'ticket.update', 'ticket', ticketId, { 
  field: 'status', 
  old: oldStatus, 
  new: newStatus 
}, request.headers.get('CF-Connecting-IP'));
*/
