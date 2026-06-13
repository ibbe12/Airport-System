/* =========================================
   HRF Airport System — HR System
   Dark sidebar (constgenius/SidebarMenu pattern)
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
    const sidebar = document.getElementById('hrSidebar');

    /* Apply stored theme on load */
    const storedTheme = localStorage.getItem('hrf-airport-theme');
    if (storedTheme) {
        document.documentElement.setAttribute('data-theme', storedTheme);
    }
    /* Sync topbar icon to current theme */
    const topbarThemeIcon = document.querySelector('#themeToggle i');
    if (topbarThemeIcon) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        topbarThemeIcon.className = isDark ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
    }
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
    const hrSubnav = document.getElementById('hrSubnav');
    const subnavItems = document.querySelectorAll('.hr-subnav-item');

    const empSubnav = document.getElementById('empSubnav');
    const empSection = document.getElementById('empSection');
    const empNavItems = empSubnav ? empSubnav.querySelectorAll('.hr-subnav-item') : [];
    const empContentItems = document.querySelectorAll('.emp-content');

    const leaveSubnav = document.getElementById('leaveSubnav');
    const leaveNavItems = leaveSubnav ? leaveSubnav.querySelectorAll('.leave-subnav-item') : [];
    const leaveContentItems = document.querySelectorAll('.leave-content');

    /* ---------- localStorage ---------- */
    const LS_KEY_DIR = 'hrf-emp-directory';
    const LS_KEY_ONB = 'hrf-emp-onboarding';

    function fmtDMY(d) {
        return String(d.getDate()).padStart(2,'0') + '.' + String(d.getMonth()+1).padStart(2,'0') + '.' + d.getFullYear();
    }

    function normalizeDate(val) {
        if (!val) return '';
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(val)) return val;
        var parts = val.split(' ');
        if (parts.length === 3 && /^\d{1,2}$/.test(parts[0]) && /^[A-Za-z]{3}$/.test(parts[1]) && /^\d{4}$/.test(parts[2])) {
            var months = {Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12'};
            return String(parts[0]).padStart(2,'0') + '.' + (months[parts[1]]||'01') + '.' + parts[2];
        }
        var d = new Date(val);
        if (!isNaN(d)) return fmtDMY(d);
        return val;
    }

    function lsSave(key, data) {
        try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
    }

    function lsLoad(key, def) {
        try { return JSON.parse(localStorage.getItem(key)) || def; } catch (e) { return def; }
    }

    function loadDirectoryFromStorage() {
        const tbody = document.querySelector('.emp-table tbody');
        if (!tbody) return;
        const employees = lsLoad(LS_KEY_DIR, []);
        if (!employees.length) return;
        tbody.innerHTML = '';
        employees.forEach((emp) => {
            const tr = document.createElement('tr');
            const hasPhoto = emp.photo && emp.photo.startsWith('data:');
            tr.innerHTML =
                '<td><div class="emp-cell-user">' +
                (hasPhoto
                    ? '<img src="' + emp.photo + '" class="emp-avatar-img" alt="' + emp.name + '" />'
                    : '<span class="emp-avatar" style="background:' +
                      (emp.color || emp.avatarColor || '#895129') +
                      ';">' +
                      (emp.name && (emp.initials || '').match(/^(SN|EMP)-/) ? emp.name.split(' ').map(function(w){return w[0]}).join('').toUpperCase().slice(0,2) : (emp.initials || emp.avatarInitials || '--')) +
                      '</span>') +
                '<div><strong>' +
                emp.name +
                '</strong><span>' +
                (emp.sn || emp.empId) +
                '</span></div></div></td><td>' +
                (emp.department || '') +
                '</td><td>' +
                (emp.position || '') +
                '</td><td><span class="emp-badge ' +
                (emp.status === 'Active' ? 'emp-active' : 'emp-inactive') +
                '">' +
                (emp.status || 'Active') +
                '</span></td><td>' +
                (normalizeDate(emp.joined) || '') +
                '</td><td><div class="emp-actions"><i class="bi bi-three-dots-vertical emp-more"></i><div class="emp-dropdown"><a href="#" class="emp-dropdown-item emp-edit"><i class="bi bi-pencil"></i> Edit</a><a href="#" class="emp-dropdown-item emp-delete"><i class="bi bi-trash"></i> Delete</a></div></div></td>';
            if (emp.sn !== undefined) tr.setAttribute('data-sn', emp.sn || '');
            if (emp.dob !== undefined) tr.setAttribute('data-dob', emp.dob || '');
            if (emp.joinedRaw !== undefined) tr.setAttribute('data-joined', emp.joinedRaw || '');
            if (emp.email !== undefined) tr.setAttribute('data-email', emp.email || '');
            if (emp.mobile !== undefined) tr.setAttribute('data-mobile', emp.mobile || '');
            if (emp.emergency !== undefined) tr.setAttribute('data-emergency', emp.emergency || '');
            if (emp.nic !== undefined) tr.setAttribute('data-nic', emp.nic || '');
            if (emp.gender !== undefined) tr.setAttribute('data-gender', emp.gender || '');
            if (emp.marital !== undefined) tr.setAttribute('data-marital', emp.marital || '');
            if (emp.permanentAddress !== undefined) tr.setAttribute('data-permanent-address', emp.permanentAddress || '');
            if (emp.presentAddress !== undefined) tr.setAttribute('data-present-address', emp.presentAddress || '');
            if (emp.salary !== undefined) tr.setAttribute('data-salary', emp.salary || '');
            tbody.appendChild(tr);
        });

        /* Fix any corrupted data where SN was written into initials */
        var needsFix = false;
        employees.forEach(function(emp) {
            var init = emp.initials || '';
            if (emp.name && (init.match(/^(SN|EMP)-/) || init.length > 2)) {
                emp.initials = emp.name.split(' ').map(function(w){return w[0]}).join('').toUpperCase().slice(0, 2);
                needsFix = true;
            }
        });
        if (needsFix) lsSave(LS_KEY_DIR, employees);

        try { applyFilters(); } catch (e) {}
    }

    function saveDirectoryToStorage() {
        const tbody = document.querySelector('.emp-table tbody');
        if (!tbody) return;
        const employees = [];
        tbody.querySelectorAll('tr').forEach((tr) => {
            const cells = tr.querySelectorAll('td');
            if (cells.length < 5) return;
            const img = cells[0].querySelector('.emp-avatar-img');
            const avatar = cells[0].querySelector('.emp-avatar');
            const strong = cells[0].querySelector('strong');
            const span = cells[0].querySelector('div span');
            const dept = cells[1];
            const pos = cells[2];
            const badge = cells[3].querySelector('.emp-badge');
            const joined = cells[4];
            const emp = {
                name: strong ? strong.textContent : '',
                empId: span ? span.textContent : '',
                department: dept ? dept.textContent : '',
                position: pos ? pos.textContent : '',
                status: badge ? badge.textContent : 'Active',
                joined: joined ? joined.textContent : '',
                sn: tr.getAttribute('data-sn') || '',
                dob: tr.getAttribute('data-dob') || '',
                joinedRaw: tr.getAttribute('data-joined') || '',
                mobile: tr.getAttribute('data-mobile') || '',
                email: tr.getAttribute('data-email') || '',
                emergency: tr.getAttribute('data-emergency') || '',
                nic: tr.getAttribute('data-nic') || '',
                gender: tr.getAttribute('data-gender') || '',
                marital: tr.getAttribute('data-marital') || '',
                permanentAddress: tr.getAttribute('data-permanent-address') || '',
                presentAddress: tr.getAttribute('data-present-address') || '',
                salary: tr.getAttribute('data-salary') || '',
            };
            if (img) {
                emp.photo = img.src;
            }
            if (avatar) {
                emp.initials = avatar.textContent;
                emp.color = avatar.style.backgroundColor || '#895129';
            }
            employees.push(emp);
        });
        lsSave(LS_KEY_DIR, employees);
    }

    function loadOnboardingFromStorage() {
        const boardList = document.querySelector('.emp-board-list');
        if (!boardList) return;
        const list = lsLoad(LS_KEY_ONB, []);
        if (!list.length) return;
        boardList.innerHTML = '';
        list.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'emp-board-card';
            card.innerHTML =
                '<div class="emp-board-top"><span class="emp-avatar-sm" style="background:' +
                item.color +
                ';">' +
                item.initials +
                '</span><div><strong>' +
                item.name +
                '</strong><span>' +
                item.position +
                ' — Starts ' +
                item.startLabel +
                '</span></div></div>' +
                '<div class="emp-board-progress"><div class="emp-board-bar" style="width:' +
                item.progress +
                '%"></div></div>' +
                '<div class="emp-board-info"><span>' +
                item.progress +
                '% complete</span><span>' +
                item.tasksDone +
                ' of 9 tasks done</span></div>';
            boardList.appendChild(card);
        });
    }

    function saveOnboardingToStorage() {
        const boardList = document.querySelector('.emp-board-list');
        if (!boardList) return;
        const list = [];
        boardList.querySelectorAll('.emp-board-card').forEach((card) => {
            const avatar = card.querySelector('.emp-avatar-sm');
            const strong = card.querySelector('.emp-board-top div strong');
            const span = card.querySelector('.emp-board-top div span');
            const bar = card.querySelector('.emp-board-bar');
            const info = card.querySelectorAll('.emp-board-info span');
            list.push({
                name: strong ? strong.textContent : '',
                initials: avatar ? avatar.textContent : '',
                color: avatar ? avatar.style.backgroundColor : '#895129',
                position: span ? span.textContent.split(' — ')[0] : '',
                startLabel: span ? (span.textContent.split(' — ')[1] || '') : '',
                progress: bar ? parseInt(bar.style.width) || 0 : 0,
                tasksDone: info[1] ? parseInt(info[1].textContent) || 0 : 0,
            });
        });
        lsSave(LS_KEY_ONB, list);
    }

    /* Load persisted data after DOM is ready */
    loadDirectoryFromStorage();
    loadOnboardingFromStorage();

    const toast = new bootstrap.Toast(successToastEl, {
        delay: 3000,
        animation: true,
    });

    /* ---------- Page content mapping ---------- */
    const PAGES = {
        dashboard: {
            title: 'Dashboard',
            emptyTitle: 'HR Dashboard',
            emptyText:
                'The HR Dashboard overview will be built here. Key metrics, recent hires and attendance summaries will live in this area.',
            icon: 'bi-people-fill',
        },
        employees: {
            title: 'Employees',
            emptyTitle: 'Employees',
            emptyText:
                'Manage employee records, contracts, documents and personal information in this module.',
            icon: 'bi-people-fill',
        },
        attendance: {
            title: 'Time & Attendance',
            emptyTitle: 'Time & Attendance',
            emptyText:
                'Track shifts, clock-ins, overtime and attendance reports from this module.',
            icon: 'bi-clock-history',
        },
        leave: {
            title: 'Leave Management',
            emptyTitle: 'Leave Management',
            emptyText:
                'Approve or review leave requests, manage leave balances and configure leave types here.',
            icon: 'bi-calendar2-week',
        },
        payroll: {
            title: 'Payroll Management',
            emptyTitle: 'Payroll Management',
            emptyText:
                'Process payroll, manage salary structures, tax deductions, and generate payslips for all employees.',
            icon: 'bi-wallet2',
        },
        performance: {
            title: 'Performance Management',
            emptyTitle: 'Performance Management',
            emptyText:
                'Set goals, conduct performance reviews, track KPIs, and manage employee development plans.',
            icon: 'bi-star',
        },
        learning: {
            title: 'Learning & Development',
            emptyTitle: 'Learning & Development',
            emptyText:
                'Manage training programs, course catalogs, certifications, and track employee skill development.',
            icon: 'bi-book',
        },
        engagement: {
            title: 'Employee Engagement',
            emptyTitle: 'Employee Engagement',
            emptyText:
                'Run surveys, track satisfaction scores, manage recognition programs, and foster workplace culture.',
            icon: 'bi-emoji-smile',
        },
        compliance: {
            title: 'Compliance & Employee Relations',
            emptyTitle: 'Compliance & Employee Relations',
            emptyText:
                'Manage policy acknowledgments, incident reports, investigations, and regulatory compliance records.',
            icon: 'bi-shield-check',
        },
        safety: {
            title: 'Health, Safety & Wellbeing',
            emptyTitle: 'Health, Safety & Wellbeing',
            emptyText:
                'Track workplace incidents, manage safety training, wellbeing programs, and occupational health records.',
            icon: 'bi-heart-pulse',
        },
        reports: {
            title: 'Reports & Analytics',
            emptyTitle: 'Reports & Analytics',
            emptyText:
                'Generate HR reports, visualize workforce analytics, and export data for strategic decision-making.',
            icon: 'bi-bar-chart',
        },
        workflow: {
            title: 'Workflow & Approvals',
            emptyTitle: 'Workflow & Approvals',
            emptyText:
                'Configure approval chains, automate HR workflows, and track pending requests across departments.',
            icon: 'bi-diagram-3',
        },
        documents: {
            title: 'Document Management',
            emptyTitle: 'Document Management',
            emptyText:
                'Store, organise, and manage HR documents, contracts, policies, and employee file records.',
            icon: 'bi-folder',
        },
        leave: {
            title: 'Leave Management',
            emptyTitle: 'Leave Management',
            emptyText:
                'Manage leave requests, approvals, balances, and reports.',
            icon: 'bi-calendar2-week',
        },
        settings: {
            title: 'Settings',
            emptyTitle: 'Settings',
            emptyText:
                'Configure HR module preferences, policies, departments and access controls here.',
            icon: 'bi-gear',
        },
    };

    /* ---------- Populate user ---------- */
    const fullName = session.fullName || 'Demo User';
    const role = session.role || 'HR Manager';
    const initials = fullName
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();

    document.querySelectorAll('.user-avatar').forEach(
        (el) => (el.textContent = initials || 'HR')
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
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }

    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            if (!sidebar.classList.contains('open')) toggleSidebar();
            else {
                const input = document.querySelector(
                    '.hr-sidebar input[type="text"]'
                );
                if (input) input.focus();
            }
        });
    }

    /* ---------- Nav items ---------- */
    function hideAllContent() {
        if (kpiSection) kpiSection.style.display = 'none';
        if (leaveSection) leaveSection.style.display = 'none';
        if (leaveSubnav) leaveSubnav.style.display = 'none';
        if (settingsSection) settingsSection.style.display = 'none';
        if (empSection) empSection.style.display = 'none';
    }

    const navLinks = document.querySelectorAll('.hr-sidebar li a[data-page]');
    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const key = link.dataset.page;
            const page = PAGES[key];
            if (!page) return;

            navLinks.forEach((l) => l.classList.remove('active'));
            link.classList.add('active');

            if (headline) headline.textContent = page.title;

            /* Sub-nav visibility */
            const showDash = key === 'dashboard';
            const showEmp = key === 'employees';

            if (hrSubnav) hrSubnav.classList.toggle('hidden', !showDash);
            if (empSubnav) empSubnav.style.display = showEmp ? '' : 'none';

            if (showDash) {
                hideAllContent();
                const activeSub = document.querySelector('#hrSubnav .hr-subnav-item.active');
                if (activeSub && activeSub.dataset.sub === 'workforce') {
                    showWorkforce();
                } else if (activeSub && activeSub.dataset.sub === 'leave') {
                    showLeaveDashboard();
                } else {
                    showEmpty(page);
                    if (pageEmpty) pageEmpty.style.display = '';
                }
            } else if (key === 'leave') {
                showFullLeaveSection();
            } else if (key === 'settings') {
                hideAllContent();
                if (hrSubnav) hrSubnav.classList.toggle('hidden', true);
                if (empSubnav) empSubnav.style.display = 'none';
                if (pageEmpty) pageEmpty.style.display = 'none';
                if (settingsSection) settingsSection.style.display = 'block';
                loadSettings();
            } else if (key === 'employees') {
                hideAllContent();
                if (empSection) empSection.style.display = 'block';
                if (pageEmpty) pageEmpty.style.display = 'none';
                showEmpContent('directory');
            } else {
                hideAllContent();
                if (empSection) empSection.style.display = 'none';
                if (pageEmpty) pageEmpty.style.display = 'block';
                if (emptyTitle) emptyTitle.textContent = page.emptyTitle;
                if (emptyText) emptyText.textContent = page.emptyText;
                if (emptyIcon) emptyIcon.className = 'bi ' + page.icon;
            }

            const empty = document.querySelector('.page-empty');
            if (empty) {
                empty.style.animation = 'none';
                void empty.offsetHeight;
                empty.style.animation = '';
            }
        });
    });

    /* ---------- Sub-nav items ---------- */
    const pageEmpty = document.getElementById('pageEmpty');
    const kpiSection = document.getElementById('kpiSection');
    const leaveSection = document.getElementById('leaveSection');
    const settingsSection = document.getElementById('settingsSection');
    const leaveSubnavItem = document.querySelector('#hrSubnav a[data-sub="leave"]');

    let chartBuilt = false;
    let leaveChartBuilt = false;

    function showWorkforce() {
        if (!chartBuilt && typeof Chart !== 'undefined') {
            buildWorkforceCharts();
            chartBuilt = true;
        }
        if (pageEmpty) pageEmpty.style.display = 'none';
        if (kpiSection) kpiSection.style.display = 'block';
    }

    function buildWorkforceCharts() {
        var emps = getEmployees();
        /* Compute departments from real employees */
        var deptMap = {};
        emps.forEach(function(e) { var d = e.department || 'Unknown'; deptMap[d] = (deptMap[d] || 0) + 1; });
        var deptNames = Object.keys(deptMap);
        var headcounts = deptNames.map(function(d) { return deptMap[d]; });
        const colorPalette = ['#895129','#ffc107','#d68a3c','#f9e076','#b86b2e','#c97d35','#e8b84b','#a05e24','#c47a35','#e8a84b'];

        /* Department donut */
        const deptCtx = document.getElementById('deptChart');
        if (deptCtx) {
            new Chart(deptCtx, {
                type: 'doughnut',
                data: {
                    labels: deptNames,
                    datasets: [{
                        data: headcounts,
                        backgroundColor: deptNames.map(function(_, i) { return colorPalette[i % colorPalette.length]; }),
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    cutout: '70%'
                }
            });
            const deptCountEl = document.getElementById('deptCount');
            if (deptCountEl) deptCountEl.textContent = deptNames.length + ' Departments';
        }

        /* Populate department summary table */
        renderDeptSummary(emps);
        const growthCtx = document.getElementById('growthChart');
        if (growthCtx) {
            new Chart(growthCtx, {
                type: 'line',
                data: {
                    labels: ['Jan','Feb','Mar','Apr','May','Jun'],
                    datasets: [{
                        label: 'New Hires',
                        data: [12, 18, 9, 22, 15, 8],
                        borderColor: '#895129',
                        backgroundColor: 'rgba(137,81,41,0.08)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#895129',
                        pointBorderWidth: 3,
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
                        y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#9ca3af' } }
                    }
                }
            });
        }

        /* Stats bar chart (retention by year) */
        const statsCtx = document.getElementById('statsBarChart');
        if (statsCtx) {
            new Chart(statsCtx, {
                type: 'bar',
                data: {
                    labels: ['2022','2023','2024','2025','2026'],
                    datasets: [{
                        label: 'Retention %',
                        data: [78, 81, 84, 86, 87.6],
                        backgroundColor: ['#895129','#d68a3c','#f9e076','#ffc107','#b86b2e'],
                        borderRadius: 4,
                        barPercentage: 0.6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
                        y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#9ca3af' }, beginAtZero: true }
                    }
                }
            });
        }

        /* Gender ratio pie */
        const genderCtx = document.getElementById('genderChart');
        if (genderCtx) {
            var males = emps.filter(function(e) { return e.gender === 'Male'; }).length;
            var females = emps.filter(function(e) { return e.gender === 'Female'; }).length;
            new Chart(genderCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Male', 'Female'],
                    datasets: [{
                        data: [males || 1, females || 1],
                        backgroundColor: ['#895129', '#ffc107'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    cutout: '60%'
                }
            });
        }
    }

    function showLeaveDashboard() {
        if (!leaveChartBuilt && typeof Chart !== 'undefined') {
            buildLeaveCharts();
            leaveChartBuilt = true;
        }
        if (pageEmpty) pageEmpty.style.display = 'none';
        if (kpiSection) kpiSection.style.display = 'none';
        if (leaveSection) leaveSection.style.display = 'block';
    }

    function showLeaveContent(key) {
        leaveContentItems.forEach(function (c) {
            c.style.display = c.dataset.leave === key ? '' : 'none';
        });
    }

    function showFullLeaveSection() {
        hideAllContent();
        if (hrSubnav) hrSubnav.classList.toggle('hidden', true);
        if (empSubnav) empSubnav.style.display = 'none';
        if (pageEmpty) pageEmpty.style.display = 'none';
        if (leaveSection) leaveSection.style.display = 'block';
        if (leaveSubnav) leaveSubnav.style.display = '';
        var first = leaveNavItems[0];
        if (first) {
            leaveNavItems.forEach(function (n) { n.classList.remove('active'); });
            first.classList.add('active');
            showLeaveContent(first.dataset.leave);
        }
    }

    function buildLeaveCharts() {
        var data = getLeaveData() || { requests: [] };
        /* Leave type donut */
        const typeCtx = document.getElementById('leaveTypeChart');
        if (typeCtx) {
            var ltypes = ['Annual Leave','FRL','Sick Leave Medical','Sick Leave','Circumcision Leave','Paternity Leave','Maternity Leave','No Pay Leave','Umrah Leave','Hajj Leave'];
            var counts = {};
            ltypes.forEach(function(t) { counts[t] = 0; });
            data.requests.forEach(function(r) {
                if (counts[r.type] !== undefined) counts[r.type]++;
            });
            var chartData = ltypes.map(function(t) { return counts[t] || 1; });
            new Chart(typeCtx, {
                type: 'doughnut',
                data: {
                    labels: ltypes,
                    datasets: [{
                        data: chartData,
                        backgroundColor: ['#895129','#ffc107','#d68a3c','#f9e076','#b86b2e'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    cutout: '70%'
                }
            });
        }

        /* Monthly leave trends bar */
        const trendCtx = document.getElementById('leaveTrendChart');
        if (trendCtx) {
            var monthly = [0,0,0,0,0,0,0,0,0,0,0,0];
            data.requests.forEach(function() {
                monthly[Math.floor(Math.random() * 12)]++;
            });
            new Chart(trendCtx, {
                type: 'bar',
                data: {
                    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
                    datasets: [{
                        label: 'Requests',
                        data: monthly,
                        backgroundColor: '#895129',
                        borderRadius: 4,
                        barPercentage: 0.5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
                        y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#9ca3af' }, beginAtZero: true }
                    }
                }
            });
        }
    }

    function showEmpty(page) {
        if (kpiSection) kpiSection.style.display = 'none';
        if (pageEmpty) {
            pageEmpty.style.display = 'block';
            if (emptyTitle) emptyTitle.textContent = page.emptyTitle;
            if (emptyText) emptyText.textContent = page.emptyText;
            if (emptyIcon) emptyIcon.className = 'bi ' + page.icon;
        }
    }

    subnavItems.forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            subnavItems.forEach((s) => s.classList.remove('active'));
            item.classList.add('active');

            const sub = item.dataset.sub;
            if (sub === 'workforce') {
                showWorkforce();
            } else if (sub === 'leave') {
                showLeaveDashboard();
            } else {
                const page = PAGES['dashboard'];
                showEmpty(page);
            }

            const empty = document.querySelector('.page-empty');
            if (empty) {
                empty.style.animation = 'none';
                void empty.offsetHeight;
                empty.style.animation = '';
            }
        });
    });

    /* ---------- Employee Sub-nav items ---------- */
    function showEmpContent(key) {
        empContentItems.forEach((c) => {
            c.style.display = c.dataset.emp === key ? '' : 'none';
        });
    }

    function renderProfiles() {
        const grid = document.getElementById('profilesGrid');
        if (!grid) return;
        const tbody = document.querySelector('.emp-table tbody');
        if (!tbody) { grid.innerHTML = ''; return; }
        const rows = tbody.querySelectorAll('tr');
        if (!rows.length) { grid.innerHTML = ''; return; }
        let html = '';
        rows.forEach((tr) => {
            const cells = tr.querySelectorAll('td');
            if (cells.length < 5) return;
            const strong = cells[0].querySelector('strong');
            const idSpan = cells[0].querySelector('div span');
            const img = cells[0].querySelector('.emp-avatar-img');
            const avatar = cells[0].querySelector('.emp-avatar');
            const name = strong ? strong.textContent : '';
            const empId = idSpan ? idSpan.textContent : '';
            const dept = cells[1] ? cells[1].textContent : '';
            const position = cells[2] ? cells[2].textContent : '';
            const statusEl = cells[3] ? cells[3].querySelector('.emp-badge') : null;
            const status = statusEl ? statusEl.textContent : 'Active';
            const joined = normalizeDate(cells[4] ? cells[4].textContent : '');
            const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            const colors = ['#895129','#ffc107','#d68a3c','#b86b2e','#a05e24','#c97d35'];
            const colorIdx = rows.length ? Array.from(rows).indexOf(tr) % colors.length : 0;

            const sn = tr.getAttribute('data-sn') || '—';
            const dob = tr.getAttribute('data-dob') || '—';
            const mobile = tr.getAttribute('data-mobile') || '—';
            const email = tr.getAttribute('data-email') || '—';
            const emergency = tr.getAttribute('data-emergency') || '—';
            const nic = tr.getAttribute('data-nic') || '—';
            const gender = tr.getAttribute('data-gender') || '—';
            const marital = tr.getAttribute('data-marital') || '—';
            const permanentAddress = tr.getAttribute('data-permanent-address') || '—';
            const presentAddress = tr.getAttribute('data-present-address') || '—';
            const salary = tr.getAttribute('data-salary') || '—';

            const avatarHtml = img
                ? '<img src="' + img.src + '" class="emp-profile-avatar-img" alt="' + name + '" />'
                : '<div class="emp-profile-avatar" style="background:' + colors[colorIdx] + ';">' + initials + '</div>';

            html +=
                '<div class="emp-profile-card">' +
                avatarHtml +
                '<h4>' + name + '</h4>' +
                '<span class="emp-profile-role">' + position + '</span>' +
                '<div class="emp-profile-details">' +
                '<span><i class="bi bi-person-badge"></i> ' + sn + '</span>' +
                '<span><i class="bi bi-briefcase"></i> ' + dept + '</span>' +
                '<span><i class="bi bi-calendar3"></i> DOB: ' + dob + '</span>' +
                '<span><i class="bi bi-phone"></i> ' + mobile + '</span>' +
                '<span><i class="bi bi-envelope"></i> ' + email + '</span>' +
                '<span><i class="bi bi-telephone"></i> Emergency: ' + emergency + '</span>' +
                '<span><i class="bi bi-card-text"></i> NIC: ' + nic + '</span>' +
                '<span><i class="bi bi-gender-ambiguous"></i> ' + gender + '</span>' +
                '<span><i class="bi bi-heart"></i> ' + marital + '</span>' +
                '<span><i class="bi bi-geo-alt"></i> Permanent: ' + permanentAddress + '</span>' +
                '<span><i class="bi bi-house-door"></i> Present: ' + presentAddress + '</span>' +
                '<span><i class="bi bi-calendar-check"></i> Joined: ' + joined + '</span>' +
                '<span><i class="bi bi-flag"></i> ' + status + '</span>' +
                '<span><i class="bi bi-cash"></i> Salary: ' + salary + '</span>' +
                '</div></div>';
        });
        grid.innerHTML = html;
    }

    /* ---------- Leave Sub-nav items ---------- */
    if (leaveNavItems.length) {
        leaveNavItems.forEach(function (item) {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                leaveNavItems.forEach(function (s) { s.classList.remove('active'); });
                item.classList.add('active');
                var key = item.dataset.leave;
                if (key) showLeaveContent(key);
            });
        });
    }

    empNavItems.forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            empNavItems.forEach((s) => s.classList.remove('active'));
            item.classList.add('active');
            const key = item.dataset.emp;
            if (key) {
                showEmpContent(key);
                if (key === 'profiles') renderProfiles();
            }
            if (pageEmpty) pageEmpty.style.display = 'none';
            if (kpiSection) kpiSection.style.display = 'none';
            if (empSection) empSection.style.display = 'block';
        });
    });

    /* ---------- New Onboarding ---------- */
    const newOnboardingBtn = document.getElementById('newOnboardingBtn');
    const onboardingModal = document.getElementById('onboardingModal');
    const saveOnboardingBtn = document.getElementById('saveOnboardingBtn');
    const onboardingForm = document.getElementById('onboardingForm');
    const boardList = document.querySelector('.emp-board-list');
    let onboardingBsModal = null;

    if (onboardingModal) {
        onboardingBsModal = new bootstrap.Modal(onboardingModal);
    }

    if (newOnboardingBtn) {
        newOnboardingBtn.addEventListener('click', () => {
            if (onboardingBsModal) onboardingBsModal.show();
        });
    }

    if (saveOnboardingBtn) {
        saveOnboardingBtn.addEventListener('click', () => {
            const name = document.getElementById('onbName').value.trim();
            const position = document.getElementById('onbDesignation') ? document.getElementById('onbDesignation').value : '';
            const dept = document.getElementById('onbDept').value;
            const date = document.getElementById('onbDate').value;
            if (!name || !position || !date) return;

            const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            const colors = ['#895129', '#ffc107', '#d68a3c', '#b86b2e', '#a05e24', '#c47a35'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const startLabel = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            /* Add to onboarding cards */
            const card = document.createElement('div');
            card.className = 'emp-board-card';
            card.style.animation = 'fadeIn 0.3s ease';
            card.innerHTML =
                '<div class="emp-board-top"><span class="emp-avatar-sm" style="background:' +
                color +
                ';">' +
                initials +
                '</span><div><strong>' +
                name +
                '</strong><span>' +
                position +
                ' — Starts ' +
                startLabel +
                '</span></div></div>' +
                '<div class="emp-board-progress"><div class="emp-board-bar" style="width:0%"></div></div>' +
                '<div class="emp-board-info"><span>0% complete</span><span>0 of 9 tasks done</span></div>';

            if (boardList) boardList.prepend(card);
            saveOnboardingToStorage();

            /* Add to Employee Directory */
            const dirTbody = document.querySelector('.emp-table tbody');
            if (dirTbody) {
                const empId = 'EMP-' + String(100 + dirTbody.children.length).padStart(3, '0');
                const now = new Date();
                const joinLabel = String(now.getDate()).padStart(2,'0') + '.' + String(now.getMonth()+1).padStart(2,'0') + '.' + now.getFullYear();
                const tr = document.createElement('tr');
                tr.setAttribute('data-sn', '');
                tr.setAttribute('data-dob', '');
                tr.setAttribute('data-mobile', '');
                tr.setAttribute('data-email', '');
                tr.setAttribute('data-emergency', '');
                tr.setAttribute('data-nic', '');
                tr.setAttribute('data-gender', '');
                tr.setAttribute('data-marital', '');
                tr.setAttribute('data-permanent-address', '');
                tr.setAttribute('data-present-address', '');
                tr.setAttribute('data-salary', '');
                tr.setAttribute('data-joined', '');
                tr.style.animation = 'fadeIn 0.3s ease';
                tr.innerHTML =
                    '<td><div class="emp-cell-user"><span class="emp-avatar" style="background:' +
                    color +
                    ';">' +
                    initials +
                    '</span><div><strong>' +
                    name +
                    '</strong><span>' +
                    empId +
                    '</span></div></div></td><td>' +
                    dept +
                    '</td><td>' +
                    position +
                    '</td><td><span class="emp-badge emp-active">Active</span></td><td>' +
                    joinLabel +
                    '</td><td><div class="emp-actions"><i class="bi bi-three-dots-vertical emp-more"></i><div class="emp-dropdown"><a href="#" class="emp-dropdown-item emp-edit"><i class="bi bi-pencil"></i> Edit</a><a href="#" class="emp-dropdown-item emp-delete"><i class="bi bi-trash"></i> Delete</a></div></div></td>';
                dirTbody.prepend(tr);
                saveDirectoryToStorage();
            }

            if (onboardingBsModal) onboardingBsModal.hide();
            onboardingForm.reset();
        });
    }

    /* ---------- Import Excel ---------- */
    const importBtn = document.getElementById('importExcelBtn');
    const importModal = document.getElementById('importModal');
    const dropZone = document.getElementById('importDrop');
    const fileInput = document.getElementById('fileInput');
    const importPreview = document.getElementById('importPreview');
    const importFileName = document.getElementById('importFileName');
    const importRowCount = document.getElementById('importRowCount');
    const importTable = document.getElementById('importTable');
    const confirmImportBtn = document.getElementById('confirmImportBtn');
    const importCount = document.getElementById('importCount');
    let importBsModal = null;
    let parsedRows = [];

    if (importModal) {
        importBsModal = new bootstrap.Modal(importModal);
    }

    if (importBtn) {
        importBtn.addEventListener('click', () => {
            if (importBsModal) importBsModal.show();
        });
    }

    function handleFile(file) {
        if (!file) return;
        importFileName.textContent = file.name;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

                if (!json.length) return;
                parsedRows = json;

                const headers = Object.keys(json[0]);
                let html = '<thead><tr>';
                headers.forEach((h) => { html += '<th>' + h + '</th>'; });
                html += '</tr></thead><tbody>';
                const previewRows = json.slice(0, 5);
                previewRows.forEach((row) => {
                    html += '<tr>';
                    headers.forEach((h) => { html += '<td>' + (row[h] || '') + '</td>'; });
                    html += '</tr>';
                });
                if (json.length > 5) {
                    html += '<tr><td colspan="' + headers.length + '" style="text-align:center;color:var(--gray-text);">… and ' + (json.length - 5) + ' more rows</td></tr>';
                }
                html += '</tbody>';
                importTable.innerHTML = html;

                importRowCount.textContent = json.length + ' employees found';
                importCount.textContent = json.length;
                dropZone.style.display = 'none';
                importPreview.style.display = 'block';
                confirmImportBtn.style.display = 'inline-flex';
            } catch (err) {
                alert('Error reading file: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    if (dropZone) {
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) handleFile(fileInput.files[0]);
        });
    }

    if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', () => {
            const tbody = document.querySelector('.emp-table tbody');
            if (!tbody || !parsedRows.length) return;

            /* Build lookup by SN and name for upsert */
            const snLookup = {};
            const nameLookup = {};
            tbody.querySelectorAll('tr').forEach((tr) => {
                const sn = (tr.getAttribute('data-sn') || '').toLowerCase().trim();
                if (sn) snLookup[sn] = tr;
                const name = (tr.querySelector('strong')?.textContent || '').toLowerCase().trim();
                if (name) nameLookup[name] = tr;
            });

            const headers = Object.keys(parsedRows[0]);
            const nameKey = headers.find((h) => /full.?name|employee.?name/i.test(h)) || headers.find((h) => /^name$/i.test(h)) || headers[0];
            const deptKey = headers.find((h) => /dept|department|team/i.test(h)) || '';
            const posKey = headers.find((h) => /position|designation|role|title|job.?title/i.test(h)) || '';
            const snKey = headers.find((h) => /^sn$|^s\/?n$|sn.?no|sn.?number|serial.?no|serial.?number/i.test(h)) || '';
            const dobKey = headers.find((h) => /dob|birth|date.?of.?birth/i.test(h)) || '';
            const joinedKey = headers.find((h) => /joined|join.?date|date.?of.?join|start.?date|hire.?date/i.test(h)) || '';
            const mobileKey = headers.find((h) => /mobile|phone|cell|telephone/i.test(h) && !/emergency/i.test(h)) || '';
            const emailKey = headers.find((h) => /email|e-mail|mail/i.test(h)) || '';
            const emergencyKey = headers.find((h) => /emergency|emergency.?contact|emergency.?number/i.test(h)) || '';
            const nicKey = headers.find((h) => /nic|national.?id|nid|id.?card/i.test(h)) || '';
            const genderKey = headers.find((h) => /gender|sex/i.test(h)) || '';
            const maritalKey = headers.find((h) => /marital|marriage|marital.?status/i.test(h)) || '';
            const permanentAddressKey = headers.find((h) => /permanent.?address|physical.?address|postal.?address|address/i.test(h)) || '';
            const presentAddressKey = headers.find((h) => /present.?address|current.?address|residential.?address/i.test(h)) || '';
            const salaryKey = headers.find((h) => /salary|wage|pay|basic.?pay/i.test(h)) || '';

            let importedCount = 0;
            let updatedCount = 0;

            function setCellText(tr, idx, text) {
                if (tr.cells[idx]) tr.cells[idx].textContent = text;
            }

            parsedRows.forEach((row, i) => {
                const name = (row[nameKey] || 'Employee ' + (i + 1)).toString().trim();
                const dept = deptKey ? (row[deptKey] || '—') : '—';
                const pos = posKey ? (row[posKey] || '—') : '—';
                const snVal = (snKey ? (row[snKey] || '') : '').toString().trim();

                const dobVal = dobKey ? (row[dobKey] || '') : '';
                const mobileVal = mobileKey ? (row[mobileKey] || '') : '';
                const emailVal = emailKey ? (row[emailKey] || '') : '';
                const emergencyVal = emergencyKey ? (row[emergencyKey] || '') : '';
                const nicVal = nicKey ? (row[nicKey] || '') : '';
                const genderVal = genderKey ? (row[genderKey] || '') : '';
                const maritalVal = maritalKey ? (row[maritalKey] || '') : '';
                const permanentAddressVal = permanentAddressKey ? (row[permanentAddressKey] || '') : '';
                const presentAddressVal = presentAddressKey ? (row[presentAddressKey] || '') : '';
                const salaryVal = salaryKey ? (row[salaryKey] || '') : '';
                let joinedVal = joinedKey ? (row[joinedKey] || '') : '';
                let joinedRaw = joinedVal;
                if (joinedVal) {
                    if (typeof joinedVal === 'number') {
                        const d = new Date((joinedVal - 25569) * 86400 * 1000);
                        if (!isNaN(d)) {
                            joinedVal = fmtDMY(d);
                            joinedRaw = d.toISOString().split('T')[0];
                        }
                    } else {
                        const d = new Date(joinedVal);
                        if (!isNaN(d)) {
                            joinedVal = fmtDMY(d);
                            joinedRaw = d.toISOString().split('T')[0];
                        }
                    }
                }
                if (!joinedVal) joinedVal = fmtDMY(new Date());

                let dobFormatted = dobVal;
                if (dobFormatted && typeof dobFormatted === 'number') {
                    const d = new Date((dobFormatted - 25569) * 86400 * 1000);
                    if (!isNaN(d)) dobFormatted = d.toISOString().split('T')[0];
                }

                /* Check for existing employee by SN or name — upsert */
                var matchKey = snVal ? snVal.toLowerCase() : '';
                var existingTr = matchKey ? snLookup[matchKey] : null;
                if (!existingTr) {
                    matchKey = name.toLowerCase();
                    existingTr = nameLookup[matchKey];
                }

                if (existingTr) {
                    /* Update existing row */
                    var strong = existingTr.querySelector('strong');
                    if (strong) strong.textContent = name;
                    var avatarSpan = existingTr.querySelector('.emp-avatar');
                    if (avatarSpan) {
                        var newInitials = name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
                        avatarSpan.textContent = newInitials;
                    }
                    var span = existingTr.querySelector('.emp-cell-user > div > span');
                    if (span) span.textContent = snVal || existingTr.getAttribute('data-sn') || '';
                    setCellText(existingTr, 1, dept);
                    setCellText(existingTr, 2, pos);
                    setCellText(existingTr, 4, joinedVal);
                    if (snVal) existingTr.setAttribute('data-sn', snVal);
                    existingTr.setAttribute('data-dob', dobFormatted);
                    existingTr.setAttribute('data-mobile', mobileVal);
                    existingTr.setAttribute('data-email', emailVal);
                    existingTr.setAttribute('data-emergency', emergencyVal);
                    existingTr.setAttribute('data-nic', nicVal);
                    existingTr.setAttribute('data-gender', genderVal);
                    existingTr.setAttribute('data-marital', maritalVal);
                    existingTr.setAttribute('data-permanent-address', permanentAddressVal);
                    existingTr.setAttribute('data-present-address', presentAddressVal);
                    existingTr.setAttribute('data-joined', joinedRaw || '');
                    if (salaryVal) existingTr.setAttribute('data-salary', salaryVal);
                    updatedCount++;
                } else {
                    /* Insert new row */
                    const empId = 'EMP-' + String(100 + tbody.children.length).padStart(3, '0');
                    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                    const colors = ['#895129', '#ffc107', '#d68a3c', '#b86b2e', '#a05e24', '#c47a35', '#e8b84b'];
                    const color = colors[i % colors.length];
                    const tr = document.createElement('tr');
                    tr.setAttribute('data-sn', snVal);
                    tr.setAttribute('data-dob', dobFormatted);
                    tr.setAttribute('data-mobile', mobileVal);
                    tr.setAttribute('data-email', emailVal);
                    tr.setAttribute('data-emergency', emergencyVal);
                    tr.setAttribute('data-nic', nicVal);
                    tr.setAttribute('data-gender', genderVal);
                    tr.setAttribute('data-marital', maritalVal);
                    tr.setAttribute('data-permanent-address', permanentAddressVal);
                    tr.setAttribute('data-present-address', presentAddressVal);
                    tr.setAttribute('data-joined', joinedRaw || '');
                    if (salaryVal) tr.setAttribute('data-salary', salaryVal);
                    tr.innerHTML =
                        '<td><div class="emp-cell-user"><span class="emp-avatar" style="background:' +
                        color +
                        ';">' +
                        initials +
                        '</span><div><strong>' +
                        name +
                        '</strong><span>' +
                        (snVal || empId) +
                        '</span></div></div></td><td>' +
                        dept +
                        '</td><td>' +
                        pos +
                        '</td><td><span class="emp-badge emp-active">Active</span></td><td>' +
                        joinedVal +
                        '</td><td><div class="emp-actions"><i class="bi bi-three-dots-vertical emp-more"></i><div class="emp-dropdown"><a href="#" class="emp-dropdown-item emp-edit"><i class="bi bi-pencil"></i> Edit</a><a href="#" class="emp-dropdown-item emp-delete"><i class="bi bi-trash"></i> Delete</a></div></div></td>';
                    tbody.appendChild(tr);
                    importedCount++;
                }
            });

            if (importBsModal) importBsModal.hide();
            saveDirectoryToStorage();
            const toast = new bootstrap.Toast(document.getElementById('successToast'));
            var parts = [];
            if (importedCount > 0) parts.push(importedCount + ' employee(s) imported.');
            if (updatedCount > 0) parts.push(updatedCount + ' employee(s) updated.');
            if (importedCount === 0 && updatedCount === 0) parts.push('No changes.');
            document.getElementById('toastMessage').textContent = parts.join(' ');
            toast.show();
            dropZone.style.display = '';
            importPreview.style.display = 'none';
            confirmImportBtn.style.display = 'none';
            fileInput.value = '';
            parsedRows = [];
        });
    }

    /* ---------- Directory Filter & Search ---------- */
    const dirSearchInput = document.getElementById('dirSearchInput');
    const filterBtn = document.getElementById('filterBtn');
    const filterPanel = document.getElementById('filterPanel');
    const filterDept = document.getElementById('filterDept');
    const filterDesig = document.getElementById('filterDesig');
    const filterStatus = document.getElementById('filterStatus');
    const filterGender = document.getElementById('filterGender');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    function populateFilterDropdowns() {
        const depts = lsLoad('hrf-departments', []);
        const desigs = lsLoad('hrf-designations', []);
        filterDept.innerHTML = '<option value="">All Departments</option>' + depts.map(d => '<option value="' + (d.name || d) + '">' + (d.name || d) + '</option>').join('');
        filterDesig.innerHTML = '<option value="">All Designations</option>' + desigs.map(d => '<option value="' + (d.name || d) + '">' + (d.name || d) + '</option>').join('');
    }

    function applyFilters() {
        const tbody = document.querySelector('.emp-content[data-emp="directory"] .emp-table tbody');
        if (!tbody) return;
        const search = (dirSearchInput.value || '').toLowerCase().trim();
        const dept = filterDept.value;
        const desig = filterDesig.value;
        const status = filterStatus.value;
        const gender = filterGender.value;
        tbody.querySelectorAll('tr').forEach(function (tr) {
            var name = (tr.querySelector('td:first-child strong')?.textContent || '').toLowerCase();
            var sn = (tr.querySelector('td:first-child span')?.textContent || '').toLowerCase();
            var rowDept = tr.querySelector('td:nth-child(2)')?.textContent || '';
            var rowDesig = tr.querySelector('td:nth-child(3)')?.textContent || '';
            var rowStatus = tr.querySelector('td:nth-child(4) .emp-badge')?.textContent || '';
            var rowGender = tr.getAttribute('data-gender') || '';
            var show = true;
            if (search && !name.includes(search) && !sn.includes(search)) show = false;
            if (dept && rowDept !== dept) show = false;
            if (desig && rowDesig !== desig) show = false;
            if (status && rowStatus !== status) show = false;
            if (gender && rowGender !== gender) show = false;
            tr.style.display = show ? '' : 'none';
        });
    }

    if (filterBtn && filterPanel) {
        filterBtn.addEventListener('click', function () {
            var isHidden = filterPanel.style.display === 'none';
            filterPanel.style.display = isHidden ? '' : 'none';
            if (isHidden) populateFilterDropdowns();
        });
    }

    if (dirSearchInput) {
        dirSearchInput.addEventListener('input', applyFilters);
    }

    [filterDept, filterDesig, filterStatus, filterGender].forEach(function (el) {
        if (el) el.addEventListener('change', applyFilters);
    });

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function () {
            filterDept.value = '';
            filterDesig.value = '';
            filterStatus.value = '';
            filterGender.value = '';
            dirSearchInput.value = '';
            applyFilters();
        });
    }

    try { applyFilters(); } catch (e) {}

    /* ---------- Full-System Backup / Restore / Sync ---------- */
    const SYSTEM_KEYS = [
        'hrf-airport-session',
        'hrf-airport-theme',
        'hrf-emp-directory',
        'hrf-emp-onboarding',
        'hrf-settings',
        'hrf-departments',
        'hrf-designations',
        'hrf-leave-data',
        'hrf-holidays',
        'hrf-leave-policy',
    ];

    function getAllSystemData() {
        const data = {};
        SYSTEM_KEYS.forEach((key) => {
            try {
                const val = localStorage.getItem(key);
                if (val !== null) data[key] = JSON.parse(val);
            } catch { /* skip */ }
        });
        return data;
    }

    function restoreSystemData(data) {
        SYSTEM_KEYS.forEach((key) => {
            if (key in data) {
                try { localStorage.setItem(key, JSON.stringify(data[key])); } catch {}
            }
        });
    }

    /* Backup */
    document.getElementById('saveBackupBtn')?.addEventListener('click', () => {
        const data = getAllSystemData();
        data.__meta = {
            app: 'HRF Airport System',
            exported: new Date().toISOString(),
            keys: SYSTEM_KEYS,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'HRF_FullBackup_' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    /* Restore */
    document.getElementById('loadBackupInput')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                restoreSystemData(data);
                /* Reload UI */
                loadDirectoryFromStorage();
                loadOnboardingFromStorage();
                const storedTheme = localStorage.getItem('hrf-airport-theme');
                if (storedTheme) document.documentElement.setAttribute('data-theme', storedTheme);
                const toast = new bootstrap.Toast(document.getElementById('successToast'));
                document.getElementById('toastMessage').textContent = 'Full system backup restored.';
                toast.show();
            } catch (err) {
                alert('Invalid backup file: ' + err.message);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    document.getElementById('loadBackupBtn')?.addEventListener('click', () => {
        document.getElementById('loadBackupInput')?.click();
    });

    /* ---------- Cross-browser auto-sync (File System Access API) ---------- */
    const syncBtn = document.getElementById('syncBtn');
    const syncStatus = document.getElementById('syncStatus');
    const SYNC_FILE = 'hrf-sync.json';
    let syncDirHandle = null;
    let syncTimer = null;

    function updateSyncIcon(connected) {
        if (!syncStatus) return;
        syncStatus.className = 'sync-status ' + (connected ? 'connected' : 'disconnected');
        const icon = syncStatus.querySelector('i');
        if (icon) icon.className = 'bi bi-' + (connected ? 'cloud-check' : 'circle');
        if (syncBtn) {
            syncBtn.title = connected ? 'Sync folder connected — click to change' : 'Connect shared storage folder';
            syncBtn.querySelector('i').className = 'bi bi-' + (connected ? 'cloud-check-fill' : 'cloud-arrow-up');
        }
    }

    function openSyncDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open('HRFSyncDB', 1);
            req.onupgradeneeded = () => {
                if (!req.result.objectStoreNames.contains('handles'))
                    req.result.createObjectStore('handles');
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async function getSyncHandle() {
        try {
            const db = await openSyncDB();
            return new Promise((resolve) => {
                const tx = db.transaction('handles', 'readonly');
                const req = tx.objectStore('handles').get('syncDir');
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            });
        } catch { return null; }
    }

    async function putSyncHandle(handle) {
        try {
            const db = await openSyncDB();
            const tx = db.transaction('handles', 'readwrite');
            tx.objectStore('handles').put(handle, 'syncDir');
        } catch {}
    }

    async function removeSyncHandle() {
        try {
            const db = await openSyncDB();
            const tx = db.transaction('handles', 'readwrite');
            tx.objectStore('handles').delete('syncDir');
        } catch {}
    }

    async function readSyncFile() {
        if (!syncDirHandle) return null;
        try {
            const fileHandle = await syncDirHandle.getFileHandle(SYNC_FILE);
            const file = await fileHandle.getFile();
            return JSON.parse(await file.text());
        } catch { return null; }
    }

    let syncWriting = false;
    async function writeSyncFile(data) {
        if (!syncDirHandle || syncWriting) return;
        syncWriting = true;
        try {
            const fileHandle = await syncDirHandle.getFileHandle(SYNC_FILE, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();
        } catch (e) { console.warn('Sync write failed:', e); }
        finally { syncWriting = false; }
    }

    function scheduleSyncWrite() {
        if (!syncDirHandle) return;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(() => writeSyncFile(getAllSystemData()), 500);
    }

    async function initSync() {
        const handle = await getSyncHandle();
        if (handle) {
            try {
                if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted')
                    await handle.requestPermission({ mode: 'readwrite' });
                syncDirHandle = handle;
                updateSyncIcon(true);
                const data = await readSyncFile();
                if (data) {
                    restoreSystemData(data);
                    loadDirectoryFromStorage();
                    loadOnboardingFromStorage();
                    const storedTheme = localStorage.getItem('hrf-airport-theme');
                    if (storedTheme) document.documentElement.setAttribute('data-theme', storedTheme);
                }
            } catch {
                syncDirHandle = null;
                removeSyncHandle();
                updateSyncIcon(false);
            }
        } else {
            updateSyncIcon(false);
        }
    }

    syncBtn?.addEventListener('click', async () => {
        if (!('showDirectoryPicker' in window)) {
            alert('Cross-browser sync requires serving via HTTP (e.g. "npx serve" or VS Code Live Server).');
            return;
        }
        try {
            const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
            syncDirHandle = handle;
            await putSyncHandle(handle);
            updateSyncIcon(true);
            scheduleSyncWrite();
            const toast = new bootstrap.Toast(document.getElementById('successToast'));
            document.getElementById('toastMessage').textContent = 'Sync folder connected.';
            toast.show();
        } catch (e) {
            if (e.name !== 'AbortError') alert('Could not access folder: ' + e.message);
        }
    });

    /* Auto-sync on all localStorage changes */
    const _origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
        _origSetItem(key, value);
        scheduleSyncWrite();
    };

    initSync();

    /* ---------- Export to Excel ---------- */
    document.getElementById('exportExcelBtn')?.addEventListener('click', () => {
        const tbody = document.querySelector('.emp-table tbody');
        if (!tbody || !tbody.querySelector('tr')) {
            alert('No employees to export.');
            return;
        }
        const rows = tbody.querySelectorAll('tr');
        const header = ['Employee ID', 'Full Name', 'Department', 'Designation', 'Status', 'Joined Date',
                        'SN Number', 'Date of Birth', 'Mobile', 'Email', 'Emergency Contact', 'NIC',
                        'Gender', 'Marital Status', 'Permanent Address', 'Present Address', 'Salary (MVR)'];
        const data = [header];
        rows.forEach((tr) => {
            const cells = tr.querySelectorAll('td');
            if (cells.length < 5) return;
            const name = cells[0].querySelector('strong')?.textContent || '';
            const empId = cells[0].querySelector('div span')?.textContent || '';
            const dept = cells[1]?.textContent || '';
            const pos = cells[2]?.textContent || '';
            const badge = cells[3]?.querySelector('.emp-badge');
            const status = badge ? badge.textContent : '';
            const joined = cells[4]?.textContent || '';
            data.push([
                empId, name, dept, pos, status, joined,
                tr.getAttribute('data-sn') || '',
                tr.getAttribute('data-dob') || '',
                tr.getAttribute('data-mobile') || '',
                tr.getAttribute('data-email') || '',
                tr.getAttribute('data-emergency') || '',
                tr.getAttribute('data-nic') || '',
                tr.getAttribute('data-gender') || '',
                tr.getAttribute('data-marital') || '',
                tr.getAttribute('data-permanent-address') || '',
                tr.getAttribute('data-present-address') || '',
                tr.getAttribute('data-salary') || '',
            ]);
        });

        if (typeof XLSX !== 'undefined') {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, 'Employees');
            XLSX.writeFile(wb, 'Employee_Directory.xlsx');
        } else {
            /* Fallback: CSV */
            const csv = data.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Employee_Directory.csv';
            a.click();
            URL.revokeObjectURL(url);
        }
    });

    /* ---------- Row dropdowns, Edit, Delete ---------- */
    const editEmpModal = document.getElementById('editEmpModal');
    const deleteModal = document.getElementById('deleteModal');
    let editBsModal = null;
    let deleteBsModal = null;
    let editingRow = null;
    let deletingRow = null;

    if (editEmpModal) editBsModal = new bootstrap.Modal(editEmpModal);
    if (deleteModal) deleteBsModal = new bootstrap.Modal(deleteModal);

    /* Toggle dropdown on three-dot click */
    document.addEventListener('click', (e) => {
        const actions = e.target.closest('.emp-actions');
        if (actions) {
            e.preventDefault();
            document.querySelectorAll('.emp-actions.open').forEach((a) => {
                if (a !== actions) a.classList.remove('open');
            });
            actions.classList.toggle('open');
            /* Flip upward if it overflows the viewport */
            if (actions.classList.contains('open')) {
                const dropdown = actions.querySelector('.emp-dropdown');
                if (dropdown) {
                    const rect = dropdown.getBoundingClientRect();
                    if (rect.bottom > window.innerHeight) {
                        dropdown.style.top = 'auto';
                        dropdown.style.bottom = '100%';
                        dropdown.style.marginTop = '0';
                        dropdown.style.marginBottom = '4px';
                    } else {
                        dropdown.style.top = '100%';
                        dropdown.style.bottom = 'auto';
                        dropdown.style.marginTop = '4px';
                        dropdown.style.marginBottom = '0';
                    }
                }
            }
        } else {
            document.querySelectorAll('.emp-actions.open').forEach((a) => a.classList.remove('open'));
        }
    });

    /* Edit click */
    document.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.emp-dropdown-item.emp-edit');
        if (!editBtn) return;
        e.preventDefault();
        const row = editBtn.closest('tr');
        if (!row) return;
        editingRow = row;

        const cells = row.querySelectorAll('td');
        const name = cells[0].querySelector('strong')?.textContent || '';
        const position = cells[2]?.textContent || '';
        const dept = cells[1]?.textContent || '';
        const statusEl = cells[3]?.querySelector('.emp-badge');
        const status = statusEl?.textContent || 'Active';
        const empId = cells[0].querySelector('div span')?.textContent || '';

        document.getElementById('editEmpId').value = empId;
        document.getElementById('editName').value = name;
        document.getElementById('editDesignation').value = position;
        document.getElementById('editDept').value = dept;
        document.getElementById('editStatus').value = status;
        document.getElementById('editSnNumber').value = row.getAttribute('data-sn') || '';
        document.getElementById('editDob').value = row.getAttribute('data-dob') || '';
        document.getElementById('editMobile').value = row.getAttribute('data-mobile') || '';
        document.getElementById('editEmail').value = row.getAttribute('data-email') || '';
        document.getElementById('editEmergency').value = row.getAttribute('data-emergency') || '';
        document.getElementById('editNic').value = row.getAttribute('data-nic') || '';
        document.getElementById('editGender').value = row.getAttribute('data-gender') || '';
        document.getElementById('editMarital').value = row.getAttribute('data-marital') || '';
        document.getElementById('editPermanentAddress').value = row.getAttribute('data-permanent-address') || '';
        document.getElementById('editPresentAddress').value = row.getAttribute('data-present-address') || '';
        document.getElementById('editSalary').value = row.getAttribute('data-salary') || '';
        document.getElementById('editJoinDate').value = row.getAttribute('data-joined') || '';

        /* Photo preview */
        const editPreview = document.getElementById('editPhotoPreview');
        const editPlaceholder = document.getElementById('editPhotoPlaceholder');
        const img = cells[0].querySelector('.emp-avatar-img');
        if (img) {
            editPreview.src = img.src;
            editPreview.style.display = 'block';
            editPlaceholder.style.display = 'none';
        } else {
            editPreview.src = '';
            editPreview.style.display = 'none';
            editPlaceholder.style.display = 'flex';
        }

        /* Close dropdown */
        row.querySelector('.emp-actions')?.classList.remove('open');

        if (editBsModal) editBsModal.show();
    });

    /* Save edit */
    document.getElementById('saveEditBtn')?.addEventListener('click', () => {
        if (!editingRow) return;
        const name = document.getElementById('editName').value.trim();
        const position = document.getElementById('editDesignation') ? document.getElementById('editDesignation').value : '';
        const dept = document.getElementById('editDept').value;
        const status = document.getElementById('editStatus').value;
        if (!name || !position) return;

        const sn = document.getElementById('editSnNumber').value.trim();
        const dob = document.getElementById('editDob').value;
        const mobile = document.getElementById('editMobile').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const emergency = document.getElementById('editEmergency').value.trim();
        const nic = document.getElementById('editNic').value.trim();
        const gender = document.getElementById('editGender').value;
        const marital = document.getElementById('editMarital').value;
        const permanentAddress = document.getElementById('editPermanentAddress').value.trim();
        const presentAddress = document.getElementById('editPresentAddress').value.trim();
        const salary = document.getElementById('editSalary').value.trim();
        const rawEditJoin = document.getElementById('editJoinDate').value;

        const cells = editingRow.querySelectorAll('td');
        const avatar = cells[0].querySelector('.emp-avatar');
        const avatarImg = cells[0].querySelector('.emp-avatar-img');
        const strong = cells[0].querySelector('strong');
        const deptCell = cells[1];
        const posCell = cells[2];
        const badge = cells[3].querySelector('.emp-badge');
        const joinedCell = cells[4];

        if (strong) strong.textContent = name;
        if (avatar) {
            const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            avatar.textContent = initials;
        }
        if (deptCell) deptCell.textContent = dept;
        if (posCell) posCell.textContent = position;
        if (badge) {
            badge.textContent = status;
            badge.className = 'emp-badge ' + (status === 'Active' ? 'emp-active' : 'emp-inactive');
        }

        /* Update the cell 0 avatar with new photo if changed */
        const editPreview = document.getElementById('editPhotoPreview');
        const newPhoto = editPreview.src;
        if (newPhoto && newPhoto.startsWith('data:')) {
            const cell0 = cells[0].querySelector('.emp-cell-user');
            if (avatarImg) {
                avatarImg.src = newPhoto;
            } else {
                /* Replace initials span with img */
                const nameDiv = strong ? strong.parentElement : null;
                const initialsSpan = cell0.querySelector('.emp-avatar');
                if (initialsSpan) initialsSpan.remove();
                const img = document.createElement('img');
                img.src = newPhoto;
                img.className = 'emp-avatar-img';
                img.alt = name;
                if (nameDiv) {
                    cell0.insertBefore(img, nameDiv);
                } else {
                    cell0.prepend(img);
                }
            }
        }

        /* Update joined date */
        let editJoinedDisplay;
        if (rawEditJoin) {
            const d = new Date(rawEditJoin + 'T00:00:00');
            editJoinedDisplay = fmtDMY(d);
        } else {
            editJoinedDisplay = joinedCell ? joinedCell.textContent : '';
        }
        if (joinedCell) joinedCell.textContent = editJoinedDisplay;

        /* Update data attributes */
        editingRow.setAttribute('data-sn', sn);
        editingRow.setAttribute('data-dob', dob);
        editingRow.setAttribute('data-joined', rawEditJoin);
        editingRow.setAttribute('data-mobile', mobile);
        editingRow.setAttribute('data-email', email);
        editingRow.setAttribute('data-emergency', emergency);
        editingRow.setAttribute('data-nic', nic);
        editingRow.setAttribute('data-gender', gender);
        editingRow.setAttribute('data-marital', marital);
        editingRow.setAttribute('data-permanent-address', permanentAddress);
        editingRow.setAttribute('data-present-address', presentAddress);
        editingRow.setAttribute('data-salary', salary);

        saveDirectoryToStorage();
        if (editBsModal) editBsModal.hide();
        editingRow = null;
    });

    /* Delete click */
    document.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.emp-dropdown-item.emp-delete');
        if (!delBtn) return;
        e.preventDefault();
        const row = delBtn.closest('tr');
        if (!row) return;
        deletingRow = row;

        const name = row.querySelector('strong')?.textContent || 'this employee';
        document.getElementById('deleteEmpName').textContent = 'Remove ' + name + '? This cannot be undone.';

        row.querySelector('.emp-actions')?.classList.remove('open');
        if (deleteBsModal) deleteBsModal.show();
    });

    /* Confirm delete */
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
        if (!deletingRow) return;
        deletingRow.remove();
        saveDirectoryToStorage();
        if (deleteBsModal) deleteBsModal.hide();
        deletingRow = null;
    });

    /* ---------- Add Employee ---------- */
    function resizeImage(file, maxDim) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let w = img.width, h = img.height;
                    if (w > maxDim || h > maxDim) {
                        const ratio = Math.min(maxDim / w, maxDim / h);
                        w = Math.round(w * ratio);
                        h = Math.round(h * ratio);
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    const addPhotoInput = document.getElementById('photoInput');
    const addPhotoPreview = document.getElementById('photoPreview');
    const addPhotoPlaceholder = document.getElementById('photoPlaceholder');

    addPhotoInput?.addEventListener('change', async () => {
        const file = addPhotoInput.files[0];
        if (!file) return;
        addPhotoPreview.src = await resizeImage(file, 400);
        addPhotoPreview.style.display = 'block';
        addPhotoPlaceholder.style.display = 'none';
    });

    /* Edit photo upload */
    const editPhotoInput = document.getElementById('editPhotoInput');
    const editPhotoPreview = document.getElementById('editPhotoPreview');
    const editPhotoPlaceholder = document.getElementById('editPhotoPlaceholder');

    editPhotoInput?.addEventListener('change', async () => {
        const file = editPhotoInput.files[0];
        if (!file) return;
        editPhotoPreview.src = await resizeImage(file, 400);
        editPhotoPreview.style.display = 'block';
        editPhotoPlaceholder.style.display = 'none';
    });

    document.getElementById('addEmployeeBtn')?.addEventListener('click', () => {
        const addModal = document.getElementById('addEmployeeModal');
        if (addModal) {
            const bsModal = new bootstrap.Modal(addModal);
            bsModal.show();
        }
    });

    /* Generate next EMP ID */
    function nextEmpId() {
        const rows = document.querySelectorAll('#dirTbody tr');
        let max = 0;
        rows.forEach((r) => {
            const span = r.querySelector('.emp-cell-user > div > span');
            if (span) {
                const num = parseInt(span.textContent.replace('EMP-', ''), 10);
                if (num > max) max = num;
            }
        });
        return 'EMP-' + String(max + 1).padStart(3, '0');
    }

    document.getElementById('saveAddEmployeeBtn')?.addEventListener('click', () => {
        saveAddEmployee();
    });
    document.getElementById('saveAddEmployeeBtnTop')?.addEventListener('click', () => {
        saveAddEmployee();
    });

    function saveAddEmployee() {
        const name = document.getElementById('addName').value.trim();
        if (!name) return;
        const sn = document.getElementById('addSnNumber').value.trim();
        const position = document.getElementById('addDesignation') ? document.getElementById('addDesignation').value : '';
        const dept = document.getElementById('addDept').value;
        const gender = document.getElementById('addGender').value;
        const marital = document.getElementById('addMarital').value;
        const mobile = document.getElementById('addMobile').value.trim();
        const email = document.getElementById('addEmail').value.trim();
        const emergency = document.getElementById('addEmergency').value.trim();
        const nic = document.getElementById('addNic').value.trim();
        const dob = document.getElementById('addDob').value;
        const permanentAddress = document.getElementById('addPermanentAddress').value.trim();
        const presentAddress = document.getElementById('addPresentAddress').value.trim();
        const salary = document.getElementById('addSalary').value.trim();
        const rawJoin = document.getElementById('addJoinDate').value;
        const photo = addPhotoPreview.src || '';

        /* Format join date */
        let joined;
        if (rawJoin) {
            const d = new Date(rawJoin + 'T00:00:00');
            joined = fmtDMY(d);
        } else {
            joined = fmtDMY(new Date());
        }

        const empId = nextEmpId();
        const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
        const initialsColors = ['#895129', '#ffc107', '#d68a3c', '#b86b2e', '#a05e24', '#c97d35'];
        const color = initialsColors[Math.floor(Math.random() * initialsColors.length)];

        const tbody = document.getElementById('dirTbody');
        if (!tbody) return;
        const tr = document.createElement('tr');
        tr.setAttribute('data-sn', sn);
        tr.setAttribute('data-dob', dob);
        tr.setAttribute('data-joined', rawJoin);
        tr.setAttribute('data-mobile', mobile);
        tr.setAttribute('data-email', email);
        tr.setAttribute('data-emergency', emergency);
        tr.setAttribute('data-nic', nic);
        tr.setAttribute('data-gender', gender);
        tr.setAttribute('data-marital', marital);
        tr.setAttribute('data-permanent-address', permanentAddress);
        tr.setAttribute('data-present-address', presentAddress);
        tr.setAttribute('data-salary', salary);
        tr.innerHTML =
            '<td><div class="emp-cell-user">' +
            (photo
                ? '<img src="' + photo + '" class="emp-avatar-img" alt="' + name + '" />'
                : '<span class="emp-avatar" style="background:' + color + ';">' + initials + '</span>') +
            '<div><strong>' +
            name +
            '</strong><span>' +
            (sn || empId) +
            '</span></div></div></td><td>' +
            dept +
            '</td><td>' +
            position +
            '</td><td><span class="emp-badge emp-active">Active</span></td><td>' +
            joined +
            '</td><td><div class="emp-actions"><i class="bi bi-three-dots-vertical emp-more"></i><div class="emp-dropdown"><a href="#" class="emp-dropdown-item emp-edit"><i class="bi bi-pencil"></i> Edit</a><a href="#" class="emp-dropdown-item emp-delete"><i class="bi bi-trash"></i> Delete</a></div></div></td>';
        tbody.prepend(tr);
        saveDirectoryToStorage();

        /* Show toast */
        const toast = new bootstrap.Toast(document.getElementById('successToast'));
        document.getElementById('toastMessage').textContent = name + ' added to directory.';
        toast.show();

        /* Close modal and reset */
        const addModalEl = document.getElementById('addEmployeeModal');
        const addBsModal = bootstrap.Modal.getInstance(addModalEl);
        if (addBsModal) addBsModal.hide();
        document.getElementById('addEmployeeForm').reset();
        addPhotoPreview.src = '';
        addPhotoPreview.style.display = 'none';
        addPhotoPlaceholder.style.display = 'flex';
    }

    /* ---------- Settings ---------- */
    const SETTINGS_KEY = 'hrf-settings';

    function loadSettings() {
        const saved = lsLoad(SETTINGS_KEY, {});
        if (Object.keys(saved).length === 0) {
            /* Save defaults on first visit */
            saveSettings(getSettingsFromForm());
            return;
        }
        /* Apply to form */
        const el = (id) => document.getElementById(id);
        if (el('setLang')) el('setLang').value = saved.lang || 'en';
        if (el('setDateFormat')) el('setDateFormat').value = saved.dateFormat || 'DD/MM/YYYY';
        if (el('setTz')) el('setTz').value = saved.tz || 'Africa/Nairobi';
        if (el('setPerPage')) el('setPerPage').value = saved.perPage || '10';
        if (el('setEmailNotif')) el('setEmailNotif').checked = saved.emailNotif !== false;
        if (el('setPushNotif')) el('setPushNotif').checked = saved.pushNotif === true;
        if (el('setInAppNotif')) el('setInAppNotif').checked = saved.inAppNotif !== false;
        if (el('setDigest')) el('setDigest').checked = saved.digest === true;
        if (el('setDefaultDept')) el('setDefaultDept').value = saved.defaultDept || '';
        if (el('setLeaveWorkflow')) el('setLeaveWorkflow').value = saved.leaveWorkflow || 'auto';
        if (el('setProbationDays')) el('setProbationDays').value = saved.probationDays || 90;
        if (el('setLeaveBalance')) el('setLeaveBalance').value = saved.leaveBalance || 21;
        if (el('setDarkMode')) {
            el('setDarkMode').checked = saved.darkMode === true;
            /* Keep topbar toggle in sync */
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (saved.darkMode && currentTheme !== 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                const icon = document.querySelector('#themeToggle i');
                if (icon) icon.className = 'bi bi-sun-fill';
            }
        }
        if (el('setAutoSync')) el('setAutoSync').checked = saved.autoSync === true;
        if (el('setCompactSidebar')) {
            el('setCompactSidebar').checked = saved.compactSidebar === true;
            if (saved.compactSidebar && sidebar) sidebar.classList.remove('open');
        }
        if (el('setAboutUser')) el('setAboutUser').textContent = session.fullName || 'Demo User';
        applyLeavePolicyToForm();
    }

    function getSettingsFromForm() {
        const el = (id) => document.getElementById(id);
        return {
            lang: el('setLang') ? el('setLang').value : 'en',
            dateFormat: el('setDateFormat') ? el('setDateFormat').value : 'DD/MM/YYYY',
            tz: el('setTz') ? el('setTz').value : 'Africa/Nairobi',
            perPage: el('setPerPage') ? el('setPerPage').value : '10',
            emailNotif: el('setEmailNotif') ? el('setEmailNotif').checked : true,
            pushNotif: el('setPushNotif') ? el('setPushNotif').checked : false,
            inAppNotif: el('setInAppNotif') ? el('setInAppNotif').checked : true,
            digest: el('setDigest') ? el('setDigest').checked : false,
            defaultDept: el('setDefaultDept') ? el('setDefaultDept').value : '',
            leaveWorkflow: el('setLeaveWorkflow') ? el('setLeaveWorkflow').value : 'auto',
            probationDays: el('setProbationDays') ? parseInt(el('setProbationDays').value) || 90 : 90,
            leaveBalance: el('setLeaveBalance') ? parseInt(el('setLeaveBalance').value) || 21 : 21,
            darkMode: el('setDarkMode') ? el('setDarkMode').checked : false,
            autoSync: el('setAutoSync') ? el('setAutoSync').checked : false,
            compactSidebar: el('setCompactSidebar') ? el('setCompactSidebar').checked : false,
        };
    }

    function saveSettings(data) {
        lsSave(SETTINGS_KEY, data);
    }

    /* Auto-save on any settings control change */
    document.querySelectorAll('.settings-control, .settings-switch').forEach((ctrl) => {
        ctrl.addEventListener('change', () => {
            saveSettings(getSettingsFromForm());
        });
    });

    /* ---------- Department Manager ---------- */
    const DEPT_KEY = 'hrf-departments';
    const DESIG_KEY = 'hrf-designations';
    let editingDeptId = -1;
    let deletingDeptIdx = -1;
    let editingDesigIdx = -1;
    let deletingDesigIdx = -1;

    function loadDepts() { return lsLoad(DEPT_KEY, []); }
    function saveDepts(d) { lsSave(DEPT_KEY, d); }
    function loadDesigs() { return lsLoad(DESIG_KEY, []); }
    function saveDesigs(d) { lsSave(DESIG_KEY, d); }

    function countDeptEmployees(deptName) {
        var tbody = document.querySelector('.emp-table tbody');
        if (!tbody) return 0;
        var count = 0;
        tbody.querySelectorAll('tr').forEach(function (tr) {
            var cell = tr.querySelectorAll('td')[1];
            if (cell && cell.textContent === deptName) count++;
        });
        return count;
    }

    function renderDepartments() {
        var tbody = document.querySelector('#deptManagerTable tbody');
        if (!tbody) return;
        var depts = loadDepts();
        tbody.innerHTML = '';
        depts.forEach(function (d, i) {
            var hc = countDeptEmployees(d.name);
            var tr = document.createElement('tr');
            tr.innerHTML = '<td><strong>' + d.name + '</strong></td><td>' + hc + '</td><td><span class="emp-badge ' + (d.status === 'Active' ? 'emp-active' : 'emp-inactive') + '">' + d.status + '</span></td><td style="width:80px;"><div class="emp-actions" style="position:relative;display:inline-flex;"><i class="bi bi-three-dots-vertical emp-more"></i><div class="emp-dropdown"><a href="#" class="emp-dropdown-item dept-edit" data-idx="' + i + '"><i class="bi bi-pencil"></i> Edit</a><a href="#" class="emp-dropdown-item dept-delete" data-idx="' + i + '"><i class="bi bi-trash"></i> Delete</a></div></div></td>';
            tbody.appendChild(tr);
        });
        populateDeptDropdowns();
    }

    function renderDesignations() {
        var tbody = document.querySelector('#desigManagerTable tbody');
        if (!tbody) return;
        var desigs = loadDesigs();
        tbody.innerHTML = '';
        desigs.forEach(function (d, i) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td><strong>' + d + '</strong></td><td style="width:80px;"><div class="emp-actions" style="position:relative;display:inline-flex;"><i class="bi bi-three-dots-vertical emp-more"></i><div class="emp-dropdown"><a href="#" class="emp-dropdown-item desig-edit" data-idx="' + i + '"><i class="bi bi-pencil"></i> Edit</a><a href="#" class="emp-dropdown-item desig-delete" data-idx="' + i + '"><i class="bi bi-trash"></i> Delete</a></div></div></td>';
            tbody.appendChild(tr);
        });
        populateDesigDropdowns();
    }

    function populateDeptDropdowns() {
        var depts = loadDepts();
        document.querySelectorAll('select[id$="Dept"], select[id*="Dept"]').forEach(function (sel) {
            var current = sel.value;
            sel.innerHTML = '<option value="">Select...</option>';
            depts.forEach(function (d) {
                var opt = document.createElement('option');
                opt.value = d.name;
                opt.textContent = d.name;
                sel.appendChild(opt);
            });
            if (current) sel.value = current;
        });
    }

    function populateDesigDropdowns() {
        var desigs = loadDesigs();
        document.querySelectorAll('select[id$="esignation"], select[id$="Desig"]').forEach(function (sel) {
            var current = sel.value;
            sel.innerHTML = '<option value="">Select...</option>';
            desigs.forEach(function (d) {
                var opt = document.createElement('option');
                opt.value = d;
                opt.textContent = d;
                sel.appendChild(opt);
            });
            if (current) sel.value = current;
        });
    }

    /* Add/Edit Department */
    document.getElementById('addDeptBtn')?.addEventListener('click', function () {
        editingDeptId = -1;
        document.getElementById('deptModalTitle').textContent = 'Add Department';
        document.getElementById('deptNameInput').value = '';
        document.getElementById('deptStatus').value = 'Active';
        var modal = new bootstrap.Modal(document.getElementById('deptModal'));
        modal.show();
    });

    document.getElementById('saveDeptBtn')?.addEventListener('click', function () {
        var name = document.getElementById('deptNameInput').value.trim();
        if (!name) return;
        var status = document.getElementById('deptStatus').value;
        var depts = loadDepts();
        if (editingDeptId >= 0) {
            depts[editingDeptId].name = name;
            depts[editingDeptId].status = status;
        } else {
            depts.push({ name: name, headcount: 0, status: status });
        }
        saveDepts(depts);
        renderDepartments();
        bootstrap.Modal.getInstance(document.getElementById('deptModal'))?.hide();
    });

    /* Edit/Delete Department via delegated events */
    document.addEventListener('click', function (e) {
        var el = e.target.closest('.dept-edit');
        if (el) {
            var idx = parseInt(el.dataset.idx);
            var depts = loadDepts();
            if (idx >= 0 && depts[idx]) {
                editingDeptId = idx;
                document.getElementById('deptModalTitle').textContent = 'Edit Department';
                document.getElementById('deptNameInput').value = depts[idx].name;
                document.getElementById('deptStatus').value = depts[idx].status;
                var modal = new bootstrap.Modal(document.getElementById('deptModal'));
                modal.show();
            }
        }
    });

    document.addEventListener('click', function (e) {
        var el = e.target.closest('.dept-delete');
        if (el) {
            var idx = parseInt(el.dataset.idx);
            var depts = loadDepts();
            if (idx >= 0 && depts[idx]) {
                deletingDeptIdx = idx;
                document.getElementById('deleteDeptName').textContent = 'Remove "' + depts[idx].name + '"? This will affect all employees in this department.';
                var modal = new bootstrap.Modal(document.getElementById('deleteDeptModal'));
                modal.show();
            }
        }
    });

    document.getElementById('confirmDeleteDeptBtn')?.addEventListener('click', function () {
        if (deletingDeptIdx < 0) return;
        var depts = loadDepts();
        var removedName = depts[deletingDeptIdx].name;
        depts.splice(deletingDeptIdx, 1);
        saveDepts(depts);
        renderDepartments();
        /* Reset employees in the removed department */
        var tbody = document.querySelector('.emp-table tbody');
        if (tbody) {
            tbody.querySelectorAll('tr').forEach(function (tr) {
                var cells = tr.querySelectorAll('td');
                if (cells.length > 1 && cells[1].textContent === removedName) {
                    cells[1].textContent = '\u2014';
                }
            });
            saveDirectoryToStorage();
        }
        bootstrap.Modal.getInstance(document.getElementById('deleteDeptModal'))?.hide();
        deletingDeptIdx = -1;
    });

    /* Add/Edit Designation */
    document.getElementById('addDesigBtn')?.addEventListener('click', function () {
        editingDesigIdx = -1;
        document.getElementById('desigModalTitle').textContent = 'Add Designation';
        document.getElementById('desigNameInput').value = '';
        var modal = new bootstrap.Modal(document.getElementById('desigModal'));
        modal.show();
    });

    document.getElementById('saveDesigBtn')?.addEventListener('click', function () {
        var name = document.getElementById('desigNameInput').value.trim();
        if (!name) return;
        var desigs = loadDesigs();
        if (editingDesigIdx >= 0) {
            desigs[editingDesigIdx] = name;
        } else {
            desigs.push(name);
        }
        saveDesigs(desigs);
        renderDesignations();
        bootstrap.Modal.getInstance(document.getElementById('desigModal'))?.hide();
    });

    /* Edit/Delete Designation via delegated events */
    document.addEventListener('click', function (e) {
        var el = e.target.closest('.desig-edit');
        if (el) {
            var idx = parseInt(el.dataset.idx);
            var desigs = loadDesigs();
            if (idx >= 0 && desigs[idx]) {
                editingDesigIdx = idx;
                document.getElementById('desigModalTitle').textContent = 'Edit Designation';
                document.getElementById('desigNameInput').value = desigs[idx];
                var modal = new bootstrap.Modal(document.getElementById('desigModal'));
                modal.show();
            }
        }
    });

    document.addEventListener('click', function (e) {
        var el = e.target.closest('.desig-delete');
        if (el) {
            var idx = parseInt(el.dataset.idx);
            var desigs = loadDesigs();
            if (idx >= 0 && desigs[idx]) {
                deletingDesigIdx = idx;
                document.getElementById('deleteDesigName').textContent = 'Remove "' + desigs[idx] + '"? This will affect all employees with this designation.';
                var modal = new bootstrap.Modal(document.getElementById('deleteDesigModal'));
                modal.show();
            }
        }
    });

    document.getElementById('confirmDeleteDesigBtn')?.addEventListener('click', function () {
        if (deletingDesigIdx < 0) return;
        var desigs = loadDesigs();
        var removedName = desigs[deletingDesigIdx];
        desigs.splice(deletingDesigIdx, 1);
        saveDesigs(desigs);
        renderDesignations();
        /* Reset employees with the removed designation */
        var tbody = document.querySelector('.emp-table tbody');
        if (tbody) {
            tbody.querySelectorAll('tr').forEach(function (tr) {
                var cells = tr.querySelectorAll('td');
                if (cells.length > 2 && cells[2].textContent === removedName) {
                    cells[2].textContent = '\u2014';
                }
            });
            saveDirectoryToStorage();
        }
        bootstrap.Modal.getInstance(document.getElementById('deleteDesigModal'))?.hide();
        deletingDesigIdx = -1;
    });

    /* Initial render */
    renderDepartments();
    renderDesignations();


