/* =========================================
   HRF Airport System — Airports Apps Logic
   ========================================= */

(function () {
    'use strict';

    /* ---------- Gatekeeper ---------- */
    const session = JSON.parse(
        sessionStorage.getItem('hrf-airport-session') || 'null'
    );
    if (!session) {
        window.location.replace('index.html');
        return;
    }

    /* ---------- DOM references ---------- */
    const themeToggle = document.getElementById('themeToggle');
    const logoutBtn = document.getElementById('logoutBtn');
    const successToastEl = document.getElementById('successToast');
    const toastMessage = document.getElementById('toastMessage');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const greetingName = document.getElementById('greetingName');
    const userAvatar = document.querySelector('.user-avatar');
    const todayDate = document.getElementById('todayDate');

    const toast = new bootstrap.Toast(successToastEl, {
        delay: 3000,
        animation: true,
    });

    /* ---------- Populate user info ---------- */
    const fullName = session.fullName || 'Demo User';
    const role = session.role || 'Operations Manager';
    const initials = fullName
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();

    if (userName) userName.textContent = fullName;
    if (userRole) userRole.textContent = role;
    if (greetingName) greetingName.textContent = fullName.split(' ')[0];
    if (userAvatar) userAvatar.textContent = initials || 'DU';

    /* ---------- Date ---------- */
    if (todayDate) {
        todayDate.textContent = new Date().toLocaleDateString(undefined, {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    /* ---------- Dark mode ---------- */
    const storedTheme = localStorage.getItem('hrf-airport-theme');
    if (storedTheme) {
        document.documentElement.setAttribute('data-theme', storedTheme);
        if (storedTheme === 'dark') {
            themeToggle.querySelector('i').classList.replace(
                'bi-moon-stars-fill',
                'bi-sun-fill'
            );
        }
    }

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('hrf-airport-theme', next);
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('bi-moon-stars-fill');
        icon.classList.toggle('bi-sun-fill');
    });

    /* ---------- Sidebar handlers removed ---------- */

    /* ---------- Tile clicks (route to dedicated pages where available) ---------- */
    const TILE_ROUTES = {
        'HR System': 'hr.html',
        'Stock and Inventory': 'stock.html',
    };

    document.querySelectorAll('.app-tile').forEach((tile) => {
        tile.addEventListener('click', (e) => {
            e.preventDefault();
            const appName = tile.dataset.app;
            const route = TILE_ROUTES[appName];

            // Visual feedback
            tile.style.transform = 'translateY(-2px) scale(0.98)';
            setTimeout(() => {
                tile.style.transform = '';
            }, 150);

            if (route) {
                window.location.href = route;
            } else {
                toastMessage.textContent = `${appName} is coming soon.`;
                toast.show();
            }
        });
    });

    /* ---------- User chip placeholder ---------- */
    const userChip = document.getElementById('userChip');
    if (userChip) {
        userChip.addEventListener('click', () => {
            toastMessage.textContent = 'Profile menu coming soon.';
            toast.show();
        });
    }

    /* ---------- Logout ---------- */
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('hrf-airport-session');
            window.location.href = 'index.html';
        });
    }
})();
