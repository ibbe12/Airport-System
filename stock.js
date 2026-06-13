/* =========================================
   HRF Airport System — Stock & Inventory
   Sidebar inspired by constgenius/SidebarMenu
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
    const sidebar = document.getElementById('stockSidebar');
    const toggleBtn = document.getElementById('toggleBtn');
    const searchIcon = document.querySelector('.search-icon');
    const logoutIcon = document.getElementById('logoutIcon');
    const logoutBtn = document.getElementById('logoutBtn');
    const themeToggle = document.getElementById('themeToggle');
    const successToastEl = document.getElementById('successToast');
    const toastMessage = document.getElementById('toastMessage');

    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const headline = document.getElementById('headline');
    const emptyTitle = document.getElementById('emptyTitle');
    const emptyText = document.getElementById('emptyText');
    const emptyIcon = document.querySelector('.page-empty-icon i');

    const toast = new bootstrap.Toast(successToastEl, {
        delay: 3000,
        animation: true,
    });

    /* ---------- Page content mapping ---------- */
    const PAGES = {
        dashboard: {
            title: 'Dashboard',
            emptyTitle: 'Stock & Inventory Dashboard',
            emptyText:
                'The Stock & Inventory overview will be built here. Track stock levels, manage suppliers and monitor inventory movements.',
            icon: 'bi-box-seam-fill',
        },
        products: {
            title: 'Stock',
            emptyTitle: 'Stock',
            emptyText:
                'Manage stock catalogue, categories, pricing and SKU tracking from this module.',
            icon: 'bi-box',
        },
        'stock-in': {
            title: 'Stock In',
            emptyTitle: 'Stock In',
            emptyText:
                'Receive incoming stock, record purchase orders and update inventory levels here.',
            icon: 'bi-download',
        },
        'stock-out': {
            title: 'Stock Out',
            emptyTitle: 'Stock Out',
            emptyText:
                'Process outgoing stock, shipments and dispatch orders from this module.',
            icon: 'bi-upload',
        },
        suppliers: {
            title: 'Suppliers',
            emptyTitle: 'Suppliers',
            emptyText:
                'Track supplier information, contracts and performance records.',
            icon: 'bi-truck',
        },
        assets: {
            title: 'Assets',
            emptyTitle: 'Assets',
            emptyText:
                'Manage company assets, equipment tracking and maintenance schedules from this module.',
            icon: 'bi-tools',
        },
        count: {
            title: 'Inventory Count',
            emptyTitle: 'Inventory Count',
            emptyText:
                'Perform stock takes, cycle counts and reconcile inventory discrepancies here.',
            icon: 'bi-clipboard-data',
        },
        reports: {
            title: 'Reports',
            emptyTitle: 'Reports',
            emptyText:
                'Generate and view stock movement reports, valuation summaries and audit trails.',
            icon: 'bi-bar-chart-line',
        },
        settings: {
            title: 'Settings',
            emptyTitle: 'Settings',
            emptyText:
                'Configure Stock & Inventory module preferences, thresholds and access controls.',
            icon: 'bi-gear',
        },
    };

    /* ---------- Populate user ---------- */
    const fullName = session.fullName || 'Demo User';
    const role = session.role || 'Stock Manager';
    const initials = fullName
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();

    document.querySelectorAll('.user-avatar').forEach(
        (el) => (el.textContent = initials || 'SM')
    );
    document.querySelectorAll('#userName, .name:not(.tooltip .name)').forEach(
        (el) => (el.textContent = fullName)
    );
    document.querySelectorAll('#userRole, .job').forEach(
        (el) => (el.textContent = role)
    );

    /* ---------- Sidebar collapse (constgenius pattern) ---------- */
    function toggleSidebar() {
        sidebar.classList.toggle('open');
        updateToggleIcon();
        // Close sidebar on mobile automatically not needed
    }

    function updateToggleIcon() {
        const open = sidebar.classList.contains('open');
        toggleBtn.className = open
            ? 'bi bi-list toggle-btn'
            : 'bi bi-list toggle-btn';
        // The CSS already handles rotation via transform: rotate(180deg)
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }

    /* Search icon also toggles sidebar (matches GitHub pattern) */
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            if (!sidebar.classList.contains('open')) toggleSidebar();
            else {
                const input = document.querySelector(
                    '.stock-sidebar input[type="text"]'
                );
                if (input) input.focus();
            }
        });
    }

    /* ---------- Nav items ---------- */
    const navLinks = document.querySelectorAll('.stock-sidebar li a[data-page]');
    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const key = link.dataset.page;
            const page = PAGES[key];
            if (!page) return;

            navLinks.forEach((l) => l.classList.remove('active'));
            link.classList.add('active');

            if (headline) headline.textContent = page.title;
            if (emptyTitle) emptyTitle.textContent = page.emptyTitle;
            if (emptyText) emptyText.textContent = page.emptyText;
            if (emptyIcon) {
                emptyIcon.className = 'bi ' + page.icon;
            }

            // Replay entrance
            const empty = document.querySelector('.page-empty');
            if (empty) {
                empty.style.animation = 'none';
                void empty.offsetHeight;
                empty.style.animation = '';
            }
        });
    });

    /* ---------- Dark mode ---------- */
    const storedTheme = localStorage.getItem('hrf-airport-theme');
    if (storedTheme) {
        document.documentElement.setAttribute('data-theme', storedTheme);
        if (storedTheme === 'dark') {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.classList.replace('bi-moon-stars-fill', 'bi-sun-fill');
            }
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('hrf-airport-theme', next);
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('bi-moon-stars-fill');
                icon.classList.toggle('bi-sun-fill');
            }
        });
    }

    /* ---------- User chip ---------- */
    const userChip = document.getElementById('userChip');
    if (userChip) {
        userChip.addEventListener('click', () => {
            toastMessage.textContent = 'Profile menu coming soon.';
            toast.show();
        });
    }

    /* ---------- Logout ---------- */
    function doLogout() {
        sessionStorage.removeItem('hrf-airport-session');
        window.location.href = 'index.html';
    }

    if (logoutIcon) logoutIcon.addEventListener('click', doLogout);
    if (logoutBtn) logoutBtn.addEventListener('click', doLogout);

    /* ---------- Backup / Restore / Sync ---------- */
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

    let syncTimer;
    const origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
        origSetItem(key, value);
        if (SYSTEM_KEYS.includes(key)) {
            clearTimeout(syncTimer);
            syncTimer = setTimeout(syncWrite, 500);
        }
    };
})();
