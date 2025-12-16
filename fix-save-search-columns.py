#!/usr/bin/env python3
"""
Corriger handleSaveSearch pour utiliser les bonnes colonnes de la table
"""

print("🔧 Correction de handleSaveSearch...")

# Lire worker.js
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Ancienne fonction (lignes 953-975)
old_function = """async function handleSaveSearch(request, env) {
  const auth = await authenticateRequest(request, env);
  if (!auth) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const body = await request.json();
    const { query, filters } = body;
    const searchId = crypto.randomUUID();

    await env.DB.prepare(`
      INSERT INTO saved_searches (id, user_id, query, filters, created_at)
      VALUES (?, ?, ?, ?, unixepoch())
    `).bind(searchId, auth.userId, query, JSON.stringify(filters || {})).run();

    return jsonResponse({ success: true, searchId });
  } catch (error) {
    console.error('Error saving search:', error);
    return jsonResponse({ success: false, error: 'Failed to save search' }, 500);
  }
}"""

# Nouvelle fonction avec les bonnes colonnes
new_function = """async function handleSaveSearch(request, env) {
  const auth = await authenticateRequest(request, env);
  if (!auth) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const body = await request.json();
    const { name, keywords, location, filters } = body;
    
    if (!name) {
      return jsonResponse({ success: false, error: 'name is required' }, 400);
    }
    
    const searchId = crypto.randomUUID();

    await env.DB.prepare(`
      INSERT INTO saved_searches (id, user_id, name, keywords, location, filters, created_at)
      VALUES (?, ?, ?, ?, ?, ?, unixepoch())
    `).bind(
      searchId, 
      auth.userId, 
      name, 
      keywords || '', 
      location || '', 
      JSON.stringify(filters || {})
    ).run();

    return jsonResponse({ success: true, searchId });
  } catch (error) {
    console.error('Error saving search:', error);
    return jsonResponse({ success: false, error: 'Failed to save search' }, 500);
  }
}"""

# Remplacer
if old_function in content:
    content = content.replace(old_function, new_function)
    print("✅ Fonction handleSaveSearch corrigée")
else:
    print("⚠️  Fonction non trouvée exactement, essai avec regex...")
    import re
    # Chercher et remplacer avec regex
    pattern = r'async function handleSaveSearch\(request, env\) \{[^}]*\{[^}]*\}[^}]*\}'
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, new_function, content, count=1, flags=re.DOTALL)
        print("✅ Fonction handleSaveSearch corrigée (regex)")
    else:
        print("❌ Impossible de trouver la fonction")

# Écrire
with open('/Users/dallyhermann/Desktop/swisscv-deploy/worker.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ Correction terminée!")