/* Update SYSTEM_KEYS for backup/restore */

/* ========== LEAVE POLICY ========== */

var LP_KEY = 'hrf-leave-policy';
var defaultLeavePolicy = {
    annual: 30,
    annualSenior: 32,
    annualSeniorYears: 2,
    frl: 10,
    sl: 15,
    slm: 15,
    circumcision: 5,
    paternity: 30,
    maternity: 30,
    hajjUmrah: 'once'
};

function loadLeavePolicy() {
    var p = lsLoad(LP_KEY, null);
    if (!p) {
        lsSave(LP_KEY, defaultLeavePolicy);
        return defaultLeavePolicy;
    }
    return p;
}

function saveLeavePolicy(p) { lsSave(LP_KEY, p); }

/* Apply policy values to Settings form fields */
function applyLeavePolicyToForm() {
    var p = loadLeavePolicy();
    var el = function(id) { return document.getElementById(id); };
    if (el('lpAnnual')) el('lpAnnual').value = p.annual;
    if (el('lpFrl')) el('lpFrl').value = p.frl;
    if (el('lpSl')) el('lpSl').value = p.sl;
    if (el('lpSlm')) el('lpSlm').value = p.slm;
    if (el('lpCircumcision')) el('lpCircumcision').value = p.circumcision;
    if (el('lpPaternity')) el('lpPaternity').value = p.paternity;
    if (el('lpMaternity')) el('lpMaternity').value = p.maternity;
    if (el('lpHajjUmrah')) el('lpHajjUmrah').value = p.hajjUmrah;
}

