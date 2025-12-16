// ============================================
// PREMIUM UTILITIES
// ============================================

// Vérifier si l'utilisateur est premium
function getUserTier() {
    const user = JSON.parse(localStorage.getItem('swisscv_user') || '{}');
    return user.tier || 'free';
}

function isPremium() {
    return getUserTier() === 'premium';
}

// Afficher le modal premium
function showPremiumModal(feature) {
    // Créer le modal s'il n'existe pas
    let modal = document.getElementById('premiumModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'premiumModal';
        modal.className = 'modal premium-modal';
        modal.innerHTML = `
      <div class="modal-content premium-content">
        <button class="close-btn" onclick="closePremiumModal()">×</button>
        
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 64px; margin-bottom: 16px;">✨</div>
          <h2 style="font-size: 28px; margin-bottom: 12px;">Fonctionnalité Premium</h2>
          <p style="color: #666; font-size: 16px;">Cette fonctionnalité est réservée aux utilisateurs Premium</p>
        </div>
        
        <div class="premium-features">
          <h3 style="margin-bottom: 20px; font-size: 20px;">Avec Premium, débloquez :</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 12px 0; border-bottom: 1px solid #eee; display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 12px;">✅</span>
              <span>Génération illimitée de lettres de motivation</span>
            </li>
            <li style="padding: 12px 0; border-bottom: 1px solid #eee; display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 12px;">✅</span>
              <span>Analyse CV complète avec conseils marché suisse</span>
            </li>
            <li style="padding: 12px 0; border-bottom: 1px solid #eee; display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 12px;">✅</span>
              <span>Export PDF professionnel</span>
            </li>
            <li style="padding: 12px 0; border-bottom: 1px solid #eee; display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 12px;">✅</span>
              <span>Job Tracker illimité</span>
            </li>
            <li style="padding: 12px 0; display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 12px;">✅</span>
              <span>Support prioritaire</span>
            </li>
          </ul>
        </div>
        
        <div style="margin-top: 32px; text-align: center;">
          <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 24px; border-radius: 12px; margin-bottom: 20px;">
            <div style="font-size: 32px; font-weight: 700; color: #000; margin-bottom: 8px;">9.90 CHF/mois</div>
            <div style="color: #333; font-size: 14px;">Annulez à tout moment</div>
          </div>
          
          <button class="btn btn-premium" onclick="upgradeToPremium()" style="width: 100%; padding: 18px; font-size: 18px; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; margin-bottom: 12px;">
            🚀 Passer à Premium
          </button>
          <button class="btn btn-secondary" onclick="closePremiumModal()" style="width: 100%; padding: 14px;">
            Fermer
          </button>
        </div>
      </div>
    `;
        document.body.appendChild(modal);
    }

    // Afficher le modal
    modal.classList.add('show');

    // Tracker l'événement (optionnel)
    console.log('Premium modal shown for feature:', feature);
}

function closePremiumModal() {
    const modal = document.getElementById('premiumModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function upgradeToPremium() {
    // Pour l'instant, rediriger vers une page de paiement (à implémenter)
    alert('Redirection vers la page de paiement...\n\nCette fonctionnalité sera bientôt disponible !');
    // window.location.href = 'premium.html';
}

// CSS pour le modal premium
const premiumStyles = `
<style>
.premium-modal .modal-content {
  max-width: 600px;
}

.premium-content {
  padding: 40px;
}

.premium-features {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
  margin: 24px 0;
}

.btn-premium {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000;
  font-weight: 700;
  transition: transform 0.2s;
}

.btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 165, 0, 0.4);
}

.premium-overlay {
  position: relative;
  min-height: 200px;
  margin: 24px 0;
}

.premium-blur {
  filter: blur(8px);
  opacity: 0.3;
  pointer-events: none;
  user-select: none;
}

.premium-unlock {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  z-index: 10;
}

.premium-badge {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  margin-left: 6px;
  vertical-align: middle;
}
</style>
`;

// Injecter les styles
if (!document.getElementById('premium-styles')) {
    const styleEl = document.createElement('div');
    styleEl.id = 'premium-styles';
    styleEl.innerHTML = premiumStyles;
    document.head.appendChild(styleEl);
}
