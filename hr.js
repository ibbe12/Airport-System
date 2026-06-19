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
    var toastTimer = null;

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

    var _toastDebounce = {};
    function showToast(el, msg) {
        var id = el.id;
        var now = Date.now();
        if (_toastDebounce[id] && now - _toastDebounce[id] < 800) return;
        _toastDebounce[id] = now;
        el.querySelector('.toast-body span') && (el.querySelector('.toast-body span').textContent = msg);
        var t = new bootstrap.Toast(el);
        t.show();
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
        if (attendanceSection) attendanceSection.style.display = 'none';
        if (attendanceSubnav) attendanceSubnav.style.display = 'none';
        if (settingsSection) settingsSection.style.display = 'none';
        if (empSection) empSection.style.display = 'none';
        var hm = document.querySelector('.hr-main');
        if (hm) hm.classList.remove('cal-fullscreen');
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
            } else if (key === 'attendance') {
                showFullAttendanceSection();
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
    const attendanceSection = document.getElementById('attendanceSection');
    const attendanceSubnav = document.getElementById('attendanceSubnav');
    const attendanceNavItems = attendanceSubnav ? attendanceSubnav.querySelectorAll('.hr-subnav-item') : [];
    const attendanceContentItems = document.querySelectorAll('.attendance-content');
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
        var hm = document.querySelector('.hr-main');
        if (hm) hm.classList.toggle('cal-fullscreen', key === 'calendar');
        /* Re-render calendar when switching to calendar tab */
        if (key === 'calendar') {
            var data = getLeaveData();
            if (data) renderLeaveCalendar(data); else renderLeaveCalendar({ requests: [] });
        }
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

    function showAttendanceContent(key) {
        attendanceContentItems.forEach(function (c) {
            c.style.display = c.dataset.attendance === key ? '' : 'none';
        });
    }

    function showFullAttendanceSection() {
        hideAllContent();
        if (hrSubnav) hrSubnav.classList.toggle('hidden', true);
        if (empSubnav) empSubnav.style.display = 'none';
        if (pageEmpty) pageEmpty.style.display = 'none';
        if (attendanceSection) attendanceSection.style.display = 'block';
        if (attendanceSubnav) attendanceSubnav.style.display = '';
        var first = attendanceNavItems[0];
        if (first) {
            attendanceNavItems.forEach(function (n) { n.classList.remove('active'); });
            first.classList.add('active');
            showAttendanceContent(first.dataset.attendance);
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
            } else if (sub === 'attendance') {
                showFullAttendanceSection();
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

    /* ---------- Attendance Sub-nav items ---------- */
    if (attendanceNavItems.length) {
        attendanceNavItems.forEach(function (item) {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                attendanceNavItems.forEach(function (s) { s.classList.remove('active'); });
                item.classList.add('active');
                var key = item.dataset.attendance;
                if (key) showAttendanceContent(key);
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
        var daysDisplay = (r.type === 'Annual Leave' && r.rawDays) ? r.days + ' / ' + r.rawDays : r.days;
        var badgeCls = r.status === 'Approved' ? 'md-badge-open' : (r.status === 'Pending' ? 'md-badge-closed' : 'md-badge-closed');
        var colorStyle = r.status === 'Rejected' ? 'color:#dc3545;' : '';
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><div class="md-user-cell"><span class="md-avatar-sm" style="background:' + r.color + ';">' + r.initials + '</span><strong>' + r.employee + '</strong></div></td>' +
            '<td>' + r.type + '</td><td>' + r.from + '</td><td>' + r.to + '</td><td title="working / calendar">&thinsp;' + daysDisplay + '</td>' +
            '<td><span class="md-badge ' + badgeCls + '" style="' + colorStyle + '">' + r.status + '</span></td>' +
            '<td><span class="md-action-btns" style="display:flex;gap:4px;">' +
            '<span class="lr-edit" style="color:var(--gray-text,#888);font-size:0.75rem;cursor:pointer;padding:2px 8px;border:1px solid var(--gray-300,#ddd);border-radius:4px;" data-rid="' + r._id + '">Edit</span>' +
            '<span class="lr-delete" style="color:#dc3545;font-size:0.75rem;cursor:pointer;padding:2px 8px;border:1px solid #dc3545;border-radius:4px;" data-rid="' + r._id + '">Delete</span></span></td>';
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
            '<span class="md-action-btns" style="display:flex;gap:4px;">' +
            '<span class="lr-approve" style="color:#155724;font-size:0.7rem;cursor:pointer;padding:2px 8px;background:#d4edda;border:1px solid #c3e6cb;border-radius:4px;font-weight:500;" data-rid="' + r._id + '">Approve</span>' +
            '<span class="lr-reject" style="color:#721c24;font-size:0.7rem;cursor:pointer;padding:2px 8px;background:#f8d7da;border:1px solid #f5c6cb;border-radius:4px;font-weight:500;" data-rid="' + r._id + '">Reject</span></span>';
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
            '<td>' + (b.umrah ?? '—') + '</td><td>' + (b.hajj ?? '—') + '</td>';
        tbody.appendChild(tr);
    });
}

function renderApprovalWorkflow(data) {
    var tbody = document.querySelector('.leave-content[data-leave="approvals"] .md-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    var allReqs = data.requests.slice().sort(function(a, b) {
        return (b.submitted || '').localeCompare(a.submitted || '');
    });
    allReqs.forEach(function(r) {
        var daysDisplay = (r.type === 'Annual Leave' && r.rawDays) ? r.days + ' / ' + r.rawDays : r.days;
        var actions = '';
        if (r.status === 'Pending') {
            actions += '<span class="lr-approve" style="color:#155724;font-size:0.72rem;cursor:pointer;padding:2px 8px;background:#d4edda;border:1px solid #c3e6cb;border-radius:4px;font-weight:500;" data-rid="' + r._id + '">Approve</span>' +
                '<span class="lr-reject" style="color:#721c24;font-size:0.72rem;cursor:pointer;padding:2px 8px;background:#f8d7da;border:1px solid #f5c6cb;border-radius:4px;font-weight:500;" data-rid="' + r._id + '">Reject</span>';
        }
        actions += '<span class="lr-edit" style="color:var(--gray-text,#888);font-size:0.72rem;cursor:pointer;padding:2px 8px;border:1px solid var(--gray-300,#ddd);border-radius:4px;" data-rid="' + r._id + '">Edit</span>' +
            '<span class="lr-delete" style="color:#dc3545;font-size:0.72rem;cursor:pointer;padding:2px 8px;border:1px solid #dc3545;border-radius:4px;" data-rid="' + r._id + '">Delete</span>';
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><div class="md-user-cell"><span class="md-avatar-sm" style="background:' + r.color + ';">' + r.initials + '</span><strong>' + r.employee + '</strong></div></td>' +
            '<td>' + r.type + '</td><td>' + r.from + '</td><td>' + r.to + '</td><td title="working / calendar">&thinsp;' + daysDisplay + '</td>' +
            '<td><span class="md-badge ' + (r.status === 'Approved' ? 'md-badge-open' : 'md-badge-closed') + '">' + r.status + '</span></td>' +
            '<td><span class="md-action-btns" style="display:flex;gap:4px;">' + actions + '</span></td>';
        tbody.appendChild(tr);
    });
}

function renderLeaveBalances(data) {
    var tbody = document.querySelector('.leave-content[data-leave="balances"] .md-table tbody');
    if (!tbody) return;
    var searchVal = (document.getElementById('lbSearch')?.value || '').toLowerCase();
    var deptVal = document.getElementById('lbDeptFilter')?.value || '';
    var desigVal = document.getElementById('lbDesigFilter')?.value || '';
    tbody.innerHTML = '';
    var emps = getEmployees();
    emps.forEach(function(emp) {
        var searchText = (emp.name + ' ' + (emp.sn || '') + ' ' + (emp.nic || '') + ' ' + (emp.mobile || '')).toLowerCase();
        var nameMatch = searchText.indexOf(searchVal) !== -1;
        var deptMatch = !deptVal || emp.department === deptVal;
        var desigMatch = !desigVal || emp.position === desigVal;
        if (!nameMatch || !deptMatch || !desigMatch) return;
        var b = data.balances[emp.name] || {};
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + (emp.sn || '—') + '</td><td><strong>' + emp.name + '</strong></td>' +
            '<td>' + (b.annual ?? '—') + '</td><td>' + (b.frl ?? '—') + '</td>' +
            '<td>' + (b.sickMedical ?? '—') + '</td><td>' + (b.sick ?? '—') + '</td>' +
            '<td>' + (b.circumcision ?? '—') + '</td><td>' + (b.paternity ?? '—') + '</td>' +
            '<td>' + (b.maternity ?? '—') + '</td><td>' + (b.noPay ?? '—') + '</td>' +
            '<td>' + (b.umrah ?? '—') + '</td><td>' + (b.hajj ?? '—') + '</td>';
        tbody.appendChild(tr);
    });
}

/* Populate leave balances filter dropdowns */
function populateLbFilters() {
    var deptSel = document.getElementById('lbDeptFilter');
    var desigSel = document.getElementById('lbDesigFilter');
    if (deptSel) {
        var deptCur = deptSel.value;
        deptSel.innerHTML = '<option value="">All Departments</option>';
        var emps = getEmployees();
        var depts = {};
        emps.forEach(function(e) { if (e.department) depts[e.department] = true; });
        Object.keys(depts).sort().forEach(function(d) {
            var opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            deptSel.appendChild(opt);
        });
        deptSel.value = deptCur;
    }
    if (desigSel) {
        var desigCur = desigSel.value;
        desigSel.innerHTML = '<option value="">All Designations</option>';
        var emps2 = getEmployees();
        var desigs = {};
        emps2.forEach(function(e) { if (e.position) desigs[e.position] = true; });
        Object.keys(desigs).sort().forEach(function(d) {
            var opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            desigSel.appendChild(opt);
        });
        desigSel.value = desigCur;
    }
}

/* Bind leave balances filter events */
document.addEventListener('input', function(e) {
    if (e.target.id === 'lbSearch') {
        var data = getLeaveData();
        if (data) renderLeaveBalances(data);
    }
});
document.addEventListener('change', function(e) {
    if (e.target.id === 'lbDeptFilter' || e.target.id === 'lbDesigFilter') {
        var data = getLeaveData();
        if (data) renderLeaveBalances(data);
    }
});

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

/* ---------- Annual Leave Planning ---------- */
var ALP_KEY = 'hrf-leave-plan';
var alpDate = new Date();
alpDate.setDate(1);
var alpView = 'month';

function loadAlpData() {
    return lsLoad(ALP_KEY, {});
}

function saveAlpData(data) {
    lsSave(ALP_KEY, data);
}

function updateAlpViewBtn(v) {
    alpView = v;
    document.querySelectorAll('.alp-view-btns button').forEach(function(b) {
        if (b.getAttribute('data-view') === v) {
            b.style.textDecoration = 'underline';
            b.style.textUnderlineOffset = '3px';
            b.style.textDecorationColor = '#895129';
            b.style.textDecorationThickness = '2px';
        } else {
            b.style.textDecoration = 'none';
        }
    });
}

function renderAnnualLeavePlanning(emps) {
    populateAlpFilters(emps);
    renderAlpGrid();
}

function populateAlpFilters(emps) {
    var deptSel = document.getElementById('alpDeptFilter');
    var desigSel = document.getElementById('alpDesigFilter');
    if (!deptSel || !desigSel) return;

    var depts = {}, desigs = {};
    emps.forEach(function(e) {
        if (e.department) depts[e.department] = true;
        if (e.position) desigs[e.position] = true;
    });
    var curDept = deptSel.value;
    var curDesig = desigSel.value;
    deptSel.innerHTML = '<option value="">All Departments</option>';
    Object.keys(depts).sort().forEach(function(d) {
        deptSel.innerHTML += '<option value="' + d.replace(/"/g, '&quot;') + '">' + d + '</option>';
    });
    desigSel.innerHTML = '<option value="">All Designations</option>';
    Object.keys(desigs).sort().forEach(function(d) {
        desigSel.innerHTML += '<option value="' + d.replace(/"/g, '&quot;') + '">' + d + '</option>';
    });
    deptSel.value = curDept;
    desigSel.value = curDesig;
}

function getFilteredEmps() {
    var emps = getEmployees();
    var dept = document.getElementById('alpDeptFilter');
    var desig = document.getElementById('alpDesigFilter');
    var deptVal = dept ? dept.value : '';
    var desigVal = desig ? desig.value : '';
    return emps.filter(function(e) {
        if (deptVal && e.department !== deptVal) return false;
        if (desigVal && e.position !== desigVal) return false;
        return true;
    });
}

function renderAlpGrid() {
    if (alpView === 'year') renderAlpYearView();
    else if (alpView === 'week') renderAlpWeekView();
    else renderAlpMonthView();
}

function renderAlpYearView() {
    var head = document.getElementById('alpGridHead');
    var body = document.getElementById('alpGridBody');
    var title = document.getElementById('alpTitle');
    if (!head || !body || !title) return;

    var year = alpDate.getFullYear();
    var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var fullMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    title.textContent = 'Year ' + year;

    var planData = loadAlpData();
    var leaveData = getLeaveData();
    var balances = leaveData ? leaveData.balances || {} : {};

    /* Header row */
    var headerHtml = '<tr><th style="position:sticky;top:0;left:0;z-index:3;background:var(--cream,#fffdd0);padding:6px 8px;border:1px solid var(--gray-200,#eef0f4);text-align:left;min-width:140px;font-weight:700;">Employee</th>';
    headerHtml += '<th style="position:sticky;top:0;z-index:2;background:var(--cream,#fffdd0);padding:6px 6px;border:1px solid var(--gray-200,#eef0f4);text-align:center;min-width:50px;font-size:0.72rem;font-weight:700;">AL Balance</th>';
    headerHtml += '<th style="position:sticky;top:0;z-index:2;background:var(--cream,#fffdd0);padding:6px 6px;border:1px solid var(--gray-200,#eef0f4);text-align:center;min-width:50px;font-size:0.72rem;font-weight:700;">Plan</th>';
    for (var m = 0; m < 12; m++) {
        headerHtml += '<th style="position:sticky;top:0;z-index:2;background:var(--cream,#fffdd0);padding:8px 4px;border:1px solid var(--gray-200,#eef0f4);text-align:center;min-width:60px;font-size:0.75rem;">' + monthNames[m] + '</th>';
    }
    headerHtml += '<th style="position:sticky;top:0;z-index:2;background:var(--cream,#fffdd0);padding:8px 4px;border:1px solid var(--gray-200,#eef0f4);text-align:center;min-width:50px;font-size:0.75rem;font-weight:700;">Total</th>';
    head.innerHTML = headerHtml;

    var emps = getFilteredEmps();
    if (emps.length === 0) {
        body.innerHTML = '<tr><td colspan="16" style="text-align:center;padding:40px 0;color:var(--gray-text);">No employees found.</td></tr>';
        return;
    }

    var bodyHtml = '';
    emps.forEach(function(emp) {
        var initials = (emp.initials || '').slice(0, 2).toUpperCase() || emp.name.slice(0, 2).toUpperCase();
        var empColor = emp.color || '#895129';
        var empPlan = planData[emp.name] || [];
        if (!Array.isArray(empPlan)) empPlan = [];

        var bal = balances[emp.name] ? (balances[emp.name].annual || 0) : 0;

        var monthCounts = [];
        var total = 0;
        for (var m = 0; m < 12; m++) {
            var count = 0;
            var prefix = year + '-' + String(m + 1).padStart(2, '0');
            empPlan.forEach(function(ds) {
                if (ds.indexOf(prefix) === 0) count++;
            });
            monthCounts.push(count);
            total += count;
        }

        bodyHtml += '<tr>' +
            '<td style="padding:6px 8px;border:1px solid var(--gray-200,#eef0f4);white-space:nowrap;font-size:0.78rem;position:sticky;left:0;background:var(--cream,#fffdd0);z-index:1;">' +
            '<span class="alp-avatar" style="background:' + empColor + ';width:22px;height:22px;font-size:0.65rem;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;font-weight:700;margin-right:6px;">' + initials + '</span>' +
            emp.name + '</td>' +
            '<td style="padding:6px 4px;border:1px solid var(--gray-200,#eef0f4);text-align:center;font-size:0.78rem;font-weight:600;' + (bal <= 0 ? 'color:#dc3545;' : '') + '">' + bal + '</td>' +
            '<td style="padding:6px 4px;border:1px solid var(--gray-200,#eef0f4);text-align:center;font-size:0.78rem;font-weight:700;">' + (total || '') + '</td>';

        for (var m = 0; m < 12; m++) {
            var hasPlan = monthCounts[m] > 0;
            bodyHtml += '<td style="padding:6px 4px;border:1px solid var(--gray-200,#eef0f4);text-align:center;font-size:0.78rem;' +
                (hasPlan ? 'background:#895129;color:#fff;font-weight:600;' : '') +
                '">' + (monthCounts[m] || '') + '</td>';
        }
        bodyHtml += '<td style="padding:6px 4px;border:1px solid var(--gray-200,#eef0f4);text-align:center;font-size:0.8rem;font-weight:700;">' + (total || '') + '</td>';
        bodyHtml += '</tr>';
    });
    body.innerHTML = bodyHtml;
}

function renderAlpMonthView() {
    var head = document.getElementById('alpGridHead');
    var body = document.getElementById('alpGridBody');
    var title = document.getElementById('alpTitle');
    if (!head || !body || !title) return;

    var year = alpDate.getFullYear();
    var month = alpDate.getMonth();
    var fullMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    title.textContent = fullMonths[month] + ' ' + year;

    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var planData = loadAlpData();
    var holidays = loadHolidays();
    var holidayMap = {};
    holidays.forEach(function(h) { holidayMap[h.date] = h; });
    var leaveData = getLeaveData();
    var balances = leaveData ? leaveData.balances || {} : {};

    /* Header row */
    var headerHtml = '<tr><th style="position:sticky;top:0;left:0;z-index:3;background:var(--cream,#fffdd0);padding:6px 8px;border:1px solid var(--gray-200,#eef0f4);text-align:left;min-width:140px;font-weight:700;">Employee</th>';
    headerHtml += '<th style="position:sticky;top:0;z-index:2;background:var(--cream,#fffdd0);padding:6px 6px;border:1px solid var(--gray-200,#eef0f4);text-align:center;min-width:40px;font-size:0.72rem;font-weight:700;">AL Balance</th>';
    headerHtml += '<th style="position:sticky;top:0;z-index:2;background:var(--cream,#fffdd0);padding:6px 6px;border:1px solid var(--gray-200,#eef0f4);text-align:center;min-width:40px;font-size:0.72rem;font-weight:700;">Plan</th>';
    for (var d = 1; d <= daysInMonth; d++) {
        var dow = new Date(year, month, d).getDay();
        var isWeekend = dow === 5;
        headerHtml += '<th style="position:sticky;top:0;z-index:2;background:var(--cream,#fffdd0);padding:6px 2px;border:1px solid var(--gray-200,#eef0f4);text-align:center;min-width:28px;font-size:0.72rem;' +
            (isWeekend ? 'color:var(--gray-text,#aaa);' : '') + '">' + d + '</th>';
    }
    head.innerHTML = headerHtml;

    var emps = getFilteredEmps();
    if (emps.length === 0) {
        body.innerHTML = '<tr><td colspan="' + (daysInMonth + 3) + '" style="text-align:center;padding:40px 0;color:var(--gray-text);">No employees found.</td></tr>';
        return;
    }

    var bodyHtml = '';
    emps.forEach(function(emp) {
        var initials = (emp.initials || '').slice(0, 2).toUpperCase() || emp.name.slice(0, 2).toUpperCase();
        var empColor = emp.color || '#895129';
        var empPlan = planData[emp.name] || {};
        var dateSet = {};
        if (Array.isArray(empPlan)) {
            empPlan.forEach(function(ds) { dateSet[ds] = true; });
        }

        var bal = balances[emp.name] ? (balances[emp.name].annual || 0) : 0;
        var empTotal = Array.isArray(empPlan) ? empPlan.length : 0;

        bodyHtml += '<tr>' +
            '<td style="padding:4px 8px;border:1px solid var(--gray-200,#eef0f4);white-space:nowrap;font-size:0.78rem;position:sticky;left:0;background:var(--cream,#fffdd0);z-index:1;">' +
            '<span class="alp-avatar" style="background:' + empColor + ';width:22px;height:22px;font-size:0.65rem;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;font-weight:700;margin-right:6px;">' + initials + '</span>' +
            emp.name + '</td>' +
            '<td style="padding:4px 6px;border:1px solid var(--gray-200,#eef0f4);text-align:center;font-size:0.72rem;font-weight:600;' + (bal <= 0 ? 'color:#dc3545;' : '') + '">' + bal + '</td>' +
            '<td style="padding:4px 6px;border:1px solid var(--gray-200,#eef0f4);text-align:center;font-size:0.72rem;font-weight:700;">' + (empTotal || '') + '</td>';

        for (var d = 1; d <= daysInMonth; d++) {
            var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            var dow = new Date(year, month, d).getDay();
            var isFriday = dow === 5;
            var isPlanned = dateSet[dateStr] === true;
            var isHoliday = holidayMap[dateStr] !== undefined;

            var cellLabel = '';
            var cellStyle = '';
            if (isPlanned) {
                cellLabel = isHoliday ? 'PH' : (isFriday ? 'OFF' : 'AL');
                cellStyle = 'background:#895129;color:' + (isHoliday ? '#4fc3f7' : (isFriday ? '#ffb74d' : '#fff')) + ';font-weight:600;';
            }
            bodyHtml += '<td class="alp-cell" data-emp="' + emp.name.replace(/"/g, '&quot;') + '" data-date="' + dateStr + '" style="padding:0;border:1px solid var(--gray-200,#eef0f4);text-align:center;cursor:pointer;font-size:0.65rem;' + cellStyle + '">' + cellLabel + '</td>';
        }
        bodyHtml += '</tr>';
    });
    body.innerHTML = bodyHtml;
}

function renderAlpWeekView() {
    var head = document.getElementById('alpGridHead');
    var body = document.getElementById('alpGridBody');
    var title = document.getElementById('alpTitle');
    if (!head || !body || !title) return;

    /* Find the Monday of the current week */
    var ref = new Date(alpDate);
    var day = ref.getDay(); /* 0=Sun */
    var diff = day === 0 ? -6 : 1 - day; /* Monday = 1 */
    var monday = new Date(ref);
    monday.setDate(ref.getDate() + diff);
    var sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    var fullMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    title.textContent = fullMonths[monday.getMonth()] + ' ' + monday.getDate() + ' - ' + fullMonths[sunday.getMonth()] + ' ' + sunday.getDate() + ', ' + sunday.getFullYear();

    var planData = loadAlpData();
    var holidays = loadHolidays();
    var holidayMap = {};
    holidays.forEach(function(h) { holidayMap[h.date] = h; });
    var dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var leaveData = getLeaveData();
    var balances = leaveData ? leaveData.balances || {} : {};

    /* Header row */
    var headerHtml = '<tr><th style="position:sticky;top:0;left:0;z-index:3;background:var(--cream,#fffdd0);padding:6px 8px;border:1px solid var(--gray-200,#eef0f4);text-align:left;min-width:140px;font-weight:700;">Employee</th>';
    headerHtml += '<th style="position:sticky;top:0;z-index:2;background:var(--cream,#fffdd0);padding:6px 6px;border:1px solid var(--gray-200,#eef0f4);text-align:center;min-width:40px;font-size:0.72rem;font-weight:700;">AL Balance</th>';
    headerHtml += '<th style="position:sticky;top:0;z-index:2;background:var(--cream,#fffdd0);padding:6px 6px;border:1px solid var(--gray-200,#eef0f4);text-align:center;min-width:40px;font-size:0.72rem;font-weight:700;">Plan</th>';
    for (var i = 0; i < 7; i++) {
        var d = new Date(monday);
        d.setDate(monday.getDate() + i);
        var dow = d.getDay();
        var isFriday = dow === 5;
        var dayNum = d.getDate();
        headerHtml += '<th style="position:sticky;top:0;z-index:2;background:var(--cream,#fffdd0);padding:6px 4px;border:1px solid var(--gray-200,#eef0f4);text-align:center;min-width:40px;font-size:0.72rem;' +
            (isFriday ? 'color:var(--gray-text,#aaa);' : '') + '">' + dayNames[dow] + ' ' + dayNum + '</th>';
    }
    head.innerHTML = headerHtml;

    var emps = getFilteredEmps();
    if (emps.length === 0) {
        body.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px 0;color:var(--gray-text);">No employees found.</td></tr>';
        return;
    }

    var bodyHtml = '';
    emps.forEach(function(emp) {
        var initials = (emp.initials || '').slice(0, 2).toUpperCase() || emp.name.slice(0, 2).toUpperCase();
        var empColor = emp.color || '#895129';
        var empPlan = planData[emp.name] || [];
        var dateSet = {};
        if (Array.isArray(empPlan)) {
            empPlan.forEach(function(ds) { dateSet[ds] = true; });
        }

        var bal = balances[emp.name] ? (balances[emp.name].annual || 0) : 0;
        var empTotal = Array.isArray(empPlan) ? empPlan.length : 0;

        bodyHtml += '<tr>' +
            '<td style="padding:4px 8px;border:1px solid var(--gray-200,#eef0f4);white-space:nowrap;font-size:0.78rem;position:sticky;left:0;background:var(--cream,#fffdd0);z-index:1;">' +
            '<span class="alp-avatar" style="background:' + empColor + ';width:22px;height:22px;font-size:0.65rem;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;color:#fff;font-weight:700;margin-right:6px;">' + initials + '</span>' +
            emp.name + '</td>' +
            '<td style="padding:4px 6px;border:1px solid var(--gray-200,#eef0f4);text-align:center;font-size:0.72rem;font-weight:600;' + (bal <= 0 ? 'color:#dc3545;' : '') + '">' + bal + '</td>' +
            '<td style="padding:4px 6px;border:1px solid var(--gray-200,#eef0f4);text-align:center;font-size:0.72rem;font-weight:700;">' + (empTotal || '') + '</td>';

        for (var i = 0; i < 7; i++) {
            var d = new Date(monday);
            d.setDate(monday.getDate() + i);
            var dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            var dow = d.getDay();
            var isFriday = dow === 5;
            var isPlanned = dateSet[dateStr] === true;
            var isHoliday = holidayMap[dateStr] !== undefined;

            var cellLabel = '';
            var cellStyle = '';
            if (isPlanned) {
                cellLabel = isHoliday ? 'PH' : (isFriday ? 'OFF' : 'AL');
                cellStyle = 'background:#895129;color:' + (isHoliday ? '#4fc3f7' : (isFriday ? '#ffb74d' : '#fff')) + ';font-weight:600;';
            }
            bodyHtml += '<td class="alp-cell" data-emp="' + emp.name.replace(/"/g, '&quot;') + '" data-date="' + dateStr + '" style="padding:0;border:1px solid var(--gray-200,#eef0f4);text-align:center;cursor:pointer;font-size:0.65rem;' + cellStyle + '">' + cellLabel + '</td>';
        }
        bodyHtml += '</tr>';
    });
    body.innerHTML = bodyHtml;
}

function updateAlpCell(cell, forcePlan) {
    var empName = cell.getAttribute('data-emp');
    var dateStr = cell.getAttribute('data-date');
    if (!empName || !dateStr) return;

    var planData = loadAlpData();
    if (!planData[empName] || !Array.isArray(planData[empName])) {
        planData[empName] = [];
    }
    var idx = planData[empName].indexOf(dateStr);

    if (forcePlan === true && idx < 0) {
        planData[empName].push(dateStr);
        planData[empName].sort();
    } else if (forcePlan === false && idx >= 0) {
        planData[empName].splice(idx, 1);
    } else if (forcePlan === undefined) {
        if (idx >= 0) planData[empName].splice(idx, 1);
        else { planData[empName].push(dateStr); planData[empName].sort(); }
    }
    saveAlpData(planData);

    var isNowPlanned = planData[empName].indexOf(dateStr) >= 0;
    var parts = dateStr.split('-');
    var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    var isFriday = d.getDay() === 5;
    var holidays = loadHolidays();
    var holidayMap = {};
    holidays.forEach(function(h) { holidayMap[h.date] = h; });
    var isHoliday = holidayMap[dateStr] !== undefined;

    if (isNowPlanned) {
        cell.textContent = isHoliday ? 'PH' : (isFriday ? 'OFF' : 'AL');
        cell.style.background = '#895129';
        cell.style.color = isHoliday ? '#4fc3f7' : (isFriday ? '#ffb74d' : '#fff');
        cell.style.fontWeight = '600';
    } else {
        cell.style.background = '';
        cell.style.color = '';
        cell.style.fontWeight = '';
        cell.textContent = '';
    }

    /* Update planned total in same row */
    var row = cell.parentNode;
    if (row) {
        var plannedTd = row.querySelector('td:nth-child(3)');
        if (plannedTd) {
            var totalCount = Array.isArray(planData[empName]) ? planData[empName].length : 0;
            plannedTd.textContent = totalCount || '';
        }
    }
    return isNowPlanned;
}

var alpDragging = false;
var alpDragAction = undefined; /* true = plan, false = unplan */

document.addEventListener('mousedown', function(e) {
    var cell = e.target.closest('.alp-cell');
    if (cell) {
        alpDragging = true;
        var empName = cell.getAttribute('data-emp');
        var dateStr = cell.getAttribute('data-date');
        if (!empName || !dateStr) return;
        var planData = loadAlpData();
        var empPlan = planData[empName] || [];
        alpDragAction = empPlan.indexOf(dateStr) < 0; /* plan if currently unplanned */
        updateAlpCell(cell);
    }
});

document.addEventListener('mouseenter', function(e) {
    if (!alpDragging) return;
    var cell = e.target.closest('.alp-cell');
    if (cell) {
        updateAlpCell(cell, alpDragAction);
    }
}, true);

document.addEventListener('mouseup', function() {
    alpDragging = false;
    alpDragAction = undefined;
});

document.addEventListener('click', function(e) {
    if (alpDragging) { alpDragging = false; return; }

    /* Navigation */
    if (e.target.id === 'alpPrev') {
        if (alpView === 'year') alpDate.setFullYear(alpDate.getFullYear() - 1);
        else if (alpView === 'week') alpDate.setDate(alpDate.getDate() - 7);
        else alpDate.setMonth(alpDate.getMonth() - 1);
        renderAlpGrid();
    }
    if (e.target.id === 'alpNext') {
        if (alpView === 'year') alpDate.setFullYear(alpDate.getFullYear() + 1);
        else if (alpView === 'week') alpDate.setDate(alpDate.getDate() + 7);
        else alpDate.setMonth(alpDate.getMonth() + 1);
        renderAlpGrid();
    }
});

/* View change */
document.addEventListener('click', function(e) {
    var btn = e.target.closest('.alp-view-btns button');
    if (btn) {
        updateAlpViewBtn(btn.getAttribute('data-view'));
        renderAlpGrid();
    }
    if (e.target.id === 'alpDeptFilter' || e.target.id === 'alpDesigFilter') {
        renderAlpGrid();
    }
});

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

/**
 * Count working days from `from` to `to` (inclusive) for a given department.
 * HR / Administrative: Sunday–Thursday only (skip Friday, Saturday, public holidays)
 * Other departments:      Sunday–Thursday + Saturday (skip Friday and public holidays)
 * @param {Date} from     Start date
 * @param {Date} to       End date
 * @param {string} department  Employee department name
 * @returns {number}       Number of working days
 */
function countWorkingDays(from, to, department) {
    var holidays = loadHolidays();
    var holidaySet = {};
    holidays.forEach(function(h) { holidaySet[h.date] = true; });

    var dept = (department || '').toLowerCase();
    var isHrAdmin = dept === 'hr' || dept === 'human resources' || dept === 'administrative' || dept === 'admin';

    var count = 0;
    var current = new Date(from);
    current.setHours(0, 0, 0, 0);
    var end = new Date(to);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
        var dayOfWeek = current.getDay(); /* 0=Sun … 6=Sat */
        var y = current.getFullYear();
        var m = String(current.getMonth() + 1).padStart(2, '0');
        var d = String(current.getDate()).padStart(2, '0');
        var dateStr = y + '-' + m + '-' + d;

        var isFriday = dayOfWeek === 5;
        var isSaturday = dayOfWeek === 6;
        var isHoliday = holidaySet[dateStr] === true;

        /* Always exclude Friday and public holidays */
        if (isFriday || isHoliday) {
            current.setDate(current.getDate() + 1);
            continue;
        }
        /* HR/Admin also exclude Saturday */
        if (isHrAdmin && isSaturday) {
            current.setDate(current.getDate() + 1);
            continue;
        }

        count++;
        current.setDate(current.getDate() + 1);
    }

    return count;
}

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
var _savingHoliday = false;
document.getElementById('saveHolidayBtn')?.addEventListener('click', function() {
    if (_savingHoliday) return;
    _savingHoliday = true;
    var dateVal = document.getElementById('holidayDate').value;
    var nameVal = document.getElementById('holidayName').value.trim();
    var typeVal = document.getElementById('holidayType').value;
    if (!dateVal || !nameVal) { _savingHoliday = false; return; }
    var holidays = loadHolidays();
    if (editingHolidayIdx >= 0 && editingHolidayIdx < holidays.length) {
        holidays[editingHolidayIdx] = { date: dateVal, name: nameVal, type: typeVal };
    } else {
        holidays.push({ date: dateVal, name: nameVal, type: typeVal });
    }
    _savingHoliday = false;
    saveHolidays(holidays);
    renderHolidays();
    hideHolidayForm();
    var toast = new bootstrap.Toast(document.getElementById('successToast'));
    document.getElementById('toastMessage').textContent = editingHolidayIdx >= 0 ? 'Holiday updated.' : 'Holiday added.';
    toast.show();
    /* Re-render calendar if visible */
    var calGrid = document.querySelector('[data-calendar]');
    if (calGrid && calGrid.offsetParent !== null) {
        var data = getLeaveData();
        if (data) renderLeaveCalendar(data); else renderLeaveCalendar({ requests: [] });
    }
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

/* Delete via confirm toast */
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
    showConfirm('Remove "' + h.name + '" holiday?', function(confirmed) {
        if (!confirmed) return;
        holidays.splice(idx, 1);
        saveHolidays(holidays);
        renderHolidays();
        var toast = new bootstrap.Toast(document.getElementById('dangerToast'));
        document.getElementById('dangerToastMessage').textContent = 'Holiday removed.';
        toast.show();
        /* Re-render calendar if visible */
        var calGrid = document.querySelector('[data-calendar]');
        if (calGrid && calGrid.offsetParent !== null) {
            var data = getLeaveData();
            if (data) renderLeaveCalendar(data); else renderLeaveCalendar({ requests: [] });
        }
    });
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
    var emp = getEmployees().filter(function(e){ return e.name === empName; })[0] || {};
    var note = '';
    if (leaveType === 'Annual Leave') {
        var dept = (emp.department || '').toLowerCase();
        if (dept === 'hr' || dept === 'human resources' || dept === 'administrative' || dept === 'admin') {
            note = ' (Fri, Sat & holidays excluded)';
        } else {
            note = ' (Fri & holidays excluded)';
        }
    }
    infoEl.textContent = 'Available ' + leaveType + ' balance: ' + balance + ' day' + (balance > 1 ? 's' : '') + note;
}

function showLeaveDayCount() {
    var empName = document.getElementById('lrEmployee').value;
    var leaveType = document.getElementById('lrType').value;
    var fromVal = document.getElementById('lrFrom').value;
    var toVal = document.getElementById('lrTo').value;
    var el = document.getElementById('lrDayCount');
    if (!el) return;
    if (!empName || !leaveType || !fromVal || !toVal) { el.style.display = 'none'; return; }
    var from = new Date(fromVal + 'T00:00:00');
    var to = new Date(toVal + 'T00:00:00');
    if (isNaN(from) || isNaN(to) || to < from) { el.style.display = 'none'; return; }
    var rawDays = Math.floor((to - from) / (24 * 60 * 60 * 1000)) + 1;
    var emp = getEmployees().filter(function(e){ return e.name === empName; })[0] || {};
    var days = leaveType === 'Annual Leave' ? countWorkingDays(from, to, emp.department || '') : rawDays;
    el.style.display = 'block';
    if (leaveType === 'Annual Leave' && days !== rawDays) {
        el.textContent = 'Days: ' + days + ' working day' + (days > 1 ? 's' : '') + ' (calendar: ' + rawDays + ')';
    } else {
        el.textContent = 'Days: ' + rawDays + ' day' + (rawDays > 1 ? 's' : '');
    }
    /* Update submit button with day count */
    var btn = document.getElementById('lrSubmitBtn');
    if (btn && !editingRequestId) {
        btn.innerHTML = 'Apply for ' + days + ' ' + (days > 1 ? 'Days' : 'Day') + ' Leave';
    }
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
    if (e.target.id === 'lrEmployee' || e.target.id === 'lrType' || e.target.id === 'lrFrom' || e.target.id === 'lrTo') {
        showLeaveBalanceInfo();
        showLeaveDayCount();
    }
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
            document.getElementById('lrSubmitBtn').innerHTML = 'Apply for Leave';
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
        var o = document.getElementById('calFormOverlay');
        if (o && o.parentNode) o.parentNode.removeChild(o);
        var p = document.getElementById('calLeavePopup');
        if (p && p.parentNode) p.parentNode.removeChild(p);
        document.getElementById('lrSubmitBtn').innerHTML = 'Apply for Leave';
        editingRequestId = null;
    }
});

document.addEventListener('click', function(e) {
    if (e.target.id === 'lrSubmitBtn' || e.target.closest('#lrSubmitBtn')) {
        /* Prevent double submission */
        if (document.getElementById('calLeavePopup') && document.getElementById('calLeavePopup').getAttribute('data-submitting') === '1') return;
        if (document.getElementById('calLeavePopup')) document.getElementById('calLeavePopup').setAttribute('data-submitting', '1');

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
        var rawDays = Math.floor((to - from) / (24 * 60 * 60 * 1000)) + 1;
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var emp = getEmployees().filter(function(e){ return e.name === empName; })[0] || {};
        var days = leaveType === 'Annual Leave' ? countWorkingDays(from, to, emp.department || '') : rawDays;

        var data = getLeaveData();
        if (!data) { alert('Leave data not initialized.'); return; }
        var key = leaveTypeToKey(leaveType);
        var balance = data.balances[empName] ? data.balances[empName][key] : 0;
        if (balance !== undefined && days > balance) {
            var detail = 'Available: ' + balance + ', Requested: ' + days + ' working day' + (days > 1 ? 's' : '') + ' (calendar: ' + rawDays + ' day' + (rawDays > 1 ? 's' : '') + ')';
            alert('Insufficient ' + leaveType + ' balance.\n' + detail);
            return;
        }

        /* Check for overlapping leave requests for same employee */
        var requestYear = from.getFullYear();
        for (var ri = 0; ri < data.requests.length; ri++) {
            var r = data.requests[ri];
            if (r.employee !== empName) continue;
            if (r.status !== 'Pending' && r.status !== 'Approved') continue;
            if (editingRequestId && r._id === editingRequestId) continue;

            var rFromParts = (r.from || '').split(' ');
            var rToParts = (r.to || '').split(' ');
            if (rFromParts.length !== 2 || rToParts.length !== 2) continue;

            var rFromMonth = months.indexOf(rFromParts[0]);
            var rFromDay = parseInt(rFromParts[1], 10);
            var rToMonth = months.indexOf(rToParts[0]);
            var rToDay = parseInt(rToParts[1], 10);
            if (rFromMonth < 0 || rToMonth < 0 || isNaN(rFromDay) || isNaN(rToDay)) continue;

            var rFrom = new Date(requestYear, rFromMonth, rFromDay);
            var rTo = new Date(requestYear, rToMonth, rToDay);
            if (rTo < rFrom) rTo.setFullYear(requestYear + 1);

            if (from <= rTo && rFrom <= to) {
                document.getElementById('dangerToastMessage').textContent = 'Employee "' + empName + '" already has a ' + r.status.toLowerCase() + ' leave request from ' + r.from + ' to ' + r.to + ' that overlaps with the requested dates.';
                var toast = new bootstrap.Toast(document.getElementById('dangerToast'), { autohide: false });
                toast.show();
                return;
            }
        }

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
                    old.rawDays = rawDays;
                    old.notes = notes || '';
                    /* Re-check balance if now approved (status unchanged unless re-approved) */
                    if (old.status === 'Approved') {
                        var newKey = leaveTypeToKey(leaveType);
                        var bal2 = data.balances[empName];
                        if (bal2 && bal2[newKey] !== undefined) {
                            if (days > bal2[newKey]) {
                                var detail = 'Available: ' + bal2[newKey] + ', Requested: ' + days + ' working day' + (days > 1 ? 's' : '') + ' (calendar: ' + rawDays + ' day' + (rawDays > 1 ? 's' : '') + ')';
                                alert('Insufficient ' + leaveType + ' balance.\n' + detail);
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
                rawDays: rawDays,
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
        var o = document.getElementById('calFormOverlay');
        if (o && o.parentNode) o.parentNode.removeChild(o);
        var p = document.getElementById('calLeavePopup');
        if (p && p.parentNode) p.parentNode.removeChild(p);
        document.getElementById('lrSubmitBtn').innerHTML = 'Apply for Leave';
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
var _confirmCallback = null;

function showConfirm(message, callback) {
    document.getElementById('confirmMessage').textContent = message;
    _confirmCallback = callback;
    document.getElementById('confirmOverlay').style.display = 'block';
}

document.addEventListener('click', function(e) {
    var target = e.target;

    /* Confirmation Yes / No */
    if (target.id === 'confirmYes') {
        var cb = _confirmCallback;
        _confirmCallback = null;
        document.getElementById('confirmOverlay').style.display = 'none';
        if (cb) cb(true);
        return;
    }
    if (target.id === 'confirmNo') {
        _confirmCallback = null;
        document.getElementById('confirmOverlay').style.display = 'none';
        return;
    }

    var rid = target.getAttribute && target.getAttribute('data-rid');
    if (!rid) return;

    /* Delete */
    if (target.classList.contains('lr-delete')) {
        showConfirm('Delete this leave request?', function(confirmed) {
            if (!confirmed) return;
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
            var toast = new bootstrap.Toast(document.getElementById('dangerToast'));
            document.getElementById('dangerToastMessage').textContent = 'Leave request deleted.';
            toast.show();
        });
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
        showLeaveDayCount();
        return;
    }
});

/* ========== LEAVE CALENDAR ========== */

var calCurrentDate = new Date();
calCurrentDate.setDate(1);
var calView = 'month';
/* calCurrentDate meaning per view:
 *   month – day is always 1 (1st of month)
 *   week  – day is the Saturday that starts the displayed week
 *   day   – day is the displayed day
 */

var CAL_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var CAL_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var CAL_DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var DOW_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

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

/* Build a lookup of leave requests for a given date range */
function buildLeaveMap(requests, startDate, endDate) {
    var map = {};
    var cur = new Date(startDate);
    cur.setHours(12,0,0,0);
    var end = new Date(endDate);
    end.setHours(12,0,0,0);
    while (cur <= end) {
        map[cur.getTime()] = [];
        cur.setDate(cur.getDate() + 1);
    }
    (requests || []).forEach(function(req) {
        if (req.status !== 'Approved' && req.status !== 'Pending') return;
        var fp = (req.from || '').split(' ');
        var tp = (req.to || '').split(' ');
        if (fp.length < 2 || tp.length < 2) return;
        var fromMon = CAL_MONTHS.indexOf(fp[0]);
        var fromDay = parseInt(fp[1]);
        var toDay = parseInt(tp[1]);
        if (fromMon < 0) return;
        var reqYear = startDate.getFullYear();
        /* Approximate – assumes the leave is in the same year */
        var reqStart = new Date(reqYear, fromMon, fromDay, 12, 0, 0);
        var reqEnd = new Date(reqYear, fromMon, toDay, 12, 0, 0);
        /* Check if request crosses year boundary – approximate */
        if (fromMon === 11 && toDay < fromDay) {
            /* spans into next year – ignore, won't show in current view cleanly */
            return;
        }
        var walk = new Date(reqStart);
        while (walk <= reqEnd) {
            var key = walk.getTime();
            if (map[key]) map[key].push(req);
            walk.setDate(walk.getDate() + 1);
        }
    });
    return map;
}

function renderLeaveCalendar(data) {
    var grid = document.querySelector('[data-calendar]');
    var header = document.querySelector('[data-nav-date]');
    if (!grid || !header) return;
    var requests = (data && data.requests) || [];
    renderMiniCalendar();
    if (calView === 'month') renderCalMonth(grid, header, requests);
    else if (calView === 'week') renderCalWeek(grid, header, requests);
    else if (calView === 'day') renderCalDay(grid, header, requests);
    renderCalLegend();
}

function renderCalMonth(grid, header, requests) {
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
    var holidays = loadHolidays();
    var holidayMap = {};
    holidays.forEach(function(h) { holidayMap[h.date] = h; });
    for (var d = 1; d <= daysInMonth; d++) {
        var entries = [];
        requests.forEach(function(req) {
            if (req.status !== 'Approved' && req.status !== 'Pending') return;
            var fp = (req.from || '').split(' ');
            var tp = (req.to || '').split(' ');
            if (fp.length < 2 || tp.length < 2) return;
            var fMon = CAL_MONTHS.indexOf(fp[0]);
            var fDay = parseInt(fp[1]);
            var tDay = parseInt(tp[1]);
            if (fMon < 0) return;
            if (fMon !== month) return;
            if (d >= fDay && d <= tDay) entries.push(req);
        });
        var dayCls = 'month-calendar__day';
        if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) {
            dayCls += ' month-calendar__day--highlight';
        }
        var mm = ('0' + (month + 1)).slice(-2);
        var dd = ('0' + d).slice(-2);
        var dateStr = year + '-' + mm + '-' + dd;
        var holiday = holidayMap[dateStr];
        if (holiday) dayCls += ' month-calendar__day--holiday';
        html += '<li class="' + dayCls + '">';
        html += '<button class="month-calendar__day-label">' + d + '</button>';
        if (holiday) {
            html += '<div class="event event--holiday" title="' + holiday.name + '">' +
                '<span class="event__color" style="background:#e11d48;"></span>' +
                '<span>' + holiday.name + '</span></div>';
        }
        entries.forEach(function(lr) {
            var c = lr.status === 'Pending' ? '#9ca3af' : (CAL_TYPE_COLORS[lr.type] || lr.color);
            var pc = lr.status === 'Pending' ? ' event--pending' : '';
            html += '<div class="event' + pc + '" title="' + lr.employee + ' - ' + lr.type + ' (' + lr.status + ')">' +
                '<span class="event__color" style="background:' + c + ';"></span>' +
                '<span>' + lr.employee + '</span></div>';
        });
        html += '</li>';
    }
    var remaining = weeks * 7 - startOffset - daysInMonth;
    for (var i = 0; i < remaining; i++) {
        html += '<li class="month-calendar__day month-calendar__day--empty"></li>';
    }
    html += '</ul></div></div>';
    grid.innerHTML = html;
}

function renderCalWeek(grid, header, requests) {
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
        var isToday = (day.getFullYear() === today.getFullYear() && day.getMonth() === today.getMonth() && day.getDate() === today.getDate());
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
    var holidays = loadHolidays();
    var holidayMap = {};
    holidays.forEach(function(h) { holidayMap[h.date] = h; });
    for (var i = 0; i < 7; i++) {
        var day = new Date(sat);
        day.setDate(sat.getDate() + i);
        var y = day.getFullYear();
        var m = day.getMonth();
        var dd = day.getDate();
        var dateStr = y + '-' + ('0' + (m + 1)).slice(-2) + '-' + ('0' + dd).slice(-2);
        var holiday = holidayMap[dateStr];
        html += '<div class="week-calendar__column">';
        if (holiday) {
            html += '<div class="event event--holiday" title="' + holiday.name + '">' +
                '<span class="event__color" style="background:#e11d48;"></span>' +
                '<span>' + holiday.name + '</span></div>';
        }
        html += '</div>';
    }
    html += '</div></div></div></div>';
    grid.innerHTML = html;
}

function renderCalDay(grid, header, requests) {
    var year = calCurrentDate.getFullYear();
    var month = calCurrentDate.getMonth();
    var dayNum = calCurrentDate.getDate();
    var dayDate = new Date(year, month, dayNum, 12, 0, 0);
    var dowName = CAL_DOW[dayDate.getDay()];
    header.textContent = dowName + ', ' + dayNum + ' ' + CAL_FULL[month] + ' ' + year;
    var html = '<div class="cal-day-view">';
    html += '<div class="cal-day-header">' + header.textContent + '</div>';
    html += '<div class="cal-day-list">';
    var dayEntries = [];
    requests.forEach(function(req) {
        if (req.status !== 'Approved' && req.status !== 'Pending') return;
        var fp = (req.from || '').split(' ');
        var tp = (req.to || '').split(' ');
        if (fp.length < 2 || tp.length < 2) return;
        var fMon = CAL_MONTHS.indexOf(fp[0]);
        var fDay = parseInt(fp[1]);
        var tDay = parseInt(tp[1]);
        if (fMon < 0) return;
        if (fMon !== month) return;
        if (dayNum >= fDay && dayNum <= tDay) dayEntries.push(req);
    });
    if (dayEntries.length === 0) {
        var holidayHtml = '';
        var holidays = loadHolidays();
        var mm = ('0' + (month + 1)).slice(-2);
        var dd = ('0' + dayNum).slice(-2);
        var dateStr = year + '-' + mm + '-' + dd;
        holidays.forEach(function(h) {
            if (h.date === dateStr) holidayHtml = '<div class="cal-day-entry cal-day-entry--holiday"><span class="cal-dot" style="background:#e11d48"></span><strong>' + h.name + '</strong></div>';
        });
        html += '<div style="color:var(--gray-text,#888);font-size:0.85rem;padding:12px 0;">No leave on this day.</div>';
        if (holidayHtml) html += holidayHtml;
    } else {
        dayEntries.forEach(function(lr) {
            var c = lr.status === 'Pending' ? '#9ca3af' : (CAL_TYPE_COLORS[lr.type] || lr.color);
            html += '<div class="cal-day-entry"><span class="cal-dot" style="background:' + c + '"></span>' +
                '<strong>' + lr.employee + '</strong> &mdash; ' + lr.type + ' (' + lr.status + ')' +
                '<span style="margin-left:auto;font-size:0.75rem;color:var(--gray-text,#888);">' + lr.from + ' - ' + lr.to + '</span></div>';
        });
        var holidays = loadHolidays();
        var mm = ('0' + (month + 1)).slice(-2);
        var dd = ('0' + dayNum).slice(-2);
        var dateStr = year + '-' + mm + '-' + dd;
        holidays.forEach(function(h) {
            if (h.date === dateStr) html += '<div class="cal-day-entry cal-day-entry--holiday"><span class="cal-dot" style="background:#e11d48"></span><strong>' + h.name + '</strong></div>';
        });
    }
    html += '</div></div>';
    grid.innerHTML = html;
}

function renderCalLegend() {
    var legendEl = document.getElementById('calLegend');
    if (!legendEl) return;
    var html = '<span class="cal-legend-title">Legend:</span>';
    for (var type in CAL_TYPE_COLORS) {
        html += '<span class="cal-legend-item"><span class="cal-legend-swatch" style="background:' + CAL_TYPE_COLORS[type] + '"></span>' + type + '</span>';
    }
    html += '<span class="cal-legend-item" style="opacity:0.7"><span class="cal-legend-swatch" style="background:#ccc"></span>Pending</span>';
    html += '<span class="cal-legend-item"><span class="cal-legend-swatch" style="background:#e11d48"></span>Holiday</span>';
    legendEl.innerHTML = html;
}

function renderMiniCalendar() {
    /* Render three mini calendars: prev month, current month, next month */
    var containers = document.querySelectorAll('[data-mini-calendar]');
    if (!containers.length) return;
    var today = new Date();
    var baseYear = calCurrentDate.getFullYear();
    var baseMonth = calCurrentDate.getMonth();
    var offsets = [-1, 0, 1];
    var monthNames = CAL_FULL;
    containers.forEach(function(container, idx) {
        var offset = offsets[idx] || 0;
        var year = baseYear;
        var month = baseMonth + offset;
        if (month < 0) { month = 11; year--; }
        else if (month > 11) { month = 0; year++; }
        var dateEl = container.querySelector('[data-mini-calendar-date]');
        var grid = container.querySelector('[data-mini-calendar-day-list]');
        if (!dateEl || !grid) return;
        dateEl.textContent = monthNames[month] + ' ' + year;
        var firstDay = new Date(year, month, 1).getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var startOffset = (firstDay + 6) % 7;
        var html = '';
        for (var i = 0; i < startOffset; i++) {
            html += '<li class="mini-calendar__day-list-item"><button class="mini-calendar__day mini-calendar__day--other"></button></li>';
        }
        for (var d = 1; d <= daysInMonth; d++) {
            var cls = 'mini-calendar__day';
            if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) cls += ' mini-calendar__day--highlight';
            if (year === calCurrentDate.getFullYear() && month === calCurrentDate.getMonth() && d === calCurrentDate.getDate()) cls += ' mini-calendar__day--selected';
            html += '<li class="mini-calendar__day-list-item"><button class="' + cls + '" data-m="' + month + '" data-y="' + year + '" data-d="' + d + '">' + d + '</button></li>';
        }
        var totalCells = startOffset + daysInMonth;
        var remaining = (7 - (totalCells % 7)) % 7;
        for (var i = 1; i <= remaining; i++) {
            html += '<li class="mini-calendar__day-list-item"><button class="mini-calendar__day mini-calendar__day--other" data-m="' + ((month + 1) % 12) + '" data-y="' + ((month === 11) ? year + 1 : year) + '" data-d="' + i + '">' + i + '</button></li>';
        }
        grid.innerHTML = html;
    });
}

/* Click day in main calendar to open leave form */
document.addEventListener('click', function(e) {
    var label = e.target.closest('.month-calendar__day-label');
    if (!label) return;
    var wrap = label.closest('#leaveCalendarWrap');
    if (!wrap) return;

    var dayNum = parseInt(label.textContent.trim(), 10);
    if (isNaN(dayNum)) return;

    var year = calCurrentDate.getFullYear();
    var month = calCurrentDate.getMonth();
    var mm = ('0' + (month + 1)).slice(-2);
    var dd = ('0' + dayNum).slice(-2);
    var dateStr = year + '-' + mm + '-' + dd;

    openLeaveRequestPopup(dateStr);
});

function openLeaveRequestPopup(dateStr) {
    var from = document.getElementById('lrFrom');
    var to = document.getElementById('lrTo');
    if (from) from.value = dateStr;
    if (to) to.value = dateStr;

    if (from) {
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent('change', true, false);
        from.dispatchEvent(evt);
    }
    if (to) {
        var evt2 = document.createEvent('HTMLEvents');
        evt2.initEvent('change', true, false);
        to.dispatchEvent(evt2);
    }

    var formRow = document.getElementById('leaveFormRow');
    if (!formRow) return;

    /* Remove any existing popup */
    var oldPopup = document.getElementById('calLeavePopup');
    if (oldPopup && oldPopup.parentNode) oldPopup.parentNode.removeChild(oldPopup);
    var oldOverlay = document.getElementById('calFormOverlay');
    if (oldOverlay && oldOverlay.parentNode) oldOverlay.parentNode.removeChild(oldOverlay);

    /* Ensure form selects are populated (clone inherits populated HTML) */
    populateLeaveRequestModal();
    var formHTML = formRow.innerHTML;

    /* Create popup overlay */
    var overlay = document.createElement('div');
    overlay.id = 'calFormOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:9998;';
    document.body.appendChild(overlay);

    /* Clone form into a centered popup */
    var popup = document.createElement('div');
    popup.id = 'calLeavePopup';
    popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;' +
        'background:#fff;border-radius:12px;padding:24px;width:520px;max-width:90vw;max-height:85vh;overflow-y:auto;' +
        'box-shadow:0 20px 60px rgba(0,0,0,0.3);';
    popup.innerHTML = '<h4 style="margin:0 0 16px;font-size:1rem;font-weight:700;">New Leave Request</h4>' +
        '<div id="calPopupForm">' +
        formHTML +
        '</div>';
    document.body.appendChild(popup);

    /* Re-bind the form fields within popup */
    var popupSubmit = popup.querySelector('#lrSubmitBtn');
    var popupCancel = popup.querySelector('#lrCancelBtn');

    /* Sync popup field changes to original form so balance/day-count works */
    ['#lrEmployee','#lrType','#lrFrom','#lrTo'].forEach(function(sel) {
        var el = popup.querySelector(sel);
        if (!el) return;
        el.addEventListener('change', function() {
            var orig = document.getElementById(sel.replace('#',''));
            if (orig) orig.value = this.value;
            if (orig) {
                var evt = document.createEvent('HTMLEvents');
                evt.initEvent('change', true, false);
                orig.dispatchEvent(evt);
            }
            /* Copy balance/day-count info to popup */
            setTimeout(function() {
                var origBal = document.getElementById('lrBalanceInfo');
                var popBal = popup.querySelector('#lrBalanceInfo');
                var origDay = document.getElementById('lrDayCount');
                var popDay = popup.querySelector('#lrDayCount');
                if (origBal && popBal) {
                    popBal.style.display = origBal.style.display;
                    popBal.innerHTML = origBal.innerHTML;
                }
                if (origDay && popDay) {
                    popDay.style.display = origDay.style.display;
                    popDay.innerHTML = origDay.innerHTML;
                }
                var popBtn = popup.querySelector('#lrSubmitBtn');
                if (popBtn) {
                    popBtn.innerHTML = document.getElementById('lrSubmitBtn').innerHTML;
                }
            }, 10);
        });
    });

    overlay.addEventListener('click', function() {
        if (popup.parentNode) popup.parentNode.removeChild(popup);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.getElementById('lrSubmitBtn').innerHTML = 'Apply for Leave';
    });

    if (popupCancel) {
        popupCancel.addEventListener('click', function(e) {
            e.stopPropagation();
            if (popup.parentNode) popup.parentNode.removeChild(popup);
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            document.getElementById('lrSubmitBtn').innerHTML = 'Apply for Leave';
        });
    }

    /* Set the date in the popup fields */
    var popFrom = popup.querySelector('#lrFrom');
    var popTo = popup.querySelector('#lrTo');
    if (popFrom) popFrom.value = dateStr;
    if (popTo) popTo.value = dateStr;
    /* Also set original form fields and trigger change for balance/day-count */
    var origFrom = document.getElementById('lrFrom');
    var origTo = document.getElementById('lrTo');
    if (origFrom) origFrom.value = dateStr;
    if (origTo) origTo.value = dateStr;
    /* Trigger change on popup fields to show balance/day count */
    if (popFrom) {
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent('change', true, false);
        popFrom.dispatchEvent(evt);
    }
    if (popTo) {
        var evt2 = document.createEvent('HTMLEvents');
        evt2.initEvent('change', true, false);
        popTo.dispatchEvent(evt2);
    }
}

/* Mini calendar day click */
document.addEventListener('click', function(e) {
    var dayEl = e.target.closest('.mini-calendar__day');
    if (!dayEl) return;
    var m = parseInt(dayEl.getAttribute('data-m'), 10);
    var d = parseInt(dayEl.getAttribute('data-d'), 10);
    var y = parseInt(dayEl.getAttribute('data-y'), 10);
    if (isNaN(m) || isNaN(d)) return;
    if (isNaN(y)) {
        y = calCurrentDate.getFullYear();
        if (m === 11 && calCurrentDate.getMonth() === 0) y--;
        else if (m === 0 && calCurrentDate.getMonth() === 11) y++;
    }
    if (calView === 'month') {
        calCurrentDate = new Date(y, m, 1);
    } else if (calView === 'week') {
        var clicked = new Date(y, m, d);
        clicked.setDate(clicked.getDate() - ((clicked.getDay() + 1) % 7));
        calCurrentDate = clicked;
    } else {
        calCurrentDate = new Date(y, m, d);
    }
    var data = getLeaveData();
    if (data) renderLeaveCalendar(data); else renderLeaveCalendar({ requests: [] });

    /* Also open leave request popup with clicked date */
    var mm = ('0' + (m + 1)).slice(-2);
    var dd = ('0' + d).slice(-2);
    var dateStr = y + '-' + mm + '-' + dd;
    openLeaveRequestPopup(dateStr);
});

/* Navigation */
document.addEventListener('click', function(e) {
    if (e.target.closest('[data-nav-previous-button]')) {
        if (calView === 'month') calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
        else if (calView === 'week') calCurrentDate.setDate(calCurrentDate.getDate() - 7);
        else calCurrentDate.setDate(calCurrentDate.getDate() - 1);
        var data = getLeaveData();
        if (data) renderLeaveCalendar(data); else renderLeaveCalendar({ requests: [] });
    }
    if (e.target.closest('[data-nav-next-button]')) {
        if (calView === 'month') calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
        else if (calView === 'week') calCurrentDate.setDate(calCurrentDate.getDate() + 7);
        else calCurrentDate.setDate(calCurrentDate.getDate() + 1);
        var data = getLeaveData();
        if (data) renderLeaveCalendar(data); else renderLeaveCalendar({ requests: [] });
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
        var data = getLeaveData();
        if (data) renderLeaveCalendar(data); else renderLeaveCalendar({ requests: [] });
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
    var data = getLeaveData();
    if (data) renderLeaveCalendar(data); else renderLeaveCalendar({ requests: [] });
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
        renderAnnualLeavePlanning(emps);
        renderLeaveCalendar(data);
    }
    renderHolidays();
    populateLbFilters();
}

/* Run on load and after data changes */
renderAllFromEmployees();

    if (typeof Chart !== 'undefined') {
        /* Chart builds lazily on first showWorkforce() call */
    }
})();
