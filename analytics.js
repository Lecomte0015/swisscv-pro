/* SwissCV Pro — mesure d'audience et attribution (audit marketing du 11.10.2026)
 *
 * Règles de confidentialité appliquées ici :
 *  - Google Analytics et Contentsquare (tiers) : chargés UNIQUEMENT après un « Accepter » explicite. Rien n'est envoyé avant.
 *  - Attribution « premier contact » (source / UTM / hôte du referrer / page d'arrivée) : donnée technique conservée
 *    sur l'appareil et envoyée une seule fois à l'inscription. Désactivée si le visiteur a cliqué « Refuser ».
 *  - Événements du tunnel de vente (/track) : anonymes et agrégés ; l'identifiant anonyme n'est créé qu'après
 *    « Accepter » ; rien n'est envoyé après « Refuser ».
 *  - Jamais de contenu de CV, d'email, de nom ni de texte saisi dans ces données.
 */
(function () {
    'use strict';

    var GA_ID = 'G-VE7PJZTF8L';
    var API = 'https://swisscv-pro.dallyhermann-71e.workers.dev';
    var CONSENT_KEY = 'swisscv_consent';
    var ATTR_KEY = 'swisscv_attribution';
    var ANON_KEY = 'swisscv_anon';

    function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } }
    function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }

    function getConsent() {
        var v = lsGet(CONSENT_KEY);
        return (v === 'granted' || v === 'denied') ? v : null;
    }

    // ---------- Google Analytics (après consentement uniquement) ----------
    var gaLoaded = false;
    window.dataLayer = window.dataLayer || [];
    // Les pages appellent gtag('event', …) : sans consentement c'est un no-op, rien n'est mis en file d'attente.
    window.gtag = function () { if (gaLoaded) window.dataLayer.push(arguments); };

    // Contentsquare (analyse d'usage du site) : même règle que Google Analytics, chargé uniquement après « Accepter »
    var csLoaded = false;
    function loadContentsquare() {
        if (csLoaded) return;
        csLoaded = true;
        var c = document.createElement('script');
        c.async = true;
        c.src = 'https://t.contentsquare.net/uxa/3c4944a1f5d99.js';
        document.head.appendChild(c);
    }

    function loadGA() {
        if (gaLoaded) return;
        loadContentsquare();
        gaLoaded = true;
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(s);
        window.gtag('js', new Date());
        window.gtag('config', GA_ID, { anonymize_ip: true });
    }

    function clearGaCookies() {
        try {
            document.cookie.split(';').forEach(function (c) {
                var name = c.split('=')[0].trim();
                if (name.indexOf('_ga') === 0) {
                    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
                    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.' + location.hostname.replace(/^www\./, '');
                }
            });
        } catch (e) { /* ignore */ }
    }

    // ---------- Attribution « premier contact » ----------
    function ownHost(h) { return /(^|\.)swisscv-pro\.(ch|pages\.dev)$/.test(h); }

    function captureAttribution() {
        if (getConsent() === 'denied') return;
        var stored = null;
        try { stored = JSON.parse(lsGet(ATTR_KEY) || 'null'); } catch (e) { stored = null; }

        var params = new URLSearchParams(location.search);
        var utmSource = params.get('utm_source');
        var refHost = '';
        try { refHost = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) { refHost = ''; }
        if (refHost && ownHost(refHost)) refHost = '';

        var hasSignal = !!(utmSource || refHost);
        // Le premier contact n'est jamais écrasé, sauf s'il était « direct » (aucun signal) et qu'un vrai signal arrive.
        if (stored && !(stored.direct && hasSignal)) return;

        var attr = {
            utm_source: utmSource,
            utm_medium: params.get('utm_medium'),
            utm_campaign: params.get('utm_campaign'),
            referrer_host: refHost || null,
            landing_path: location.pathname,
            direct: !hasSignal
        };
        lsSet(ATTR_KEY, JSON.stringify(attr));
    }

    // Lu par login.html au moment de l'inscription
    window.swisscvAttribution = function () {
        if (getConsent() === 'denied') return null;
        try {
            var a = JSON.parse(lsGet(ATTR_KEY) || 'null');
            if (!a) return null;
            return {
                utm_source: a.utm_source, utm_medium: a.utm_medium, utm_campaign: a.utm_campaign,
                referrer_host: a.referrer_host, landing_path: a.landing_path
            };
        } catch (e) { return null; }
    };

    // ---------- Événements du tunnel de vente (first-party, anonymes) ----------
    function getAnonId() {
        var id = lsGet(ANON_KEY);
        if (!id) {
            id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(16).slice(2, 10);
            lsSet(ANON_KEY, id);
        }
        return id;
    }

    // eventType : liste blanche côté serveur (POST /track) ; plan : 'premium' | 'pro' (optionnel) ;
    // place : identifiant court du lieu du clic (lettres minuscules et _), jamais de contenu saisi par l'utilisateur
    window.swisscvTrack = function (eventType, plan, place) {
        try {
            var consent = getConsent();
            if (consent === 'denied') return;
            var headers = { 'Content-Type': 'application/json' };
            var token = lsGet('swisscv_token');
            if (token) headers['Authorization'] = 'Bearer ' + token;
            fetch(API + '/track', {
                method: 'POST',
                keepalive: true,
                headers: headers,
                body: JSON.stringify({ event_type: eventType, plan: plan || null, place: place || null, anon_id: consent === 'granted' ? getAnonId() : null })
            }).catch(function () { /* mesure non critique */ });
        } catch (e) { /* ignore */ }
    };

    // ---------- Consentement ----------
    function applyConsent(value) {
        lsSet(CONSENT_KEY, value);
        if (value === 'granted') {
            loadGA();
            captureAttribution();
        } else {
            lsDel(ATTR_KEY);
            lsDel(ANON_KEY);
            clearGaCookies();
        }
    }

    function removeBanner() {
        var b = document.getElementById('swisscvConsentBanner');
        if (b && b.parentNode) b.parentNode.removeChild(b);
    }

    function showBanner() {
        if (window.top !== window.self) return; // pas dans les aperçus en iframe
        if (document.getElementById('swisscvConsentBanner')) return;
        var wrap = document.createElement('div');
        wrap.id = 'swisscvConsentBanner';
        wrap.setAttribute('role', 'dialog');
        wrap.setAttribute('aria-label', 'Préférences de confidentialité');
        wrap.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:560px;margin:0 auto;' +
            'background:#fff;color:#1a1a1a;border:1px solid #e5e5e5;border-radius:12px;padding:16px 18px;' +
            'box-shadow:0 10px 40px rgba(0,0,0,.18);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
        wrap.innerHTML =
            '<div style="font-weight:700;margin-bottom:4px;">Votre vie privée</div>' +
            '<div style="color:#444;margin-bottom:12px;">Avec votre accord, nous utilisons Google Analytics pour mesurer l\'audience et améliorer SwissCV Pro. ' +
            'Le contenu de vos CV n\'est jamais partagé. <a href="/cookies" style="color:#D50000;font-weight:600;">En savoir plus</a></div>' +
            '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
            '<button type="button" id="swisscvConsentAccept" style="flex:1;min-width:120px;background:#D50000;color:#fff;border:0;border-radius:8px;padding:10px 14px;font-weight:700;cursor:pointer;font-size:14px;">Accepter</button>' +
            '<button type="button" id="swisscvConsentDeny" style="flex:1;min-width:120px;background:#fff;color:#1a1a1a;border:1px solid #cfcfcf;border-radius:8px;padding:10px 14px;font-weight:600;cursor:pointer;font-size:14px;">Refuser</button>' +
            '</div>';
        document.body.appendChild(wrap);
        document.getElementById('swisscvConsentAccept').addEventListener('click', function () { applyConsent('granted'); removeBanner(); });
        document.getElementById('swisscvConsentDeny').addEventListener('click', function () { applyConsent('denied'); removeBanner(); });
    }

    // Réouverture du choix (lien « Modifier mon choix » de la page cookies)
    window.swisscvConsent = {
        get: getConsent,
        reopen: function () { lsDel(CONSENT_KEY); showBanner(); }
    };

    // ---------- Démarrage ----------
    var consent = getConsent();
    if (consent === 'granted') loadGA();
    captureAttribution();

    if (consent === null) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner);
        else showBanner();
    }
})();
