#!/usr/bin/env python3
"""
Script robuste pour réparer TOUS les try/catch dans worker-full-to-fix.js
"""

def fix_all_try_catch_robust():
    with open('worker-full-to-fix.js', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Stack pour tracker les try/catch
    try_stack = []
    fixed_lines = []
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Détecter un try
        if 'try {' in line or stripped.startswith('try {'):
            try_stack.append({
                'line_num': i,
                'indent': len(line) - len(line.lstrip()),
                'has_catch': False
            })
            fixed_lines.append(line)
        
        # Détecter un catch
        elif ('} catch' in line or stripped.startswith('catch')) and try_stack:
            try_stack[-1]['has_catch'] = True
            fixed_lines.append(line)
        
        # Détecter la fin d'un bloc (fermeture de fonction)
        elif stripped == '}' and try_stack:
            # Vérifier si c'est la fin d'un try sans catch
            current_try = try_stack[-1]
            if not current_try['has_catch']:
                # Ajouter un catch avant la fermeture
                indent = ' ' * current_try['indent']
                fixed_lines.append(f"{indent}}} catch (error) {{\n")
                fixed_lines.append(f"{indent}  console.error('Auto-fixed error:', error);\n")
                fixed_lines.append(f"{indent}  return jsonResponse({{ success: false, error: error.message }}, 500);\n")
                try_stack.pop()
            fixed_lines.append(line)
        
        else:
            fixed_lines.append(line)
    
    # Sauvegarder
    with open('worker-auto-repaired.js', 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
    
    print(f"✅ Fichier réparé automatiquement")
    print(f"📝 Sauvegardé dans worker-auto-repaired.js")
    print(f"📊 {len(fixed_lines)} lignes")
    print(f"🔧 {len([t for t in try_stack if not t['has_catch']])} erreurs try/catch réparées")

if __name__ == '__main__':
    fix_all_try_catch_robust()
