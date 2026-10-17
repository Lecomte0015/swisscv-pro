/* Mode « dossier candidat » (plan Pro, équipes).
 * Ouvert via ?candidate=<id> depuis un dossier candidat, le mode reste actif pour l'onglet (sessionStorage).
 * Il affiche un bandeau, rattache automatiquement les outils au candidat (candidate_id ajouté aux requêtes
 * d'analyse, de lettre, de candidature 1 clic et du générateur de CV), met le nom du candidat comme signataire,
 * et garde le CV du candidat à part du CV personnel du conseiller. Le serveur revérifie tous les droits d'accès.
 * ?candidate=none quitte le mode.
 */
(function () {
    'use strict';
    var KEY = 'swisscv_candidate';
    var API = 'https://swisscv-pro.dallyhermann-71e.workers.dev';
    var TOOLS = ['/analyze-cv-text', '/generate-cover-letter', '/ai/generate-application', '/cv-builder/save'];

    function ss() { try { return window.sessionStorage; } catch (e) { return null; } }
    function read() {
        var s = ss();
        if (!s) return null;
        try {
            var c = JSON.parse(s.getItem(KEY) || 'null');
            return c && /^[0-9a-f-]{36}$/i.test(c.id) ? c : null;
        } catch (e) { return null; }
    }
    function save(c) { var s = ss(); if (s) { try { if (c) s.setItem(KEY, JSON.stringify(c)); else s.removeItem(KEY); } catch (e) { /* ignore */ } } }

    var params = new URLSearchParams(window.location.search);
    var asked = params.get('candidate');
    if (asked === 'none') save(null);
    else if (asked && /^[0-9a-f-]{36}$/i.test(asked)) {
        var cur = read();
        if (!cur || cur.id !== asked) save({ id: asked, name: '' });
    }
    var ctx = read();
    window.swisscvCandidate = { get: function () { return read(); } };
    if (!ctx) return;

    // Ajoute candidate_id aux requêtes des outils
    var realFetch = window.fetch.bind(window);
    window.fetch = function (input, init) {
        try {
            var url = typeof input === 'string' ? input : input.url;
            var path = url.replace(API, '').split('?')[0];
            var c = read();
            if (c && path === '/cv-builder/list' && url.indexOf('candidate_id=') === -1) {
                url += (url.indexOf('?') === -1 ? '?' : '&') + 'candidate_id=' + encodeURIComponent(c.id);
                return realFetch(url, init);
            }
            if (c && init && String(init.method || 'GET').toUpperCase() === 'POST' && TOOLS.indexOf(path) !== -1 && typeof init.body === 'string') {
                var body = JSON.parse(init.body);
                if (!body.candidate_id && !(path === '/cv-builder/save' && body.id)) body.candidate_id = c.id;
                if (c.name && Object.prototype.hasOwnProperty.call(body, 'candidateName')) body.candidateName = c.name;
                init = Object.assign({}, init, { body: JSON.stringify(body) });
            }
        } catch (e) { /* requête laissée telle quelle */ }
        return realFetch(input, init);
    };

    // Le CV du candidat ne remplace pas le CV personnel du conseiller (pré-remplissage des autres outils)
    try {
        var ls = window.localStorage;
        var cvKey = 'swisscv_cand_cv_' + ctx.id;
        var origGet = ls.getItem.bind(ls), origSet = ls.setItem.bind(ls);
        ls.getItem = function (k) { return k === 'swisscv_last_cv' ? (ss() ? ss().getItem(cvKey) : null) : origGet(k); };
        ls.setItem = function (k, v) { if (k === 'swisscv_last_cv') { if (ss()) ss().setItem(cvKey, v); return; } origSet(k, v); };
    } catch (e) { /* stockage indisponible */ }

    function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }

    function banner(c) {
        var old = document.getElementById('swisscvCandidateBanner');
        if (old) old.remove();
        var bar = document.createElement('div');
        bar.id = 'swisscvCandidateBanner';
        bar.setAttribute('role', 'status');
        bar.style.cssText = 'position:sticky;top:0;z-index:2000;background:#0D0D0D;color:#fff;font-family:Inter,Arial,sans-serif;font-size:14px;padding:10px 16px;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:center;';
        bar.innerHTML = '<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#D50000;margin-right:8px;"></span>Dossier candidat : <strong>' + esc(c.name || 'chargement…') + '</strong> — ce que vous faites ici est enregistré dans son dossier</span>' +
            '<a href="candidats.html?id=' + encodeURIComponent(c.id) + '" style="color:#fff;font-weight:700;">Retour au dossier</a>' +
            '<a href="?candidate=none" style="color:#bbb;">Quitter le mode candidat</a>';
        document.body.insertBefore(bar, document.body.firstChild);
    }

    function fillName(c) {
        var el = document.getElementById('candidateName');
        if (el && c.name) el.value = c.name;
    }

    function start() {
        var c = read();
        banner(c);
        var token = null;
        try { token = window.localStorage.getItem('swisscv_token'); } catch (e) { token = null; }
        if (!token) return;
        realFetch(API + '/candidates/' + encodeURIComponent(c.id), { headers: { 'Authorization': 'Bearer ' + token } })
            .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
            .then(function (res) {
                if (!res.ok || !res.d.candidate) { save(null); var b = document.getElementById('swisscvCandidateBanner'); if (b) b.remove(); return; }
                var cand = res.d.candidate;
                var next = { id: cand.id, name: (cand.first_name + ' ' + cand.last_name).trim() };
                save(next);
                banner(next);
                fillName(next);
                // Le pré-remplissage du profil du conseiller peut arriver après : on repasse le nom du candidat
                setTimeout(function () { fillName(next); }, 1200);
                setTimeout(function () { fillName(next); }, 3000);
            })
            .catch(function () { /* hors ligne : bandeau minimal conservé */ });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
