/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                    ██╗   ██╗ ██████╗ ██████╗ ████████╗       ║
 * ║                    ██║   ██║██╔═══██╗██╔══██╗╚══██╔══╝       ║
 * ║                    ██║   ██║██║   ██║██████╔╝   ██║          ║
 * ║                    ╚██╗ ██╔╝██║   ██║██╔══██╗   ██║          ║
 * ║                     ╚████╔╝ ╚██████╔╝██║  ██║   ██║          ║
 * ║                      ╚═══╝   ╚═════╝ ╚═╝  ╚═╝   ╚═╝          ║
 * ║                                                                ║
 * ║  Hope HUb — Main Application Entry Point                     ║
 * ║  Powered by VORTEX Framework & Supabase                       ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import './styles/main.css';

import { h, render } from './vortex';
import { createSignal, createEffect } from './vortex/signals';
import { createRouter, type RouteConfig } from './vortex/router';

// Services
import { initAuth, currentUser, authLoading } from './services/auth';
import { cleanupAllChannels } from './services/realtime';
import { getToasts } from './services/toast';
import { currentProfile, hasAnyRole } from './services/profiles';
import { initContentStore, refreshContent } from './stores/content-store';

// Components
import { Sidebar } from './components/sidebar';
import { Navbar } from './components/navbar';
import { PageLoader } from './components/loading';
import { ToastContainer } from './components/toast-container';
import { PublicNav } from './components/public-nav';
import { AdminSidebar } from './components/admin-sidebar';

// Pages
import { HomePage } from './pages/home';
import { AuthPage } from './pages/auth';
import { AuthCallbackPage } from './pages/auth-callback';
import { DashboardPage } from './pages/dashboard';
import { DonationRequestPage } from './pages/donation-request';
import { NoticesPage } from './pages/notices';
import { AboutPage } from './pages/about';
import { ContactPage } from './pages/contact';
import { EventsPage } from './pages/events';
import { NewsPage } from './pages/news';
import { SettingsPage } from './pages/settings';
import { AdminPage } from './pages/admin';
import { C2SocietyPage } from './pages/c2-society';
import { EducationResourcesPage } from './pages/education-resources';
import { CounselingPage } from './pages/counseling';
import { CareerGuidancePage } from './pages/career-guidance';
import { NotFoundPage } from './pages/not-found';

// ─── Route Definitions ────────────────────────────────────

const routes: RouteConfig[] = [
  {
    path: '/',
    component: HomePage,
    meta: { title: 'Home', public: true },
  },
  {
    path: '/auth',
    component: AuthPage,
    meta: { title: 'Sign In', public: true, hideLayout: true },
  },
  {
    path: '/auth/callback',
    component: AuthCallbackPage,
    meta: { title: 'Signing In...', public: true, hideLayout: true },
  },
  {
    path: '/dashboard',
    component: DashboardPage,
    guard: () => currentUser.peek() !== null,
    meta: { title: 'Dashboard' },
  },
  {
    path: '/donation-request',
    component: DonationRequestPage,
    guard: () => {
      if (currentUser.peek() === null) {
        localStorage.setItem('hope-hub-auth-redirect', '/donation-request');
        return false;
      }
      return true;
    },
    meta: { title: 'Donation Request' },
  },
  {
    path: '/notices',
    component: NoticesPage,
    meta: { title: 'Notices', public: true },
  },
  {
    path: '/about',
    component: AboutPage,
    meta: { title: 'About', public: true },
  },
  {
    path: '/contact',
    component: ContactPage,
    meta: { title: 'Contact', public: true },
  },
  {
    path: '/events',
    component: EventsPage,
    meta: { title: 'Events', public: true },
  },
  {
    path: '/news',
    component: NewsPage,
    meta: { title: 'News', public: true },
  },
  {
    path: '/settings',
    component: SettingsPage,
    guard: () => currentUser.peek() !== null,
    meta: { title: 'Settings' },
  },
  {
    path: '/admin',
    component: AdminPage,
    guard: () => currentUser.peek() !== null && hasAnyRole('admin'),
    meta: { title: 'Admin', roles: ['admin'], adminLayout: true },
  },
  {
    path: '/c2-society',
    component: C2SocietyPage,
    meta: { title: 'C2 Society', public: true },
  },
  {
    path: '/education-resources',
    component: EducationResourcesPage,
    meta: { title: 'Education Resources', public: true },
  },
  {
    path: '/counseling',
    component: CounselingPage,
    meta: { title: 'Counseling & Referral', public: true },
  },
  {
    path: '/career-guidance',
    component: CareerGuidancePage,
    meta: { title: 'Career Guidance', public: true },
  },
  {
    path: '/404',
    component: NotFoundPage,
    meta: { title: 'Page Not Found', public: true },
  },
];

// ─── Router Instance ──────────────────────────────────────

const router = createRouter(routes);

// ─── App Shell ────────────────────────────────────────────

