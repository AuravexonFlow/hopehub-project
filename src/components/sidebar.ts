/**
 * ═══════════════════════════════════════════════════════════
 *  Sidebar — Futuristic navigation panel
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { appStore } from '../stores/app-store';
import { currentUser } from '../services/auth';

const navItems = [
  { icon: '⬡', label: 'Dashboard', path: '/dashboard' },
  { icon: '◈', label: 'Projects', path: '/projects' },
  { icon: '◉', label: 'Tasks', path: '/tasks' },
  { icon: '◎', label: 'Analytics', path: '/analytics' },
  { icon: '⬢', label: 'Team', path: '/team' },
  { icon: '⚙', label: 'Settings', path: '/settings' },
];

export const Sidebar = defineComponent('Sidebar', () => {
  const state = appStore.get.peek();
  const user = currentUser.peek();

  return h('aside', {
    class: `sidebar ${state.sidebarOpen ? 'open' : 'collapsed'}`,
  },
    // Logo
    h('div', { class: 'sidebar-logo' },
      h('div', { class: 'logo-icon' }, '◆'),
      state.sidebarOpen ? h('span', { class: 'logo-text' }, 'Hope HUb') : null,
    ),

    // Navigation
    h('nav', { class: 'sidebar-nav' },
      ...navItems.map((item) =>
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
              h('span', { class: 'user-name' }, user?.user_metadata?.full_name || 'User'),
              h('span', { class: 'user-email' }, user?.email || ''),
            )
          : null,
      ),
    ),
  );
});
