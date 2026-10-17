// ============================================
// CREDIT SYSTEM - FRONTEND JAVASCRIPT
// ============================================

// API_BASE is already defined globally, no need to redeclare

// Credit costs (must match backend)
const CREDIT_COSTS = {
    'cv_analysis': 1,
    'cover_letter': 2,
    'interview_prep': 1,
    'job_search': 0
};

/**
 * Load and display credit balance in navbar
 */
async function loadCreditBalance() {
    try {
        const response = await authenticatedFetch('/credits/balance');

        if (!response.ok) {
            console.error('Failed to load credit balance');
            return;
        }

        const data = await response.json();

        if (data.success) {
            updateCreditDisplay(data.balance, data.monthly_limit);

            // Lien « Équipe » : abonnés Pro et membres d'une équipe
            updateTeamLinkVisibility(!!data.team);
        }
    } catch (error) {
        console.error('Error loading credit balance:', error);
    }
}

/**
 * Update credit display in navbar
 */
function updateCreditDisplay(balance, limit) {
    const balanceEl = document.getElementById('creditsBalance');
    const limitEl = document.getElementById('creditsLimit');
    const displayEl = document.querySelector('.credits-display');

    if (balanceEl) balanceEl.textContent = balance;
    if (limitEl) limitEl.textContent = limit;

    // Add visual feedback based on balance
    if (displayEl) {
        displayEl.classList.remove('credits-low', 'credits-empty');

        if (balance === 0) {
            displayEl.classList.add('credits-empty');
        } else if (balance <= limit * 0.2) { // 20% or less
            displayEl.classList.add('credits-low');
        }
    }
}

/**
 * Validate credits before action
 */
async function validateCredits(actionType) {
    try {
        const response = await authenticatedFetch('/credits/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action_type: actionType })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error('Validation failed');
        }

        return data;
    } catch (error) {
        console.error('Error validating credits:', error);
        return { has_enough_credits: false, current_balance: 0, required_credits: 0 };
    }
}

/**
 * Consume credits after successful action
 */
async function consumeCredits(actionType, metadata = {}) {
    try {
        const response = await authenticatedFetch('/credits/consume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action_type: actionType,
                metadata: metadata
            })
        });

        const data = await response.json();

        if (data.success) {
            // Update display with new balance
            if (data.new_balance !== undefined) {
                const user = getUser();
                const limit = user?.credits_monthly_limit || 100;
                updateCreditDisplay(data.new_balance, limit);
            }

            console.log(` Credits consumed: ${data.credits_consumed}`);
        }

        return data;
    } catch (error) {
        console.error('Error consuming credits:', error);
        return { success: false };
    }
}

/**
 * Show insufficient credits modal
 */
function showInsufficientCreditsModal(required, current, actionName = 'cette action') {
    const modal = document.getElementById('insufficientCreditsModal');

    if (!modal) {
        // Create modal if it doesn't exist
        createInsufficientCreditsModal();
        return showInsufficientCreditsModal(required, current, actionName);
    }

    // Update modal content
    document.getElementById('modalActionName').textContent = actionName;
    document.getElementById('modalRequiredCredits').textContent = required;
    document.getElementById('modalCurrentCredits').textContent = current;
    document.getElementById('modalMissingCredits').textContent = required - current;

    // Show modal
    modal.classList.add('show');
}

/**
 * Close insufficient credits modal
 */
function closeInsufficientCreditsModal() {
    const modal = document.getElementById('insufficientCreditsModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Create insufficient credits modal
 */
function createInsufficientCreditsModal() {
    const modalHTML = `
    <div id="insufficientCreditsModal" class="credits-modal">
      <div class="credits-modal-content">
        <div class="credits-modal-icon"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
        <h2>Crédits insuffisants</h2>
        <p>Vous n'avez pas assez de crédits pour <strong id="modalActionName">cette action</strong>.</p>
        
        <div class="credit-info">
          <div class="credit-info-row">
            <span>Crédits requis :</span>
            <strong id="modalRequiredCredits">--</strong>
          </div>
          <div class="credit-info-row">
            <span>Votre solde actuel :</span>
            <strong id="modalCurrentCredits">--</strong>
          </div>
          <div class="credit-info-row">
            <span>Crédits manquants :</span>
            <strong id="modalMissingCredits">--</strong>
          </div>
        </div>

        <p style="margin-top: 20px;">
          Passez à <strong>Premium</strong> (100 crédits/mois) ou <strong>Pro</strong> (200 crédits/mois) pour continuer.
        </p>

        <div class="modal-actions">
          <button class="btn-upgrade" onclick="window.location.href='pricing.html'">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg> Améliorer mon abonnement
          </button>
          <button class="btn-cancel" onclick="closeInsufficientCreditsModal()">
            Annuler
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close on outside click
    const modal = document.getElementById('insufficientCreditsModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeInsufficientCreditsModal();
        }
    });
}

/**
 * Add credit cost badge to button
 */
function addCreditCostBadge(buttonElement, actionType) {
    const cost = CREDIT_COSTS[actionType] || 0;

    if (cost > 0) {
        buttonElement.setAttribute('data-cost', cost);
        buttonElement.classList.add('btn-with-cost');
    }
}

/**
 * Show/hide Team link based on user tier
 */
function updateTeamLinkVisibility(inTeam) {
    const teamLink = document.getElementById('teamNavLink');
    if (!teamLink) return;

    const user = getUser();
    if (inTeam || (user && (user.subscription_tier === 'pro' || user.tier === 'pro'))) {
        teamLink.style.display = 'inline-block';
    } else {
        teamLink.style.display = 'none';
    }
}

/**
 * Initialize credit system on page load
 */
function initCreditSystem() {
    // Load balance
    loadCreditBalance();

    // Create modal if not exists
    if (!document.getElementById('insufficientCreditsModal')) {
        createInsufficientCreditsModal();
    }

    // Add click event listener to credit display for navigation
    const displayEl = document.querySelector('.credits-display');
    if (displayEl) {
        displayEl.addEventListener('click', () => {
            window.location.href = 'credits.html';
        });
        // Add cursor pointer to indicate it's clickable
        displayEl.style.cursor = 'pointer';
    }

    // Update Team link visibility based on user tier
    updateTeamLinkVisibility();

    // Refresh balance every 30 seconds
    setInterval(loadCreditBalance, 30000);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCreditSystem);
} else {
    initCreditSystem();
}
