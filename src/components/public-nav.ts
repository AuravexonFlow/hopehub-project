/**
 * ═══════════════════════════════════════════════════════════
 *  Public Navigation — Shared nav bar for all public pages
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { appStore } from '../stores/app-store';
import { currentUser } from '../services/auth';
import { currentProfile } from '../services/profiles';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/c2-society', label: 'C2 Centre' },
  { path: '/notices', label: 'Notices' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
  { path: '/events', label: 'Events' },
  { path: '/news', label: 'News' },
];

export const PublicNav = defineComponent('PublicNav', (props: { currentPath?: string }) => {
  const currentPath = props.currentPath || window.location.pathname;
  const user = currentUser.peek();
  const profile = currentProfile.peek();
  const isAdmin = profile?.role === 'admin';

  return h('nav', { class: 'public-nav' },
    h('a', { href: '/', class: 'public-nav-logo' },
      h('img', { src: '/logo.png', alt: 'Hope Hub', class: 'logo-img' }),
      h('span', { class: 'founded-badge' }, "Founded by '94 Richmondites"),
    ),
    h('ul', { class: 'public-nav-links' },
      ...navLinks.map(link =>
        h('li', null,
          h('a', {
            href: link.path,
            class: link.path === currentPath ? 'active' : '',
          }, link.label),
        ),
      ),
    ),
    h('div', { class: 'public-nav-actions' },
      h('button', {
        class: 'btn-icon theme-toggle',
        onClick: () => appStore.actions.toggleTheme(),
        title: 'Toggle theme',
      }, '◐'),
      ...(user ? [
        isAdmin
          ? h('button', {
              class: 'btn btn-primary btn-sm',
              onClick: () => { history.pushState(null, '', '/admin'); dispatchEvent(new PopStateEvent('popstate')); },
            }, '👑 Admin Panel')
          : h('button', {
              class: 'btn btn-primary btn-sm',
              onClick: () => { history.pushState(null, '', '/dashboard'); dispatchEvent(new PopStateEvent('popstate')); },
            }, '📊 Dashboard'),
      ] : [
        h('button', {
          class: 'btn btn-outline btn-sm',
          onClick: () => { history.pushState(null, '', '/auth'); dispatchEvent(new PopStateEvent('popstate')); },
        }, 'Sign Up'),
        h('button', {
          class: 'btn btn-primary btn-sm',
          onClick: () => { history.pushState(null, '', '/auth'); dispatchEvent(new PopStateEvent('popstate')); },
        }, 'Login'),
      ]),
    ),
  );
});
