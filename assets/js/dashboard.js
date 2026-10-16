/**
 * STACKLY SPORTS CLUB - DEDICATED INDIVIDUAL DASHBOARDS ENGINE
 * Manages Dedicated Member & Coach Portals | Session Verification | Tab Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Session verification
  const currentUserRaw = localStorage.getItem('currentUser');
  if (!currentUserRaw) {
    const inPages = window.location.pathname.replace(/\\/g, '/').includes('/pages/');
    window.location.href = inPages ? '../auth/sign-in.html' : 'pages/auth/sign-in.html';
    return;
  }

  const currentUser = JSON.parse(currentUserRaw);
  const currentPath = window.location.pathname.toLowerCase();
  const isCoachPage = currentPath.includes('coach-');

  // Align active role with dedicated page
  const activeRole = isCoachPage ? 'coach' : 'member';
  localStorage.setItem('role', activeRole);

  // 2. Initialize Topbar Details
  initTopbar(currentUser, activeRole);

  // 3. Sidebar Navigation Tab Scrolling
  initSidebarTabs();

  // 4. Sidebar Collapse Toggle
  initSidebarCollapse();
});

function initSidebarCollapse() {
  const collapseBtn = document.getElementById('sidebarCollapseBtn');
  const mobileToggle = document.getElementById('dashMobileToggle');
  const sidebar = document.querySelector('.dashboard-sidebar');
  if (!sidebar) return;

  // 1. Ensure backdrop element exists for mobile drawer
  let backdrop = document.querySelector('.dashboard-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'dashboard-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  // 2. Desktop Collapse State Restoration (> 991px)
  const isCollapsed = localStorage.getItem('stackly_sidebar_collapsed') === 'true';
  if (isCollapsed && window.innerWidth > 991) {
    sidebar.classList.add('collapsed');
    if (collapseBtn) {
      collapseBtn.setAttribute('aria-expanded', 'false');
      collapseBtn.setAttribute('title', 'Expand sidebar');
    }
  }

  // 3. Mobile Drawer Controls (<= 991px)
  let savedDashScrollY = 0;

  const openMobileDrawer = () => {
    const dashBody = document.querySelector('.dashboard-content-body');
    savedDashScrollY = dashBody ? dashBody.scrollTop : (window.pageYOffset || document.documentElement.scrollTop || 0);
    sidebar.classList.add('mobile-open', 'mobile-expanded');
    document.body.classList.add('dash-sidebar-open');
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'true');
    if (collapseBtn) collapseBtn.setAttribute('title', 'Close navigation menu');
  };

  const closeMobileDrawer = () => {
    sidebar.classList.remove('mobile-open', 'mobile-expanded');
    document.body.classList.remove('dash-sidebar-open');
    const dashBody = document.querySelector('.dashboard-content-body');
    if (dashBody && savedDashScrollY) {
      dashBody.scrollTop = savedDashScrollY;
    } else if (savedDashScrollY) {
      window.scrollTo(0, savedDashScrollY);
    }
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
    if (collapseBtn) {
      const isDeskCollapsed = sidebar.classList.contains('collapsed');
      collapseBtn.setAttribute('title', isDeskCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
    }
  };

  // 4. Mobile Toggle Button (Topbar)
  if (mobileToggle) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar.classList.contains('mobile-open')) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }

  // 5. Sidebar Collapse / Close Button
  if (collapseBtn) {
    collapseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.innerWidth <= 991) {
        closeMobileDrawer();
      } else {
        const willCollapse = !sidebar.classList.contains('collapsed');
        sidebar.classList.toggle('collapsed', willCollapse);
        collapseBtn.setAttribute('aria-expanded', (!willCollapse).toString());
        collapseBtn.setAttribute('title', willCollapse ? 'Expand sidebar' : 'Collapse sidebar');
        localStorage.setItem('stackly_sidebar_collapsed', willCollapse ? 'true' : 'false');
      }
    });
  }

  // 6. Backdrop click to close drawer
  backdrop.addEventListener('click', () => {
    closeMobileDrawer();
  });

  // 7. Close mobile drawer when clicking any link inside the sidebar
  sidebar.addEventListener('click', (e) => {
    const link = e.target.closest('.sidebar-link, .sidebar-footer .btn, .brand-link');
    if (link && window.innerWidth <= 991) {
      closeMobileDrawer();
    }
  });

  // 8. Close drawer on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
      closeMobileDrawer();
    }
  });

  // 9. Reset mobile drawer on viewport resize above 991px
  window.addEventListener('resize', () => {
    if (window.innerWidth > 991 && sidebar.classList.contains('mobile-open')) {
      closeMobileDrawer();
    }
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function initTopbar(user, role) {
  const greetingEl = document.getElementById('dashGreetingText');
  const roleBadgeEl = document.getElementById('dashRoleBadge');
  const userNameEl = document.getElementById('dashUserName');
  const userRoleEl = document.getElementById('dashUserRole');
  const userAvatarEl = document.getElementById('dashUserAvatar');

  const greeting = getGreeting();
  const isCoach = role === 'coach';

  // Determine display name
  let firstName = user.firstName;
  let lastName = user.lastName;

  // If user role from login matched the page, use user's credentials, otherwise default to role profile
  if (user.role === role) {
    firstName = user.firstName || (isCoach ? 'Marcus' : 'Arjun');
    lastName = user.lastName || (isCoach ? 'Vance' : 'Patel');
  } else {
    firstName = isCoach ? 'Marcus' : 'Arjun';
    lastName = isCoach ? 'Vance' : 'Patel';
  }

  const fullName = `${firstName} ${lastName}`;

  if (greetingEl) {
    greetingEl.textContent = `${greeting}, ${firstName}!`;
  }
  if (roleBadgeEl) {
    roleBadgeEl.textContent = isCoach ? 'Head Coach / Athletics Director' : 'Club Athlete / Member';
  }
  if (userNameEl) {
    userNameEl.textContent = fullName;
  }
  if (userRoleEl) {
    userRoleEl.textContent = isCoach ? 'Director of Athletics' : 'Pro Tier Athlete';
  }
  if (userAvatarEl) {
    const initials = (firstName ? firstName[0] : 'S') + (lastName ? lastName[0] : 'C');
    userAvatarEl.textContent = initials.toUpperCase();
  }
}

function initSidebarTabs() {
  const links = document.querySelectorAll('.sidebar-link');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#' || href.startsWith('#')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const targetKey = link.getAttribute('data-target');
        const targetElement = document.getElementById(targetKey) || document.querySelector(`[data-target="${targetKey}"]`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  });
}
