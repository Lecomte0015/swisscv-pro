// Resynchronise le profil mis en cache (localStorage.swisscv_user) avec la base.
// Sans ça, un changement de plan fait côté serveur (upgrade, admin, Stripe) n'apparaît
// qu'à la prochaine connexion, car la plupart des pages lisent le plan en cache.
(function () {
    var API = 'https://swisscv-pro.dallyhermann-71e.workers.dev';
    try {
        var token = localStorage.getItem('swisscv_token');
        if (!token) return;
        var cached = JSON.parse(localStorage.getItem('swisscv_user') || 'null') || {};

        fetch(API + '/auth/me', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                if (!data || !data.success || !data.user) return;
                var fresh = data.user;
                var tierChanged = (cached.tier || 'free') !== (fresh.tier || 'free');
                var merged = Object.assign({}, cached, fresh);
                localStorage.setItem('swisscv_user', JSON.stringify(merged));
                // Recharger une seule fois : le second passage ne verra plus de différence.
                if (tierChanged) window.location.reload();
            })
            .catch(function () { /* hors ligne ou erreur réseau : on garde le cache */ });
    } catch (e) { /* localStorage indisponible */ }
})();
