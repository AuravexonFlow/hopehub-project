/**
 * ═══════════════════════════════════════════════════════════
 *  Auth Page — Login / Register with Role System
 *  Login: auto-detect role from profile
 *  Register: role selection → approval for teachers/admins
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent, type VNode } from '../vortex/component';
import { createSignal } from '../vortex/signals';
import { signIn, signUp, signInWithOAuth, resetPassword, authError, currentUser } from '../services/auth';
import { appStore } from '../stores/app-store';
import { success, error as showError } from '../services/toast';
import {
  roleConfig,
  currentProfile,
  type UserRole,
} from '../services/profiles';

type AuthMode = 'login' | 'register' | 'select-role' | 'pending' | 'rejected';

// Module-level signals (persist across renders)
const mode = createSignal<AuthMode>('login');
const selectedRole = createSignal<UserRole>('donor');
const email = createSignal('');
const password = createSignal('');
const confirmPassword = createSignal('');
const fullName = createSignal('');
const loading = createSignal(false);

function rerenderAuth() {
  const el = document.querySelector('.auth-content') as HTMLElement | null;
  if (el) {
    el.innerHTML = '';
    let content: VNode;
    switch (mode.peek()) {
      case 'login': content = renderLogin(); break;
      case 'select-role': content = renderRoleSelect(); break;
      case 'register': content = renderRegister(); break;
      case 'pending': content = renderPending(); break;
      case 'rejected': content = renderRejected(); break;
      default: content = renderLogin();
    }
    import('../vortex').then(({ render }) => {
      render(content, el);
    });
  }
}

function clearFields() {
  email.set('');
  password.set('');
  confirmPassword.set('');
  fullName.set('');
  authError.set(null);
}

function navigateAfterAuth(role: UserRole, redirectHint?: string) {
  // Check for redirect param (e.g., /auth?redirect=/donation-request)
  const params = new URLSearchParams(window.location.search);
  const redirect = redirectHint || params.get('redirect') || localStorage.getItem('hope-hub-auth-redirect');
  localStorage.removeItem('hope-hub-auth-redirect');
  let target: string;
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
    target = redirect;
  } else if (role === 'admin') {
    target = '/admin';
  } else {
    target = '/dashboard';
  }

  appStore.actions.setPage(target.slice(1));
  window.history.pushState(null, '', target);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function handleLogin(e: Event) {
  e.preventDefault();
  loading.set(true);
  // Capture redirect param now before any async work changes the URL
  const _redirectParam = new URLSearchParams(window.location.search).get('redirect') || undefined;
  rerenderAuth();

  const doLogin = async () => {
    try {
      const result = await signIn(email.peek(), password.peek());
      if (result) {
        // Wait a tick for profile to load
        await new Promise(r => setTimeout(r, 100));
        const profile = currentProfile.peek();

        if (!profile) {
          // No profile yet — shouldn't happen but handle gracefully
          showError('Profile Error', 'Could not load your profile. Please try again.');
          loading.set(false);
          rerenderAuth();
          return;
        }

        if (profile.status === 'rejected') {
          mode.set('rejected');
          loading.set(false);
          rerenderAuth();
          return;
        }

        if (profile.status === 'pending') {
          mode.set('pending');
          loading.set(false);
          rerenderAuth();
          return;
        }

        // Active user — navigate
        success('Welcome back!', `Signed in as ${roleConfig[profile.role].label}`);
        navigateAfterAuth(profile.role, _redirectParam);
      }
    } catch (err: any) {
      showError('Error', err.message);
    }
    loading.set(false);
    rerenderAuth();
  };

  doLogin();
}

function handleRegister(e: Event) {
  e.preventDefault();
  loading.set(true);
  const _redirectParam = new URLSearchParams(window.location.search).get('redirect') || undefined;
  rerenderAuth();

  const doRegister = async () => {
    try {
      if (password.peek() !== confirmPassword.peek()) {
        showError('Password mismatch', 'Passwords do not match.');
        loading.set(false);
        rerenderAuth();
        return;
      }

      const result = await signUp(
        email.peek(),
        password.peek(),
        { full_name: fullName.peek() },
        selectedRole.peek(),
      );

      if (result) {
        const role = selectedRole.peek();

        if (role === 'donor') {
          // Donors are auto-approved
          success('Account created!', 'Welcome to Hope HUb.');
          navigateAfterAuth('donor', _redirectParam);
        } else {
          // Teachers & admins need approval
          mode.set('pending');
          rerenderAuth();
        }
      }
    } catch (err: any) {
      showError('Error', err.message);
    }
    loading.set(false);
    rerenderAuth();
  };

  doRegister();
}

function handleForgotPassword() {
  const doReset = async () => {
    if (email.peek()) {
      await resetPassword(email.peek());
      success('Reset email sent', 'Check your inbox.');
    } else {
      showError('Email required', 'Enter your email first.');
    }
  };
  doReset();
}

// ─── Render: Login ───────────────────────────────────────

function renderLogin(): VNode {
  return h('div', { class: 'auth-container' },
    // Left Panel — Branding
    h('div', { class: 'auth-brand' },
      h('div', { class: 'brand-bg' }),
      h('div', { class: 'brand-content' },
        h('img', { src: '/logo.png', alt: 'Hope Hub', class: 'brand-logo-img' }),
        h('h1', { class: 'brand-title' }, 'Hope HUb'),
        h('p', { class: 'brand-subtitle' }, 'Richmond College — Empowering Futures'),
        h('div', { class: 'brand-features' },
          h('div', { class: 'brand-feature' }, '🎓 Richmond College'),
          h('div', { class: 'brand-feature' }, '💝 Support Student Futures'),
          h('div', { class: 'brand-feature' }, '🤝 Community Driven'),
        ),
      ),
    ),

    // Right Panel — Login Form
    h('div', { class: 'auth-form-container' },
      h('div', { class: 'auth-form-wrapper' },
        h('h2', { class: 'auth-title' }, 'Welcome Back'),
        h('p', { class: 'auth-subtitle' }, 'Sign in to your account'),

        h('div', { class: 'oauth-buttons' },
          h('button', {
            class: 'btn btn-oauth',
            onClick: () => signInWithOAuth('google'),
          },
            h('svg', { width: '18', height: '18', viewBox: '0 0 24 24', style: 'margin-right:10px;vertical-align:middle;' },
              h('path', { d: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z', fill: '#4285F4' }),
              h('path', { d: 'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z', fill: '#34A853' }),
              h('path', { d: 'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z', fill: '#FBBC05' }),
              h('path', { d: 'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z', fill: '#EA4335' })
            ),
            'Continue with Google'
          ),
        ),

        h('div', { class: 'divider' },
          h('span', null, 'or sign in with email'),
        ),

        h('form', { class: 'auth-form', onSubmit: handleLogin },
          h('div', { class: 'form-group' },
            h('label', { class: 'form-label' }, 'Email Address'),
            h('input', {
              type: 'email',
              class: 'form-input',
              placeholder: 'you@example.com',
              value: email.peek(),
              onInput: (e: Event) => email.set((e.target as HTMLInputElement).value),
              required: true,
            }),
          ),
          h('div', { class: 'form-group' },
            h('label', { class: 'form-label' }, 'Password'),
            h('input', {
              type: 'password',
              class: 'form-input',
              placeholder: '••••••••',
              value: password.peek(),
              onInput: (e: Event) => password.set((e.target as HTMLInputElement).value),
              required: true,
              minlength: 6,
              autocomplete: 'current-password',
            }),
          ),

          authError.peek()
            ? h('div', { class: 'form-error' }, authError.peek())
            : null,

          h('button', {
            type: 'submit',
            class: 'btn btn-primary btn-glow btn-full',
            disabled: loading.peek(),
          }, loading.peek() ? 'Signing in...' : 'Sign In'),
        ),

        h('div', { class: 'auth-toggle' },
          h('span', null, "Don't have an account? "),
          h('button', {
            class: 'link-btn',
            onClick: () => { mode.set('select-role'); clearFields(); rerenderAuth(); },
          }, 'Sign Up'),
          h('button', {
            class: 'link-btn forgot-link',
            onClick: handleForgotPassword,
          }, 'Forgot password?'),
        ),

        h('div', { class: 'auth-hint' },
          h('p', null, '💡 Default admin: admin@hopehub.lk'),
        ),
      ),
    ),
  );
}

// ─── Render: Role Selection (Register Step 1) ────────────

function renderRoleSelect(): VNode {
  const cards = (['admin', 'teacher', 'donor'] as UserRole[]).map(r => {
    const c = roleConfig[r];
    return h('button', {
      class: 'auth-role-card',
      style: `--role-color: ${c.color}; --role-gradient: ${c.gradient};`,
      onClick: () => {
        selectedRole.set(r);
        mode.set('register');
        clearFields();
        rerenderAuth();
      },
    },
      h('div', { class: 'role-card-glow' }),
      h('div', { class: 'role-card-icon' }, c.icon),
      h('div', { class: 'role-card-label' }, c.label),
      h('div', { class: 'role-card-desc' }, c.description),
      h('div', { class: 'role-card-features' },
        ...c.features.map(f =>
          h('div', { class: 'role-card-feature' },
            h('span', { class: 'role-card-check' }, '✓'),
            f,
          ),
        ),
      ),
      h('div', { class: 'role-card-action' },
        h('span', null, `Register as ${c.label}`),
        h('span', { class: 'role-card-arrow' }, '→'),
      ),
    );
  });

  return h('div', { class: 'auth-role-select' },
    h('div', { class: 'auth-role-header' },
      h('img', { src: '/logo.png', alt: 'Hope Hub', class: 'auth-role-logo' }),
      h('h1', { class: 'auth-role-title' }, 'Create an Account'),
      h('p', { class: 'auth-role-subtitle' }, 'Select your role to continue'),
    ),

    h('div', { class: 'auth-role-cards' }, ...cards),

    h('div', { class: 'auth-role-footer' },
      h('p', null,
        'Already have an account? ',
        h('button', {
          class: 'link-btn',
          onClick: () => { mode.set('login'); clearFields(); rerenderAuth(); },
        }, 'Sign In'),
      ),
      h('p', { class: 'auth-role-note' },
        '⚠️ Teacher & Admin accounts require approval from an administrator.',
      ),
    ),
  );
}

// ─── Render: Register Form (Step 2) ─────────────────────

function renderRegister(): VNode {
  const role = selectedRole.peek();
  const cfg = roleConfig[role];

  return h('div', { class: 'auth-container' },
    // Left Panel — Role Branding
    h('div', {
      class: 'auth-brand',
      style: `--role-color: ${cfg.color}; --role-gradient: ${cfg.gradient};`,
    },
      h('div', { class: 'brand-bg role-brand-bg' }),
      h('div', { class: 'brand-content' },
        h('div', { class: 'brand-role-icon' }, cfg.icon),
        h('h1', { class: 'brand-title' }, cfg.label),
        h('p', { class: 'brand-subtitle' }, cfg.description),
        h('div', { class: 'brand-features' },
          ...cfg.features.map(f =>
            h('div', { class: 'brand-feature' },
              h('span', { class: 'brand-check' }, '✓'),
              f,
            ),
          ),
        ),
        h('button', {
          class: 'brand-back-btn',
          onClick: () => { mode.set('select-role'); clearFields(); rerenderAuth(); },
        }, '← Choose different role'),
      ),
    ),

    // Right Panel — Register Form
    h('div', { class: 'auth-form-container' },
      h('div', { class: 'auth-form-wrapper' },
        h('div', {
          class: 'auth-role-badge',
          style: `background: ${cfg.gradient};`,
        },
          h('span', null, cfg.icon),
          h('span', null, cfg.label),
        ),

        h('h2', { class: 'auth-title' }, 'Create Account'),
        h('p', { class: 'auth-subtitle' }, `Register as a ${cfg.label.toLowerCase()}`),

        role !== 'donor'
          ? h('div', { class: 'auth-approval-notice' },
              h('span', null, '⏳'),
              h('span', null, 'Your account will need admin approval before you can access the platform.'),
            )
          : null,

        h('form', { class: 'auth-form', onSubmit: handleRegister },
          h('div', { class: 'form-group' },
            h('label', { class: 'form-label' }, 'Full Name'),
            h('input', {
              type: 'text',
              class: 'form-input',
              placeholder: 'Enter your full name',
              value: fullName.peek(),
              onInput: (e: Event) => fullName.set((e.target as HTMLInputElement).value),
              required: true,
            }),
          ),
          h('div', { class: 'form-group' },
            h('label', { class: 'form-label' }, 'Email Address'),
            h('input', {
              type: 'email',
              class: 'form-input',
              placeholder: 'you@example.com',
              value: email.peek(),
              onInput: (e: Event) => email.set((e.target as HTMLInputElement).value),
              required: true,
            }),
          ),
          h('div', { class: 'form-group' },
            h('label', { class: 'form-label' }, 'Password'),
            h('input', {
              type: 'password',
              class: 'form-input',
              placeholder: '••••••••',
              value: password.peek(),
              onInput: (e: Event) => password.set((e.target as HTMLInputElement).value),
              required: true,
              minlength: 6,
              autocomplete: 'new-password',
            }),
          ),
          h('div', { class: 'form-group' },
            h('label', { class: 'form-label' }, 'Confirm Password'),
            h('input', {
              type: 'password',
              class: 'form-input',
              placeholder: '••••••••',
              value: confirmPassword.peek(),
              onInput: (e: Event) => confirmPassword.set((e.target as HTMLInputElement).value),
              required: true,
              autocomplete: 'new-password',
            }),
          ),

          authError.peek()
            ? h('div', { class: 'form-error' }, authError.peek())
            : null,

          h('button', {
            type: 'submit',
            class: 'btn btn-primary btn-glow btn-full',
            disabled: loading.peek(),
          }, loading.peek() ? 'Creating account...' : `Create ${cfg.label} Account`),
        ),

        h('div', { class: 'auth-toggle' },
          h('span', null, 'Already have an account? '),
          h('button', {
            class: 'link-btn',
            onClick: () => { mode.set('login'); clearFields(); rerenderAuth(); },
          }, 'Sign In'),
        ),
      ),
    ),
  );
}

// ─── Render: Pending Approval ────────────────────────────

function renderPending(): VNode {
  return h('div', { class: 'auth-status-page' },
    h('div', { class: 'auth-status-card auth-status-pending' },
      h('div', { class: 'status-icon' }, '⏳'),
      h('h1', { class: 'status-title' }, 'Account Pending Approval'),
      h('p', { class: 'status-message' },
        'Your account has been created successfully, but it requires approval from an administrator before you can access the platform.',
      ),
      h('div', { class: 'status-details' },
        h('p', null, 'You will be notified once your account is approved.'),
        h('p', null, 'This usually takes 1-2 business days.'),
      ),
      h('div', { class: 'status-actions' },
        h('button', {
          class: 'btn btn-primary',
          onClick: () => { mode.set('login'); clearFields(); rerenderAuth(); },
        }, '← Back to Sign In'),
      ),
    ),
  );
}

// ─── Render: Rejected ────────────────────────────────────

function renderRejected(): VNode {
  return h('div', { class: 'auth-status-page' },
    h('div', { class: 'auth-status-card auth-status-rejected' },
      h('div', { class: 'status-icon' }, '❌'),
      h('h1', { class: 'status-title' }, 'Account Access Denied'),
      h('p', { class: 'status-message' },
        'Your account has been reviewed and was not approved at this time.',
      ),
      h('div', { class: 'status-details' },
        h('p', null, 'If you believe this is an error, please contact the administrator.'),
      ),
      h('div', { class: 'status-actions' },
        h('button', {
          class: 'btn btn-primary',
          onClick: () => { mode.set('login'); clearFields(); rerenderAuth(); },
        }, '← Back to Sign In'),
      ),
    ),
  );
}

// ─── AuthPage Component ──────────────────────────────────

export const AuthPage = defineComponent('AuthPage', () => {
  // If already logged in (session cached), redirect without re-entering credentials
  const user = currentUser.peek();
  const profile = currentProfile.peek();
  if (user && profile && profile.status === 'active') {
    setTimeout(() => navigateAfterAuth(profile.role), 0);
    return h('div', { class: 'page page-auth' },
      h('div', { class: 'auth-content' },
        h('div', { style: 'display:flex;align-items:center;justify-content:center;height:100vh;color:var(--text-secondary);font-family:var(--font-body);' }, 'Redirecting...'),
      ),
    );
  }

  // Reset to login mode on mount
  mode.set('login');

  // Render initial content after mount
  setTimeout(() => rerenderAuth(), 0);

  return h('div', { class: 'page page-auth' },
    h('div', { class: 'auth-content' }),
  );
});
