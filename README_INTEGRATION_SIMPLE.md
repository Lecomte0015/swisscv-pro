# 🎯 INTÉGRATION SIMPLIFIÉE - SwissCV Pro Phase 3

## ✅ Option Recommandée : Intégrer dans ton worker.js existant

Tu as déjà un worker.js qui fonctionne. Voici **EXACTEMENT** ce qu'il faut ajouter :

---

## 📝 ÉTAPE 1 : Modifier l'en-tête du fetch()

Dans ton `export default { async fetch(request, env, ctx) {`

**AVANT :**
```javascript
'Access-Control-Allow-Headers': 'Content-Type',
```

**APRÈS (ajouter X-API-Key) :**
```javascript
'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
```

---

## 📝 ÉTAPE 2 : Ajouter les nouvelles routes

Dans la section `// ==================== ROUTES ====================`

**AJOUTER APRÈS tes routes existantes** (ligne ~49) :

```javascript
// ==================== FREE PLAN LIMITS ====================

// Vérifier limite
if (path === '/check-limit' && request.method === 'POST') {
  return handleCheckLimit(request, corsHeaders, env);
}

// Incrémenter compteur
if (path === '/increment-analysis' && request.method === 'POST') {
  return handleIncrementAnalysis(request, corsHeaders, env);
}

// ==================== TEAM MANAGEMENT ====================

// Créer équipe
if (path === '/team/create' && request.method === 'POST') {
  return handleTeamCreate(request, corsHeaders, env);
}

// Inviter membre
if (path === '/team/invite' && request.method === 'POST') {
  return handleTeamInvite(request, corsHeaders, env);
}

// Accepter invitation
if (path === '/team/accept-invite' && request.method === 'POST') {
  return handleAcceptInvite(request, corsHeaders, env);
}

// Info équipe
if (path === '/team/info' && request.method === 'GET') {
  return handleTeamInfo(url, corsHeaders, env);
}

// Retirer membre
if (path === '/team/remove-member' && request.method === 'POST') {
  return handleRemoveMember(request, corsHeaders, env);
}

// ==================== BULK ANALYSIS ====================

// Analyse en masse
if (path === '/bulk-analyze' && request.method === 'POST') {
  return handleBulkAnalyze(request, corsHeaders, env);
}

// Télécharger résultats
if (path.startsWith('/bulk-download/') && request.method === 'GET') {
  const jobId = path.split('/bulk-download/')[1];
  return handleBulkDownload(jobId, corsHeaders, env);
}

// Statut job
if (path.startsWith('/bulk-status/') && request.method === 'GET') {
  const jobId = path.split('/bulk-status/')[1];
  return handleBulkStatus(jobId, corsHeaders, env);
}

// ==================== API KEYS ====================

// Générer clé API
if (path === '/api/generate-key' && request.method === 'POST') {
  return handleGenerateAPIKey(request, corsHeaders, env);
}

// Lister clés
if (path === '/api/list-keys' && request.method === 'GET') {
  return handleListAPIKeys(url, corsHeaders, env);
}

// Révoquer clé
if (path === '/api/revoke-key' && request.method === 'POST') {
  return handleRevokeAPIKey(request, corsHeaders, env);
}

// Analyse via API
if (path === '/api/v1/analyze' && request.method === 'POST') {
  return handleAPIAnalyze(request, corsHeaders, env);
}

// ==================== BRANDING ====================

// Upload logo
if (path === '/branding/upload-logo' && request.method === 'POST') {
  return handleUploadLogo(request, corsHeaders, env);
}

// Get logo
if (path === '/branding/get-logo' && request.method === 'GET') {
  return handleGetLogo(url, corsHeaders, env);
}

// Configure branding
if (path === '/branding/configure' && request.method === 'POST') {
  return handleConfigureBranding(request, corsHeaders, env);
}

// Get settings
if (path === '/branding/settings' && request.method === 'GET') {
  return handleGetBrandingSettings(url, corsHeaders, env);
}

// Delete branding
if (path === '/branding/delete' && request.method === 'POST') {
  return handleDeleteBranding(request, corsHeaders, env);
}
```

---

## 📝 ÉTAPE 3 : Modifier handleCVAnalysis

Dans ta fonction `handleCVAnalysis`, **AJOUTER AU DÉBUT** (après avoir récupéré cvText) :

```javascript
async function handleCVAnalysis(request, corsHeaders, env) {
  try {
    const { cvText, hasPhoto, userId } = await request.json(); // ✅ AJOUTER userId

    if (!cvText) {
      return new Response(JSON.stringify({ error: 'CV text required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ✅ NOUVEAU CODE À AJOUTER ICI
    // Vérifier la limite FREE (si userId fourni et pas Premium)
    if (userId && env.SWISSCV_KV) {
      const isPremium = await checkIfUserIsPremium(userId, env);
      
      if (!isPremium) {
        const limitCheck = await checkAndIncrementAnalysis(userId, env);
        
        if (!limitCheck.allowed) {
          return new Response(JSON.stringify({ 
            error: 'upgrade_required',
            message: 'Vous avez atteint la limite de 2 analyses gratuites',
            used: limitCheck.used,
            remaining: limitCheck.remaining,
            upgradeUrl: 'https://swisscv-pro.ch/pricing.html'
          }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }
    // ✅ FIN DU NOUVEAU CODE

    // Continuer avec le reste du code existant...
    const photoInstruction = hasPhoto ? ...
```

