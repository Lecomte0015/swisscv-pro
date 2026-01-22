// ============================================
// CREDIT SYSTEM - FRONTEND JAVASCRIPT
// ============================================

const API_BASE = 'https://swisscv-pro.dallyhermann-71e.workers.dev';

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

            console.log(`✅ Credits consumed: ${data.credits_consumed}`);
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
        <div class="credits-modal-icon">💳</div>
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
            🚀 Améliorer mon abonnement
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
 * Initialize credit system on page load
 */
function initCreditSystem() {
    // Load balance
    loadCreditBalance();

    // Create modal if not exists
    if (!document.getElementById('insufficientCreditsModal')) {
        createInsufficientCreditsModal();
    }

    // Refresh balance every 30 seconds
    setInterval(loadCreditBalance, 30000);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCreditSystem);
} else {
    initCreditSystem();
}
