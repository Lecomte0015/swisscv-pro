#!/bin/bash
# Script pour créer des screenshots des templates Word
# Utilise AppleScript pour automatiser Microsoft Word

echo "🎨 Création des images preview des templates..."
echo ""

cd templates

for docx in template-*.docx; do
    if [ -f "$docx" ]; then
        jpg="${docx%.docx}.jpg"
        echo "📸 Capture: $docx..."
        
        # Ouvrir le fichier Word et prendre un screenshot
        osascript <<EOF
tell application "Microsoft Word"
    activate
    open POSIX file "$(pwd)/$docx"
    delay 2
    
    tell application "System Events"
        keystroke "1" using {command down}
        delay 1
    end tell
end tell

tell application "System Events"
    do shell script "screencapture -R 100,100,800,1000 '$(pwd)/$jpg'"
end tell

tell application "Microsoft Word"
    close active document saving no
end tell
EOF
        
        if [ -f "$jpg" ]; then
            echo "   ✅ Créé: $jpg"
        else
            echo "   ❌ Échec"
        fi
    fi
done

echo ""
echo "✨ Terminé!"
