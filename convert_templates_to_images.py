#!/usr/bin/env python3
"""
Convertit les templates Word (.docx) en images JPG pour preview
Utilise docx2pdf + pdf2image pour la conversion
"""

import os
import subprocess
from pathlib import Path

def convert_docx_to_jpg_mac(docx_path, jpg_path):
    """
    Convertit un fichier Word en JPG sur Mac
    Utilise sips (outil natif macOS)
    """
    try:
        # Étape 1: Convertir DOCX en PDF avec textutil
        pdf_path = docx_path.replace('.docx', '_temp.pdf')
        
        # Utiliser textutil pour convertir en PDF
        subprocess.run([
            'textutil',
            '-convert', 'html',
            docx_path,
            '-output', docx_path.replace('.docx', '_temp.html')
        ], check=True, capture_output=True)
        
        # Alternative: utiliser LibreOffice si disponible
        try:
            subprocess.run([
                '/Applications/LibreOffice.app/Contents/MacOS/soffice',
                '--headless',
                '--convert-to', 'pdf',
                '--outdir', os.path.dirname(docx_path),
                docx_path
            ], check=True, capture_output=True, timeout=10)
            
            pdf_path = docx_path.replace('.docx', '.pdf')
            
            # Convertir PDF en JPG avec sips
            subprocess.run([
                'sips',
                '-s', 'format', 'jpeg',
                '-Z', '800',  # Hauteur max 800px
                pdf_path,
                '--out', jpg_path
            ], check=True, capture_output=True)
            
            # Nettoyer le PDF temporaire
            if os.path.exists(pdf_path):
                os.remove(pdf_path)
                
            return True
            
        except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
            # LibreOffice pas disponible, utiliser méthode alternative
            print(f"⚠️  LibreOffice non disponible pour {os.path.basename(docx_path)}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur conversion {os.path.basename(docx_path)}: {e}")
        return False

def main():
    templates_dir = 'templates'
    
    print("🎨 Conversion des templates Word en images JPG...")
    print("📁 Dossier:", templates_dir)
    print()
    
    # Lister tous les fichiers .docx
    docx_files = list(Path(templates_dir).glob('*.docx'))
    
    if not docx_files:
        print("❌ Aucun fichier .docx trouvé dans", templates_dir)
        return
    
    print(f"📄 {len(docx_files)} templates trouvés")
    print()
    
    success_count = 0
    failed_files = []
    
    for docx_file in sorted(docx_files):
        docx_path = str(docx_file)
        jpg_path = docx_path.replace('.docx', '.jpg')
        
        print(f"🔄 Conversion: {docx_file.name}...", end=' ')
        
        if convert_docx_to_jpg_mac(docx_path, jpg_path):
            if os.path.exists(jpg_path):
                file_size = os.path.getsize(jpg_path) / 1024  # KB
                print(f"✅ ({file_size:.1f} KB)")
                success_count += 1
            else:
                print("❌ Fichier JPG non créé")
                failed_files.append(docx_file.name)
        else:
            print("❌ Échec")
            failed_files.append(docx_file.name)
    
    print()
    print("=" * 50)
    print(f"✨ Conversion terminée: {success_count}/{len(docx_files)} réussies")
    
    if failed_files:
        print()
        print("⚠️  Fichiers échoués:")
        for f in failed_files:
            print(f"   - {f}")
        print()
        print("💡 Solution manuelle:")
        print("   1. Ouvrez chaque template Word")
        print("   2. Fichier → Exporter → JPG")
        print("   3. Enregistrez dans /templates/")

if __name__ == '__main__':
    main()
