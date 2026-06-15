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
        calendar: {
            title: 'Calendar',
            emptyTitle: 'Calendar',
            emptyText:
                'View stock movements, deliveries, and inventory events on a calendar.',
            icon: 'bi-calendar3',
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

            var pageEmpty = document.querySelector('.page-empty');
            var pageCalendar = document.getElementById('pageCalendar');
            if (key === 'calendar') {
                if (pageEmpty) pageEmpty.style.display = 'none';
                if (pageCalendar) pageCalendar.style.display = '';
                var data = getStockData();
                if (data) renderStockCalendar(data); else renderStockCalendar({ items: [] });
            } else {
                if (pageCalendar) pageCalendar.style.display = 'none';
                if (pageEmpty) pageEmpty.style.display = 'block';
                if (emptyTitle) emptyTitle.textContent = page.emptyTitle;
                if (emptyText) emptyText.textContent = page.emptyText;
                if (emptyIcon) {
                    emptyIcon.className = 'bi ' + page.icon;
                }
                // Replay entrance
                if (pageEmpty) {
                    pageEmpty.style.animation = 'none';
                    void pageEmpty.offsetHeight;
                    pageEmpty.style.animation = '';
                }
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

    /* ========== STOCK CALENDAR ========== */

    var calCurrentDate = new Date();
    calCurrentDate.setDate(1);
    var calView = 'month';

    var CAL_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var CAL_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var CAL_DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var DOW_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    function getStockData() {
        try {
            var raw = localStorage.getItem('hrf-airport-stock');
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function renderStockCalendar(data) {
        var grid = document.querySelector('[data-calendar]');
        var header = document.querySelector('[data-nav-date]');
        if (!grid || !header) return;
        var items = (data && data.items) || [];
        if (calView === 'month') {
            miniCalDate = new Date(calCurrentDate);
        }
        renderMiniCalendar();
        if (calView === 'month') renderCalMonth(grid, header, items);
        else if (calView === 'week') renderCalWeek(grid, header, items);
        else if (calView === 'day') renderCalDay(grid, header, items);
    }

    function renderCalMonth(grid, header, items) {
        var year = calCurrentDate.getFullYear();
        var month = calCurrentDate.getMonth();
        header.textContent = CAL_FULL[month] + ' ' + year;

        var firstDay = new Date(year, month, 1).getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var startOffset = (firstDay + 6) % 7;
        var totalCells = startOffset + daysInMonth;
        var weeks = Math.ceil(totalCells / 7);

        var html = '<div class="month-calendar">';
        html += '<ul class="month-calendar__day-of-week-list">';
        ['Sat','Sun','Mon','Tue','Wed','Thu','Fri'].forEach(function(dn) {
            html += '<li class="month-calendar__day-of-week">' + dn + '</li>';
        });
        html += '</ul>';
        html += '<div class="month-calendar__day-list-wrapper"><ul class="month-calendar__day-list" style="grid-template-rows:repeat(' + weeks + ',1fr);">';
        for (var i = 0; i < startOffset; i++) {
            html += '<li class="month-calendar__day month-calendar__day--empty"></li>';
        }
        var today = new Date();
        for (var d = 1; d <= daysInMonth; d++) {
            var dayCls = 'month-calendar__day';
            if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) {
                dayCls += ' month-calendar__day--highlight';
            }
            html += '<li class="' + dayCls + '">';
            html += '<button class="month-calendar__day-label">' + d + '</button>';
            html += '</li>';
        }
        var remaining = weeks * 7 - startOffset - daysInMonth;
        for (var i = 0; i < remaining; i++) {
            html += '<li class="month-calendar__day month-calendar__day--empty"></li>';
        }
        html += '</ul></div></div>';
        grid.innerHTML = html;
    }

    function renderCalWeek(grid, header, items) {
        var year = calCurrentDate.getFullYear();
        var month = calCurrentDate.getMonth();
        header.textContent = CAL_FULL[month] + ' ' + year;

        var sat = new Date(calCurrentDate);
        sat.setHours(12, 0, 0, 0);

        var html = '<div class="week-calendar">';
        var today = new Date();
        html += '<ul class="week-calendar__day-of-week-list">';
        for (var i = 0; i < 7; i++) {
            var day = new Date(sat);
            day.setDate(sat.getDate() + i);
            var isToday = (day.getFullYear() === today.getFullYear() &&
                           day.getMonth() === today.getMonth() &&
                           day.getDate() === today.getDate());
            var dateStr = day.getDate();
            var dowName = DOW_SHORT[day.getDay()];
            html += '<li class="week-calendar__day-of-week-button' + (isToday ? ' week-calendar__day-of-week-button--highlight' : '') + '">' +
                '<span class="dow">' + dowName + '</span>' +
                '<span class="dom">' + dateStr + '</span></li>';
        }
        html += '</ul>';
        html += '<ul class="week-calendar__all-day-list"></ul>';
        html += '<div class="week-calendar__content"><div class="week-calendar__content-inner">';
        html += '<div class="week-calendar__columns">';
        for (var i = 0; i < 7; i++) {
            html += '<div class="week-calendar__column"></div>';
        }
        html += '</div></div></div></div>';
        grid.innerHTML = html;
    }

    function renderCalDay(grid, header, items) {
        var year = calCurrentDate.getFullYear();
        var month = calCurrentDate.getMonth();
        var dayNum = calCurrentDate.getDate();
        var dayDate = new Date(year, month, dayNum, 12, 0, 0);
        var dowName = CAL_DOW[dayDate.getDay()];
        header.textContent = dowName + ', ' + dayNum + ' ' + CAL_FULL[month] + ' ' + year;

        var html = '<div class="cal-day-view">';
        html += '<div class="cal-day-header">' + header.textContent + '</div>';
        html += '<div class="cal-day-list">';
        html += '<div style="color:var(--gray-text,#888);font-size:0.85rem;padding:12px 0;">No items on this day.</div>';
        html += '</div></div>';
        grid.innerHTML = html;
    }

    /* Mini calendar */
    var miniCalDate = new Date();
    miniCalDate.setDate(1);

    function renderMiniCalendar() {
        var miniDate = document.querySelector('[data-mini-calendar-date]');
        var grid = document.querySelector('[data-mini-calendar-day-list]');
        if (!miniDate || !grid) return;
        var year = miniCalDate.getFullYear();
        var month = miniCalDate.getMonth();
        miniDate.textContent = CAL_FULL[month] + ' ' + year;

        var firstDay = new Date(year, month, 1).getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var startOffset = (firstDay + 6) % 7;
        var today = new Date();
        var html = '';
        for (var i = 0; i < startOffset; i++) {
            html += '<li class="mini-calendar__day-list-item"><button class="mini-calendar__day mini-calendar__day--other"></button></li>';
        }
        for (var d = 1; d <= daysInMonth; d++) {
            var cls = 'mini-calendar__day';
            if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) cls += ' mini-calendar__day--highlight';
            if (year === calCurrentDate.getFullYear() && month === calCurrentDate.getMonth() && d === calCurrentDate.getDate()) cls += ' mini-calendar__day--selected';
            html += '<li class="mini-calendar__day-list-item"><button class="' + cls + '" data-m="' + month + '" data-d="' + d + '">' + d + '</button></li>';
        }
        var totalCells = startOffset + daysInMonth;
        var remaining = (7 - (totalCells % 7)) % 7;
        for (var i = 1; i <= remaining; i++) {
            html += '<li class="mini-calendar__day-list-item"><button class="mini-calendar__day mini-calendar__day--other" data-m="' + ((month + 1) % 12) + '" data-d="' + i + '">' + i + '</button></li>';
        }
        grid.innerHTML = html;
    }

    /* Mini calendar click delegation */
    document.addEventListener('click', function(e) {
        var dayEl = e.target.closest('.mini-calendar__day');
        if (!dayEl) return;
        var m = parseInt(dayEl.getAttribute('data-m'), 10);
        var d = parseInt(dayEl.getAttribute('data-d'), 10);
        if (isNaN(m) || isNaN(d)) return;
        var year = miniCalDate.getFullYear();
        var targetMonth = m;
        var targetYear = year;
        if (m === 11 && miniCalDate.getMonth() === 0) { targetYear = year - 1; }
        else if (m === 0 && miniCalDate.getMonth() === 11) { targetYear = year + 1; }
        if (calView === 'month') {
            calCurrentDate = new Date(targetYear, targetMonth, 1);
        } else if (calView === 'week') {
            var clicked = new Date(targetYear, targetMonth, d);
            clicked.setDate(clicked.getDate() - ((clicked.getDay() + 1) % 7));
            calCurrentDate = clicked;
        } else {
            calCurrentDate = new Date(targetYear, targetMonth, d);
        }
        miniCalDate = new Date(targetYear, targetMonth, 1);
        var data = getStockData();
        if (data) renderStockCalendar(data); else renderStockCalendar({ items: [] });
    });

    /* Mini calendar prev/next */
    document.addEventListener('click', function(e) {
        if (e.target.closest('[data-mini-calendar-previous-button]')) {
            miniCalDate.setMonth(miniCalDate.getMonth() - 1);
            renderMiniCalendar();
        }
        if (e.target.closest('[data-mini-calendar-next-button]')) {
            miniCalDate.setMonth(miniCalDate.getMonth() + 1);
            renderMiniCalendar();
        }
    });

    /* Navigation */
    document.addEventListener('click', function(e) {
        if (e.target.closest('[data-nav-previous-button]')) {
            if (calView === 'month') calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
            else if (calView === 'week') calCurrentDate.setDate(calCurrentDate.getDate() - 7);
            else calCurrentDate.setDate(calCurrentDate.getDate() - 1);
            var data = getStockData();
            if (data) renderStockCalendar(data); else renderStockCalendar({ items: [] });
        }
        if (e.target.closest('[data-nav-next-button]')) {
            if (calView === 'month') calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
            else if (calView === 'week') calCurrentDate.setDate(calCurrentDate.getDate() + 7);
            else calCurrentDate.setDate(calCurrentDate.getDate() + 1);
            var data = getStockData();
            if (data) renderStockCalendar(data); else renderStockCalendar({ items: [] });
        }
        if (e.target.closest('[data-nav-today-button]')) {
            var now = new Date();
            if (calView === 'month') {
                calCurrentDate = new Date(now.getFullYear(), now.getMonth(), 1);
            } else if (calView === 'week') {
                calCurrentDate = new Date(now);
                calCurrentDate.setDate(now.getDate() - ((now.getDay() + 1) % 7));
            } else {
                calCurrentDate = new Date(now);
            }
            miniCalDate = new Date(now.getFullYear(), now.getMonth(), 1);
            var data = getStockData();
            if (data) renderStockCalendar(data); else renderStockCalendar({ items: [] });
        }
    });

    /* View switcher */
    document.addEventListener('change', function(e) {
        var sel = e.target.closest('[data-view-select]');
        if (!sel) return;
        calView = sel.value;
        var now = new Date();
        if (calView === 'month') {
            calCurrentDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (calView === 'week') {
            calCurrentDate = new Date(now);
            calCurrentDate.setDate(now.getDate() - ((now.getDay() + 1) % 7));
        } else {
            calCurrentDate = new Date(now);
        }
        miniCalDate = new Date(now.getFullYear(), now.getMonth(), 1);
        var data = getStockData();
        if (data) renderStockCalendar(data); else renderStockCalendar({ items: [] });
    });
})();
