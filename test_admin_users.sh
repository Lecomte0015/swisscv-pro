#!/bin/bash
# Test de l'endpoint /admin/users pour voir les données réelles

# Remplacez YOUR_ADMIN_TOKEN par votre vrai token admin
ADMIN_TOKEN="YOUR_ADMIN_TOKEN"

curl -X GET "https://swisscv-pro.dallyhermann-71e.workers.dev/admin/users?page=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.users[] | {email, tier, subscription_tier}'
