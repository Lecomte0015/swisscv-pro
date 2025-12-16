#!/usr/bin/env python3
"""
Script pour corriger l'endpoint dans job-tracker.html
Remplacer /jobs/tracked par /job-tracker/kanban
"""

print("🔧 Correction de l'endpoint job-tracker...")

# Lire le fichier
with open('/Users/dallyhermann/Desktop/swisscv-deploy/job-tracker.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Compter les occurrences
count_before = content.count('/jobs/tracked')
print(f"📊 Trouvé {count_before} occurrence(s) de '/jobs/tracked'")

# Remplacer /jobs/tracked par /job-tracker/kanban
content = content.replace("'/jobs/tracked'", "'/job-tracker/kanban'")

# Vérifier le remplacement
count_after = content.count('/job-tracker/kanban')
print(f"✅ Maintenant {count_after} occurrence(s) de '/job-tracker/kanban'")

# Écrire le fichier corrigé
with open('/Users/dallyhermann/Desktop/swisscv-deploy/job-tracker.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ job-tracker.html corrigé!")
print("   - Endpoint changé: /jobs/tracked → /job-tracker/kanban")
print("\n🔄 Rechargez la page job-tracker pour tester")