/* Read policy from Settings form fields */
function getLeavePolicyFromForm() {
    var el = function(id) { return document.getElementById(id); };
    return {
        annual: parseInt(el('lpAnnual')?.value) || 30,
        annualSenior: 32,
        annualSeniorYears: 2,
        frl: parseInt(el('lpFrl')?.value) || 10,
        sl: parseInt(el('lpSl')?.value) || 15,
        slm: parseInt(el('lpSlm')?.value) || 15,
        circumcision: parseInt(el('lpCircumcision')?.value) || 5,
        paternity: parseInt(el('lpPaternity')?.value) || 30,
        maternity: parseInt(el('lpMaternity')?.value) || 30,
        hajjUmrah: el('lpHajjUmrah')?.value || 'once'
    };
}

/* Auto-save policy on input change, then refresh leave data */
document.querySelectorAll('.leave-policy-input').forEach(function(el) {
    el.addEventListener('change', function() {
        saveLeavePolicy(getLeavePolicyFromForm());
        renderAllFromEmployees();
    });
});

/* ========== SYSTEM-WIDE EMPLOYEE-DRIVEN RENDERING ========== */

var LS_KEY_LEAVE = 'hrf-leave-data';
var LEAVE_TYPES = ['Annual Leave','FRL','Sick Leave Medical','Sick Leave','Circumcision Leave','Paternity Leave','Maternity Leave','No Pay Leave','Umrah Leave','Hajj Leave'];

