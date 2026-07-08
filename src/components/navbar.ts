/**
 * ═══════════════════════════════════════════════════════════
 *  Navbar — Top header bar with search and controls
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { appStore } from '../stores/app-store';
import { currentUser, signOut } from '../services/auth';
import { createSignal } from '../vortex/signals';

export const Navbar = defineComponent('Navbar', () => {
  const user = currentUser.peek();
  const searchFocused = createSignal(false);

  return h('header', { class: 'navbar' },
    // Left — Toggle & Breadcrumb
    h('div', { class: 'navbar-left' },
      h('button', {
        class: 'btn-icon',
        onClick: () => appStore.actions.toggleSidebar(),
      }, '☰'),
      h('div', { class: 'breadcrumb' },
        h('span', { class: 'breadcrumb-home' },
          h('img', { src: '/logo.png', alt: 'Hope Hub', class: 'logo-img-sm' }),
        ),
        h('span', { class: 'breadcrumb-sep' }, '›'),
        h('span', { class: 'breadcrumb-page' }, appStore.get.peek().currentPage),
      ),
    ),

    // Center — Search
    h('div', { class: 'navbar-center' },
      h('div', { class: 'search-bar' },
        h('span', { class: 'search-icon' }, '⌕'),
        h('input', {
          type: 'text',
          class: 'search-input',
          placeholder: 'Search across Hope HUb...',
          onInput: (e: Event) => {
            const target = e.target as HTMLInputElement;
            // Handle search
          },
        }),
        h('kbd', { class: 'search-kbd' }, '⌘K'),
      ),
    ),

    // Right — Actions
    h('div', { class: 'navbar-right' },
      h('button', {
        class: 'btn-icon notification-btn',
        onClick: () => {},
      },
        h('span', null, '🔔'),
        h('span', { class: 'notification-badge' }, '3'),
      ),
      h('button', {
        class: 'btn-icon btn-ripple',
        onClick: () => appStore.actions.toggleTheme(),
      }, appStore.get.peek().theme === 'dark' ? '☀' : '☾'),
      h('div', { class: 'navbar-user' },
        h('div', { class: 'avatar-sm' },
          user?.email?.charAt(0).toUpperCase() || '?',
        ),
        h('div', { class: 'user-dropdown' },
          h('span', { class: 'dropdown-name' }, user?.user_metadata?.full_name || user?.email),
          h('div', { class: 'dropdown-divider' }),
          h('button', {
            class: 'dropdown-item',
            onClick: () => appStore.actions.setPage('settings'),
          }, '⚙ Settings'),
          h('button', {
            class: 'dropdown-item danger',
            onClick: () => signOut(),
          }, '⏻ Sign Out'),
        ),
      ),
    ),
  );
});
