// ============================================
// MODAL SYSTEM - SwissCV Pro
// ============================================

/**
 * Affiche une modale moderne personnalisée
 * @param {Object} options - Configuration de la modale
 * @param {string} options.title - Titre de la modale
 * @param {string} options.message - Message à afficher
 * @param {string} options.type - Type: 'confirm', 'alert', 'success', 'error', 'warning'
 * @param {string} options.confirmText - Texte bouton confirmation (défaut: 'OK')
 * @param {string} options.cancelText - Texte bouton annulation (défaut: 'Annuler')
 * @param {boolean} options.danger - Si true, bouton rouge pour actions dangereuses
 * @param {boolean} options.showConfetti - Si true, affiche confettis après confirmation
 * @returns {Promise<boolean>} - true si confirmé, false si annulé
 */
async function showModal(options = {}) {
    const {
        title = 'Confirmation',
        message = '',
        type = 'confirm',
        confirmText = 'OK',
        cancelText = 'Annuler',
        danger = false,
        showConfetti = false
    } = options;

    return new Promise((resolve) => {
        // Créer modal HTML
        const modalHTML = `
            <div id="customModal" class="custom-modal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                animation: fadeIn 0.2s ease;
                padding: 20px;
                box-sizing: border-box;
            " onclick="window.closeModal(false)">
                
                <div class="custom-modal-content" onclick="event.stopPropagation()" style="
                    position: relative;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    overflow: hidden;
                ">
                    <div class="modal-header" style="
                        padding: 32px 24px 24px;
                        text-align: center;
                        border-bottom: 1px solid #E0E0E0;
                    ">
                        <div class="modal-icon" style="
                            font-size: 56px;
                            margin-bottom: 16px;
                            animation: iconBounce 0.5s ease;
                        ">${getIcon(type, danger)}</div>
                        <h3 class="modal-title" style="
                            font-size: 22px;
                            font-weight: 700;
                            margin: 0;
                            color: #1a1a1a;
                        ">${title}</h3>
                    </div>
                    
                    <div class="modal-body" style="
                        padding: 24px;
                        color: #666;
                        line-height: 1.6;
                        font-size: 15px;
                        text-align: center;
                    ">${message}</div>
                    
                    <div class="modal-footer" style="
                        padding: 16px 24px 24px;
                        display: flex;
                        gap: 12px;
                        justify-content: ${type === 'alert' || type === 'success' || type === 'error' ? 'center' : 'flex-end'};
                    ">
                        ${type === 'confirm' ? `
                            <button class="btn-cancel" onclick="window.closeModal(false)" style="
                                padding: 14px 28px;
                                border: 2px solid #E0E0E0;
                                background: white;
                                color: #666;
                                border-radius: 10px;
                                font-weight: 600;
                                font-size: 15px;
                                cursor: pointer;
                                transition: all 0.2s;
                                min-width: 120px;
                            " onmouseover="this.style.background='#f5f5f5'; this.style.borderColor='#ccc';" 
                               onmouseout="this.style.background='white'; this.style.borderColor='#E0E0E0';">
                                ${cancelText}
                            </button>
                        ` : ''}
                        
                        <button class="btn-confirm" onclick="window.closeModal(true)" style="
                            padding: 14px 28px;
                            border: none;
                            background: ${danger ? 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
                            color: white;
                            border-radius: 10px;
                            font-weight: 600;
                            font-size: 15px;
                            cursor: pointer;
                            transition: all 0.2s;
                            box-shadow: 0 4px 12px ${danger ? 'rgba(244, 67, 54, 0.3)' : 'rgba(102, 126, 234, 0.3)'};
                            min-width: 120px;
                        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px ${danger ? 'rgba(244, 67, 54, 0.4)' : 'rgba(102, 126, 234, 0.4)'}'" 
                           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px ${danger ? 'rgba(244, 67, 54, 0.3)' : 'rgba(102, 126, 234, 0.3)'}'">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                @keyframes iconBounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                
                /* Responsive Mobile */
                @media (max-width: 768px) {
                    .modal-container {
                        width: 95% !important;
                        max-width: none !important;
                        padding: 24px 20px !important; /* Adjust padding for smaller screens */
                        margin: 20px !important; /* Ensure margin is applied */
                    }

                    .modal-header {
                        padding: 20px 20px 16px !important;
                    }

                    .modal-title {
                        font-size: 20px !important;
                    }

                    .modal-body {
                        padding: 20px !important;
                        font-size: 14px !important;
                    }

                    .modal-footer {
                        padding: 16px 20px 20px !important;
                        flex-direction: column !important;
                        gap: 10px !important;
                    }

                    .btn-cancel, .btn-confirm {
                        width: 100% !important;
                    }
                }
            </style>
        `;

        // Insérer dans le DOM
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHTML;
        document.body.appendChild(modalDiv);

        // Fonction pour fermer la modale
        window.closeModal = (confirmed) => {
            const modal = document.getElementById('customModal');
            if (modal) {
                modal.style.animation = 'fadeOut 0.2s ease';
                setTimeout(() => {
                    modalDiv.remove();
                    delete window.closeModal;

                    // Afficher confettis si demandé et confirmé
                    if (confirmed && showConfetti) {
                        triggerConfetti();
                    }

                    resolve(confirmed);
                }, 200);
            }
        };

        // Fermer avec Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                window.closeModal(false);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    });
}

/**
 * Retourne l'icône selon le type de modale
 */
function getIcon(type, danger) {
    if (danger) return '⚠️';

    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'confirm': return '❓';
        default: return 'ℹ️';
    }
}

/**
 * Déclenche une animation de confettis
 */
function triggerConfetti() {
    if (typeof confetti === 'undefined') {
        console.warn('canvas-confetti non chargé');
        return;
    }

    // Explosion principale
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
    });

    // Explosion secondaire après 200ms
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#667eea', '#764ba2', '#f093fb']
        });
    }, 200);

    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#4facfe', '#00f2fe', '#43e97b']
        });
    }, 400);
}

/**
 * Raccourcis pour types courants
 */
async function showSuccess(message, title = 'Succès !') {
    return await showModal({
        title,
        message,
        type: 'success',
        confirmText: 'OK',
        showConfetti: true
    });
}

async function showError(message, title = 'Erreur') {
    return await showModal({
        title,
        message,
        type: 'error',
        confirmText: 'OK'
    });
}

async function showConfirm(message, title = 'Confirmation', danger = false) {
    return await showModal({
        title,
        message,
        type: 'confirm',
        confirmText: danger ? 'Supprimer' : 'Confirmer',
        cancelText: 'Annuler',
        danger,
        showConfetti: danger // Confettis pour suppressions
    });
}

// Ajouter style fadeOut pour fermeture
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
