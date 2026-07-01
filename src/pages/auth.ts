/**
 * ═══════════════════════════════════════════════════════════
 *  Auth Page — Login / Register / Password Reset
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { createSignal } from '../vortex/signals';
import { signIn, signUp, signInWithOAuth, resetPassword, authError } from '../services/auth';
import { appStore } from '../stores/app-store';
import { success, error as showError } from '../services/toast';

type AuthMode = 'login' | 'register' | 'reset';

export const AuthPage = defineComponent('AuthPage', () => {
  const mode = createSignal<AuthMode>('login');
  const email = createSignal('');
  const password = createSignal('');
  const confirmPassword = createSignal('');
  const fullName = createSignal('');
  const loading = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    loading.set(true);

    try {
      if (mode.peek() === 'login') {
        const result = await signIn(email.peek(), password.peek());
        if (result) {
          success('Welcome back!', 'Successfully signed in.');
          appStore.actions.setPage('dashboard');
          window.history.pushState(null, '', '/dashboard');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      } else if (mode.peek() === 'register') {
        if (password.peek() !== confirmPassword.peek()) {
          showError('Password mismatch', 'Passwords do not match.');
          loading.set(false);
          return;
        }
        const result = await signUp(email.peek(), password.peek(), {
          full_name: fullName.peek(),
        });
        if (result) {
          success('Account created!', 'Check your email for verification.');
        }
      } else if (mode.peek() === 'reset') {
        const sent = await resetPassword(email.peek());
        if (sent) {
          success('Reset email sent', 'Check your inbox for the reset link.');
        }
      }
    } catch (err: any) {
      showError('Error', err.message);
    }

    loading.set(false);
  };

  return h('div', { class: 'page page-auth' },
    h('div', { class: 'auth-container' },
      // Left Panel — Branding
      h('div', { class: 'auth-brand' },
        h('div', { class: 'brand-bg' }),
        h('div', { class: 'brand-content' },
          h('div', { class: 'brand-logo' }, '◆'),
          h('h1', { class: 'brand-title' }, 'Hope HUb'),
          h('p', { class: 'brand-subtitle' }, 'Next-generation workspace platform'),
          h('div', { class: 'brand-features' },
            h('div', { class: 'brand-feature' }, '⚡ Signal-based reactivity'),
            h('div', { class: 'brand-feature' }, '📡 Real-time collaboration'),
            h('div', { class: 'brand-feature' }, '🔐 Enterprise security'),
          ),
        ),
      ),

      // Right Panel — Form
      h('div', { class: 'auth-form-container' },
        h('div', { class: 'auth-form-wrapper' },
          h('h2', { class: 'auth-title' },
            mode.peek() === 'login' ? 'Welcome Back'
              : mode.peek() === 'register' ? 'Create Account'
              : 'Reset Password',
          ),
          h('p', { class: 'auth-subtitle' },
            mode.peek() === 'login' ? 'Sign in to your workspace'
              : mode.peek() === 'register' ? 'Join the future of productivity'
              : 'Enter your email to reset',
          ),

          // OAuth Buttons
          mode.peek() !== 'reset'
            ? h('div', { class: 'oauth-buttons' },
                h('button', {
                  class: 'btn btn-oauth',
                  onClick: () => signInWithOAuth('google'),
                }, '🔵 Google'),
                h('button', {
                  class: 'btn btn-oauth',
                  onClick: () => signInWithOAuth('github'),
                }, '⚫ GitHub'),
                h('button', {
                  class: 'btn btn-oauth',
                  onClick: () => signInWithOAuth('discord'),
                }, '🟣 Discord'),
              )
            : null,

          mode.peek() !== 'reset'
            ? h('div', { class: 'divider' },
                h('span', null, 'or continue with email'),
              )
            : null,

          // Form
          h('form', { class: 'auth-form', onSubmit: handleSubmit },

            // Full Name (Register only)
            mode.peek() === 'register'
              ? h('div', { class: 'form-group' },
                  h('label', { class: 'form-label' }, 'Full Name'),
                  h('input', {
                    type: 'text',
                    class: 'form-input',
                    placeholder: 'Enter your full name',
                    value: fullName.peek(),
                    onInput: (e: Event) => fullName.set((e.target as HTMLInputElement).value),
                    required: true,
                  }),
                )
              : null,

            // Email
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

            // Password
            mode.peek() !== 'reset'
              ? h('div', { class: 'form-group' },
                  h('label', { class: 'form-label' }, 'Password'),
                  h('input', {
                    type: 'password',
                    class: 'form-input',
                    placeholder: '••••••••',
                    value: password.peek(),
                    onInput: (e: Event) => password.set((e.target as HTMLInputElement).value),
                    required: true,
                    minlength: 6,
                  }),
                )
              : null,

            // Confirm Password (Register only)
            mode.peek() === 'register'
              ? h('div', { class: 'form-group' },
                  h('label', { class: 'form-label' }, 'Confirm Password'),
                  h('input', {
                    type: 'password',
                    class: 'form-input',
                    placeholder: '••••••••',
                    value: confirmPassword.peek(),
                    onInput: (e: Event) => confirmPassword.set((e.target as HTMLInputElement).value),
                    required: true,
                  }),
                )
              : null,

            // Error
            authError.peek()
              ? h('div', { class: 'form-error' }, authError.peek())
              : null,

            // Submit
            h('button', {
              type: 'submit',
              class: 'btn btn-primary btn-glow btn-full',
              disabled: loading.peek(),
            }, loading.peek() ? 'Processing...' :
              mode.peek() === 'login' ? 'Sign In'
              : mode.peek() === 'register' ? 'Create Account'
              : 'Send Reset Link'),
          ),

          // Toggle Mode
          h('div', { class: 'auth-toggle' },
            mode.peek() === 'login'
              ? [
                  h('span', null, "Don't have an account? "),
                  h('button', {
                    class: 'link-btn',
                    onClick: () => mode.set('register'),
                  }, 'Sign Up'),
                ]
              : mode.peek() === 'register'
              ? [
                  h('span', null, 'Already have an account? '),
                  h('button', {
                    class: 'link-btn',
                    onClick: () => mode.set('login'),
                  }, 'Sign In'),
                ]
              : [
                  h('button', {
                    class: 'link-btn',
                    onClick: () => mode.set('login'),
                  }, '← Back to Sign In'),
                ],

            mode.peek() === 'login'
              ? h('button', {
                  class: 'link-btn forgot-link',
                  onClick: () => mode.set('reset'),
                }, 'Forgot password?')
              : null,
          ),
        ),
      ),
    ),
  );
});
