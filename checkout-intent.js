/* Mémorise le plan choisi sur la page tarifs pendant la connexion / l'inscription / la confirmation d'email,
 * puis renvoie vers la page de paiement correspondante. Aucune donnée sensible : seulement "premium" ou "pro"
 * (liste blanche) et une date d'expiration. Le serveur revérifie tout (authentification, plan déjà détenu).
 * Un retour sur une URL de succès ne donne jamais de droits : seuls les webhooks Stripe signés le font.
 */
(function () {
    'use strict';
    var KEY = 'swisscv_pending_plan';
    var TTL_MS = 48 * 3600 * 1000;
    var PLANS = ['premium', 'pro'];
    var RANK = { free: 0, premium: 1, pro: 2 };

    function store() { try { return window.localStorage; } catch (e) { return null; } }

    function read() {
        var s = store();
        if (!s) return null;
        try {
            var raw = JSON.parse(s.getItem(KEY) || 'null');
            if (!raw || PLANS.indexOf(raw.plan) === -1 || typeof raw.ts !== 'number' || Date.now() - raw.ts > TTL_MS) {
                try { s.removeItem(KEY); } catch (e) { /* ignore */ }
                return null;
            }
            return raw;
        } catch (e) { return null; }
    }

    window.swisscvIntent = {
        // Lit ?plan=premium|pro dans l'URL (liste blanche) et le mémorise
        captureFromUrl: function () {
            var s = store();
            if (!s) return null;
            var plan = new URLSearchParams(window.location.search).get('plan');
            if (PLANS.indexOf(plan) === -1) return null;
            try { s.setItem(KEY, JSON.stringify({ plan: plan, ts: Date.now() })); } catch (e) { return null; }
            return plan;
        },
        get: function () { var i = read(); return i ? i.plan : null; },
        clear: function () { var s = store(); if (s) { try { s.removeItem(KEY); } catch (e) { /* ignore */ } } },
        // Page de destination après une authentification réussie
        nextPage: function (defaultPage, currentTier) {
            // Invitation d'équipe en attente (lien ouvert avant connexion) : on y retourne en priorité
            var st = store();
            var invite = null;
            try { invite = st ? st.getItem('swisscv_pending_invite') : null; } catch (e) { invite = null; }
            if (invite && /^[a-f0-9]{32,64}$/i.test(invite)) return 'team.html?invite=' + invite;
            var i = read();
            if (!i) return defaultPage;
            if ((RANK[currentTier] || 0) >= RANK[i.plan]) { this.clear(); return defaultPage; }
            return 'credits.html?checkout=' + i.plan;
        }
    };
})();