function AppShell() {
  const route = router.route.peek();
  const user = currentUser.peek();
  const isLoading = authLoading.peek();
  const loadingRoute = router.isLoading.peek();

  if (isLoading) {
    return h(PageLoader, {});
  }

  // Auth page — no layout
  if (route?.meta?.hideLayout) {
    return h('div', { class: 'app-no-layout' },
      h(route.component, {}),
    );
  }

  // Admin layout — separate admin sidebar
  if (route?.meta?.adminLayout) {
    return h('div', { class: 'app-admin-layout' },
      // Mobile top bar (visible only < 768px via CSS)
      h('div', { class: 'admin-mobile-topbar' },
        h('div', { class: 'admin-mobile-brand' },
          h('div', { class: 'admin-mobile-brand-icon' }, '⚡'),
          h('span', { class: 'admin-mobile-brand-name' }, 'Hope HUb'),
        ),
        h('button', {
          class: 'admin-mobile-hamburger',
          'aria-label': 'Open menu',
          onClick: () => {
            const sidebar = document.querySelector('.admin-sidebar-wrap');
            const backdrop = document.querySelector('.admin-drawer-backdrop');
            sidebar?.classList.add('mobile-open');
            backdrop?.classList.add('visible');
          },
        }, '☰'),
      ),
      // Drawer backdrop (visible only when drawer open)
      h('div', {
        class: 'admin-drawer-backdrop',
        onClick: () => {
          const sidebar = document.querySelector('.admin-sidebar-wrap');
          const backdrop = document.querySelector('.admin-drawer-backdrop');
          sidebar?.classList.remove('mobile-open');
          backdrop?.classList.remove('visible');
        },
      }),
      h(AdminSidebar, {}),
      h('main', { class: 'admin-main' },
        loadingRoute
          ? h('div', { class: 'route-loading' },
              h('div', { class: 'loading-pulse' }),
            )
          : route
            ? h(route.component, {})
            : h(NotFoundPage, {}),
      ),
    );
  }

  // Public pages — show shared nav + content (always, even when logged in)
  if (route?.meta?.public) {
    const currentPath = route.path;
    return h('div', { class: 'app-public' },
      h(PublicNav, { currentPath }),
      h('div', { class: 'public-content' },
        h(route.component, {}),
      ),
    );
  }

  // Authenticated layout
  return h('div', { class: 'app-layout' },
    h(Sidebar, {}),
    h('div', { class: 'app-main' },
      h(Navbar, {}),
      h('main', { class: 'app-content' },
        loadingRoute
          ? h('div', { class: 'route-loading' },
              h('div', { class: 'loading-pulse' }),
            )
          : route
            ? h(route.component, {})
            : h(NotFoundPage, {}),
      ),
    ),
  );
}

// ─── Bootstrap ────────────────────────────────────────────

async function bootstrap() {
  // Initialize auth first — so guards can evaluate correctly
  await initAuth();

  // Load content from Supabase (with localStorage fallback)
  await initContentStore();

  // Start the router (resolves initial route with auth state available)
  await router.start();

  // Render app
  const app = document.getElementById('app');
  if (app) {
    render(h(AppShell, {}), app);
  }

  // Re-render app on route/auth changes ONLY (not toasts)
  let _lastHashScrolled = '';
  let _lastRoutePath = '';
  createEffect(() => {
    const _route = router.route();
    const _user = currentUser();
    const _loading = authLoading();

    // Re-fetch content from Supabase on route change (keeps pages in sync)
    const newPath = _route?.path || '';
    if (newPath && newPath !== _lastRoutePath) {
      _lastRoutePath = newPath;
      refreshContent().then(() => {
        // Re-render after content refresh so pages show latest data
        const target = document.getElementById('app');
        if (target) {
          render(h(AppShell, {}), target);
        }
      });
    }

    const target = document.getElementById('app');
    if (target) {
      render(h(AppShell, {}), target);
    }

    // Update document title
    const routeTitle = router.route.peek()?.meta?.title;
    document.title = routeTitle
      ? `${routeTitle} — Richmond Hope Hub`
      : 'Richmond Hope Hub — Empower Education, One Donation at a Time';

    // Scroll to hash anchor after render settles
    const hash = window.location.hash;
    if (hash && hash !== _lastHashScrolled) {
      _lastHashScrolled = hash;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        });
      });
    }
  });

  // Toast rendering — separate container, does NOT destroy app DOM
  createEffect(() => {
    const _toasts = getToasts()();

    const toastRoot = document.getElementById('toast-root');
    if (toastRoot) {
      render(h(ToastContainer, {}), toastRoot);
    }
  });

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    cleanupAllChannels();
  });

  // Cross-tab sync: re-render when content is updated from another tab
  window.addEventListener('content-updated', () => {
    const target = document.getElementById('app');
    if (target) {
      render(h(AppShell, {}), target);
    }
  });

  // Log startup
  console.log(
    '%c◆ VORTEX Framework v1.0.0 %c— Hope HUb',
    'background: #0c0c1e; color: #e02040; padding: 8px 12px; font-family: monospace; font-weight: bold; border: 1px solid #e02040;',
    'background: #0c0c1e; color: #0090d0; padding: 8px 12px; font-family: monospace;'
  );
  console.log(
    '%c⚠ Security Notice',
    'color: #ffaa00; font-weight: bold; font-size: 12px;',
    'This browser feature is intended for developers. If someone told you to copy-paste something here, it may be a scam.'
  );

  // ─── SPA Navigation Interceptor ──────────────────────
  // Intercept all <a> clicks for SPA navigation
  document.addEventListener('click', (e) => {
    const anchor = (e.target as HTMLElement).closest('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || href.startsWith('mailto:')) return;
    e.preventDefault();
    history.pushState(null, '', href);
    dispatchEvent(new PopStateEvent('popstate'));
  });
}

// ─── Mount ────────────────────────────────────────────────

bootstrap().catch(console.error);
