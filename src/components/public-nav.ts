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
  { path: '/donations', label: 'Donations' },
  { path: '/c2-society', label: 'C2 Centre' },
  { path: '/events', label: 'Events' },
  { path: '/news', label: 'News' },
  { path: '/notices', label: 'Notices' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

export const PublicNav = defineComponent('PublicNav', (props: { currentPath?: string }) => {
  const currentPath = props.currentPath || window.location.pathname;
  const user = currentUser.peek();
  const profile = currentProfile.peek();
  const isAdmin = profile?.role === 'admin';

  const toggleMobileNav = () => {
    const nav = document.querySelector('.public-nav');
    nav?.classList.toggle('nav-open');
  };

  const closeMobileNav = () => {
    const nav = document.querySelector('.public-nav');
    nav?.classList.remove('nav-open');
  };

  return h('nav', { class: 'public-nav' },
    h('a', { href: '/', class: 'public-nav-logo' },
      h('img', { src: '/logo.png', alt: 'Hope Hub', class: 'logo-img' }),
      h('span', { class: 'founded-badge' }, "Founded by '94 Richmondites"),
    ),
    h('ul', { class: 'public-nav-links' },
      h('li', { class: 'nav-mobile-badge' },
        h('span', { class: 'founded-badge' }, "Founded by '94 Richmondites"),
      ),
      ...navLinks.map(link =>
        h('li', null,
          h('a', {
            href: link.path,
            class: link.path === currentPath ? 'active' : '',
            onClick: closeMobileNav,
          }, link.label),
        ),
      ),
      h('li', { class: 'nav-mobile-actions' },
        ...(user ? [
          isAdmin
            ? h('button', {
                class: 'btn btn-primary btn-sm',
                onClick: () => { closeMobileNav(); history.pushState(null, '', '/admin'); dispatchEvent(new PopStateEvent('popstate')); },
              }, '👑 Admin Panel')
            : h('button', {
                class: 'btn btn-primary btn-sm',
                onClick: () => { closeMobileNav(); history.pushState(null, '', '/dashboard'); dispatchEvent(new PopStateEvent('popstate')); },
              }, '📊 Dashboard'),
        ] : [
          h('button', {
            class: 'btn btn-outline btn-sm',
            onClick: () => { closeMobileNav(); history.pushState(null, '', '/auth'); dispatchEvent(new PopStateEvent('popstate')); },
          }, 'Sign Up'),
          h('button', {
            class: 'btn btn-primary btn-sm',
            onClick: () => { closeMobileNav(); history.pushState(null, '', '/auth'); dispatchEvent(new PopStateEvent('popstate')); },
          }, 'Login'),
        ]),
      ),
    ),
    h('div', { class: 'public-nav-actions' },
      h('button', {
        class: 'btn-icon theme-toggle btn-ripple',
        onClick: () => appStore.actions.toggleTheme(),
        title: 'Toggle theme',
      }, '◐'),
      h('button', {
        class: 'btn-icon nav-hamburger btn-ripple',
        onClick: toggleMobileNav,
        title: 'Menu',
      }, '☰'),
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
