# Utilisation de SendGrid dans SwissCV Pro

## 🎯 La fonction sendEmail est maintenant disponible!

### Exemple 1: Email de Bienvenue (dans handleSignup)

```javascript
// Dans la fonction handleSignup, après la création de l'utilisateur:
await sendEmail(
  env,
  email,
  'Bienvenue sur SwissCV Pro! 🎉',
  `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">Bienvenue sur SwissCV Pro!</h1>
      <p>Bonjour,</p>
      <p>Merci de vous être inscrit sur SwissCV Pro. Vous avez maintenant accès à:</p>
      <ul>
        <li>✅ 2 analyses CV gratuites</li>
        <li>✅ Recherche d'emplois en Suisse</li>
        <li>✅ Suivi de candidatures</li>
      </ul>
      <p>Commencez dès maintenant en analysant votre CV!</p>
      <a href="https://swisscv-pro.dallyhermann-71e.workers.dev/app" 
         style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
        Analyser mon CV
      </a>
    </div>
  `
);
```

### Exemple 2: Notification Nouvelle Offre

```javascript
// Quand une nouvelle offre correspond au profil:
await sendEmail(
  env,
  user.email,
  'Nouvelle offre d\'emploi correspondant à votre profil',
  `
    <h2>${jobTitle}</h2>
    <p><strong>Entreprise:</strong> ${company}</p>
    <p><strong>Localisation:</strong> ${location}</p>
    <p>${description}</p>
    <a href="${jobUrl}">Voir l'offre</a>
  `
);
```

### Exemple 3: Alerte Limite Gratuite Atteinte

```javascript
// Dans handleAnalyzeCVText, quand la limite est atteinte:
if (count >= limit) {
  await sendEmail(
    env,
    user.email,
    'Limite gratuite atteinte - Passez à Premium',
    `
      <h2>Vous avez utilisé vos 2 analyses gratuites</h2>
      <p>Passez à Premium pour continuer à analyser vos CVs!</p>
      <a href="https://swisscv-pro.dallyhermann-71e.workers.dev/pricing">Voir les offres</a>
    `
  );
}
```

## 🔑 Configuration Requise

La clé API SendGrid est déjà configurée dans Cloudflare:
- Variable: `SENDGRID_API_KEY`
- Email expéditeur vérifié: `dallyhermann6@gmail.com`

## ✅ Prêt à l'emploi!

La fonction est maintenant déployée et prête à être utilisée dans n'importe quel handler du worker.
