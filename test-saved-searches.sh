#!/bin/bash
# Test direct de l'endpoint /saved-searches

echo "🧪 Test de l'endpoint /saved-searches..."
echo ""

# Récupérer le token depuis localStorage (simulé - l'utilisateur devra le fournir)
echo "Pour tester, exécutez cette commande dans la console du navigateur:"
echo ""
echo "fetch('https://swisscv-pro.dallyhermann-71e.workers.dev/saved-searches', {"
echo "  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('swisscv_token') }"
echo "}).then(r => r.json()).then(d => console.log('Réponse:', d))"
echo ""
echo "Ou testez avec curl (remplacez YOUR_TOKEN):"
echo ""
echo "curl -H 'Authorization: Bearer YOUR_TOKEN' https://swisscv-pro.dallyhermann-71e.workers.dev/saved-searches"
