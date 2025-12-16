/**
 * Admin Permissions Middleware
 * Système de permissions granulaires basé sur les rôles
 */

// Vérifier si un rôle a une permission spécifique
function hasPermission(rolePermissions, requiredPermission) {
    try {
        const permissions = JSON.parse(rolePermissions);

        // Super admin a toutes les permissions
        if (permissions.includes('*')) {
            return true;
        }

        // Vérifier permission exacte
        if (permissions.includes(requiredPermission)) {
            return true;
        }

        // Vérifier permission wildcard (ex: users.* pour users.view, users.edit, etc.)
        const [category] = requiredPermission.split('.');
        if (permissions.includes(`${category}.*`)) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error parsing permissions:', error);
        return false;
    }
}

// Middleware pour vérifier les permissions
async function requirePermission(env, adminId, requiredPermission) {
    try {
        // Récupérer le rôle de l'admin
        const admin = await env.DB.prepare(`
            SELECT a.id, a.email, a.role_id, r.name as role_name, r.permissions
            FROM admins a
            LEFT JOIN admin_roles r ON a.role_id = r.id
            WHERE a.id = ?
        `).bind(adminId).first();

        if (!admin) {
            return { authorized: false, error: 'Admin not found' };
        }

        if (!admin.permissions) {
            return { authorized: false, error: 'No role assigned' };
        }

        // Vérifier permission
        const authorized = hasPermission(admin.permissions, requiredPermission);

        return {
            authorized,
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role_name,
                permissions: JSON.parse(admin.permissions)
            }
        };
    } catch (error) {
        console.error('Permission check error:', error);
        return { authorized: false, error: error.message };
    }
}

// GET /admin/roles - Liste des rôles disponibles
async function handleAdminGetRoles(request, env) {
    try {
        const roles = await env.DB.prepare(`
            SELECT id, name, display_name, permissions, description, created_at
            FROM admin_roles
            ORDER BY id ASC
        `).all();

        return new Response(JSON.stringify({
            roles: roles.results.map(role => ({
                ...role,
                permissions: JSON.parse(role.permissions)
            }))
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// PATCH /admin/users/:id/role - Changer le rôle d'un admin
async function handleAdminUpdateUserRole(request, env, userId, adminId) {
    try {
        // Vérifier permission
        const permCheck = await requirePermission(env, adminId, 'settings.manage');
        if (!permCheck.authorized) {
            return new Response(JSON.stringify({ error: 'Permission denied' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const body = await request.json();
        const { role_id } = body;

        if (!role_id) {
            return new Response(JSON.stringify({ error: 'role_id required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Vérifier que le rôle existe
        const role = await env.DB.prepare('SELECT id FROM admin_roles WHERE id = ?')
            .bind(role_id).first();

        if (!role) {
            return new Response(JSON.stringify({ error: 'Role not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Mettre à jour le rôle
        await env.DB.prepare('UPDATE admins SET role_id = ? WHERE id = ?')
            .bind(role_id, userId).run();

        // Logger l'action
        if (typeof logAdminAction === 'function') {
            await logAdminAction(env, adminId, 'admin.update_role', 'admin', userId,
                JSON.stringify({ new_role_id: role_id }),
                request.headers.get('CF-Connecting-IP'));
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Export des fonctions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        hasPermission,
        requirePermission,
        handleAdminGetRoles,
        handleAdminUpdateUserRole
    };
}
