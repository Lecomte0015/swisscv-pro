// Mettre à jour le badge favoris dans la navbar
(async function updateFavoritesBadge() {
    try {
        const token = localStorage.getItem('swisscv_token');
        if (!token) return;

        const response = await fetch('https://swisscv-pro.dallyhermann-71e.workers.dev/jobs/favorites', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const badge = document.getElementById('favoritesBadge');
                if (badge && data.count > 0) {
                    badge.textContent = data.count;
                    badge.style.display = 'inline';
                }
            }
        }
    } catch (error) {
        console.error('Erreur chargement badge favoris:', error);
    }
})();
