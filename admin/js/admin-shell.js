/* Coquille du back-office : construit la barre latérale et la barre supérieure sur toutes les pages admin.
   Pour ajouter une page au menu, il suffit d'ajouter une ligne dans NAV ci-dessous (plus de copie dans chaque page). */
(function () {
    'use strict';

    window.__adminShell = true; // indique à mobile-menu.js / dark-mode.js que la coquille gère déjà le menu et le thème

    // ---------- Menu (source unique) ----------
    var NAV = [
        { group: 'Pilotage', items: [
            { href: 'admin-dashboard.html', label: 'Tableau de bord', icon: 'dashboard' },
            { href: 'admin-analytics.html', label: 'Analytics', icon: 'chart' }
        ] },
        { group: 'Marketing', items: [
            { href: 'admin-marketing.html', label: 'Statistiques marketing', icon: 'trend' },
            { href: 'admin-campaigns.html', label: 'Campagnes email', icon: 'send' }
        ] },
        { group: 'Utilisateurs', items: [
            { href: 'admin-users.html', label: 'Utilisateurs', icon: 'users' },
            { href: 'admin-roles.html', label: 'Rôles et accès', icon: 'shield' }
        ] },
        { group: 'Relation client', items: [
            { href: 'admin-support.html', label: 'Support', icon: 'support' },
            { href: 'admin-feedback.html', label: 'Feedback', icon: 'message' },
            { href: 'admin-testimonials.html', label: 'Témoignages', icon: 'quote' }
        ] },
        { group: 'Contenu', items: [
            { href: 'admin-cms.html', label: 'Contenu du site', icon: 'layout' },
            { href: 'admin-reports.html', label: 'Rapports par email', icon: 'mail' }
        ] },
        { group: 'Système', items: [
            { href: 'admin-logs.html', label: 'Journal d\'audit', icon: 'log' }
        ] }
    ];

    // Icônes Lucide (SVG en ligne, trait 1.75) — aucune icône emoji
    var ICONS = {
        dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
        chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
        trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
        users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
        support: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/>',
        message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
        quote: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>',
        layout: '<rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/>',
        mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
        log: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>',
        logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
        moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
        menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
        collapse: '<path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/>',
        bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
        send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>'
    };
    function svg(name, extra) {
        return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"' + (extra || '') + '>' + (ICONS[name] || '') + '</svg>';
    }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

    // ---------- Thème (appliqué tout de suite pour éviter l'éclair blanc) ----------
    function currentTheme() {
        var saved = store('admin_theme');
        return saved === 'dark' ? 'dark' : 'light'; // clair par défaut ; le sombre n'est activé que par choix explicite
    }
    document.documentElement.setAttribute('data-theme', currentTheme());


    // ---------- Adaptateur « mode sombre » ----------
    // Les pages écrivent leurs fonds blancs / textes foncés en dur. En mode sombre, on repère automatiquement les fonds neutres clairs
    // et les textes neutres foncés (y compris dans le contenu affiché plus tard) et on leur applique des classes (voir admin-shell.css).
    // Les couleurs « teintées » (badges verts, boutons bleus, rouges...) sont volontairement laissées telles quelles.
    var SKIP_TAGS = /^(SCRIPT|STYLE|LINK|SVG|PATH|CANVAS|IMG|BR|HR|NOSCRIPT|META|TITLE|DEFS|G|CIRCLE|RECT|LINE|POLYLINE|POLYGON)$/i;
    function rgbOf(str) {
        var m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/.exec(str || '');
        return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
    }
    function lum(c) { return (c.r + c.g + c.b) / 3; }
    // écart entre la composante la plus forte et la plus faible : ~0 pour un gris, > 60 pour une vraie couleur (vert, rouge, bleu...)
    function chroma(c) { return Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b); }
    function isDarkTheme() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

    function collect(root, list) {
        if (root.nodeType !== 1 || SKIP_TAGS.test(root.tagName) || root.closest('svg')) return;
        list.push(root);
        var all = root.querySelectorAll('*');
        for (var i = 0; i < all.length; i++) { if (!SKIP_TAGS.test(all[i].tagName) && !all[i].closest('svg')) list.push(all[i]); }
    }

    function darkPatch(roots) {
        if (!isDarkTheme()) return;
        var els = [];
        roots.forEach(function (r) { collect(r, els); });
        els = els.filter(function (el) { return !el.__admDk; });
        if (!els.length) return;
        // Passe 1 : lectures seules (pas de re-calcul de style entre les lectures), puis écritures groupées
        var bgs = els.map(function (el) { return rgbOf(getComputedStyle(el).backgroundColor); });
        els.forEach(function (el, i) {
            var c = bgs[i];
            if (c && c.a > 0.6 && lum(c) > 215 && chroma(c) <= 24) el.classList.add('adm-dk-bg');
        });
        // Passe 2 : textes neutres foncés posés sur un fond désormais sombre
        var fixes = [];
        els.forEach(function (el) {
            var cs = getComputedStyle(el);
            var col = rgbOf(cs.color);
            if (!col || lum(col) >= 150 || chroma(col) > 45) return;
            // fond effectif = premier ancêtre (ou soi-même) avec un fond opaque
            var p = el, bg = null;
            while (p && p.nodeType === 1) {
                var b = rgbOf(getComputedStyle(p).backgroundColor);
                if (b && b.a > 0.6) { bg = b; break; }
                p = p.parentElement;
            }
            if (!bg || lum(bg) < 110) fixes.push([el, lum(col) < 105 ? 'adm-dk-fg' : 'adm-dk-muted']);
        });
        fixes.forEach(function (f) { f[0].classList.add(f[1]); });
        els.forEach(function (el) { el.__admDk = true; });
    }

    var darkQueue = new Set(), darkTimer = null;
    function scheduleDark(nodes) {
        nodes.forEach(function (n) { if (n.nodeType === 1) darkQueue.add(n); });
        if (darkTimer) return;
        darkTimer = setTimeout(function () {
            darkTimer = null;
            var batch = Array.from(darkQueue); darkQueue.clear();
            darkPatch(batch);
        }, 60);
    }
    function startDarkObserver() {
        var main = document.getElementById('adminContent');
        if (!main || main.__admObs) return;
        main.__admObs = true;
        new MutationObserver(function (muts) {
            if (!isDarkTheme()) return;
            var added = [];
            muts.forEach(function (m) { m.addedNodes.forEach(function (n) { added.push(n); }); });
            if (added.length) scheduleDark(added);
        }).observe(main, { childList: true, subtree: true });
    }

    // ---------- Construction ----------
    function build() {
        if (document.querySelector('.admin-app')) return;
        var body = document.body;
        var file = (location.pathname.split('/').pop() || '').replace(/\.html$/, '') + '.html';
        var current = null;
        NAV.forEach(function (g) { g.items.forEach(function (it) { if (it.href === file) current = it; }); });
        var pageTitle = current ? current.label : (document.title || 'Administration').replace(/\s*[—-].*$/, '');

        // Éléments hérités à conserver : cloche de notifications (alimentée par notifications.js)
        var legacyNav = document.querySelector('.admin-navbar');
        var notif = legacyNav ? legacyNav.querySelector('.notifications-container') : document.querySelector('.notifications-container');
        if (notif && notif.parentNode) notif.parentNode.removeChild(notif);
        if (legacyNav && legacyNav.parentNode) legacyNav.parentNode.removeChild(legacyNav);
        // Les pages n'embarquent plus le HTML de la cloche : on le crée si notifications.js est chargé (mêmes identifiants qu'avant)
        if (!notif && document.querySelector('script[src*="notifications.js"]')) {
            notif = document.createElement('div');
            notif.className = 'notifications-container';
            notif.innerHTML = '<button type="button" class="notifications-bell"><span class="notifications-badge" id="notificationsBadge" style="display:none;">0</span></button>' +
                '<div class="notifications-dropdown" id="notificationsDropdown"><div class="notifications-header">Notifications</div>' +
                '<div id="notificationsList"><div class="notifications-empty">Chargement…</div></div></div>';
        }
        ['.burger-menu', '.mobile-menu', '.mobile-menu-overlay'].forEach(function (sel) {
            var el = document.querySelector(sel); if (el && el.parentNode) el.parentNode.removeChild(el);
        });

        var user = {}; try { user = JSON.parse(store('admin_user') || '{}') || {}; } catch (e) { user = {}; }
        var email = user.email || 'Administrateur';
        var role = (user.role || 'admin').replace('_', ' ');

        var navHtml = NAV.map(function (g) {
            return '<div class="admin-nav-group"><div class="admin-nav-group-title">' + esc(g.group) + '</div>' +
                g.items.map(function (it) {
                    var active = it.href === file;
                    return '<a class="admin-nav-link" href="' + it.href + '" title="' + esc(it.label) + '"' + (active ? ' aria-current="page"' : '') + '>' +
                        svg(it.icon) + '<span class="admin-nav-label">' + esc(it.label) + '</span></a>';
                }).join('') + '</div>';
        }).join('');

        var app = document.createElement('div');
        app.className = 'admin-app';
        app.innerHTML =
            '<a class="admin-skip" href="#adminContent">Aller au contenu</a>' +
            '<aside class="admin-sidebar" id="adminSidebar" aria-label="Navigation du back-office">' +
                '<div class="admin-brand"><div class="admin-brand-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></div>' +
                '<div class="admin-brand-text"><strong>SwissCV Pro</strong><span>Administration</span></div></div>' +
                '<nav class="admin-nav" aria-label="Pages">' + navHtml + '</nav>' +
                '<div class="admin-sidebar-foot"><button type="button" class="admin-collapse" id="adminCollapse" aria-pressed="false" title="Réduire le menu">' +
                svg('collapse') + '<span class="admin-collapse-label">Réduire le menu</span></button></div>' +
            '</aside>' +
            '<div class="admin-overlay" id="adminOverlay"></div>' +
            '<div class="admin-main">' +
                '<header class="admin-topbar">' +
                    '<button type="button" class="admin-icon-btn admin-burger" id="adminBurger" aria-label="Ouvrir le menu" aria-controls="adminSidebar" aria-expanded="false">' + svg('menu') + '</button>' +
                    '<h1 class="admin-page-title">' + esc(pageTitle) + '</h1>' +
                    '<div class="admin-topbar-spacer"></div>' +
                    '<div class="admin-topbar-actions" id="adminActions">' +
                        '<button type="button" class="admin-icon-btn" id="adminTheme" aria-label="Changer de thème"></button>' +
                        '<div class="admin-chip" title="' + esc(email) + '"><span class="admin-avatar" aria-hidden="true">' + esc(email.charAt(0).toUpperCase()) + '</span>' +
                            '<span class="admin-chip-meta"><strong>' + esc(email) + '</strong><span>' + esc(role) + '</span></span></div>' +
                        '<button type="button" class="admin-logout" id="adminLogout" aria-label="Déconnexion">' + svg('logout') + '<span class="admin-logout-label">Déconnexion</span></button>' +
                    '</div>' +
                '</header>' +
                '<main class="admin-content" id="adminContent" tabindex="-1"></main>' +
            '</div>';

        // Déplacer le contenu existant de la page (sauf scripts / styles) dans la zone principale
        var content = app.querySelector('#adminContent');
        var nodes = Array.prototype.slice.call(body.childNodes);
        nodes.forEach(function (n) {
            if (n.nodeType === 1 && /^(SCRIPT|STYLE|LINK|NOSCRIPT)$/.test(n.tagName)) return;
            content.appendChild(n);
        });
        body.insertBefore(app, body.firstChild);
        body.classList.add('admin-shell-on');

        // Les titres des pages commencent souvent par un emoji : le menu a désormais de vraies icônes, on les retire
        try {
            var lead = /^[\s\u200d\ufe0f\p{Extended_Pictographic}]+/u;
            content.querySelectorAll('h2, h3').forEach(function (h) {
                var n = h.firstChild;
                if (n && n.nodeType === 3 && lead.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(lead, '');
            });
        } catch (e) { /* navigateur ancien : on laisse les titres tels quels */ }

        // Cloche de notifications
        var actions = app.querySelector('#adminActions');
        if (notif) {
            var bell = notif.querySelector('.notifications-bell');
            if (bell) {
                var badge = bell.querySelector('.notifications-badge');
                bell.setAttribute('aria-label', 'Notifications');
                bell.innerHTML = svg('bell');
                if (badge) bell.appendChild(badge);
            }
            actions.insertBefore(notif, app.querySelector('#adminTheme'));
        }

        // Thème
        var themeBtn = app.querySelector('#adminTheme');
        function paintTheme() {
            var dark = document.documentElement.getAttribute('data-theme') === 'dark';
            themeBtn.innerHTML = svg(dark ? 'sun' : 'moon');
            themeBtn.title = dark ? 'Passer en mode clair' : 'Passer en mode sombre';
            themeBtn.setAttribute('aria-label', themeBtn.title);
        }
        // Les graphiques Chart.js lisent leurs couleurs par défaut au moment de leur création
        function paintCharts() {
            if (!window.Chart || !Chart.defaults) return;
            var dark = document.documentElement.getAttribute('data-theme') === 'dark';
            Chart.defaults.color = dark ? '#93A1B8' : '#64748B';
            Chart.defaults.borderColor = dark ? 'rgba(147,161,184,.18)' : 'rgba(100,116,139,.18)';
        }
        paintTheme();
        paintCharts();
        themeBtn.addEventListener('click', function () {
            var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            store('admin_theme', next);
            paintTheme();
            paintCharts();
            if (next === 'dark') darkAll();
        });

        // Déconnexion : réutilise la fonction logout() de la page si elle existe
        app.querySelector('#adminLogout').addEventListener('click', function () {
            if (typeof window.logout === 'function') { window.logout(); return; }
            try { localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user'); } catch (e) { /* ignore */ }
            location.href = 'admin-login.html';
        });

        // Mode sombre : adapter le contenu existant puis surveiller le contenu affiché plus tard
        startDarkObserver();
        function darkAll() { darkPatch([content]); var dd = document.querySelector('.notifications-dropdown'); if (dd) darkPatch([dd]); }
        if (isDarkTheme()) darkAll();

        // Réduction du menu (grand écran), mémorisée
        var collapseBtn = app.querySelector('#adminCollapse');
        function setCollapsed(on) {
            body.classList.toggle('sidebar-collapsed', on);
            collapseBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
            collapseBtn.title = on ? 'Déployer le menu' : 'Réduire le menu';
            store('admin_sidebar', on ? 'collapsed' : 'open');
        }
        setCollapsed(store('admin_sidebar') === 'collapsed');
        collapseBtn.addEventListener('click', function () { setCollapsed(!body.classList.contains('sidebar-collapsed')); });

        // Tiroir (tablette / mobile)
        var burger = app.querySelector('#adminBurger');
        var overlay = app.querySelector('#adminOverlay');
        var sidebar = app.querySelector('#adminSidebar');
        function setDrawer(open) {
            body.classList.toggle('drawer-open', open);
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
            burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
            if (open) { var first = sidebar.querySelector('.admin-nav-link'); if (first) first.focus(); } else { burger.focus({ preventScroll: true }); }
        }
        burger.addEventListener('click', function () { setDrawer(!body.classList.contains('drawer-open')); });
        overlay.addEventListener('click', function () { setDrawer(false); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && body.classList.contains('drawer-open')) setDrawer(false); });
        sidebar.addEventListener('click', function (e) { if (e.target.closest('.admin-nav-link')) body.classList.remove('drawer-open'); });
        window.addEventListener('resize', function () { if (window.innerWidth >= 1024) body.classList.remove('drawer-open'); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
    else build();
})();