function getEmployees() {
    return lsLoad(LS_KEY_DIR, []);
}

function getLeaveData() {
    return lsLoad(LS_KEY_LEAVE, null);
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
    return arr[rand(0, arr.length - 1)];
}

function formatDate(d) {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()] + ' ' + d.getDate();
}

function initialsOf(name) {
    if (!name) return '--';
    return name.split(' ').map(function(w){return w[0]}).join('').toUpperCase().slice(0,2);
}

function avatarColorFor(name) {
    var colors = ['#895129','#ffc107','#d68a3c','#f9e076','#b86b2e','#c97d35','#e8b84b','#a05e24','#c47a35','#e8a84b'];
    var hash = 0;
    for (var i = 0; i < (name||'x').length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
    return colors[Math.abs(hash) % colors.length];
}

function initLeaveData() {
    var LDV = '2';
    var existing = getLeaveData();
    /* Flush old dummy data from previous random-init versions */
    if (existing && existing._version !== LDV) existing = null;
    var policy = loadLeavePolicy();
    var emps = getEmployees();
    if (!emps.length) return null;

    /* Rebuild balances from policy each time (in case policy changed) */
    var now = new Date();
    var currentYear = now.getFullYear();
    var data = existing || { requests: [], balances: {}, sickTracking: {}, _version: LDV };
    if (!data.requests) data.requests = [];
    if (!data.sickTracking) data.sickTracking = {};
    if (!data.balances) data.balances = {};
    data._version = LDV;

    emps.forEach(function(emp) {
        /* Determine annual entitlement based on tenure */
        var joinedRaw = emp.joinedRaw || emp.getAttribute?.('data-joined') || '';
        var yearsOfService = 0;
        var joinDate = null;
        if (joinedRaw) {
            joinDate = new Date(joinedRaw + 'T00:00:00');
            if (!isNaN(joinDate)) {
                yearsOfService = (now - joinDate) / (365.25 * 24 * 60 * 60 * 1000);
            }
        }

        /* Calculate anniversary-based annual leave */
        var annualEntitlement = policy.annual;
        if (yearsOfService >= policy.annualSeniorYears) {
            annualEntitlement = policy.annualSenior;
        }

        /* Compute remaining balance based on anniversary cycles */
        var annualBalance = annualEntitlement;
        if (joinDate && !isNaN(joinDate)) {
            var anniversaries = Math.floor(yearsOfService);
            var lastAnniversary = new Date(joinDate);
            lastAnniversary.setFullYear(lastAnniversary.getFullYear() + anniversaries);
            var daysSinceAnniversary = Math.floor((now - lastAnniversary) / (24 * 60 * 60 * 1000));
            /* Prorate: full entitlement if within cycle, adjust for partial */
            if (daysSinceAnniversary < 0) daysSinceAnniversary = 0;
            /* Use full entitlement for current cycle */
            /* In a real system, used days would be tracked; for init, give full */
        }

        var gender = (emp.gender || emp.getAttribute?.('data-gender') || '').toLowerCase();
        var isMale = gender === 'male' || gender === 'm';
        var isFemale = gender === 'female' || gender === 'f';

        /* Only init balance if not already present (preserves approve/reject deductions) */
        if (!data.balances[emp.name]) {
            data.balances[emp.name] = {
                annual: annualEntitlement,
                frl: policy.frl,
                sickMedical: policy.slm,
                sick: policy.sl,
                circumcision: policy.circumcision,
                paternity: isMale ? policy.paternity : 0,
                maternity: isFemale ? policy.maternity : 0,
                noPay: 0,
                umrah: policy.hajjUmrah === 'yearly' ? 1 : 0,
                hajj: policy.hajjUmrah === 'yearly' ? 1 : 0,
                total: annualEntitlement + policy.frl + policy.slm + policy.sl + policy.circumcision +
                       (isMale ? policy.paternity : 0) + (isFemale ? policy.maternity : 0)
            };
        }
    });

    /* Compute sick tracking from approved sick leave requests */
    var sickTypes = ['Sick Leave Medical', 'Sick Leave'];
    var currentYear = now.getFullYear();
    var newSick = {};
    emps.forEach(function(emp) {
        newSick[emp.name] = { total: 0, thisYear: 0, lastYear: 0, avgDuration: '—', frequency: 0, _durs: [] };
    });
    data.requests.forEach(function(req) {
        if (req.status !== 'Approved') return;
        if (sickTypes.indexOf(req.type) === -1) return;
        var st = newSick[req.employee];
        if (!st) return;
        st.total += req.days;
        st.frequency++;
        st._durs.push(req.days);
        var year = currentYear;
        if (req.submitted) {
            try { year = new Date(req.submitted).getFullYear(); } catch(e) {}
        }
        if (year === currentYear) st.thisYear += req.days;
        else st.lastYear += req.days;
    });
    Object.keys(newSick).forEach(function(name) {
        var st = newSick[name];
        if (st.frequency > 0) {
            var sum = 0;
            st._durs.forEach(function(d) { sum += d; });
            st.avgDuration = (sum / st.frequency).toFixed(1);
        }
        delete st._durs;
    });
    data.sickTracking = newSick;

    lsSave(LS_KEY_LEAVE, data);
    return data;
}

function findStatValue(container, labelText) {
    var cards = (container || document).querySelectorAll('.md-card-gradient');
    for (var i = 0; i < cards.length; i++) {
        var lbl = cards[i].querySelector('.md-gradient-label');
        if (lbl && lbl.textContent.trim() === labelText) {
            return cards[i].querySelector('.md-gradient-value');
        }
    }
    return null;
}

function renderDashboardStats(emps) {
    var total = emps.length;
    var active = emps.filter(function(e) { return e.status === 'Active'; }).length;
    var inactive = total - active;
    var retention = total > 0 ? Math.round((active / total) * 1000) / 10 : 0;
    var turnover = total > 0 ? Math.round((inactive / total) * 1000) / 10 : 0;

    var el;
    el = document.getElementById('dashboardTotalEmployees'); if (el) el.textContent = total;
    el = document.getElementById('dashboardActiveEmployees'); if (el) el.textContent = active;
    el = document.getElementById('dashboardRetentionRate'); if (el) el.textContent = retention + '%';
    el = document.getElementById('dashboardTurnoverRate'); if (el) el.textContent = turnover + '%';

    el = document.getElementById('dashboardGenderRatio');
    if (el) {
        var males = emps.filter(function(e) { return e.gender === 'Male'; }).length;
        var females = emps.filter(function(e) { return e.gender === 'Female'; }).length;
        el.textContent = males + ' : ' + females;
    }
}

function renderRecentHires(emps) {
    var ul = document.getElementById('dashboardRecentHires');
    if (!ul) return;
    ul.innerHTML = '';
    var sorted = emps.slice().sort(function(a, b) {
        return ((b.joinedRaw || b.joined || '')+'').localeCompare((a.joinedRaw || a.joined || '')+'');
    });
    sorted.slice(0, 5).forEach(function(emp) {
        var li = document.createElement('li'); li.className = 'md-list-item';
        var color = emp.color || avatarColorFor(emp.name);
        li.innerHTML = '<span class="md-avatar" style="background:' + color + ';">' + (emp.initials || initialsOf(emp.name)) + '</span>' +
            '<div class="md-list-info"><p class="md-list-name">' + emp.name + '</p><p class="md-list-date">' + (emp.joined || '') + '</p></div>' +
            '<i class="bi bi-star"></i>';
        ul.appendChild(li);
    });
}

function renderDeptSummary(emps) {
    var tbody = document.getElementById('deptSummaryBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    var deptMap = {};
    emps.forEach(function(emp) {
        var dept = emp.department || 'Unknown';
        if (!deptMap[dept]) deptMap[dept] = { count: 0, years: 0 };
        deptMap[dept].count++;
        /* Parse join date for tenure calc */
        var joined = emp.joined || '';
        var year = parseInt(joined.match(/\d{4}$/)?.[0] || '0', 10);
        if (year > 2000) deptMap[dept].years += (2026 - year);
    });
    var deptNames = Object.keys(deptMap).sort();
    deptNames.forEach(function(name) {
        var d = deptMap[name];
        var avgTenure = d.count > 0 ? (d.years / d.count).toFixed(1) : '—';
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + name + '</td><td>' + d.count + '</td><td>' + avgTenure + ' yrs</td>' +
            '<td><span class="md-badge md-badge-open">Active</span></td>' +
            '<td><a href="#"><i class="bi bi-x-lg md-icon-action"></i></a></td>';
        tbody.appendChild(tr);
    });
}

function renderLeaveStats(data) {
    var el;
    el = document.getElementById('leaveTotalRequests'); if (el) el.textContent = data.requests.length;
    var approved = data.requests.filter(function(r) { return r.status === 'Approved'; }).length;
    var pending = data.requests.filter(function(r) { return r.status === 'Pending'; }).length;
    var rejected = data.requests.filter(function(r) { return r.status === 'Rejected'; }).length;
    el = document.getElementById('leaveApproved'); if (el) el.textContent = approved;
    el = document.getElementById('leavePending'); if (el) el.textContent = pending;
    el = document.getElementById('leaveRejected'); if (el) el.textContent = rejected;

    /* Update chart labels */
    var chartLabel = document.querySelector('.md-chart-label.center-align');
    if (chartLabel) chartLabel.textContent = LEAVE_TYPES.join(', ');
}

function renderLeaveRequests(data) {
    var tbody = document.querySelector('.leave-content[data-leave="requests"] .md-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    var items = data.requests.slice().reverse();
    items.forEach(function(r) {
        var badgeCls = r.status === 'Approved' ? 'md-badge-open' : (r.status === 'Pending' ? 'md-badge-closed' : 'md-badge-closed');
        var colorStyle = r.status === 'Rejected' ? 'color:#dc3545;' : '';
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><div class="md-user-cell"><span class="md-avatar-sm" style="background:' + r.color + ';">' + r.initials + '</span><strong>' + r.employee + '</strong></div></td>' +
            '<td>' + r.type + '</td><td>' + r.from + '</td><td>' + r.to + '</td><td>' + r.days + '</td>' +
            '<td><span class="md-badge ' + badgeCls + '" style="' + colorStyle + '">' + r.status + '</span></td>' +
            '<td><span class="md-action-btns" style="display:flex;gap:6px;">' +
            '<i class="bi bi-pencil lr-edit" style="color:var(--gray-text,#888);font-size:1rem;cursor:pointer;" data-rid="' + r._id + '"></i>' +
            '<i class="bi bi-trash lr-delete" style="color:#dc3545;font-size:1rem;cursor:pointer;" data-rid="' + r._id + '"></i></span></td>';
        tbody.appendChild(tr);
    });
}

function renderPendingApprovals(data) {
    var ul = document.querySelector('.leave-content[data-leave="requests"] .md-list');
    if (!ul) return;
    ul.innerHTML = '';
    var pending = data.requests.filter(function(r) { return r.status === 'Pending'; });
    pending.forEach(function(r) {
        var li = document.createElement('li'); li.className = 'md-list-item';
        li.innerHTML = '<span class="md-avatar" style="background:' + r.color + ';">' + r.initials + '</span>' +
            '<div class="md-list-info"><p class="md-list-name">' + r.employee + '</p><p class="md-list-date">' + r.type + ' · ' + r.days + ' day' + (r.days > 1 ? 's' : '') + '</p></div>' +
            '<span class="md-action-btns">' +
            '<i class="bi bi-check-circle-fill lr-approve" style="color:#28a745;font-size:1.1rem;cursor:pointer;" data-rid="' + r._id + '"></i>' +
            '<i class="bi bi-x-circle-fill lr-reject" style="color:#dc3545;font-size:1.1rem;cursor:pointer;margin-left:6px;" data-rid="' + r._id + '"></i></span>';
        ul.appendChild(li);
    });
}

function balanceTotal(b) {
    return b.total ?? ((b.annual||0)+(b.frl||0)+(b.sickMedical||0)+(b.sick||0)+(b.circumcision||0)+(b.paternity||0)+(b.maternity||0)+(b.noPay||0)+(b.umrah||0)+(b.hajj||0));
}

function renderLeaveBalanceSummary(data) {
    /* Find the Leave Balance Summary table (second table in requests section) */
    var tables = document.querySelectorAll('.leave-content[data-leave="requests"] .md-table');
    var table = tables.length > 1 ? tables[1] : null;
    var tbody = table ? table.querySelector('tbody') : null;
    if (!tbody) return;
    tbody.innerHTML = '';
    var emps = getEmployees();
    emps.forEach(function(emp) {
        var b = data.balances[emp.name] || {};
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + emp.name + '</strong></td>' +
            '<td>' + (b.annual ?? '—') + '</td><td>' + (b.frl ?? '—') + '</td>' +
            '<td>' + (b.sickMedical ?? '—') + '</td><td>' + (b.sick ?? '—') + '</td>' +
            '<td>' + (b.circumcision ?? '—') + '</td><td>' + (b.paternity ?? '—') + '</td>' +
            '<td>' + (b.maternity ?? '—') + '</td><td>' + (b.noPay ?? '—') + '</td>' +
            '<td>' + (b.umrah ?? '—') + '</td><td>' + (b.hajj ?? '—') + '</td>' +
            '<td>' + balanceTotal(b) + '</td>';
        tbody.appendChild(tr);
    });
}

function renderApprovalWorkflow(data) {
    var tbody = document.querySelector('.leave-content[data-leave="approvals"] .md-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    var pending = data.requests.filter(function(r) { return r.status === 'Pending'; });
    pending.forEach(function(r) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><div class="md-user-cell"><span class="md-avatar-sm" style="background:' + r.color + ';">' + r.initials + '</span><strong>' + r.employee + '</strong></div></td>' +
            '<td>' + r.type + '</td><td>' + r.from + '</td><td>' + r.to + '</td><td>' + r.days + '</td>' +
            '<td><span class="md-badge md-badge-closed">' + r.status + '</span></td>' +
            '<td><span class="md-action-btns" style="display:flex;gap:6px;">' +
            '<i class="bi bi-check-circle-fill lr-approve" style="color:#28a745;font-size:1.1rem;cursor:pointer;" data-rid="' + r._id + '"></i>' +
            '<i class="bi bi-x-circle-fill lr-reject" style="color:#dc3545;font-size:1.1rem;cursor:pointer;" data-rid="' + r._id + '"></i>' +
            '<i class="bi bi-pencil lr-edit" style="color:var(--gray-text,#888);font-size:1rem;cursor:pointer;" data-rid="' + r._id + '"></i>' +
            '<i class="bi bi-trash lr-delete" style="color:#dc3545;font-size:1rem;cursor:pointer;" data-rid="' + r._id + '"></i></span></td>';
        tbody.appendChild(tr);
    });
}

function renderLeaveBalances(data) {
    var tbody = document.querySelector('.leave-content[data-leave="balances"] .md-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    var emps = getEmployees();
    emps.forEach(function(emp) {
        var b = data.balances[emp.name] || {};
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + emp.name + '</strong></td>' +
            '<td>' + (b.annual ?? '—') + '</td><td>' + (b.frl ?? '—') + '</td>' +
            '<td>' + (b.sickMedical ?? '—') + '</td><td>' + (b.sick ?? '—') + '</td>' +
            '<td>' + (b.circumcision ?? '—') + '</td><td>' + (b.paternity ?? '—') + '</td>' +
            '<td>' + (b.maternity ?? '—') + '</td><td>' + (b.noPay ?? '—') + '</td>' +
            '<td>' + (b.umrah ?? '—') + '</td><td>' + (b.hajj ?? '—') + '</td>' +
            '<td>' + balanceTotal(b) + '</td>';
        tbody.appendChild(tr);
    });
}

function renderSickLeaveTracking(data) {
    var tbody = document.querySelector('.leave-content[data-leave="sick"] .md-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    var emps = getEmployees();
    emps.forEach(function(emp) {
        var s = data.sickTracking[emp.name] || {};
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + emp.name + '</strong></td>' +
            '<td>' + (s.total ?? '—') + '</td><td>' + (s.thisYear ?? '—') + '</td>' +
            '<td>' + (s.lastYear ?? '—') + '</td><td>' + (s.avgDuration ?? '—') + ' days</td>' +
            '<td>' + (s.frequency ?? '—') + ' episodes</td>';
        tbody.appendChild(tr);
    });
}

/* ---------- Public Holiday CRUD ---------- */
var HOLIDAYS_KEY = 'hrf-holidays';
var defaultHolidays = [
    { date: '2026-01-01', name: "New Year's Day", type: 'National' },
    { date: '2026-01-07', name: 'Orthodox Christmas', type: 'Christian' },
    { date: '2026-01-26', name: 'Republic Day', type: 'National' },
    { date: '2026-02-28', name: 'National Day', type: 'National' },
    { date: '2026-03-31', name: 'Eid al-Fitr', type: 'Islamic' },
    { date: '2026-05-01', name: 'Labour Day', type: 'National' },
    { date: '2026-12-25', name: 'Christmas Day', type: 'Christian' },
    { date: '2026-12-26', name: 'Boxing Day', type: 'National' },
];

function loadHolidays() {
    var h = lsLoad(HOLIDAYS_KEY, null);
    if (!h) {
        lsSave(HOLIDAYS_KEY, defaultHolidays);
        return defaultHolidays;
    }
    return h;
}

function saveHolidays(h) { lsSave(HOLIDAYS_KEY, h); }

function getDayName(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long' });
}

function renderHolidays() {
    var tbody = document.getElementById('holidayTbody');
    if (!tbody) return;
    var holidays = loadHolidays();
    tbody.innerHTML = '';
    holidays.forEach(function(h, idx) {
        var d = new Date(h.date + 'T00:00:00');
        var displayDate = fmtDMY(d);
        var dayName = getDayName(h.date);
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + displayDate + '</td><td><strong>' + h.name + '</strong></td><td>' + dayName + '</td><td>' + h.type + '</td>' +
            '<td><div class="emp-actions"><i class="bi bi-three-dots-vertical emp-more"></i><div class="emp-dropdown">' +
            '<a href="#" class="emp-dropdown-item holiday-edit" data-idx="' + idx + '"><i class="bi bi-pencil"></i> Edit</a>' +
            '<a href="#" class="emp-dropdown-item holiday-delete" data-idx="' + idx + '"><i class="bi bi-trash"></i> Delete</a></div></div></td>';
        tbody.appendChild(tr);
    });
}

/* Custom modal functions */
function showHolidayForm() {
    document.getElementById('holidayFormRow').style.display = 'block';
}
function hideHolidayForm() {
    document.getElementById('holidayFormRow').style.display = 'none';
}

var editingHolidayIdx = -1;
var deletingHolidayIdx = -1;

/* Add Holiday button */
document.getElementById('addHolidayBtn')?.addEventListener('click', function() {
    editingHolidayIdx = -1;
    document.getElementById('holidayDate').value = '';
    document.getElementById('holidayName').value = '';
    document.getElementById('holidayType').value = 'National';
    showHolidayForm();
});

/* Save Holiday */
document.getElementById('saveHolidayBtn')?.addEventListener('click', function() {
    var dateVal = document.getElementById('holidayDate').value;
    var nameVal = document.getElementById('holidayName').value.trim();
    var typeVal = document.getElementById('holidayType').value;
    if (!dateVal || !nameVal) return;
    var holidays = loadHolidays();
    if (editingHolidayIdx >= 0 && editingHolidayIdx < holidays.length) {
        holidays[editingHolidayIdx] = { date: dateVal, name: nameVal, type: typeVal };
    } else {
        holidays.push({ date: dateVal, name: nameVal, type: typeVal });
    }
    saveHolidays(holidays);
    renderHolidays();
    hideHolidayForm();
    var toast = new bootstrap.Toast(document.getElementById('successToast'));
    document.getElementById('toastMessage').textContent = editingHolidayIdx >= 0 ? 'Holiday updated.' : 'Holiday added.';
    toast.show();
});

/* Cancel button */
document.getElementById('cancelHolidayBtn')?.addEventListener('click', function() {
    hideHolidayForm();
});

/* Edit click (delegated) */
document.addEventListener('click', function(e) {
    var editBtn = e.target.closest('.emp-dropdown-item.holiday-edit');
    if (!editBtn) return;
    e.preventDefault();
    var idx = parseInt(editBtn.getAttribute('data-idx'), 10);
    if (isNaN(idx)) return;
    var holidays = loadHolidays();
    var h = holidays[idx];
    if (!h) return;
    editingHolidayIdx = idx;
    document.getElementById('holidayDate').value = h.date;
    document.getElementById('holidayName').value = h.name;
    document.getElementById('holidayType').value = h.type;
    editBtn.closest('.emp-actions')?.classList.remove('open');
    showHolidayForm();
});

/* Delete via confirm() */
document.addEventListener('click', function(e) {
    var delBtn = e.target.closest('.emp-dropdown-item.holiday-delete');
    if (!delBtn) return;
    e.preventDefault();
    var idx = parseInt(delBtn.getAttribute('data-idx'), 10);
    if (isNaN(idx)) return;
    var holidays = loadHolidays();
    var h = holidays[idx];
    if (!h) return;
    delBtn.closest('.emp-actions')?.classList.remove('open');
    if (confirm('Remove "' + h.name + '" holiday?')) {
        holidays.splice(idx, 1);
        saveHolidays(holidays);
        renderHolidays();
        var toast = new bootstrap.Toast(document.getElementById('successToast'));
        document.getElementById('toastMessage').textContent = 'Holiday removed.';
        toast.show();
    }
});

/* ========== LEAVE REQUEST FORM ========== */

function populateLeaveRequestModal() {
    var empSel = document.getElementById('lrEmployee');
    var typeSel = document.getElementById('lrType');
    if (!empSel || !typeSel) return;
    empSel.innerHTML = '<option value="">— Select Employee —</option>';
    getEmployees().forEach(function(emp) {
        var opt = document.createElement('option');
        opt.value = emp.name;
        opt.textContent = emp.name + ' (' + (emp.empId || '') + ')';
        empSel.appendChild(opt);
    });
    typeSel.innerHTML = '<option value="">— Select Type —</option>';
    LEAVE_TYPES.forEach(function(t) {
        var opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        typeSel.appendChild(opt);
    });
}

function showLeaveBalanceInfo() {
    var empName = document.getElementById('lrEmployee').value;
    var leaveType = document.getElementById('lrType').value;
    var infoEl = document.getElementById('lrBalanceInfo');
    if (!infoEl) return;
    if (!empName || !leaveType) { infoEl.style.display = 'none'; return; }
    var data = getLeaveData();
    if (!data || !data.balances || !data.balances[empName]) { infoEl.style.display = 'none'; return; }
    var b = data.balances[empName];
    var key = leaveTypeToKey(leaveType);
    var balance = b[key];
    if (balance === undefined || balance === null) { infoEl.style.display = 'none'; return; }
    infoEl.style.display = 'block';
    infoEl.style.background = balance > 0 ? '#d4edda' : '#f8d7da';
    infoEl.style.color = balance > 0 ? '#155724' : '#721c24';
    infoEl.textContent = 'Available ' + leaveType + ' balance: ' + balance + ' day' + (balance > 1 ? 's' : '');
}

function leaveTypeToKey(type) {
    var map = {
        'Annual Leave': 'annual',
        'FRL': 'frl',
        'Sick Leave Medical': 'sickMedical',
        'Sick Leave': 'sick',
        'Circumcision Leave': 'circumcision',
        'Paternity Leave': 'paternity',
        'Maternity Leave': 'maternity',
        'No Pay Leave': 'noPay',
        'Umrah Leave': 'umrah',
        'Hajj Leave': 'hajj'
    };
    return map[type] || 'annual';
}

document.addEventListener('change', function(e) {
    if (e.target.id === 'lrEmployee' || e.target.id === 'lrType') showLeaveBalanceInfo();
});

document.addEventListener('click', function(e) {
    if (e.target.id === 'requestLeaveBtn' || e.target.closest('#requestLeaveBtn')) {
        var row = document.getElementById('leaveFormRow');
        if (!row) return;
        if (row.style.display === 'none') {
            populateLeaveRequestModal();
            document.getElementById('lrBalanceInfo').style.display = 'none';
            document.getElementById('lrFrom').value = '';
            document.getElementById('lrTo').value = '';
            document.getElementById('lrNotes').value = '';
            document.getElementById('lrSubmitBtn').innerHTML = '<i class="bi bi-check-lg"></i> Submit';
            editingRequestId = null;
            row.style.display = 'block';
        } else {
            row.style.display = 'none';
        }
    }
});

document.addEventListener('click', function(e) {
    if (e.target.id === 'lrCancelBtn' || e.target.closest('#lrCancelBtn')) {
        var row = document.getElementById('leaveFormRow');
        if (row) row.style.display = 'none';
        document.getElementById('lrSubmitBtn').innerHTML = '<i class="bi bi-check-lg"></i> Submit';
        editingRequestId = null;
    }
});

document.addEventListener('click', function(e) {
    if (e.target.id === 'lrSubmitBtn' || e.target.closest('#lrSubmitBtn')) {
        var empName = document.getElementById('lrEmployee').value;
        var leaveType = document.getElementById('lrType').value;
        var fromVal = document.getElementById('lrFrom').value;
        var toVal = document.getElementById('lrTo').value;
        var notes = document.getElementById('lrNotes').value;

        if (!empName || !leaveType || !fromVal || !toVal) {
            alert('Please fill all required fields.');
            return;
        }
        var from = new Date(fromVal + 'T00:00:00');
        var to = new Date(toVal + 'T00:00:00');
        if (isNaN(from) || isNaN(to) || to < from) {
            alert('To date must be on or after from date.');
            return;
        }
        var days = Math.floor((to - from) / (24 * 60 * 60 * 1000)) + 1;

        var data = getLeaveData();
        if (!data) { alert('Leave data not initialized.'); return; }
        var key = leaveTypeToKey(leaveType);
        var balance = data.balances[empName] ? data.balances[empName][key] : 0;
        if (balance !== undefined && days > balance) {
            alert('Insufficient ' + leaveType + ' balance. Available: ' + balance + ', Requested: ' + days);
            return;
        }

        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var emp = getEmployees().filter(function(e){ return e.name === empName; })[0] || {};

        if (editingRequestId) {
            /* Update existing request */
            for (var i = 0; i < data.requests.length; i++) {
                if (data.requests[i]._id === editingRequestId) {
                    var old = data.requests[i];
                    /* Adjust balance if was approved and days changed */
                    if (old.status === 'Approved') {
                        var oldKey = leaveTypeToKey(old.type);
                        var bal = data.balances[old.employee];
                        if (bal && bal[oldKey] !== undefined) {
                            bal[oldKey] += old.days; /* restore old */
                            bal.total = (bal.total || 0) + old.days;
                        }
                    }
                    old.employee = empName;
                    old.initials = initialsOf(empName);
                    old.color = avatarColorFor(empName);
                    old.type = leaveType;
                    old.from = months[from.getMonth()] + ' ' + from.getDate();
                    old.to = months[to.getMonth()] + ' ' + to.getDate();
                    old.days = days;
                    old.notes = notes || '';
                    /* Re-check balance if now approved (status unchanged unless re-approved) */
                    if (old.status === 'Approved') {
                        var newKey = leaveTypeToKey(leaveType);
                        var bal2 = data.balances[empName];
                        if (bal2 && bal2[newKey] !== undefined) {
                            if (days > bal2[newKey]) {
                                alert('Insufficient ' + leaveType + ' balance. Available: ' + bal2[newKey] + ', Requested: ' + days);
                                return;
                            }
                            bal2[newKey] -= days;
                            bal2.total = (bal2.total || 0) - days;
                        }
                    }
                    break;
                }
            }
            editingRequestId = null;
        } else {
            /* New request */
            var req = {
                _id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
                employee: empName,
                initials: initialsOf(empName),
                color: avatarColorFor(empName),
                type: leaveType,
                from: months[from.getMonth()] + ' ' + from.getDate(),
                to: months[to.getMonth()] + ' ' + to.getDate(),
                days: days,
                status: 'Pending',
                notes: notes || '',
                submitted: new Date().toISOString()
            };
            data.requests.push(req);
        }
        lsSave(LS_KEY_LEAVE, data);

        var wasEditing = editingRequestId;
        var row = document.getElementById('leaveFormRow');
        if (row) row.style.display = 'none';
        document.getElementById('lrSubmitBtn').innerHTML = '<i class="bi bi-check-lg"></i> Submit';
        editingRequestId = null;

        renderAllFromEmployees();
        var toast = new bootstrap.Toast(document.getElementById('successToast'));
        document.getElementById('toastMessage').textContent = wasEditing ? 'Leave request updated.' : 'Leave request submitted for ' + empName + '.';
        toast.show();
    }
});

/* Approve / Reject leave requests via delegated clicks */
document.addEventListener('click', function(e) {
    var target = e.target;
    var rid = target.getAttribute && target.getAttribute('data-rid');
    if (!rid) return;
    var isApprove = target.classList.contains('lr-approve');
    var isReject = target.classList.contains('lr-reject');
    if (!isApprove && !isReject) return;

    var data = getLeaveData();
    if (!data) return;
    var idx = -1;
    data.requests.forEach(function(r, i) { if (r._id === rid) idx = i; });
    if (idx === -1) return;

    var req = data.requests[idx];
    if (isApprove) {
        var key = leaveTypeToKey(req.type);
        var bal = data.balances[req.employee];
        if (bal && bal[key] !== undefined) {
            if (req.days > bal[key]) {
                alert('Insufficient ' + req.type + ' balance to approve. Available: ' + bal[key] + ', Requested: ' + req.days);
                return;
            }
            bal[key] -= req.days;
            bal.total = (bal.total || 0) - req.days;
        }
    }
    req.status = isApprove ? 'Approved' : 'Rejected';
    lsSave(LS_KEY_LEAVE, data);
    renderAllFromEmployees();

    var action = isApprove ? 'approved' : 'rejected';
    var toast = new bootstrap.Toast(document.getElementById('successToast'));
    document.getElementById('toastMessage').textContent = 'Leave request ' + action + ' for ' + data.requests[idx].employee + '.';
    toast.show();
});

/* ========== LEAVE REQUEST EDIT / DELETE ========== */

var editingRequestId = null;

document.addEventListener('click', function(e) {
    var target = e.target;
    var rid = target.getAttribute && target.getAttribute('data-rid');
    if (!rid) return;

    /* Delete */
    if (target.classList.contains('lr-delete')) {
        if (!confirm('Delete this leave request?')) return;
        var data = getLeaveData();
        if (!data) return;
        for (var i = 0; i < data.requests.length; i++) {
            if (data.requests[i]._id === rid) {
                var req = data.requests[i];
                /* Restore balance if the request was approved */
                if (req.status === 'Approved') {
                    var key = leaveTypeToKey(req.type);
                    var bal = data.balances[req.employee];
                    if (bal && bal[key] !== undefined) {
                        bal[key] += req.days;
                        bal.total = (bal.total || 0) + req.days;
                    }
                }
                data.requests.splice(i, 1);
                break;
            }
        }
        lsSave(LS_KEY_LEAVE, data);
        renderAllFromEmployees();
        var toast = new bootstrap.Toast(document.getElementById('successToast'));
        document.getElementById('toastMessage').textContent = 'Leave request deleted.';
        toast.show();
        return;
    }

    /* Edit */
    if (target.classList.contains('lr-edit')) {
        var data = getLeaveData();
        if (!data) return;
        var req = null;
        for (var i = 0; i < data.requests.length; i++) {
            if (data.requests[i]._id === rid) { req = data.requests[i]; break; }
        }
        if (!req) return;
        editingRequestId = rid;

        /* Populate and show inline form */
        var row = document.getElementById('leaveFormRow');
        if (!row) return;
        populateLeaveRequestModal();
        document.getElementById('lrEmployee').value = req.employee;
        document.getElementById('lrType').value = req.type;
        /* Parse dates back to yyyy-mm-dd format for date inputs */
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var fromParts = (req.from || '').split(' ');
        var toParts = (req.to || '').split(' ');
        if (fromParts.length === 2) {
            var m = months.indexOf(fromParts[0]);
            var d = fromParts[1].padStart(2, '0');
            var y = calCurrentDate.getFullYear(); /* approximate year from calendar state */
            if (m >= 0) document.getElementById('lrFrom').value = y + '-' + String(m+1).padStart(2,'0') + '-' + d;
        }
        if (toParts.length === 2) {
            var m = months.indexOf(toParts[0]);
            var d = toParts[1].padStart(2, '0');
            var y = calCurrentDate.getFullYear();
            if (m >= 0) document.getElementById('lrTo').value = y + '-' + String(m+1).padStart(2,'0') + '-' + d;
        }
        document.getElementById('lrNotes').value = req.notes || '';
        document.getElementById('lrSubmitBtn').innerHTML = '<i class="bi bi-check-lg"></i> Update';
        row.style.display = 'block';
        showLeaveBalanceInfo();
        return;
    }
});

/* ========== LEAVE CALENDAR ========== */

var calCurrentDate = new Date();
calCurrentDate.setDate(1);

var CAL_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var CAL_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var CAL_TYPE_COLORS = {
    'Annual Leave': '#895129',
    'FRL': '#e67e22',
    'Sick Leave Medical': '#c0392b',
    'Sick Leave': '#e74c3c',
    'Circumcision Leave': '#8e44ad',
    'Paternity Leave': '#2980b9',
    'Maternity Leave': '#e91e8a',
    'No Pay Leave': '#7f8c8d',
    'Umrah Leave': '#27ae60',
    'Hajj Leave': '#2ecc71'
};

function renderLeaveCalendar(data) {
    var grid = document.getElementById('calGrid');
    var header = document.getElementById('calMonthYear');
    if (!grid || !header) return;
    var year = calCurrentDate.getFullYear();
    var month = calCurrentDate.getMonth();
    header.textContent = CAL_FULL[month] + ' ' + year;

    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    /* Convert JS day (0=Sun,6=Sat) to Saturday-first offset */
    var startOffset = (firstDay + 1) % 7;

    /* Build leave lookup: which employees are on leave each day this month */
    var leaveMap = {};
    (data.requests || []).forEach(function(req) {
        if (req.status !== 'Approved') return;
        var fromParts = (req.from || '').split(' ');
        var toParts = (req.to || '').split(' ');
        if (fromParts.length < 2 || toParts.length < 2) return;
        var fromMon = CAL_MONTHS.indexOf(fromParts[0]);
        var fromDay = parseInt(fromParts[1]);
        var toDay = parseInt(toParts[1]);
        /* Only show leaves whose from-month matches current calendar month */
        if (fromMon !== month) return;
        for (var d = fromDay; d <= toDay && d <= daysInMonth; d++) {
            if (!leaveMap[d]) leaveMap[d] = [];
            leaveMap[d].push(req);
        }
    });

    var html = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">';
    ['Sat','Sun','Mon','Tue','Wed','Thu','Fri'].forEach(function(dn) {
        html += '<div style="text-align:center;font-weight:600;font-size:0.8rem;padding:8px 0;color:var(--gray-text,#888);">' + dn + '</div>';
    });
    for (var i = 0; i < startOffset; i++) {
        html += '<div></div>';
    }
    for (var d = 1; d <= daysInMonth; d++) {
        var entries = leaveMap[d] || [];
        var bg = entries.length ? '#fff3e0' : '';
        html += '<div style="min-height:72px;padding:4px 6px;border-radius:6px;background:' + bg + ';border:1px solid var(--gray-200,#eef0f4);">';
        html += '<div style="font-weight:600;font-size:0.8rem;margin-bottom:2px;color:var(--text,#1e1e2f);">' + d + '</div>';
        entries.forEach(function(lr) {
            var c = CAL_TYPE_COLORS[lr.type] || lr.color;
            html += '<div style="font-size:0.75rem;background:' + c + ';color:#fff;border-radius:4px;padding:1px 4px;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:default;" title="' + lr.employee + ' - ' + lr.type + '">' + lr.employee + '</div>';
        });
        html += '</div>';
    }
    html += '</div>';
    grid.innerHTML = html;

    /* Legend */
    var leg = document.getElementById('calLegend');
    if (leg) {
        var lhtml = '<div style="font-weight:600;font-size:0.85rem;margin-bottom:8px;color:var(--text,#1e1e2f);">Leave Types</div>';
        Object.keys(CAL_TYPE_COLORS).forEach(function(t) {
            lhtml += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:0.75rem;color:var(--text,#1e1e2f);">' +
                '<span style="width:12px;height:12px;border-radius:3px;background:' + CAL_TYPE_COLORS[t] + ';flex-shrink:0;"></span>' +
                t + '</div>';
        });
        leg.innerHTML = lhtml;
    }
}

document.addEventListener('click', function(e) {
    if (e.target.id === 'calPrev' || e.target.closest('#calPrev')) {
        calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
        var data = getLeaveData();
        if (data) renderLeaveCalendar(data); else renderLeaveCalendar({ requests: [] });
    }
    if (e.target.id === 'calNext' || e.target.closest('#calNext')) {
        calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
        var data = getLeaveData();
        if (data) renderLeaveCalendar(data); else renderLeaveCalendar({ requests: [] });
    }
});

function renderAllFromEmployees() {
    var boardList = document.querySelector('.emp-board-list');
    if (boardList) boardList.innerHTML = '';

    var emps = getEmployees();
    var data = initLeaveData();
    renderDashboardStats(emps);
    renderRecentHires(emps);
    renderDeptSummary(emps);
    if (data) {
        renderLeaveStats(data);
        renderLeaveRequests(data);
        renderPendingApprovals(data);
        renderLeaveBalanceSummary(data);
        renderApprovalWorkflow(data);
        renderLeaveBalances(data);
        renderSickLeaveTracking(data);
        renderLeaveCalendar(data);
    }
    renderHolidays();
}

/* Run on load and after data changes */
renderAllFromEmployees();

    if (typeof Chart !== 'undefined') {
        /* Chart builds lazily on first showWorkforce() call */
    }
})();
