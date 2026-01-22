// ============================================
// SUPPORT CLIENT - Fonctions Admin
// À ajouter dans worker.js après handleAdminMetrics (ligne ~5160)
// ============================================

// GET /admin/support/tickets - Liste des tickets avec filtres
async function handleAdminGetTickets(request, env) {
    try {
        const url = new URL(request.url);
        const status = url.searchParams.get('status') || '';
        const priority = url.searchParams.get('priority') || '';
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = 50;

        let query = `
      SELECT t.*, u.email as user_email 
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
        const params = [];

        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }

        if (priority) {
            query += ' AND t.priority = ?';
            params.push(priority);
        }

        query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, (page - 1) * limit);

        const tickets = await env.DB.prepare(query).bind(...params).all();

        // Count total
        let countQuery = 'SELECT COUNT(*) as total FROM support_tickets WHERE 1=1';
        const countParams = [];
        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }
        if (priority) {
            countQuery += ' AND priority = ?';
            countParams.push(priority);
        }

        const countResult = await env.DB.prepare(countQuery).bind(...countParams).first();
        const total = countResult?.total || 0;

        return new Response(JSON.stringify({
            tickets: tickets.results || [],
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('Get tickets error:', error);
        return new Response(JSON.stringify({ error: 'Failed to get tickets', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}

// GET /admin/support/stats - Statistiques support
async function handleAdminGetSupportStats(request, env) {
    try {
        const stats = await env.DB.prepare(`
      SELECT 
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tickets,
        COUNT(CASE WHEN status = 'resolved' AND created_at >= unixepoch('now', '-30 days') THEN 1 END) as resolved_this_month,
        AVG(CASE WHEN status = 'resolved' THEN updated_at - created_at END) / 3600.0 as avg_response_time_hours
      FROM support_tickets
    `).first();

        return new Response(JSON.stringify(stats || {
            open_tickets: 0,
            in_progress_tickets: 0,
            resolved_this_month: 0,
            avg_response_time_hours: 0
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('Get support stats error:', error);
        return new Response(JSON.stringify({ error: 'Failed to get stats', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}

// PATCH /admin/support/tickets/:id - Modifier un ticket
async function handleAdminUpdateTicket(request, env, ticketId) {
    try {
        const body = await request.json();
        const { status, priority, assigned_to } = body;

        const updates = [];
        const params = [];

        if (status) {
            updates.push('status = ?');
            params.push(status);
        }
        if (priority) {
            updates.push('priority = ?');
            params.push(priority);
        }
        if (assigned_to !== undefined) {
            updates.push('assigned_to = ?');
            params.push(assigned_to);
        }

        if (updates.length === 0) {
            return new Response(JSON.stringify({ error: 'No fields to update' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        updates.push('updated_at = unixepoch()');
        params.push(ticketId);

        await env.DB.prepare(
            `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?`
        ).bind(...params).run();

        return new Response(JSON.stringify({ success: true, message: 'Ticket updated successfully' }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('Update ticket error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update ticket', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}

// ============================================
// ROUTES À AJOUTER dans la section admin (ligne ~5515)
// ============================================

/*
// Support tickets
if (url.pathname === '/admin/support/tickets' && request.method === 'GET') {
  return handleAdminGetTickets(request, env);
}

if (url.pathname === '/admin/support/stats' && request.method === 'GET') {
  return handleAdminGetSupportStats(request, env);
}

if (url.pathname.match(/^\/admin\/support\/tickets\/(\d+)$/) && request.method === 'PATCH') {
  const ticketId = url.pathname.split('/')[4];
  return handleAdminUpdateTicket(request, env, ticketId);
}
*/
