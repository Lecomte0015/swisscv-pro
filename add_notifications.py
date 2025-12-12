#!/usr/bin/env python3
"""
Script pour ajouter le système de notifications sur toutes les pages HTML
"""

import os
import re

# Pages à modifier (pages authentifiées)
PAGES = [
    'app.html',
    'cover-letter.html',
    'job-search.html',
    'job-tracker.html',
    'job-tracker-new.html',
    'profile.html',
    'support.html',
    'team.html',
    'team-dashboard.html',
    'pricing.html',
    'onboarding.html'
]

SCRIPT_TAG = '    <!-- Système de Notifications -->\n    <script src="notifications.js"></script>\n'

def add_notification_script(filepath):
    """Ajouter le script de notifications avant </body>"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Vérifier si le script est déjà présent
        if 'notifications.js' in content:
            print(f"✓ {filepath} - Déjà présent")
            return False
        
        # Ajouter avant </body>
        if '</body>' in content:
            content = content.replace('</body>', f'{SCRIPT_TAG}</body>')
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✓ {filepath} - Ajouté")
            return True
        else:
            print(f"✗ {filepath} - Pas de balise </body>")
            return False
            
    except Exception as e:
        print(f"✗ {filepath} - Erreur: {e}")
        return False

def main():
    base_dir = '/Users/dallyhermann/Desktop/swisscv-deploy'
    modified_count = 0
    
    print("🔔 Déploiement du système de notifications...\n")
    
    for page in PAGES:
        filepath = os.path.join(base_dir, page)
        if os.path.exists(filepath):
            if add_notification_script(filepath):
                modified_count += 1
        else:
            print(f"✗ {page} - Fichier non trouvé")
    
    print(f"\n✅ Terminé ! {modified_count} pages modifiées")

if __name__ == '__main__':
    main()
