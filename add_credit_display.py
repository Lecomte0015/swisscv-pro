#!/usr/bin/env python3
"""
Script to add credit display to all HTML pages
Adds the credit balance display to the navbar and includes necessary CSS/JS
"""

import os
import re

def add_credit_display_to_page(filepath):
    """Add credit display to a single HTML page"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already added
    if 'credits-display' in content or 'credits.css' in content:
        print(f"⏭️  {os.path.basename(filepath)} - Already has credit display")
        return False
    
    # Add CSS link in <head>
    css_link = '<link rel="stylesheet" href="public/css/credits.css">'
    
    # Find </head> and insert before it
    if '</head>' in content:
        content = content.replace('</head>', f'    {css_link}\n</head>')
    
    # Add JS script before </body>
    js_script = '<script src="public/js/credits.js"></script>'
    
    if '</body>' in content:
        content = content.replace('</body>', f'    {js_script}\n</body>')
    
    # Add credit display to navbar
    # Find the user menu or navbar-menu div
    credit_display_html = '''
            <!-- Credit Balance Display -->
            <div class="credits-display" onclick="window.location.href='settings.html'" title="Voir mes crédits">
                <span class="credits-icon">💳</span>
                <span class="credits-balance" id="creditsBalance">--</span>
                <span class="credits-limit">/ <span id="creditsLimit">--</span></span>
            </div>
'''
    
    # Try to find navbar-menu and insert before user avatar
    navbar_pattern = r'(<div class="user-avatar-btn")'
    if re.search(navbar_pattern, content):
        content = re.sub(navbar_pattern, credit_display_html + r'\1', content, count=1)
    else:
        # Alternative: find navbar-menu closing and insert before
        navbar_pattern2 = r'(</div>\s*</nav>)'
        if re.search(navbar_pattern2, content):
            content = re.sub(navbar_pattern2, credit_display_html + r'\1', content, count=1)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ {os.path.basename(filepath)} - Credit display added")
    return True

def main():
    print("🔧 Adding credit display to all HTML pages...\n")
    
    # List of pages to update
    pages = [
        'app.html',
        'dashboard.html',
        'job-search.html',
        'interview-prep.html',
        'profile.html',
        'cover-letter.html',
        'favorites.html',
        'support.html',
        'team.html',
        'job-tracker.html',
        'cv-templates.html',
        'settings.html'
    ]
    
    updated = 0
    skipped = 0
    
    for page in pages:
        if os.path.exists(page):
            if add_credit_display_to_page(page):
                updated += 1
            else:
                skipped += 1
        else:
            print(f"⚠️  {page} - File not found")
    
    print(f"\n{'='*50}")
    print(f"✅ Updated: {updated} pages")
    print(f"⏭️  Skipped: {skipped} pages")
    print(f"{'='*50}")

if __name__ == '__main__':
    main()
