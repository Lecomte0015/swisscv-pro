// ============================================
// ADMIN NAVBAR RESPONSIVE - Menu Burger JS
// ============================================

function initAdminMobileMenu() {
    // Check if burger menu already exists
    if (document.querySelector('.burger-menu')) {
        console.log('Burger menu already exists, skipping initialization');
        return;
    }

    // Create burger button
    const burgerBtn = document.createElement('button');
    burgerBtn.className = 'burger-menu';
    burgerBtn.setAttribute('aria-label', 'Menu');
    burgerBtn.innerHTML = '<span></span><span></span><span></span>';

    // Create mobile menu overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';

    // Create mobile menu
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';

    // Get desktop nav links
    const desktopNav = document.querySelector('.admin-nav-links');
    if (!desktopNav) return;

    // Clone nav links for mobile
    const mobileLinks = document.createElement('div');
    mobileLinks.className = 'mobile-menu-links';

    // Copy all links except logout button
    const links = desktopNav.querySelectorAll('a:not(.logout-btn)');
    links.forEach(link => {
        const mobileLink = link.cloneNode(true);
        mobileLinks.appendChild(mobileLink);
    });

    // Copy notifications component if exists
    const notificationsContainer = desktopNav.querySelector('.notifications-container');
    if (notificationsContainer) {
        const mobileNotifications = notificationsContainer.cloneNode(true);
        mobileLinks.appendChild(mobileNotifications);
    }

    // Add dark mode toggle button if it exists
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        const clonedToggle = darkModeToggle.cloneNode(true);
        clonedToggle.id = 'darkModeToggleMobile'; // Give it a unique ID for mobile
        clonedToggle.addEventListener('click', function () {
            if (window.toggleDarkMode) {
                window.toggleDarkMode();
                // Update the icon of the desktop toggle too
                const current = document.documentElement.getAttribute('data-theme');
                const icon = current === 'dark' ? '☀️' : '🌙';
                darkModeToggle.innerHTML = icon; // Update desktop toggle icon
                this.innerHTML = icon; // Update mobile toggle icon
            }
        });
        mobileLinks.appendChild(clonedToggle);
    }

    // Add logout button
    const logoutBtn = desktopNav.querySelector('.logout-btn');
    if (logoutBtn) {
        const mobileLogout = logoutBtn.cloneNode(true);
        mobileMenu.appendChild(mobileLinks);
        mobileMenu.appendChild(mobileLogout);
    } else {
        mobileMenu.appendChild(mobileLinks);
    }

    // Add to DOM
    document.body.appendChild(overlay);
    document.body.appendChild(mobileMenu);

    // Add burger button to navbar
    const navbar = document.querySelector('.admin-navbar');
    navbar.appendChild(burgerBtn);

    // Toggle menu
    function toggleMenu() {
        burgerBtn.classList.toggle('active');
        overlay.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    // Event listeners
    burgerBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Close menu when clicking a link
    mobileLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu();
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Close menu on window resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Add dark mode toggle to mobile menu after it's created (with delay to ensure toggle exists)
    setTimeout(() => {
        const mobileMenu = document.querySelector('.mobile-menu');
        const darkModeToggle = document.getElementById('darkModeToggle');

        if (mobileMenu && darkModeToggle && !document.getElementById('darkModeToggleMobile')) {
            const mobileLinks = mobileMenu.querySelector('.mobile-menu-links');
            if (mobileLinks) {
                const clonedToggle = darkModeToggle.cloneNode(true);
                clonedToggle.id = 'darkModeToggleMobile';
                clonedToggle.addEventListener('click', function () {
                    if (window.toggleDarkMode) {
                        window.toggleDarkMode();
                        const current = document.documentElement.getAttribute('data-theme');
                        const icon = current === 'dark' ? '☀️' : '🌙';
                        darkModeToggle.innerHTML = icon;
                        this.innerHTML = icon;
                    }
                });
                mobileLinks.appendChild(clonedToggle);
            }
        }
    }, 500);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminMobileMenu);
} else {
    initAdminMobileMenu();
}
