/**
 * ═══════════════════════════════════════════════════════════
 *  Sidebar — Futuristic navigation panel
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { appStore } from '../stores/app-store';
import { currentUser } from '../services/auth';
import { currentProfile, roleConfig } from '../services/profiles';

const navItems = [
  { icon: '◈', label: 'Home', path: '/' },
  { icon: '🏛️', label: 'C2 Centre', path: '/c2-society' },
  { icon: '◉', label: 'Notices', path: '/notices' },
  { icon: '◎', label: 'Events', path: '/events' },
  { icon: '📰', label: 'News', path: '/news' },
  { icon: '⬢', label: 'About', path: '/about' },
  { icon: '✉', label: 'Contact', path: '/contact' },
  { icon: '⚙', label: 'Settings', path: '/settings' },
];

const adminNavItem = { icon: '⚡', label: 'Admin', path: '/admin' };
const donorNavItem = { icon: '💝', label: 'My Dashboard', path: '/donor-dashboard' };

export const Sidebar = defineComponent('Sidebar', () => {
  const state = appStore.get.peek();
  const user = currentUser.peek();
  const profile = currentProfile.peek();

  // Build nav items — admin only for admin role, donor dashboard for donor role
  let items = [...navItems];
  if (profile?.role === 'admin') {
    items.push(adminNavItem);
  }
  if (profile?.role === 'donor') {
    items.push(donorNavItem);
  }

  return h('aside', {
    class: `sidebar ${state.sidebarOpen ? 'open' : 'collapsed'}`,
  },
    // Logo
    h('div', { class: 'sidebar-logo' },
      h('img', { src: '/logo.png', alt: 'Hope Hub', class: 'logo-img' }),
      state.sidebarOpen ? h('div', { class: 'sidebar-logo-text' },
        h('span', { class: 'logo-text' }, 'Hope HUb'),
        h('span', { class: 'founded-badge-sidebar' }, "Founded by '94 Richmondites"),
      ) : null,
    ),

    // Navigation
    h('nav', { class: 'sidebar-nav' },
      ...items.map((item) =>
        h('a', {
          href: item.path,
          class: `nav-item ${state.currentPage === item.label.toLowerCase() ? 'active' : ''}`,
          onClick: (e: Event) => {
            e.preventDefault();
            appStore.actions.setPage(item.label.toLowerCase());
            window.history.pushState(null, '', item.path);
          },
        },
          h('span', { class: 'nav-icon' }, item.icon),
          state.sidebarOpen ? h('span', { class: 'nav-label' }, item.label) : null,
          state.currentPage === item.label.toLowerCase()
            ? h('div', { class: 'nav-indicator' })
            : null,
        ),
      ),
    ),

    // User section
    h('div', { class: 'sidebar-footer' },
      h('div', { class: 'user-card' },
        h('div', { class: 'user-avatar' },
          user?.email?.charAt(0).toUpperCase() || '?',
        ),
        state.sidebarOpen
          ? h('div', { class: 'user-info' },
              h('span', { class: 'user-name' }, profile?.full_name || user?.user_metadata?.full_name || 'User'),
              h('span', { class: 'user-email' }, user?.email || ''),
              profile ? h('span', {
                class: 'user-role-badge',
                style: `color: ${roleConfig[profile.role].color};`,
              }, `${roleConfig[profile.role].icon} ${roleConfig[profile.role].label}`) : null,
            )
          : null,
      ),
    ),
  );
});
