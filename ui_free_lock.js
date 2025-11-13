// ============================================================
// 🔐 SwissCV Pro - UI FREE LOCK SYSTEM
// ============================================================
// Gère l'affichage des sections bloquées pour les utilisateurs gratuits

/**
 * Vérifie si l'utilisateur est Premium
 */
function isPremiumUser() {
  return localStorage.getItem('swisscv_premium') === 'true';
}

/**
 * Applique le blur et le lock sur une section
 */
function lockSection(sectionId, featureName = 'cette fonctionnalité') {
  const section = document.getElementById(sectionId);
  
  if (!section) {
    console.warn(`Section ${sectionId} not found`);
    return;
  }
  
  // Wrapper pour le blur + overlay
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: relative;
    pointer-events: none;
  `;
  
  // Appliquer le blur
  section.style.filter = 'blur(8px)';
  section.style.userSelect = 'none';
  section.style.opacity = '0.4';
  
  // Overlay avec lock
  const overlay = document.createElement('div');
  overlay.className = 'premium-lock-overlay';
  overlay.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 32px;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    text-align: center;
    z-index: 100;
    pointer-events: all;
    max-width: 400px;
    width: 90%;
  `;
  
  overlay.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
    <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #0D0D0D;">
      Fonctionnalité Premium
    </h3>
    <p style="font-size: 15px; color: #666; margin-bottom: 24px; line-height: 1.5;">
      ${featureName} est réservée aux abonnés <strong>Premium</strong>.
    </p>
    <button onclick="window.location.href='pricing.html'" 
            style="background: linear-gradient(135deg, #D50000 0%, #B80000 100%); 
                   color: white; border: none; padding: 14px 32px; border-radius: 4px; 
                   font-size: 15px; font-weight: 600; cursor: pointer; width: 100%;
                   box-shadow: 0 4px 16px rgba(213,0,0,0.3); transition: all 0.2s;">
      🚀 Passer à Premium
    </button>
    <div style="margin-top: 16px; font-size: 13px; color: #999;">
      9 CHF • Analyses illimitées • Toutes les fonctionnalités
    </div>
  `;
  
  // Wrapper parent
  const parent = section.parentNode;
  parent.insertBefore(wrapper, section);
  wrapper.appendChild(section);
  wrapper.appendChild(overlay);
}

/**
 * Masque complètement une section pour les utilisateurs gratuits
 */
function hideSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = 'none';
  }
}

/**
 * Remplace un bouton par une version "locked"
 */
function lockButton(buttonId, featureName = 'Cette fonctionnalité') {
  const button = document.getElementById(buttonId);
  
  if (!button) {
    console.warn(`Button ${buttonId} not found`);
    return;
  }
  
  // Désactiver le bouton
  button.disabled = true;
  button.style.opacity = '0.5';
  button.style.cursor = 'not-allowed';
  
  // Remplacer le texte
  const originalText = button.innerHTML;
  button.innerHTML = `🔒 ${originalText}`;
  
  // Supprimer les anciens event listeners en clonant
  const newButton = button.cloneNode(true);
  button.parentNode.replaceChild(newButton, button);
  
  // Ajouter nouveau event listener
  newButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showUpgradeModal(featureName);
  });
}

/**
 * Affiche un modal d'upgrade
 */
function showUpgradeModal(featureName = 'cette fonctionnalité') {
  const existingModal = document.getElementById('upgradeModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'upgradeModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease-out;
  `;
  
  modal.innerHTML = `
    <div style="background: white; padding: 48px; border-radius: 8px; max-width: 550px; 
                text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                animation: slideUp 0.3s ease-out;">
      <div style="font-size: 72px; margin-bottom: 24px;">✨</div>
      <h2 style="font-size: 32px; font-weight: 800; margin-bottom: 16px; color: #0D0D0D;">
        Débloquez ${featureName}
      </h2>
      <p style="font-size: 16px; color: #666; margin-bottom: 32px; line-height: 1.6;">
        Cette fonctionnalité fait partie de <strong>SwissCV Pro Premium</strong>.<br>
        Passez à Premium et profitez de :
      </p>
      <div style="background: #FAFAFA; padding: 24px; border-radius: 6px; margin-bottom: 32px;">
        <ul style="text-align: left; color: #333; font-size: 15px; 
                   list-style: none; padding: 0;">
          <li style="padding: 10px 0; display: flex; align-items: center; gap: 12px;">
            <span style="color: #D50000; font-size: 20px;">✓</span>
            <strong>Analyses CV illimitées</strong>
          </li>
          <li style="padding: 10px 0; display: flex; align-items: center; gap: 12px;">
            <span style="color: #D50000; font-size: 20px;">✓</span>
            Export PDF professionnel
          </li>
          <li style="padding: 10px 0; display: flex; align-items: center; gap: 12px;">
            <span style="color: #D50000; font-size: 20px;">✓</span>
            ATS Score + Keywords détaillés
          </li>
          <li style="padding: 10px 0; display: flex; align-items: center; gap: 12px;">
            <span style="color: #D50000; font-size: 20px;">✓</span>
            Génération lettres de motivation
          </li>
          <li style="padding: 10px 0; display: flex; align-items: center; gap: 12px;">
            <span style="color: #D50000; font-size: 20px;">✓</span>
            3 templates CV suisses exclusifs
          </li>
          <li style="padding: 10px 0; display: flex; align-items: center; gap: 12px;">
            <span style="color: #D50000; font-size: 20px;">✓</span>
            Support prioritaire par email
          </li>
        </ul>
      </div>
      <button onclick="window.location.href='pricing.html'" 
              style="background: linear-gradient(135deg, #D50000 0%, #B80000 100%); 
                     color: white; border: none; padding: 20px 48px; border-radius: 6px; 
                     font-size: 17px; font-weight: 700; cursor: pointer; width: 100%;
                     box-shadow: 0 6px 24px rgba(213,0,0,0.4); transition: all 0.2s;
                     margin-bottom: 12px;">
        🚀 Activer Premium — 9 CHF
      </button>
      <div style="font-size: 13px; color: #999; margin-bottom: 20px;">
        Sans engagement • Paiement sécurisé • Accès instantané
      </div>
      <button onclick="document.getElementById('upgradeModal').remove()" 
              style="background: transparent; border: none; color: #999; 
                     cursor: pointer; font-size: 14px; text-decoration: underline;">
        Fermer
      </button>
    </div>
  `;
  
  // Animations CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(modal);
  
  // Fermer en cliquant sur le backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

/**
 * Applique le mode Free sur l'ensemble de l'interface après analyse
 */
function applyFreeModeRestrictions() {
  if (isPremiumUser()) {
    return; // Ne rien faire si l'utilisateur est Premium
  }
  
  // Afficher SEULEMENT score et points forts
  // Bloquer tout le reste
  
  // Sections à bloquer
  const sectionsToLock = [
    { id: 'improvements', name: 'Les améliorations recommandées' },
    { id: 'swissAdvice', name: 'Les conseils marché Suisse' },
    { id: 'atsSection', name: 'L\'analyse ATS et les keywords' },
    { id: 'atsScore', name: 'Le score ATS' }
  ];
  
  sectionsToLock.forEach(({ id, name }) => {
    lockSection(id, name);
  });
  
  // Boutons à bloquer
  const buttonsToLock = [
    { id: 'exportPdfBtn', name: 'L\'export PDF' },
    { id: 'openCoverLetterBtn', name: 'La génération de lettre de motivation' }
  ];
  
  buttonsToLock.forEach(({ id, name }) => {
    lockButton(id, name);
  });
}

/**
 * Ajoute un badge "Premium" sur les fonctionnalités
 */
function addPremiumBadges() {
  if (isPremiumUser()) return;
  
  const premiumElements = document.querySelectorAll('[data-premium="true"]');
  
  premiumElements.forEach(element => {
    const badge = document.createElement('span');
    badge.className = 'premium-badge';
    badge.textContent = '✨ Premium';
    badge.style.cssText = `
      display: inline-block;
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      color: #0D0D0D;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 12px;
      margin-left: 8px;
      vertical-align: middle;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    `;
    
    element.appendChild(badge);
  });
}

// ============================================================
// EXPORTS
// ============================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isPremiumUser,
    lockSection,
    hideSection,
    lockButton,
    showUpgradeModal,
    applyFreeModeRestrictions,
    addPremiumBadges
  };
}
