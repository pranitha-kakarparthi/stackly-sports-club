/**
 * STACKLY SPORTS CLUB - CORE FRONTEND ENGINE
 * Handles Loader, Sticky Nav, Mobile Menu, Active Links, AOS Observer, Forms, & Accordions
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Page Loader Dismissal
  initPageLoader();

  // 2. Sticky Navbar & Header Scroll State
  initStickyHeader();

  // 3. Mobile Navigation Drawer & Background Scroll Lock
  initMobileNav();

  // 4. Highlight Active Navigation Item
  highlightActiveNavLink();

  // 5. Scroll Animations (Lightweight AOS simulation)
  initScrollAnimations();

  // 6. Time of Day Greeting wherever .dynamic-greeting element exists
  updateDynamicGreetings();

  // 7. Interactive Accordions (e.g., FAQ sections)
  initAccordions();

  // 8. Contact Form Character Counter & Alpine-like Helpers
  initContactFormHelpers();
});

/* ==========================================================================
   1. PAGE LOADER
   ========================================================================== */
function initPageLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  const hideLoader = () => {
    loader.classList.add('loaded');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 550);
  };

  // Immediate or slight delay for smooth aesthetic
  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 250);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 250));
    // Fallback timeout prevention (max 1.5s)
    setTimeout(hideLoader, 1500);
  }
}

/* ==========================================================================
   2. STICKY NAVBAR
   ========================================================================== */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   3. MOBILE NAVIGATION DRAWER & SCROLL LOCK
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');

  if (!toggleBtn || !navMenu) return;

  const toggleMenu = () => {
    const isOpen = navMenu.classList.toggle('open');
    document.body.classList.toggle('nav-open', isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen);

    // Update hamburger SVG icon
    if (isOpen) {
      toggleBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    } else {
      toggleBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      `;
    }
  };

  toggleBtn.addEventListener('click', toggleMenu);

  // Close nav when clicking outside or link (except dropdown toggles)
  navMenu.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && !link.classList.contains('dropdown-trigger')) {
      if (navMenu.classList.contains('open')) {
        toggleMenu();
      }
    }
  });

  // Mobile dropdown toggle
  dropdownItems.forEach((item) => {
    const trigger = item.querySelector('.dropdown-trigger');
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
          e.preventDefault();
          item.classList.toggle('mobile-expanded');
        }
      });
    }
  });

  // Reset menu on resize above 1024px
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      document.body.classList.remove('nav-open');
      toggleBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      `;
    }
  });
}

/* ==========================================================================
   4. ACTIVE NAV LINK DETECTION
   ========================================================================== */
function highlightActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .dropdown-link');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.split('/').pop();

    if (linkPath === currentPath) {
      link.classList.add('active');
      const parentDropdown = link.closest('.has-dropdown');
      if (parentDropdown) {
        const parentTrigger = parentDropdown.querySelector('.nav-link');
        if (parentTrigger) parentTrigger.classList.add('active');
      }
    }
  });
}

/* ==========================================================================
   5. TIME OF DAY GREETINGS
   ========================================================================== */
function getGreetingTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
}

function updateDynamicGreetings() {
  const greetingElements = document.querySelectorAll('.dynamic-greeting');
  const greeting = getGreetingTimeOfDay();
  greetingElements.forEach((el) => {
    const userRoleOrName = el.getAttribute('data-name') || 'Champion';
    el.textContent = `${greeting}, ${userRoleOrName}!`;
  });
}

/* ==========================================================================
   6. SCROLL ANIMATIONS (AOS OBSERVER)
   ========================================================================== */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-aos]');
  if (!animatedElements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });

    animatedElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback for older browsers
    animatedElements.forEach((el) => el.classList.add('aos-animate'));
  }
}

/* ==========================================================================
   7. ACCORDIONS (FAQ)
   ========================================================================== */
function initAccordions() {
  const accordionHeaders = document.querySelectorAll('.faq-accordion-header');
  accordionHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      const item = header.closest('.faq-accordion-item');
      const isOpen = item.classList.contains('active');

      // Close other accordions in the same group
      const parent = item.parentElement;
      parent.querySelectorAll('.faq-accordion-item').forEach((i) => i.classList.remove('active'));

      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   8. CONTACT FORM HELPERS & LIVE VALIDATION
   ========================================================================== */
function initContactFormHelpers() {
  const msgInput = document.getElementById('contactMessage');
  const charCounter = document.getElementById('charCount');

  if (msgInput && charCounter) {
    const max = msgInput.getAttribute('maxlength') || 500;
    const updateCount = () => {
      const len = msgInput.value.length;
      charCounter.textContent = `${len} / ${max} characters`;
    };
    msgInput.addEventListener('input', updateCount);
    updateCount();
  }

  // Name fields: Accept only alphabets
  const nameInputs = document.querySelectorAll('input[data-alphabets-only="true"]');
  nameInputs.forEach((input) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^a-zA-Z\s]/g, '');
    });
  });

  // Mobile number: Numerical only and max 10 digits
  const phoneInputs = document.querySelectorAll('input[data-exact-phone="true"]');
  phoneInputs.forEach((input) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 10);
    });
  });
}

