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

import { h, render, Fragment } from './vortex';
import { createSignal, createEffect } from './vortex/signals';
import { createRouter, type RouteConfig } from './vortex/router';

// Services
import { initAuth, currentUser, authLoading } from './services/auth';
import { cleanupAllChannels } from './services/realtime';

// Components
import { Sidebar } from './components/sidebar';
import { Navbar } from './components/navbar';
import { PageLoader } from './components/loading';

// Pages
import { HomePage } from './pages/home';
import { AuthPage } from './pages/auth';
import { DashboardPage } from './pages/dashboard';
import { ProjectsPage } from './pages/projects';
import { TasksPage } from './pages/tasks';
import { AnalyticsPage } from './pages/analytics';
import { SettingsPage } from './pages/settings';

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
    path: '/dashboard',
    component: DashboardPage,
    guard: () => currentUser.peek() !== null,
    meta: { title: 'Dashboard' },
  },
  {
    path: '/projects',
    component: ProjectsPage,
    guard: () => currentUser.peek() !== null,
    meta: { title: 'Projects' },
  },
  {
    path: '/tasks',
    component: TasksPage,
    guard: () => currentUser.peek() !== null,
    meta: { title: 'Tasks' },
  },
  {
    path: '/analytics',
    component: AnalyticsPage,
    guard: () => currentUser.peek() !== null,
    meta: { title: 'Analytics' },
  },
  {
    path: '/team',
    component: DashboardPage, // Reuse dashboard for now
    guard: () => currentUser.peek() !== null,
    meta: { title: 'Team' },
  },
  {
    path: '/settings',
    component: SettingsPage,
    guard: () => currentUser.peek() !== null,
    meta: { title: 'Settings' },
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

  // Public pages without auth — show content without sidebar
  if (!user && route?.meta?.public) {
    return h('div', { class: 'app-public' },
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
  // Initialize auth
  await initAuth();

  // Render app
  const app = document.getElementById('app');
  if (app) {
    render(h(AppShell, {}), app);
  }

  // Re-render on route/auth changes
  createEffect(() => {
    const _route = router.route();
    const _user = currentUser();
    const _loading = authLoading();

    // Trigger re-render
    requestAnimationFrame(() => {
      const target = document.getElementById('app');
      if (target) {
        render(h(AppShell, {}), target);
      }
    });
  });

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    cleanupAllChannels();
  });

  // Log startup
  console.log(
    '%c◆ VORTEX Framework v1.0.0 %c— Hope HUb',
    'background: #0a0a2e; color: #00f5ff; padding: 8px 12px; font-family: monospace; font-weight: bold; border: 1px solid #00f5ff;',
    'background: #1a0a2e; color: #aa44ff; padding: 8px 12px; font-family: monospace;'
  );
}

// ─── Mount ────────────────────────────────────────────────

bootstrap().catch(console.error);
