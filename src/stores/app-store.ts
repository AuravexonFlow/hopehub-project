/**
 * ═══════════════════════════════════════════════════════════
 *  App Store — Global application state
 * ═══════════════════════════════════════════════════════════
 */

import { createStore } from '../vortex/store';

export const appStore = createStore('app', {
  state: {
    theme: 'dark' as 'dark' | 'light',
    sidebarOpen: true,
    notifications: [] as Array<{
      id: string;
      type: 'success' | 'error' | 'info' | 'warning';
      message: string;
      timestamp: number;
    }>,
    currentPage: 'home',
    isLoading: false,
  },
  actions: {
    toggleTheme(state) {
      return { theme: (state.theme === 'dark' ? 'light' : 'dark') as 'dark' | 'light' };
    },
    toggleSidebar(state) {
      return { sidebarOpen: !state.sidebarOpen };
    },
    addNotification(state, type: string, message: string) {
      const notification = {
        id: crypto.randomUUID(),
        type: type as any,
        message,
        timestamp: Date.now(),
      };
      return { notifications: [...state.notifications, notification] };
    },
    dismissNotification(state, id: string) {
      return { notifications: state.notifications.filter((n) => n.id !== id) };
    },
    setPage(state, page: string) {
      return { currentPage: page, isLoading: false };
    },
    setLoading(state, loading: boolean) {
      return { isLoading: loading };
    },
  },
  persist: 'hope-hub-app',
});
