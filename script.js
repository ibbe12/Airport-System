/* =========================================
   HRF Airport System — Auth Page Interactions
   ========================================= */

(function () {
    'use strict';

    /* ---------- DOM references ---------- */
    const form = document.getElementById('registerForm');
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const terms = document.getElementById('terms');
    const rememberMe = document.getElementById('rememberMe');
    const submitBtn = document.getElementById('submitBtn');
    const togglePassword = document.getElementById('togglePassword');
    const passwordStrength = document.getElementById('passwordStrength');
    const themeToggle = document.getElementById('themeToggle');
    const successToastEl = document.getElementById('successToast');
    const toastMessage = document.getElementById('toastMessage');
    const demoFillBtn = document.getElementById('demoFillBtn');

    /* ---------- Demo credentials ---------- */
    const DEMO_CREDENTIALS = {
        fullName: 'Demo User',
        email: 'demo@hrf.airport',
        password: 'Demo@1234',
    };

    const toast = new bootstrap.Toast(successToastEl, {
        delay: 3500,
        animation: true,
    });

    /* ---------- Validation helpers ---------- */
    const validators = {
        fullName: (value) => value.trim().length >= 2,
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
        password: (value) => value.length >= 8,
    };

    function setFieldValidity(input, isValid) {
        input.classList.toggle('is-invalid', !isValid);
    }

    function validateField(input) {
        const validator = validators[input.id];
        if (!validator) return true;
        const isValid = validator(input.value);
        setFieldValidity(input, isValid);
        return isValid;
    }

    /* ---------- Live validation ---------- */
    [fullName, email, password].forEach((field) => {
        field.addEventListener('input', () => {
            if (field.classList.contains('is-invalid')) {
                validateField(field);
            }
        });
        field.addEventListener('blur', () => validateField(field));
    });

    /* ---------- Password show/hide ---------- */
    togglePassword.addEventListener('click', () => {
        const isPassword = password.type === 'password';
        password.type = isPassword ? 'text' : 'password';
        const icon = togglePassword.querySelector('i');
        icon.classList.toggle('bi-eye');
        icon.classList.toggle('bi-eye-slash');
        togglePassword.setAttribute(
            'aria-label',
            isPassword ? 'Hide password' : 'Show password'
        );
    });

    /* ---------- Password strength meter ---------- */
    function getPasswordStrength(value) {
        let score = 0;
        if (value.length >= 8) score++;
        if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
        if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
        return score; // 0..3
    }

    password.addEventListener('input', () => {
        const value = password.value;
        if (!value) {
            passwordStrength.classList.remove('active', 'weak', 'medium', 'strong');
            return;
        }
        const strength = getPasswordStrength(value);
        passwordStrength.classList.add('active');
        passwordStrength.classList.remove('weak', 'medium', 'strong');
        if (strength <= 1) passwordStrength.classList.add('weak');
        else if (strength === 2) passwordStrength.classList.add('medium');
        else passwordStrength.classList.add('strong');
    });

    /* ---------- Form submit ---------- */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const isNameValid = validateField(fullName);
        const isEmailValid = validateField(email);
        const isPasswordValid = validateField(password);
        const isTermsAccepted = terms.checked;

        if (!isTermsAccepted) {
            terms.classList.add('is-invalid');
            terms.focus();
            return;
        }
        terms.classList.remove('is-invalid');

        if (!isNameValid || !isEmailValid || !isPasswordValid) {
            return;
        }

        // Loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            // Simulated API call
            await new Promise((resolve) => setTimeout(resolve, 1600));

            const remembered = rememberMe.checked;
            const firstName = fullName.value.split(' ')[0] || 'User';

            // Persist session for dashboard
            sessionStorage.setItem(
                'hrf-airport-session',
                JSON.stringify({
                    fullName: fullName.value.trim(),
                    email: email.value.trim(),
                    role: 'Operations Manager',
                    loginAt: new Date().toISOString(),
                })
            );

            toastMessage.textContent = remembered
                ? `Welcome back, ${firstName}! Redirecting…`
                : `Account created. Welcome, ${firstName}!`;

            toast.show();
            form.reset();
            passwordStrength.classList.remove('active', 'weak', 'medium', 'strong');
            [fullName, email, password].forEach((f) =>
                f.classList.remove('is-invalid')
            );

            // Redirect to Airports Apps after a short delay
            setTimeout(() => {
                window.location.href = 'apps.html';
            }, 900);
        } catch (err) {
            toastMessage.textContent = 'Something went wrong. Please try again.';
            successToastEl.classList.remove('text-bg-success');
            successToastEl.classList.add('text-bg-danger');
            toast.show();
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });

    /* ---------- Dark mode toggle ---------- */
    const storedTheme = localStorage.getItem('hrf-airport-theme');
    if (storedTheme) {
        document.documentElement.setAttribute('data-theme', storedTheme);
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

    /* ---------- Demo autofill ---------- */
    if (demoFillBtn) {
        demoFillBtn.addEventListener('click', () => {
            fullName.value = DEMO_CREDENTIALS.fullName;
            email.value = DEMO_CREDENTIALS.email;
            password.value = DEMO_CREDENTIALS.password;
            rememberMe.checked = true;
            terms.checked = true;
            terms.classList.remove('is-invalid');

            [fullName, email, password].forEach((field) => {
                field.classList.remove('is-invalid');
                field.dispatchEvent(new Event('input'));
            });

            password.dispatchEvent(new Event('input'));

            toastMessage.textContent = 'Demo credentials filled. Click "Create Account" to continue.';
            toast.show();

            submitBtn.focus({ preventScroll: false });
        });
    }

    /* ---------- Sign-in link placeholder ---------- */
    const signinLink = document.getElementById('signinLink');
    if (signinLink) {
        signinLink.addEventListener('click', (e) => {
            e.preventDefault();
            toastMessage.textContent = 'Sign-in flow coming soon!';
            toast.show();
        });
    }
})();
