// Email Templates for Job Alerts and Feature Announcements
// SwissCV Pro - 2026

export const JOB_ALERT_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #D50000 0%, #B80000 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .header p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .job-card {
            background: #FAFAFA;
            border-left: 4px solid #D50000;
            padding: 20px;
            margin: 15px 0;
            border-radius: 6px;
        }
        .job-title {
            font-size: 18px;
            font-weight: 600;
            color: #D50000;
            margin: 0 0 10px 0;
        }
        .job-meta {
            font-size: 14px;
            color: #666;
            margin: 5px 0;
        }
        .job-company {
            font-weight: 600;
            color: #333;
        }
        .job-salary {
            color: #059669;
            font-weight: 600;
            margin-top: 10px;
        }
        .cta-button {
            display: inline-block;
            background: #D50000;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 0;
            font-weight: 600;
        }
        .cta-button:hover {
            background: #B80000;
        }
        .tips {
            background: #F0F9FF;
            border-left: 4px solid #0284C7;
            padding: 20px;
            margin: 20px 0;
            border-radius: 6px;
        }
        .tips h3 {
            margin: 0 0 10px 0;
            color: #0284C7;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #999;
            font-size: 13px;
            border-top: 1px solid #E6E6E6;
        }
        .footer a {
            color: #D50000;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Nouvelles offres d'emploi !</h1>
            <p>{{JOB_COUNT}} nouvelles offres correspondent à "{{SEARCH_NAME}}"</p>
        </div>
        
        <div class="content">
            <p>Bonjour {{USER_NAME}},</p>
            
            <p>Nous avons trouvé <strong>{{JOB_COUNT}} nouvelles offres</strong> qui correspondent à votre recherche sauvegardée <strong>"{{SEARCH_NAME}}"</strong> :</p>
            
            {{JOBS_HTML}}
            
            <center style="margin-top: 30px;">
                <a href="https://swisscv-pro.ch/app/job-search.html?search={{SEARCH_ID}}" class="cta-button">
                    🔍 Voir toutes les offres ({{TOTAL_COUNT}})
                </a>
            </center>
            
            <div class="tips">
                <h3>💡 Conseil SwissCV Pro</h3>
                <p>Pour maximiser vos chances :</p>
                <ul style="margin: 10px 0;">
                    <li>Analysez votre CV avec notre outil pour chaque offre</li>
                    <li>Adaptez vos mots-clés selon le score ATS</li>
                    <li>Générez une lettre de motivation personnalisée</li>
                </ul>
            </div>
            
            <p style="font-size: 13px; color: #999; margin-top: 30px;">
                Vous recevez cet email car vous avez activé les alertes pour la recherche "{{SEARCH_NAME}}". 
                <a href="https://swisscv-pro.ch/app/profile.html#notifications" style="color: #D50000;">Gérer mes préférences</a>
            </p>
        </div>
        
        <div class="footer">
            <p><strong>SwissCV Pro</strong> — Votre assistant carrière pour le marché suisse</p>
            <p>
                <a href="https://swisscv-pro.ch">swisscv-pro.ch</a> • 
                <a href="mailto:contact@swisscv-pro.ch">contact@swisscv-pro.ch</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

export const FEATURE_ANNOUNCEMENT_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px;
        }
        .feature-box {
            background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
            padding: 30px;
            border-radius: 8px;
            margin: 20px 0;
            border: 2px solid #0284C7;
        }
        .feature-box h2 {
            margin: 0 0 15px 0;
            color: #0284C7;
            font-size: 22px;
        }
        .feature-box p {
            font-size: 16px;
            margin: 0;
            color: #333;
        }
        .cta-button {
            display: inline-block;
            background: #7C3AED;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
            font-size: 16px;
        }
        .cta-button:hover {
            background: #5B21B6;
        }
        .steps {
            background: #FAFAFA;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .steps h3 {
            margin: 0 0 15px 0;
            color: #333;
        }
        .steps ol {
            margin: 0;
            padding-left: 20px;
        }
        .steps li {
            margin: 8px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #999;
            font-size: 13px;
            border-top: 1px solid #E6E6E6;
        }
        .footer a {
            color: #7C3AED;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Nouvelle fonctionnalité !</h1>
        </div>
        
        <div class="content">
            <p>Bonjour {{USER_NAME}},</p>
            
            <p>Nous sommes ravis de vous annoncer une nouvelle fonctionnalité sur SwissCV Pro !</p>
            
            <div class="feature-box">
                <h2>{{FEATURE_TITLE}}</h2>
                <p>{{FEATURE_DESCRIPTION}}</p>
            </div>
            
            <div class="steps">
                <h3>✨ Comment ça marche ?</h3>
                {{FEATURE_STEPS}}
            </div>
            
            <center>
                <a href="{{FEATURE_URL}}" class="cta-button">
                    🚀 Essayer maintenant
                </a>
            </center>
            
            <p style="margin-top: 30px;">Comme toujours, n'hésitez pas à nous faire part de vos retours !</p>
            
            <p>Cordialement,<br>
            <strong>L'équipe SwissCV Pro</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>SwissCV Pro</strong></p>
            <p>
                <a href="https://swisscv-pro.ch">swisscv-pro.ch</a> • 
                <a href="mailto:contact@swisscv-pro.ch">contact@swisscv-pro.ch</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

// Helper function to generate job cards HTML
export function generateJobCardsHTML(jobs) {
    return jobs.map(job => `
        <div class="job-card">
            <h2 class="job-title">${escapeHtml(job.title)}</h2>
            <p class="job-meta">
                <span class="job-company">📍 ${escapeHtml(job.company)}</span> • 
                ${escapeHtml(job.location)}
            </p>
            <p style="margin: 10px 0; color: #666;">
                ${escapeHtml(job.description.substring(0, 150))}...
            </p>
            ${job.salary ? `<p class="job-salary">💰 ${job.salary}</p>` : ''}
            <a href="${job.url}" class="cta-button">Voir l'offre</a>
        </div>
    `).join('');
}

// Helper function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
