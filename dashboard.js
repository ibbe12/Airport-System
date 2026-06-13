/* =========================================
   HRF Airport System — Dashboard Logic
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
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const logoutBtn = document.getElementById('logoutBtn');
    const successToastEl = document.getElementById('successToast');
    const toastMessage = document.getElementById('toastMessage');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const greetingName = document.getElementById('greetingName');
    const userAvatar = document.querySelector('.user-avatar');
    const todayDate = document.getElementById('todayDate');
    const liveClock = document.getElementById('liveClock');

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

    /* ---------- Date + clock ---------- */
    function formatDate(date) {
        return date.toLocaleDateString(undefined, {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    function tickClock() {
        const now = new Date();
        if (todayDate) todayDate.textContent = formatDate(now);
        if (liveClock) {
            liveClock.textContent = now.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        }
    }
    tickClock();
    setInterval(tickClock, 1000);

    /* ---------- Animated stat counters ---------- */
    function animateCount(el) {
        const target = parseInt(el.dataset.target, 10) || 0;
        const suffix = el.dataset.suffix || '';
        const duration = 1200;
        const startTime = performance.now();

        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(target * eased);
            el.textContent = value.toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString() + suffix;
        }
        requestAnimationFrame(step);
    }

    const counters = document.querySelectorAll('.stat-value');
    counters.forEach((c, i) => setTimeout(() => animateCount(c), 100 + i * 120));

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

    /* ---------- Sidebar (mobile) ---------- */
    function openSidebar() {
        sidebar.classList.add('open');
        sidebarBackdrop.classList.add('show');
    }
    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarBackdrop.classList.remove('show');
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            if (sidebar.classList.contains('open')) closeSidebar();
            else openSidebar();
        });
    }
    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', closeSidebar);
    }

    /* ---------- Nav active state ---------- */
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach((n) => n.classList.remove('active'));
            item.classList.add('active');
            const page = item.dataset.page;
            if (page) {
                toastMessage.textContent = `${page.charAt(0).toUpperCase() + page.slice(1)} module is coming soon.`;
                toast.show();
            }
            if (window.innerWidth < 768) closeSidebar();
        });
    });

    /* ---------- Quick action buttons ---------- */
    document.querySelectorAll('.quick-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const label = btn.querySelector('span')?.textContent || 'Action';
            toastMessage.textContent = `${label} — coming soon.`;
            toast.show();
        });
    });

    /* ---------- User chip (placeholder dropdown) ---------- */
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

    /* ---------- Backup / Restore / Sync (mirrors hr.js) ---------- */
    const SYSTEM_KEYS = ['hrf-airport-session', 'hrf-airport-theme', 'hrf-emp-directory', 'hrf-emp-onboarding'];

    function showToast(msg) {
        toastMessage.textContent = msg;
        toast.show();
    }

    /* --- Save backup --- */
    document.getElementById('saveBackupBtn')?.addEventListener('click', () => {
        const data = {};
        SYSTEM_KEYS.forEach(key => { data[key] = localStorage.getItem(key); });
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HRF_FullBackup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('System backup saved.');
    });

    /* --- Load backup --- */
    document.getElementById('loadBackupInput')?.addEventListener('change', function (e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                SYSTEM_KEYS.forEach(key => {
                    if (data[key] !== undefined) localStorage.setItem(key, data[key]);
                });
                showToast('Backup restored. Reloading…');
                setTimeout(() => window.location.reload(), 1200);
            } catch { showToast('Invalid backup file.'); }
        };
        reader.readAsText(file);
        this.value = '';
    });
    document.getElementById('loadBackupBtn')?.addEventListener('click', () => {
        document.getElementById('loadBackupInput')?.click();
    });

    /* --- File System Access API sync --- */
    const DB_NAME = 'HRFSyncDB', STORE = 'handles', DB_VER = 1;
    let syncHandle = null;
    const syncStatus = document.getElementById('syncStatus');
    const syncBtn = document.getElementById('syncBtn');

    function openDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VER);
            req.onupgradeneeded = () => req.result.createObjectStore(STORE);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async function getHandle() {
        const db = await openDB();
        return new Promise(resolve => {
            const tx = db.transaction(STORE, 'readonly');
            const req = tx.objectStore(STORE).get('syncDir');
            req.onsuccess = () => { resolve(req.result); db.close(); };
            req.onerror = () => { db.close(); resolve(null); };
        });
    }

    async function saveHandle(handle) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            const req = tx.objectStore(STORE).put(handle, 'syncDir');
            req.onsuccess = () => { db.close(); resolve(); };
            req.onerror = () => { db.close(); reject(req.error); };
        });
    }

    async function syncWrite() {
        if (!syncHandle) return;
        try {
            const data = {};
            SYSTEM_KEYS.forEach(key => { data[key] = localStorage.getItem(key); });
            const fileHandle = await syncHandle.getFileHandle('hrf-sync.json', { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();
        } catch { /* ignore */ }
    }

    async function syncRead() {
        if (!syncHandle) return;
        try {
            const fileHandle = await syncHandle.getFileHandle('hrf-sync.json');
            const file = await fileHandle.getFile();
            const text = await file.text();
            const data = JSON.parse(text);
            SYSTEM_KEYS.forEach(key => {
                if (data[key] !== undefined) localStorage.setItem(key, data[key]);
            });
            showToast('Sync data loaded.');
            setTimeout(() => window.location.reload(), 1200);
        } catch { /* no sync file yet */ }
    }

    function updateSyncStatus(connected) {
        if (syncStatus) {
            const icon = syncStatus.querySelector('i');
            if (icon) {
                icon.className = connected ? 'bi bi-circle-fill text-success' : 'bi bi-circle';
                syncStatus.title = connected ? 'Sync connected' : 'Sync disconnected';
            }
        }
    }

    (async () => {
        try {
            const stored = await getHandle();
            if (stored) {
                syncHandle = stored;
                updateSyncStatus(true);
                await syncRead();
            }
        } catch { /* no stored handle */ }
    })();

    syncBtn?.addEventListener('click', async () => {
        try {
            const handle = await window.showDirectoryPicker?.();
            if (!handle) return;
            syncHandle = handle;
            await saveHandle(handle);
            updateSyncStatus(true);
            await syncWrite();
            showToast('Sync folder connected.');
        } catch { showToast('Sync setup cancelled or failed.'); }
    });

    /* Debounced write on localStorage change */
    let syncTimer;
    const origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
        origSetItem(key, value);
        if (SYSTEM_KEYS.includes(key)) {
            clearTimeout(syncTimer);
            syncTimer = setTimeout(syncWrite, 500);
        }
    };

    /* Welcome toast */
    setTimeout(() => {
        toastMessage.textContent = `Welcome, ${fullName.split(' ')[0]}! Session active.`;
        toast.show();
    }, 600);
})();
