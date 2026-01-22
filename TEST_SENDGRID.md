# 🧪 Comment Tester SendGrid (Sans Toucher au Code de Production)

## Option 1: Test en Local avec Wrangler Dev ⭐ RECOMMANDÉ

### Étape 1: Lancer le serveur de test
```bash
cd /Users/dallyhermann/Desktop/swisscv-deploy
npx wrangler dev test-email.js
```

### Étape 2: Envoyer un email de test
Dans un autre terminal:
```bash
# Envoyer à votre email
curl "http://localhost:8787/test-email?to=dallyhermann6@gmail.com"

# Ou avec un autre email
curl "http://localhost:8787/test-email?to=votre@email.com"
```

### Étape 3: Vérifier
- Regardez la réponse dans le terminal
- Vérifiez votre boîte email (et spam!)
- Si succès, vous recevrez un email avec "✅ SendGrid fonctionne!"

---

## Option 2: Vérifier dans SendGrid Dashboard

### 1. Connectez-vous à SendGrid
https://app.sendgrid.com/

### 2. Allez dans "Activity"
- Menu: **Activity** > **Email Activity**
- Vous verrez tous les emails envoyés (même les tests)

### 3. Vérifiez le statut
- ✅ **Delivered**: Email envoyé avec succès
- ⏳ **Processed**: En cours d'envoi
- ❌ **Bounced/Dropped**: Problème d'envoi

---

## Option 3: Test via l'API SendGrid directement

### Avec curl (sans passer par le worker):
```bash
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header 'Authorization: Bearer VOTRE_CLE_API' \
  --header 'Content-Type: application/json' \
  --data '{
    "personalizations": [{"to": [{"email": "dallyhermann6@gmail.com"}]}],
    "from": {"email": "dallyhermann6@gmail.com", "name": "Test"},
    "subject": "Test SendGrid Direct",
    "content": [{"type": "text/plain", "value": "Test réussi!"}]
  }'
```

---

## Option 4: Créer un Endpoint de Test Temporaire (Production)

Si vous voulez tester en production sans toucher aux autres fonctionnalités:

### 1. Ajoutez cet endpoint dans index.js (temporairement):
```javascript
// Dans la fonction fetch(), avant le return final:
if (url.pathname === '/test-sendgrid' && request.method === 'GET') {
  const testEmail = url.searchParams.get('email') || 'dallyhermann6@gmail.com';
  const result = await sendEmail(
    env,
    testEmail,
    '🧪 Test SendGrid',
    '<h1>✅ Ça marche!</h1><p>SendGrid est opérationnel.</p>'
  );
  return jsonResponse(result);
}
```

### 2. Déployez:
```bash
npx wrangler deploy
```

### 3. Testez:
```bash
curl "https://swisscv-pro.dallyhermann-71e.workers.dev/test-sendgrid?email=votre@email.com"
```

### 4. Supprimez l'endpoint après le test

---

## 🎯 Recommandation

**Utilisez l'Option 1** (test en local) - c'est le plus simple et le plus sûr:

1. Lancez `npx wrangler dev test-email.js`
2. Testez avec `curl "http://localhost:8787/test-email?to=votre@email.com"`
3. Vérifiez votre email

Aucun risque pour la production! 🚀
