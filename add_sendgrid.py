#!/usr/bin/env python3
# Script pour ajouter la fonction sendEmail au code du worker

# Lire le code fourni par l'utilisateur depuis un fichier temporaire
import sys

# Le code complet du worker sera dans ce fichier
worker_code = """[VOTRE CODE COMPLET ICI]"""

# Fonction sendEmail à ajouter
sendgrid_function = '''
// ==========================================
// SENDGRID EMAIL FUNCTION
// ==========================================
async function sendEmail(env, to, subject, htmlContent) {
  try {
    const config = getConfig(env);
    
    if (!config.SENDGRID_API_KEY) {
      console.error('❌ SendGrid API key not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }]
        }],
        from: { 
          email: 'dallyhermann6@gmail.com',
          name: 'SwissCV Pro'
        },
        subject: subject,
        content: [{
          type: 'text/html',
          value: htmlContent
        }]
      })
    });

    if (response.ok) {
      console.log('✅ Email envoyé à:', to);
      return { success: true };
    } else {
      const error = await response.text();
      console.error('❌ Erreur SendGrid:', error);
      return { success: false, error };
    }
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return { success: false, error: error.message };
  }
}
__name(sendEmail, "sendEmail");
'''

# Trouver où insérer la fonction (après getConfig)
insert_position = worker_code.find('__name(getConfig, "getConfig");')
if insert_position != -1:
    # Trouver la fin de la ligne
    end_of_line = worker_code.find('\n', insert_position)
    # Insérer la fonction sendEmail
    new_code = worker_code[:end_of_line+1] + sendgrid_function + worker_code[end_of_line+1:]
    
    with open('index.js', 'w') as f:
        f.write(new_code)
    
    print("✅ Fonction sendEmail ajoutée au worker")
else:
    print("❌ Position d'insertion non trouvée")
