/**
 * ═══════════════════════════════════════════════════════════
 *  Auth Callback — Handles OAuth redirect from providers
 *  Supabase detects session from URL, then we redirect
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { createSignal } from '../vortex/signals';
import { currentProfile, roleConfig } from '../services/profiles';
import { currentUser } from '../services/auth';
import { appStore } from '../stores/app-store';

const status = createSignal('Completing sign in...');

function navigateAfterAuth(role: string) {
  let target = '/dashboard';
  if (role === 'admin') target = '/admin';

  appStore.actions.setPage(target.slice(1));
  window.history.pushState(null, '', target);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export const AuthCallbackPage = defineComponent('AuthCallbackPage', () => {
  // Wait for Supabase to process the OAuth callback
  const checkInterval = setInterval(() => {
    const profile = currentProfile.peek();
    const user = currentUser.peek();

    if (user && profile) {
      clearInterval(checkInterval);
      status.set(`Welcome, ${profile.full_name}! Redirecting...`);

      setTimeout(() => {
        if (profile.status === 'pending') {
          status.set('Your account is pending approval.');
          appStore.actions.setPage('auth');
          window.history.pushState(null, '', '/auth');
          window.dispatchEvent(new PopStateEvent('popstate'));
        } else if (profile.status === 'rejected') {
          status.set('Your account access was denied.');
          appStore.actions.setPage('auth');
          window.history.pushState(null, '', '/auth');
          window.dispatchEvent(new PopStateEvent('popstate'));
        } else {
          navigateAfterAuth(profile.role);
        }
      }, 1500);
    }
  }, 500);

  // Timeout after 10 seconds
  setTimeout(() => {
    clearInterval(checkInterval);
    if (!currentUser.peek()) {
      status.set('Sign in failed. Redirecting...');
      setTimeout(() => {
        appStore.actions.setPage('auth');
        window.history.pushState(null, '', '/auth');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 2000);
    }
  }, 10000);

  return h('div', {
    class: 'page',
    style: 'display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg-primary);',
  },
    h('div', { style: 'text-align:center;' },
      h('div', { style: 'font-size:48px;margin-bottom:24px;animation:pulse-glow 2s ease-in-out infinite;' }, '⏳'),
      h('h2', {
        style: 'font-family:var(--font-display);color:var(--text-primary);margin-bottom:12px;',
      }, status.peek()),
      h('p', {
        style: 'color:var(--text-muted);font-size:14px;',
      }, 'Please wait while we complete your sign in.'),
    ),
  );
});