---

## 📝 ÉTAPE 4 : Ajouter toutes les nouvelles fonctions

À la **FIN** de ton worker.js (après toutes les fonctions existantes), **COPIER-COLLER** toutes les fonctions de **worker_COMPLET.js** à partir de la ligne qui commence par :

```javascript
// ============================================================
// 🔒 FREE LIMIT MANAGEMENT
// ============================================================
```

**JUSQU'À** la fin du fichier.

C'est environ **1500 lignes de code** à copier, mais c'est juste un copier-coller !

---

## 📝 ÉTAPE 5 : Modifier handlePremiumVerification

Dans ta fonction `handlePremiumVerification` existante, **REMPLACER** par la nouvelle version qui utilise KV :

```javascript
async function handlePremiumVerification(url, corsHeaders) {
  // Remplacer par handleVerifyCheckout du worker_COMPLET.js
}
```

Voir la fonction `handleVerifyCheckout` dans **worker_COMPLET.js** (ligne ~580)

---

## 📝 ÉTAPE 6 : Modifier handleStripeWebhook

Dans ta fonction `handleStripeWebhook` existante, **REMPLACER** par :

```javascript
async function handleStripeWebhook(request, corsHeaders, env) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);
    
    console.log('Webhook received:', event.type);
    
    switch (event.type) {
      case 'checkout.session.completed':
        return await handleCheckoutCompleted(event.data.object, env, corsHeaders);
        
      case 'customer.subscription.deleted':
        return await handleSubscriptionDeleted(event.data.object, env, corsHeaders);
        
      default:
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
    
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ 
      error: 'Webhook processing failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
```

Puis ajouter les fonctions `handleCheckoutCompleted` et `handleSubscriptionDeleted` du **worker_COMPLET.js**

---

## 🎯 Résumé des modifications

| Étape | Action | Lignes à modifier |
|-------|--------|-------------------|
| 1 | CORS headers | 1 ligne |
| 2 | Ajouter routes | ~100 lignes |
| 3 | Modifier handleCVAnalysis | ~20 lignes |
| 4 | Copier nouvelles fonctions | ~1500 lignes |
| 5 | Remplacer handlePremiumVerification | Fonction complète |
| 6 | Remplacer handleStripeWebhook | Fonction complète |

**Total : Environ 1620 lignes à ajouter/modifier**

---

## ✅ Checklist finale

- [ ] CORS headers modifiés (X-API-Key ajouté)
- [ ] Toutes les nouvelles routes ajoutées
- [ ] handleCVAnalysis modifié (limitation Free)
- [ ] Toutes les nouvelles fonctions copiées
- [ ] handleVerifyCheckout remplacé
- [ ] handleStripeWebhook remplacé
- [ ] Testé avec `wrangler dev` en local
- [ ] Déployé avec `wrangler deploy`

---

## 🚨 IMPORTANT

**Ne modifie PAS** tes fonctions existantes :
- `handleCoverLetterGeneration` ✅ Garder tel quel
- `handleATSAnalysis` ✅ Garder tel quel
- `getATSPrompt` ✅ Garder tel quel
- `getIndustryName` ✅ Garder tel quel

Ces fonctions sont déjà parfaites !

---

## 🎁 Alternative : Utiliser worker_COMPLET.js

Si tu préfères TOUT remplacer d'un coup :

1. **Sauvegarder** ton worker.js actuel
2. **Copier** le fichier `worker_COMPLET.js`
3. **Vérifier** que tes clés API sont bonnes (lignes 5-6)
4. **Déployer** : `wrangler deploy`

**worker_COMPLET.js contient TOUT** :
- Toutes les routes Phase 3 ✅
- Limitation Free ✅
- Stripe webhooks ✅
- Team management ✅
- Bulk analysis ✅
- API keys ✅
- Branding ✅
- Cover Letter ✅ (de ton worker existant)
- ATS Analysis ✅ (de ton worker existant)

**Taille finale : ~2200 lignes**

---

## 🤔 Quelle option choisir ?

**Option A : Intégrer dans l'existant** (recommandé si tu as des modifications personnelles)
- ✅ Tu gardes tes modifications
- ✅ Tu comprends ce que tu ajoutes
- ❌ Plus de travail (30 minutes)

**Option B : Remplacer par worker_COMPLET.js** (recommandé si worker.js standard)
- ✅ Rapide (2 minutes)
- ✅ Tout est intégré
- ❌ Tu perds tes modifications personnelles

---

## 📞 Support

Si besoin d'aide :
1. Vérifie les erreurs dans `wrangler tail`
2. Consulte worker_COMPLET.js pour voir les fonctions complètes
3. Teste chaque endpoint avec curl

**Bon développement ! 🚀**
