#!/usr/bin/env python3
"""
Corriger handleGetApplicationStats pour retourner le bon format
"""
import re

print("🔧 Correction de handleGetApplicationStats...")

# Lire worker.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Trouver la fonction handleGetApplicationStats
pattern = r'async function handleGetApplicationStats\([^)]*\)[^{]*\{[^}]*\}'
match = re.search(pattern, content, re.DOTALL)

if not match:
    # Essayer avec plus de contenu
    pattern = r'(async function handleGetApplicationStats\([^)]*\)[^{]*\{(?:[^{}]|\{[^{}]*\})*\})'
    match = re.search(pattern, content, re.DOTALL)

if match:
    print(f"✅ Fonction trouvée à la position {match.start()}")
    
    # Nouvelle implémentation
    new_function = """async function handleGetApplicationStats(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }
    
    try {
        const apps = await env.DB.prepare(`
            SELECT status, COUNT(*) as count 
            FROM job_applications 
            WHERE user_id = ?
            GROUP BY status
        `).bind(auth.userId).all();
        
        // Format pour le frontend
        const by_status = {};
        apps.results.forEach(row => {
            by_status[row.status] = row.count;
        });
        
        // Générer weekly_trend (derniers 7 jours)
        const weekly_trend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            weekly_trend.push({ date: dateStr, count: 0 });
        }
        
        return jsonResponse({ 
            success: true, 
            stats: {
                by_status: by_status,
                weekly_trend: weekly_trend
            }
        });
    } catch (error) {
        console.error('❌ Error getting stats:', error);
        return jsonResponse({ 
            success: false, 
            error: 'Failed to get stats',
            details: error.message 
        }, 500);
    }
}"""
    
    # Remplacer
    content = content[:match.start()] + new_function + content[match.end():]
    print("✅ Fonction remplacée")
    
    # Écrire
    with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✅ worker.js corrigé!")
    print("   - Retourne maintenant stats.by_status et stats.weekly_trend")
    print("\n🚀 Déployez avec 'npx wrangler deploy'")
else:
    print("❌ Fonction handleGetApplicationStats non trouvée")
