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

  // 5. Sidebar Tooltips for Collapsed Action Items
  initSidebarTooltips();
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
      updateCollapseTooltip(true);
    }
  }

  // 3. Mobile Drawer Controls (<= 991px) - Fullscreen width expanded menu
  const openMobileDrawer = () => {
    sidebar.classList.add('mobile-open', 'mobile-expanded');
    document.body.classList.add('dash-sidebar-open');
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'true');
    if (collapseBtn) {
      collapseBtn.setAttribute('title', 'Close navigation menu');
      collapseBtn.setAttribute('aria-label', 'Close navigation menu');
      collapseBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    }
  };

  const closeMobileDrawer = () => {
    sidebar.classList.remove('mobile-open', 'mobile-expanded');
    document.body.classList.remove('dash-sidebar-open');
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
    if (collapseBtn) {
      const isDeskCollapsed = sidebar.classList.contains('collapsed');
      collapseBtn.setAttribute('title', isDeskCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
      collapseBtn.setAttribute('aria-label', isDeskCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
      collapseBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      `;
      updateCollapseTooltip(isDeskCollapsed);
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
        updateCollapseTooltip(willCollapse);
      }
    });
  }

  // 6. Backdrop click & touch to close drawer
  backdrop.addEventListener('click', closeMobileDrawer);
  backdrop.addEventListener('touchstart', (e) => {
    e.preventDefault();
    closeMobileDrawer();
  }, { passive: false });

  // Close drawer when clicking outside anywhere on document
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('mobile-open')) {
      if (!sidebar.contains(e.target) && (!mobileToggle || !mobileToggle.contains(e.target))) {
        closeMobileDrawer();
      }
    }
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
    if (window.innerWidth > 991) {
      if (sidebar.classList.contains('mobile-open')) {
        closeMobileDrawer();
      }
      const isDeskCollapsed = sidebar.classList.contains('collapsed');
      if (collapseBtn) {
        collapseBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        `;
        collapseBtn.setAttribute('title', isDeskCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
        updateCollapseTooltip(isDeskCollapsed);
      }
    }
  });
}

function updateCollapseTooltip(isCollapsed) {
  const collapseBtn = document.getElementById('sidebarCollapseBtn');
  if (!collapseBtn) return;
  const tooltipText = collapseBtn.querySelector('.tooltip-text');
  const tooltipIcon = collapseBtn.querySelector('.tooltip-icon');
  if (tooltipText) {
    tooltipText.textContent = isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar';
  }
  if (tooltipIcon) {
    tooltipIcon.innerHTML = isCollapsed
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
  }
}

function initSidebarTooltips() {
  const sidebar = document.querySelector('.dashboard-sidebar');
  if (!sidebar) return;

  // 1. Navigation items
  const links = sidebar.querySelectorAll('.sidebar-link');
  links.forEach(link => {
    let tooltip = link.querySelector('.sidebar-tooltip');
    const svg = link.querySelector('svg:not(.tooltip-icon svg)');
    const labelSpan = link.querySelector('.sidebar-label') || link.querySelector('span:not(.sidebar-tooltip):not(.tooltip-text):not(.tooltip-icon)');
    const labelText = (labelSpan ? labelSpan.textContent.trim() : link.getAttribute('data-tooltip') || '').trim();

    if (!tooltip && svg && labelText) {
      tooltip = document.createElement('span');
      tooltip.className = 'sidebar-tooltip';
      tooltip.setAttribute('aria-hidden', 'true');
      tooltip.innerHTML = `
        <span class="tooltip-icon">${svg.outerHTML}</span>
        <span class="tooltip-text">${labelText}</span>
      `;
      link.appendChild(tooltip);
    }
  });

  // 2. Footer Sign Out action button
  const footerBtn = sidebar.querySelector('.sidebar-footer .btn');
  if (footerBtn) {
    let tooltip = footerBtn.querySelector('.sidebar-tooltip');
    const svg = footerBtn.querySelector('svg:not(.tooltip-icon svg)');
    const labelSpan = footerBtn.querySelector('.sidebar-label') || footerBtn.querySelector('span:not(.sidebar-tooltip):not(.tooltip-text):not(.tooltip-icon)');
    const labelText = labelSpan ? labelSpan.textContent.trim() : 'Sign Out Session';

    if (!tooltip && svg) {
      tooltip = document.createElement('span');
      tooltip.className = 'sidebar-tooltip';
      tooltip.setAttribute('aria-hidden', 'true');
      tooltip.innerHTML = `
        <span class="tooltip-icon">${svg.outerHTML}</span>
        <span class="tooltip-text">${labelText}</span>
      `;
      footerBtn.appendChild(tooltip);
    }
  }

  // 3. Header Collapse / Expand button
  const collapseBtn = document.getElementById('sidebarCollapseBtn');
  if (collapseBtn) {
    let tooltip = collapseBtn.querySelector('.sidebar-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('span');
      tooltip.className = 'sidebar-tooltip';
      tooltip.setAttribute('aria-hidden', 'true');
      const isCollapsed = sidebar.classList.contains('collapsed');
      tooltip.innerHTML = `
        <span class="tooltip-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="${isCollapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'}"></polyline>
          </svg>
        </span>
        <span class="tooltip-text">${isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</span>
      `;
      collapseBtn.appendChild(tooltip);
    }
  }

  // 4. Role Badge
  const roleBadge = document.getElementById('dashRoleBadge');
  if (roleBadge) {
    let tooltip = roleBadge.querySelector('.sidebar-tooltip');
    const textEl = roleBadge.querySelector('.role-badge-text');
    const labelText = (textEl ? textEl.textContent : roleBadge.textContent).trim();
    if (!tooltip) {
      tooltip = document.createElement('span');
      tooltip.className = 'sidebar-tooltip';
      tooltip.setAttribute('aria-hidden', 'true');
      tooltip.innerHTML = `
        <span class="tooltip-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </span>
        <span class="tooltip-text">${labelText}</span>
      `;
      roleBadge.appendChild(tooltip);
    }
  }
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
    const roleText = isCoach ? 'Head Coach / Athletics Director' : 'Club Athlete / Member';
    const textEl = roleBadgeEl.querySelector('.role-badge-text');
    if (textEl) {
      textEl.textContent = roleText;
    } else {
      const starSvg = `
        <span class="role-badge-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </span>
      `;
      const tooltipEl = roleBadgeEl.querySelector('.sidebar-tooltip');
      roleBadgeEl.innerHTML = `${starSvg}<span class="role-badge-text">${roleText}</span>${tooltipEl ? tooltipEl.outerHTML : ''}`;
    }

    const tooltipTextEl = roleBadgeEl.querySelector('.sidebar-tooltip .tooltip-text');
    if (tooltipTextEl) {
      tooltipTextEl.textContent = roleText;
    }
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
