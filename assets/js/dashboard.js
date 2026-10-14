/**
 * STACKLY SPORTS CLUB - DEDICATED INDIVIDUAL DASHBOARDS ENGINE
 * Manages Dedicated Member & Coach Portals | Session Verification | Tab Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Session verification
  const currentUserRaw = localStorage.getItem('currentUser');
  if (!currentUserRaw) {
    window.location.href = 'sign-in.html';
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

  // Restore saved collapse state on desktop
  const isCollapsed = localStorage.getItem('stackly_sidebar_collapsed') === 'true';
  if (isCollapsed && window.innerWidth > 900) {
    sidebar.classList.add('collapsed');
    if (collapseBtn) {
      collapseBtn.setAttribute('aria-expanded', 'false');
      collapseBtn.setAttribute('title', 'Expand sidebar');
    }
  }

  if (collapseBtn) {
    collapseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isMobile = window.innerWidth <= 900;
      if (isMobile) {
        sidebar.classList.toggle('mobile-expanded');
      } else {
        const willCollapse = !sidebar.classList.contains('collapsed');
        sidebar.classList.toggle('collapsed', willCollapse);
        collapseBtn.setAttribute('aria-expanded', (!willCollapse).toString());
        collapseBtn.setAttribute('title', willCollapse ? 'Expand sidebar' : 'Collapse sidebar');
        localStorage.setItem('stackly_sidebar_collapsed', willCollapse ? 'true' : 'false');
      }
    });
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('mobile-expanded');
    });
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
