// ============================================================
// 🔒 SwissCV Pro - FREE PLAN LIMITATION LOGIC
// ============================================================
// Gère la limitation de 2 analyses à vie pour les utilisateurs gratuits
// Utilise Cloudflare KV pour le stockage persistant

/**
 * Génère un ID utilisateur unique basé sur le navigateur
 * Utilise plusieurs fingerprints pour éviter les contournements faciles
 */
function generateUserId() {
  const fingerprints = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    navigator.deviceMemory || 0
  ];
  
  // Simple hash function
  const hash = fingerprints.join('|').split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  return `user_${Math.abs(hash)}`;
}

/**
 * Récupère le nombre d'analyses restantes pour l'utilisateur
 */
async function getRemainingAnalyses(apiEndpoint) {
  try {
    const userId = generateUserId();
    
    const response = await fetch(`${apiEndpoint}/check-limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to check limit');
    }
    
    const data = await response.json();
    return {
      remaining: data.remaining,
      total: data.total,
      isPremium: data.isPremium
    };
  } catch (error) {
    console.error('Error checking limit:', error);
    return { remaining: 0, total: 2, isPremium: false };
  }
}

/**
 * Incrémente le compteur d'analyses
 */
async function incrementAnalysisCount(apiEndpoint) {
  try {
    const userId = generateUserId();
    
    const response = await fetch(`${apiEndpoint}/increment-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to increment count');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error incrementing count:', error);
    throw error;
  }
}

/**
 * Vérifie si l'utilisateur peut effectuer une analyse
 */
async function canAnalyze(apiEndpoint) {
  // Vérifier d'abord si l'utilisateur est Premium
  const isPremium = localStorage.getItem('swisscv_premium') === 'true';
  
  if (isPremium) {
    return { allowed: true, reason: 'premium' };
  }
  
  // Sinon, vérifier la limite Free
  const { remaining } = await getRemainingAnalyses(apiEndpoint);
  
  if (remaining > 0) {
    return { allowed: true, reason: 'free', remaining };
  }
  
  return { allowed: false, reason: 'limit_reached' };
}

/**
 * Affiche le compteur d'analyses restantes dans l'UI
 */
function displayRemainingCount(remaining, containerId = 'remainingAnalyses') {
  const container = document.getElementById(containerId);
  
  if (!container) return;
  
  if (remaining === 0) {
    container.innerHTML = `
      <div style="background: #FEE; border: 2px solid #F00; padding: 16px; border-radius: 4px; margin: 20px 0;">
        <h4 style="color: #D00; margin-bottom: 8px;">❌ Limite atteinte</h4>
        <p style="color: #666; font-size: 14px;">
          Vous avez utilisé vos 2 analyses gratuites.<br>
          Passez à Premium pour des analyses illimitées !
        </p>
        <button onclick="window.location.href='pricing.html'" 
                style="background: #D50000; color: white; border: none; padding: 12px 32px; 
                       border-radius: 4px; margin-top: 12px; cursor: pointer; font-weight: 600;">
          🚀 Passer à Premium
        </button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div style="background: #FFF8DC; border: 1px solid #FFD700; padding: 12px; 
                  border-radius: 4px; margin: 20px 0; text-align: center;">
        <span style="font-size: 14px; color: #666;">
          ✅ <strong>${remaining}</strong> analyse${remaining > 1 ? 's' : ''} gratuite${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}
        </span>
      </div>
    `;
  }
}

/**
 * Affiche le modal de limitation
 */
function showLimitReachedModal() {
  const existingModal = document.getElementById('limitModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'limitModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  modal.innerHTML = `
    <div style="background: white; padding: 48px; border-radius: 8px; max-width: 500px; 
                text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
      <div style="font-size: 64px; margin-bottom: 24px;">🔒</div>
      <h2 style="font-size: 28px; font-weight: 700; margin-bottom: 16px; color: #0D0D0D;">
        Limite atteinte
      </h2>
      <p style="font-size: 16px; color: #666; margin-bottom: 32px; line-height: 1.6;">
        Vous avez utilisé vos <strong>2 analyses gratuites</strong> à vie.<br><br>
        Passez à <strong>SwissCV Pro Premium</strong> pour profiter de :
      </p>
      <ul style="text-align: left; margin: 24px 0; color: #333; font-size: 15px; 
                 list-style: none; padding: 0;">
        <li style="padding: 8px 0;">✅ <strong>Analyses illimitées</strong></li>
        <li style="padding: 8px 0;">✅ Export PDF professionnel</li>
        <li style="padding: 8px 0;">✅ ATS Score + Keywords</li>
        <li style="padding: 8px 0;">✅ Génération lettres de motivation</li>
        <li style="padding: 8px 0;">✅ Templates CV suisses</li>
        <li style="padding: 8px 0;">✅ Support prioritaire</li>
      </ul>
      <button onclick="window.location.href='pricing.html'" 
              style="background: linear-gradient(135deg, #D50000 0%, #B80000 100%); 
                     color: white; border: none; padding: 18px 48px; border-radius: 4px; 
                     font-size: 16px; font-weight: 700; cursor: pointer; width: 100%;
                     box-shadow: 0 4px 20px rgba(213,0,0,0.4); transition: all 0.2s;">
        🚀 Passer à Premium (9 CHF)
      </button>
      <button onclick="document.getElementById('limitModal').remove()" 
              style="background: transparent; border: none; color: #999; margin-top: 16px; 
                     cursor: pointer; font-size: 14px; text-decoration: underline;">
        Fermer
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// ============================================================
// EXPORTS
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateUserId,
    getRemainingAnalyses,
    incrementAnalysisCount,
    canAnalyze,
    displayRemainingCount,
    showLimitReachedModal
  };
}
