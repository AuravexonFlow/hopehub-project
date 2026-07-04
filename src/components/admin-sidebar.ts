/**
 * ═══════════════════════════════════════════════════════════
 *  Admin Sidebar — Dedicated admin navigation panel
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { render } from '../vortex/render';
import { createSignal } from '../vortex/signals';
import { currentUser } from '../services/auth';
import { currentProfile, roleConfig, getAllProfilesWithStatus } from '../services/profiles';
import {
  getAllNotices, getAllEvents, getAllNews, getAllDonations, getAllTransactions,
} from '../stores/content-store';

// ─── Admin Nav Items ──────────────────────────────────────

const adminNavItems = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/admin' },
  { id: 'notices',   icon: '📋', label: 'Notices',   path: '/admin' },
  { id: 'events',    icon: '🎉', label: 'Events',    path: '/admin' },
  { id: 'news',      icon: '📰', label: 'News',      path: '/admin' },
  { id: 'donations', icon: '💝', label: 'Donations', path: '/admin' },
  { id: 'users',     icon: '👥', label: 'Users',     path: '/admin' },
];

// ─── Sidebar State Signal ─────────────────────────────────

export const adminSidebarCollapsed = createSignal(false);
export const adminActiveNav = createSignal<string>('notices');

// ─── Admin Sidebar Component ──────────────────────────────

export const AdminSidebar = defineComponent('AdminSidebar', () => {
  const collapsed = adminSidebarCollapsed.peek();
  const activeNav = adminActiveNav.peek();
  const user = currentUser.peek();
  const profile = currentProfile.peek();

  // Counts for badges
  const txs = getAllTransactions();
  const counts: Record<string, number> = {
    notices: getAllNotices().length,
    events: getAllEvents().length,
    news: getAllNews().length,
    donations: getAllDonations().length + txs.length,
    users: getAllProfilesWithStatus().length,
  };
  const pendingUsers = getAllProfilesWithStatus().filter(p => p.status === 'pending').length;

  return h('aside', {
    class: `admin-sidebar ${collapsed ? 'collapsed' : ''}`,
  },
    // Logo + Brand
    h('div', { class: 'admin-sidebar-brand' },
      h('div', { class: 'admin-brand-icon' }, '⚡'),
      !collapsed ? h('div', { class: 'admin-brand-text' },
        h('span', { class: 'admin-brand-name' }, 'Hope HUb'),
        h('span', { class: 'admin-brand-label' }, 'Admin Panel'),
      ) : null,
    ),

    // Collapse toggle
    h('button', {
      class: 'admin-sidebar-toggle',
      onClick: () => {
        adminSidebarCollapsed.set(!adminSidebarCollapsed.peek());
        rerenderAdminSidebar();
      },
      title: collapsed ? 'Expand sidebar' : 'Collapse sidebar',
    }, collapsed ? '»' : '«'),

    // Navigation
    h('nav', { class: 'admin-sidebar-nav' },
      ...adminNavItems.map(item => {
        const isActive = activeNav === item.id;
        const badgeCount = item.id === 'users' ? pendingUsers : 0;
        const itemCount = counts[item.id] || 0;

        return h('button', {
          class: `admin-nav-item ${isActive ? 'active' : ''}`,
          onClick: () => {
            adminActiveNav.set(item.id);
            // Dispatch custom event for admin page to listen
            window.dispatchEvent(new CustomEvent('admin-nav-change', { detail: { tab: item.id } }));
            rerenderAdminSidebar();
          },
          title: item.label,
        },
          h('span', { class: 'admin-nav-icon' }, item.icon),
          !collapsed ? h('span', { class: 'admin-nav-label' }, item.label) : null,
          !collapsed && itemCount > 0 ? h('span', { class: 'admin-nav-count' }, String(itemCount)) : null,
          !collapsed && badgeCount > 0 ? h('span', { class: 'admin-nav-badge' }, String(badgeCount)) : null,
          isActive ? h('div', { class: 'admin-nav-indicator' }) : null,
        );
      }),
    ),

    // Divider
    h('div', { class: 'admin-sidebar-divider' }),

    // Quick Stats
    !collapsed ? h('div', { class: 'admin-sidebar-stats' },
      h('div', { class: 'admin-stat-item' },
        h('span', { class: 'admin-stat-value' }, String(getAllProfilesWithStatus().length)),
        h('span', { class: 'admin-stat-label' }, 'Total Users'),
      ),
      h('div', { class: 'admin-stat-item' },
        h('span', { class: 'admin-stat-value', style: pendingUsers > 0 ? 'color: var(--accent-yellow)' : '' }, String(pendingUsers)),
        h('span', { class: 'admin-stat-label' }, 'Pending'),
      ),
    ) : null,

    // Footer — Back to site + user info
    h('div', { class: 'admin-sidebar-footer' },
      h('a', {
        href: '/',
        class: 'admin-back-link',
      },
        h('span', { class: 'admin-nav-icon' }, '←'),
        !collapsed ? h('span', { class: 'admin-nav-label' }, 'Back to Site') : null,
      ),
      h('div', { class: 'admin-user-card' },
        h('div', { class: 'admin-user-avatar' },
          user?.email?.charAt(0).toUpperCase() || '?',
        ),
        !collapsed ? h('div', { class: 'admin-user-info' },
          h('span', { class: 'admin-user-name' }, profile?.full_name || 'Admin'),
          h('span', { class: 'admin-user-role' },
            profile ? `${roleConfig[profile.role].icon} ${roleConfig[profile.role].label}` : '',
          ),
        ) : null,
      ),
    ),
  );
});

// ─── Re-render Helper ─────────────────────────────────────

function rerenderAdminSidebar() {
  const el = document.querySelector('.admin-sidebar') as HTMLElement | null;
  if (el && el.parentElement) {
    const parent = el.parentElement;
    // Create a temporary container, render into it, then replace the old element
    const tmp = document.createElement('div');
    render(h(AdminSidebar, {}), tmp);
    const newSidebar = tmp.firstElementChild;
    if (newSidebar) {
      parent.replaceChild(newSidebar, el);
    }
  }
}
