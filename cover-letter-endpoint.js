// Cover Letter Generation Endpoint
// Add this to worker.js after line 1050 (after Analysis History route)

// Route (add in fetch handler around line 1050):
if (url.pathname === '/generate-cover-letter' && request.method === 'POST') {
    return handleGenerateCoverLetter(request, env);
}

// Function (add at end of file before export):
async function handleGenerateCoverLetter(request, env) {
    const auth = await authenticateRequest(request, env);
    if (!auth) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const body = await request.json();
        const { jobTitle, company, jobDescription, candidateName, experience } = body;

        if (!jobTitle || !company || !candidateName) {
            return jsonResponse({
                success: false,
                error: 'Missing required fields: jobTitle, company, candidateName'
            }, 400);
        }

        const config = getConfig(env);

        // Construire le prompt pour Claude
        const prompt = `Tu es un expert en rédaction de lettres de motivation pour le marché suisse.

Génère une lettre de motivation professionnelle en français pour:
- Poste: ${jobTitle}
- Entreprise: ${company}
${jobDescription ? `- Description du poste: ${jobDescription}` : ''}
- Candidat: ${candidateName}
${experience ? `- Expérience: ${experience}` : ''}

La lettre doit:
1. Être adaptée au marché du travail suisse (ton professionnel, format formel)
2. Faire maximum 1 page (environ 300-400 mots)
3. Inclure: en-tête avec coordonnées, introduction, 2-3 paragraphes de motivation, conclusion
4. Mettre en avant les compétences pertinentes pour le poste
5. Montrer l'intérêt pour l'entreprise et le poste
6. Être personnalisée et authentique

Format de sortie: texte brut, prêt à être copié-collé.`;

        // Appeler Claude AI
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!anthropicResponse.ok) {
            const errorText = await anthropicResponse.text();
            console.error('Anthropic API error:', errorText);
            throw new Error('Failed to generate cover letter');
        }

        const anthropicData = await anthropicResponse.json();
        const letter = anthropicData.content[0].text;

        return jsonResponse({
            success: true,
            letter: letter
        });

    } catch (error) {
        console.error('Error generating cover letter:', error);
        return jsonResponse({
            success: false,
            error: 'Failed to generate cover letter'
        }, 500);
    }
}
