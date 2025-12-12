#!/usr/bin/env python3
"""
Script pour copier la nouvelle navbar de dashboard.html vers toutes les autres pages
"""

import re
import os

# Lire la navbar de dashboard.html
with open('dashboard.html', 'r', encoding='utf-8') as f:
    dashboard_content = f.read()

# Extraire la section navbar complète (CSS + HTML + JS)
# Pattern: depuis "/* Menus déroulants */" jusqu'à la fin du script navbar
navbar_start = dashboard_content.find('/* Menus déroulants */')
navbar_end = dashboard_content.find('</script>', navbar_start) + len('</script>')

if navbar_start == -1 or navbar_end == -1:
    print("❌ Impossible de trouver la navbar dans dashboard.html")
    exit(1)

new_navbar_section = dashboard_content[navbar_start:navbar_end]

print(f"✅ Navbar extraite ({len(new_navbar_section)} caractères)")
print()

# Fichiers à mettre à jour
files_to_update = [
    ('app.html', 'Analyser CV'),
    ('job-search.html', 'Offres'),
    ('cover-letter.html', 'Lettre'),
    ('job-tracker.html', 'Tracker'),
    ('favorites.html', 'Favoris'),
    ('profile.html', 'Profil'),
    ('support.html', 'Support'),
    ('cv-templates.html', 'Templates'),
]

updated_count = 0

for filename, active_page in files_to_update:
    if not os.path.exists(filename):
        print(f"⚠️  {filename} - Fichier non trouvé")
        continue
    
    print(f"🔄 Mise à jour: {filename}")
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Trouver l'ancienne navbar (de <nav class="navbar"> à </script> suivant)
    nav_start_match = re.search(r'<nav class="navbar">', content)
    if not nav_start_match:
        print(f"   ❌ Navbar non trouvée")
        continue
    
    # Trouver le </script> qui suit la navbar
    nav_start_pos = nav_start_match.start()
    script_end_match = re.search(r'</script>', content[nav_start_pos:])
    if not script_end_match:
        print(f"   ❌ Fin de navbar non trouvée")
        continue
    
    nav_end_pos = nav_start_pos + script_end_match.end()
    
    # Extraire juste la partie HTML + JS (sans le CSS qui est déjà avant)
    new_navbar_html_start = new_navbar_section.find('<nav class="navbar">')
    new_navbar_html = new_navbar_section[new_navbar_html_start:]
    
    # Ajuster le lien actif selon la page
    new_navbar_html_adjusted = new_navbar_html.replace('class="navbar-link active"', 'class="navbar-link"')
    
    if 'dashboard' in filename:
        new_navbar_html_adjusted = new_navbar_html_adjusted.replace('href="dashboard.html" class="navbar-link"', 'href="dashboard.html" class="navbar-link active"')
    elif 'app' in filename:
        new_navbar_html_adjusted = new_navbar_html_adjusted.replace('href="app.html"', 'href="app.html" class="navbar-link active" style="display:none;"')
        # Analyser CV est dans le dropdown, on met le dropdown actif
    elif 'job-search' in filename:
        new_navbar_html_adjusted = new_navbar_html_adjusted.replace('href="job-search.html" class="navbar-link"', 'href="job-search.html" class="navbar-link active"')
    elif 'profile' in filename:
        new_navbar_html_adjusted = new_navbar_html_adjusted.replace('href="profile.html" class="navbar-link"', 'href="profile.html" class="navbar-link active"')
    elif 'support' in filename:
        new_navbar_html_adjusted = new_navbar_html_adjusted.replace('href="support.html" class="navbar-link"', 'href="support.html" class="navbar-link active"')
    
    # Remplacer l'ancienne navbar
    new_content = content[:nav_start_pos] + new_navbar_html_adjusted + content[nav_end_pos:]
    
    # Vérifier si le CSS des dropdowns existe déjà
    if '/* Menus déroulants */' not in new_content:
        # Trouver où insérer le CSS (juste avant </style>)
        style_end = new_content.rfind('</style>')
        if style_end != -1:
            # Extraire juste le CSS
            css_section = new_navbar_section[:new_navbar_section.find('<nav class="navbar">')]
            new_content = new_content[:style_end] + '\n' + css_section + new_content[style_end:]
            print(f"   ✅ CSS ajouté")
    
    # Sauvegarder
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"   ✅ Navbar mise à jour")
    updated_count += 1

print()
print(f"✨ Terminé ! {updated_count}/{len(files_to_update)} fichiers mis à jour")
