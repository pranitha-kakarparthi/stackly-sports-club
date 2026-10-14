/**
 * STACKLY SPORTS CLUB - ROLE-BASED DASHBOARD ENGINE
 * Supports 2 Distinct Roles: 'member' (Athlete) and 'coach' (Coach / Admin)
 * Live Role Switcher, Session Persistence, KPI Metrics, Tables & Schedules
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Session verification
  const currentUserRaw = localStorage.getItem('currentUser');
  if (!currentUserRaw) {
    window.location.href = 'sign-in.html';
    return;
  }

  const currentUser = JSON.parse(currentUserRaw);
  let activeRole = localStorage.getItem('role') || currentUser.role || 'member';

  // 2. Initialize Topbar Details
  initTopbar(currentUser, activeRole);

  // 3. Render Dashboard View for Active Role
  renderDashboard(currentUser, activeRole);

  // 4. Role Switcher Listener
  const roleSelect = document.getElementById('roleSwitcherSelect');
  if (roleSelect) {
    roleSelect.value = activeRole;
    roleSelect.addEventListener('change', (e) => {
      activeRole = e.target.value;
      localStorage.setItem('role', activeRole);
      currentUser.role = activeRole;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      initTopbar(currentUser, activeRole);
      renderDashboard(currentUser, activeRole);
    });
  }

  // 5. Sidebar Navigation tab switching
  initSidebarTabs();
});

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

  const fullName = `${user.firstName || 'Athlete'} ${user.lastName || 'Member'}`;
  const greeting = getGreeting();

  if (greetingEl) {
    greetingEl.textContent = `${greeting}, ${user.firstName || 'Champion'}!`;
  }
  if (roleBadgeEl) {
    roleBadgeEl.textContent = role === 'coach' ? 'Head Coach / Admin' : 'Club Athlete / Member';
  }
  if (userNameEl) {
    userNameEl.textContent = fullName;
  }
  if (userRoleEl) {
    userRoleEl.textContent = role === 'coach' ? 'Director of Athletics' : 'Pro Tier Athlete';
  }
  if (userAvatarEl) {
    const initials = (user.firstName ? user.firstName[0] : 'S') + (user.lastName ? user.lastName[0] : 'C');
    userAvatarEl.textContent = initials.toUpperCase();
  }
}

function renderDashboard(user, role) {
  const memberContainer = document.getElementById('memberDashboardView');
  const coachContainer = document.getElementById('coachDashboardView');

  if (role === 'coach') {
    if (memberContainer) memberContainer.style.display = 'none';
    if (coachContainer) coachContainer.style.display = 'block';
  } else {
    if (coachContainer) coachContainer.style.display = 'none';
    if (memberContainer) memberContainer.style.display = 'block';
  }

  // Reset active sidebar link to overview on role switch
  const links = document.querySelectorAll('.sidebar-link[data-target]');
  links.forEach(l => l.classList.remove('active'));
  const overviewLink = document.querySelector('.sidebar-link[data-target="overview"]');
  if (overviewLink) overviewLink.classList.add('active');
}

function initSidebarTabs() {
  const links = document.querySelectorAll('.sidebar-link[data-target]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const targetKey = link.getAttribute('data-target');
      const activeRole = localStorage.getItem('role') || 'member';
      // Look for role-scoped ID first (e.g. member-overview or coach-overview)
      const targetElement = document.getElementById(`${activeRole}-${targetKey}`) || document.getElementById(targetKey);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

