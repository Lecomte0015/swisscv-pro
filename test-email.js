// Test SendGrid - Fichier temporaire pour tester l'envoi d'email
// Usage: npx wrangler dev test-email.js
// Puis: curl http://localhost:8787/test-email?to=VOTRE_EMAIL

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Endpoint de test
        if (url.pathname === '/test-email') {
            const toEmail = url.searchParams.get('to') || 'dallyhermann6@gmail.com';

            try {
                const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        personalizations: [{
                            to: [{ email: toEmail }]
                        }],
                        from: {
                            email: 'dallyhermann@gmail.com',
                            name: 'SwissCV Pro - Test'
                        },
                        subject: '🧪 Test SendGrid - SwissCV Pro',
                        content: [{
                            type: 'text/html',
                            value: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h1 style="color: #4F46E5;">✅ SendGrid fonctionne!</h1>
                  <p>Cet email de test confirme que l'intégration SendGrid est opérationnelle.</p>
                  <p><strong>Heure du test:</strong> ${new Date().toLocaleString('fr-CH')}</p>
                  <p><strong>Destinataire:</strong> ${toEmail}</p>
                  <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px;">
                    Ce message a été envoyé depuis SwissCV Pro pour tester l'intégration SendGrid.
                  </p>
                </div>
              `
                        }]
                    })
                });

                if (response.ok) {
                    return new Response(JSON.stringify({
                        success: true,
                        message: `✅ Email envoyé avec succès à ${toEmail}`,
                        status: response.status,
                        timestamp: new Date().toISOString()
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                } else {
                    const error = await response.text();
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'Erreur SendGrid',
                        details: error,
                        status: response.status
                    }), {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            } catch (error) {
                return new Response(JSON.stringify({
                    success: false,
                    error: error.message
                }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        return new Response('Test SendGrid - Utilisez /test-email?to=votre@email.com');
    }
};
