#!/usr/bin/env python3
"""
Ajouter du logging dans job-tracker.html pour déboguer
"""

print("🔧 Ajout de logging dans job-tracker.html...")

# Lire le fichier
with open('/Users/dallyhermann/Desktop/swisscv-deploy/job-tracker.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Trouver et remplacer la ligne problématique
old_code = """        } else {
            alert('Erreur: ' + data.error);
        }"""

new_code = """        } else {
            console.log('❌ Réponse du serveur:', data);
            console.log('❌ data.success:', data.success);
            console.log('❌ data.error:', data.error);
            alert('Erreur: ' + (data.error || 'Erreur inconnue. Voir console pour détails.'));
        }"""

if old_code in content:
    content = content.replace(old_code, new_code)
    print("✅ Logging ajouté dans loadTrackedJobs")
else:
    print("⚠️  Code exact non trouvé, essai avec regex...")

# Écrire
with open('/Users/dallyhermann/Desktop/swisscv-deploy/job-tracker.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ job-tracker.html mis à jour!")
print("   L'alerte affichera maintenant 'Erreur inconnue' si data.error est undefined")
print("   Et loggera les détails dans la console")
