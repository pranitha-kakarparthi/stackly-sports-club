/**
 * STACKLY SPORTS CLUB - AUTHENTICATION & SESSION MANAGEMENT
 * Pure Frontend LocalStorage Architecture | Strict Validations | Role Management
 */

// Initialize default mock storage
(function initStorage() {
  if (!localStorage.getItem('users')) {
    const defaultUsers = [
      {
        id: 'usr_01',
        firstName: 'Arjun',
        lastName: 'Patel',
        email: 'athlete@stackly.com',
        password: 'Password@123',
        role: 'member',
        phone: '9876543210',
        countryCode: '+91',
        joinedDate: '2025-01-15'
      },
      {
        id: 'usr_02',
        firstName: 'Marcus',
        lastName: 'Vance',
        email: 'coach@stackly.com',
        password: 'Password@123',
        role: 'coach',
        phone: '9876543211',
        countryCode: '+91',
        joinedDate: '2024-06-10'
      }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem('preferences')) {
    localStorage.setItem('preferences', JSON.stringify({
      emailAlerts: true,
      trainingReminders: true,
      theme: 'dark'
    }));
  }

  if (!localStorage.getItem('themeSettings')) {
    localStorage.setItem('themeSettings', JSON.stringify({
      mode: 'athletic-luxury',
      contrast: 'high-aa'
    }));
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // Setup password toggles
  setupPasswordToggles();

  // Setup Sign In Form
  const signInForm = document.getElementById('signInForm');
  if (signInForm) {
    initSignIn(signInForm);
  }

  // Setup Sign Up Form
  const signUpForm = document.getElementById('signUpForm');
  if (signUpForm) {
    initSignUp(signUpForm);
  }
});

/* ==========================================================================
   PASSWORD TOGGLES
   ========================================================================== */
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.input-password-toggle');
  toggleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.getAttribute('type') === 'password';
      input.setAttribute('type', isPassword ? 'text' : 'password');

      btn.innerHTML = isPassword ? `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      ` : `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `;
    });
  });
}

/* ==========================================================================
   SIGN IN FORM CONTROLLER
   ========================================================================== */
function initSignIn(form) {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const roleSelect = document.getElementById('loginRole');
  const errorAlert = document.getElementById('loginAlert');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    let firstInvalidInput = null;

    // Reset previous errors
    form.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
    if (errorAlert) {
      errorAlert.style.display = 'none';
      errorAlert.textContent = '';
    }

    // Role validation
    if (!roleSelect.value) {
      roleSelect.classList.add('is-invalid');
      isValid = false;
      firstInvalidInput = firstInvalidInput || roleSelect;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      emailInput.classList.add('is-invalid');
      isValid = false;
      firstInvalidInput = firstInvalidInput || emailInput;
    }

    // Password validation (min 6 chars for login)
    if (!passwordInput.value || passwordInput.value.length < 6) {
      passwordInput.classList.add('is-invalid');
      isValid = false;
      firstInvalidInput = firstInvalidInput || passwordInput;
    }

    if (!isValid) {
      if (firstInvalidInput) firstInvalidInput.focus();
      return;
    }

    // Authenticate or initialize session with entered email + chosen role
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const email = emailInput.value.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === email);

    const userProfile = {
      firstName: existing ? existing.firstName : (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)),
      lastName: existing ? existing.lastName : 'Athlete',
      email: email,
      role: roleSelect.value, // 'member' or 'coach'
      phone: existing ? existing.phone : '9876543210',
      loginTime: new Date().toISOString()
    };

    // Store session
    localStorage.setItem('currentUser', JSON.stringify(userProfile));
    localStorage.setItem('role', roleSelect.value);

    // Redirect to individual role dashboard
    window.location.href = roleSelect.value === 'coach' ? 'coach-dashboard.html' : 'member-dashboard.html';
  });
}

/* ==========================================================================
   SIGN UP FORM CONTROLLER
   Strict Validations | Real-Time Password Strength Meter | 10-Digit Phone
   ========================================================================== */
