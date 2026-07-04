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
    meta: { title: 'Donation Request', public: true },
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
      h(AdminSidebar, {}),
      h('main', { class: 'admin-main' },
        loadingRoute
          ? h('div', { class: 'route-loading' },
              h('div', { class: 'loading-pulse' }),
            )
          : route
            ? h(route.component, {})
            : h('div', { class: 'error-page' },
                h('h1', null, '404'),
                h('p', null, 'Route not found'),
              ),
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
            : h('div', { class: 'error-page' },
                h('h1', null, '404'),
                h('p', null, 'Route not found'),
              ),
      ),
    ),
  );
}

// ─── Bootstrap ────────────────────────────────────────────

async function bootstrap() {
  // Initialize auth first — so guards can evaluate correctly
  await initAuth();

  // Start the router (resolves initial route with auth state available)
  await router.start();

  // Render app
  const app = document.getElementById('app');
  if (app) {
    render(h(AppShell, {}), app);
  }

  // Re-render app on route/auth changes ONLY (not toasts)
  let _lastHashScrolled = '';
  createEffect(() => {
    const _route = router.route();
    const _user = currentUser();
    const _loading = authLoading();

    const target = document.getElementById('app');
    if (target) {
      render(h(AppShell, {}), target);
    }

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

  // Log startup
  console.log(
    '%c◆ VORTEX Framework v1.0.0 %c— Hope HUb',
    'background: #0c0c1e; color: #e02040; padding: 8px 12px; font-family: monospace; font-weight: bold; border: 1px solid #e02040;',
    'background: #0c0c1e; color: #0090d0; padding: 8px 12px; font-family: monospace;'
  );
}

// ─── Mount ────────────────────────────────────────────────

bootstrap().catch(console.error);
