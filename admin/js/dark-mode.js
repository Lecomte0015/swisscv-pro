// Admin Dark Mode Toggle
(function () {
    'use strict';

    // Détecter préférence système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Charger préférence sauvegardée ou utiliser préférence système
    const savedTheme = localStorage.getItem('admin_theme');
    const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    // Appliquer le thème
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Créer le toggle button
    function createDarkModeToggle() {
        // Vérifier si le toggle existe déjà
        if (document.getElementById('darkModeToggle')) return;

        const navbar = document.querySelector('.admin-navbar');
        if (!navbar) return;

        const notificationsContainer = navbar.querySelector('.notifications-container');
        if (!notificationsContainer) return;

        // Créer le bouton toggle
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'darkModeToggle';
        toggleBtn.className = 'dark-mode-toggle';
        toggleBtn.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
        toggleBtn.title = currentTheme === 'dark' ? 'Mode clair' : 'Mode sombre';

        // Insérer avant les notifications
        notificationsContainer.parentNode.insertBefore(toggleBtn, notificationsContainer);

        // Event listener
        toggleBtn.addEventListener('click', toggleDarkMode);
    }

    function toggleDarkMode() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('admin_theme', newTheme);

        const toggleBtn = document.getElementById('darkModeToggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
            toggleBtn.title = newTheme === 'dark' ? 'Mode clair' : 'Mode sombre';
        }
    }

    // Initialiser quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createDarkModeToggle);
    } else {
        createDarkModeToggle();
    }

    // Exposer la fonction toggle globalement
    window.toggleDarkMode = toggleDarkMode;
})();