function initSignUp(form) {
  const firstNameInput = document.getElementById('regFirstName');
  const lastNameInput = document.getElementById('regLastName');
  const emailInput = document.getElementById('regEmail');
  const phoneInput = document.getElementById('regPhone');
  const roleSelect = document.getElementById('regRole');
  const passwordInput = document.getElementById('regPassword');
  const confirmPasswordInput = document.getElementById('regConfirmPassword');
  const termsCheckbox = document.getElementById('regTerms');
  const successAlert = document.getElementById('regSuccessAlert');

  // Password strength elements
  const strengthBar = document.getElementById('strengthBarFill');
  const strengthLabel = document.getElementById('strengthLabel');
  const checkUpper = document.getElementById('chkUpper');
  const checkLower = document.getElementById('chkLower');
  const checkNum = document.getElementById('chkNum');
  const checkSpecial = document.getElementById('chkSpecial');

  // Alphabets only listener on name inputs
  [firstNameInput, lastNameInput].forEach((input) => {
    if (input) {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/[^a-zA-Z\s]/g, '');
      });
    }
  });

  // Phone: Only numbers, exact 10 digits
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  // Real-time password strength analyzer
  if (passwordInput && strengthBar) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      const hasUpper = /[A-Z]/.test(val);
      const hasLower = /[a-z]/.test(val);
      const hasNum = /[0-9]/.test(val);
      const hasSpecial = /[^A-Za-z0-9]/.test(val);
      const isLongEnough = val.length >= 8;

      if (checkUpper) checkUpper.classList.toggle('met', hasUpper);
      if (checkLower) checkLower.classList.toggle('met', hasLower);
      if (checkNum) checkNum.classList.toggle('met', hasNum);
      if (checkSpecial) checkSpecial.classList.toggle('met', hasSpecial);

      let score = 0;
      if (hasUpper) score++;
      if (hasLower) score++;
      if (hasNum) score++;
      if (hasSpecial) score++;
      if (isLongEnough) score++;

      strengthBar.className = 'strength-bar-fill';
      if (score <= 2) {
        strengthBar.classList.add('weak');
        if (strengthLabel) strengthLabel.textContent = 'Strength: Weak';
      } else if (score <= 4) {
        strengthBar.classList.add('medium');
        if (strengthLabel) strengthLabel.textContent = 'Strength: Moderate';
      } else {
        strengthBar.classList.add('strong');
        if (strengthLabel) strengthLabel.textContent = 'Strength: Strong';
      }
    });
  }

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    let firstInvalidInput = null;

    // Reset error states
    form.querySelectorAll('.form-control, .form-check-input').forEach(el => el.classList.remove('is-invalid'));

    // First Name (alphabets only, min 2 chars)
    if (!firstNameInput.value.trim() || !/^[A-Za-z\s]{2,}$/.test(firstNameInput.value.trim())) {
      firstNameInput.classList.add('is-invalid');
      isValid = false;
      firstInvalidInput = firstInvalidInput || firstNameInput;
    }

    // Last Name (alphabets only, min 1 char)
    if (!lastNameInput.value.trim() || !/^[A-Za-z\s]{1,}$/.test(lastNameInput.value.trim())) {
      lastNameInput.classList.add('is-invalid');
      isValid = false;
      firstInvalidInput = firstInvalidInput || lastNameInput;
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      emailInput.classList.add('is-invalid');
      isValid = false;
      firstInvalidInput = firstInvalidInput || emailInput;
    }

    // Phone (exactly 10 digits)
    if (!phoneInput.value.trim() || phoneInput.value.trim().length !== 10) {
      phoneInput.classList.add('is-invalid');
      isValid = false;
      firstInvalidInput = firstInvalidInput || phoneInput;
    }

    // Role
    if (!roleSelect.value) {
      roleSelect.classList.add('is-invalid');
      isValid = false;
      firstInvalidInput = firstInvalidInput || roleSelect;
    }

    // Password: min 8, uppercase, lowercase, number, special char
    const pass = passwordInput.value;
    const isPassValid = pass.length >= 8 && /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass);
    if (!isPassValid) {
      passwordInput.classList.add('is-invalid');
      isValid = false;
      firstInvalidInput = firstInvalidInput || passwordInput;
    }

    // Confirm Password
    if (confirmPasswordInput.value !== pass || !confirmPasswordInput.value) {
      confirmPasswordInput.classList.add('is-invalid');
      isValid = false;
      firstInvalidInput = firstInvalidInput || confirmPasswordInput;
    }

    // Terms & Conditions Checkbox (Mandatory)
    if (!termsCheckbox.checked) {
      termsCheckbox.classList.add('is-invalid');
      isValid = false;
      firstInvalidInput = firstInvalidInput || termsCheckbox;
    }

    if (!isValid) {
      if (firstInvalidInput) firstInvalidInput.focus();
      return;
    }

    // Save to localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const newUser = {
      id: 'usr_' + Date.now(),
      firstName: firstNameInput.value.trim(),
      lastName: lastNameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      role: roleSelect.value,
      joinedDate: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Show success message
    if (successAlert) {
      successAlert.style.display = 'block';
    }

    // Redirect to sign in page after 1 second
    setTimeout(() => {
      window.location.href = 'sign-in.html?registered=true';
    }, 1200);
  });
}

/* ==========================================================================
   GLOBAL LOGOUT
   ========================================================================== */
function logoutUser() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('role');
  window.location.href = 'sign-in.html';
}
window.logoutUser = logoutUser;

