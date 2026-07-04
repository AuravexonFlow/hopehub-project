/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  VORTEX ROUTER — Client-Side SPA Router                     ║
 * ║  History API, params, guards, lazy loading, transitions      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createSignal, createEffect, type Signal } from './signals';
import type { VNode, VortexComponent } from './component';

export interface RouteConfig {
  path: string;
  component: (() => Promise<{ default: VortexComponent }>) | VortexComponent;
  guard?: () => boolean | Promise<boolean>;
  meta?: Record<string, any>;
  children?: RouteConfig[];
}

interface ResolvedRoute {
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  component: VortexComponent;
  meta: Record<string, any>;
}

function matchPath(pattern: string, pathname: string): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

function parseQuery(search: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!search) return params;
  const sp = new URLSearchParams(search);
  sp.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

// ─── Router Class ─────────────────────────────────────────────

export class VortexRouter {
  private routes: RouteConfig[];
  private currentRoute: Signal<ResolvedRoute | null>;
  private loading: Signal<boolean>;
  private error: Signal<string | null>;
  private cache = new Map<string, VortexComponent>();

  constructor(routes: RouteConfig[]) {
    this.routes = routes;
    this.currentRoute = createSignal<ResolvedRoute | null>(null);
    this.loading = createSignal(false);
    this.error = createSignal<string | null>(null);

    window.addEventListener('popstate', () => this.resolve());

    // Intercept link clicks
    document.addEventListener('click', (e) => {
      const link = (e.target as HTMLElement).closest('a');
      if (link && link.href.startsWith(window.location.origin) && !link.hasAttribute('data-external')) {
        e.preventDefault();
        this.navigate(link.pathname + link.search);
      }
    });

    // Don't auto-resolve — let the app call start() after auth is ready
  }

  /**
   * Start the router — resolve the initial route.
   * Call this after auth/state initialization so guards can evaluate correctly.
   */
  async start(): Promise<void> {
    await this.resolve();
  }

  get route(): Signal<ResolvedRoute | null> {
    return this.currentRoute;
  }

  get isLoading(): Signal<boolean> {
    return this.loading;
  }

  get routeError(): Signal<string | null> {
    return this.error;
  }

  async navigate(path: string): Promise<void> {
    if (path === window.location.pathname + window.location.search) return;
    history.pushState(null, '', path);
    await this.resolve();
  }

  replace(path: string): void {
    history.replaceState(null, '', path);
    this.resolve();
  }

  back(): void {
    history.back();
  }

  forward(): void {
    history.forward();
  }

  private async resolve(): Promise<void> {
    const pathname = window.location.pathname;
    const query = parseQuery(window.location.search);
    this.loading.set(true);
    this.error.set(null);

    for (const route of this.routes) {
      const params = matchPath(route.path, pathname);
      if (params === null) continue;

      // Run guard
      if (route.guard) {
        const allowed = await route.guard();
        if (!allowed) {
          this.loading.set(false);
          this.navigate('/');
          return;
        }
      }

      // Resolve component (lazy or direct)
      let component: VortexComponent;
      if (typeof route.component === 'function' && route.component.length === 0) {
        const loader = route.component as () => Promise<{ default: VortexComponent }>;
        const cacheKey = route.path;

        if (this.cache.has(cacheKey)) {
          component = this.cache.get(cacheKey)!;
        } else {
          try {
            const mod = await loader();
            component = mod.default;
            this.cache.set(cacheKey, component);
          } catch (err) {
            this.error.set(`Failed to load route: ${route.path}`);
            this.loading.set(false);
            return;
          }
        }
      } else {
        component = route.component as VortexComponent;
      }

      this.currentRoute.set({
        path: pathname,
        params,
        query,
        component,
        meta: route.meta || {},
      });

      this.loading.set(false);
      return;
    }

    this.error.set(`404 — Route not found: ${pathname}`);
    this.loading.set(false);
  }

  createLink(path: string, text: string, className?: string): HTMLAnchorElement {
    const a = document.createElement('a');
    a.href = path;
    a.textContent = text;
    if (className) a.className = className;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      this.navigate(path);
    });
    return a;
  }
}

export function createRouter(routes: RouteConfig[]): VortexRouter {
  return new VortexRouter(routes);
}

export function useRouter(router: VortexRouter) {
  return router;
}
