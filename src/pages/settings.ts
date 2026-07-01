/**
 * ═══════════════════════════════════════════════════════════
 *  Settings Page — User preferences and configuration
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { createSignal } from '../vortex/signals';
import { appStore } from '../stores/app-store';
import { currentUser, signOut, updatePassword } from '../services/auth';
import { success, error as showError } from '../services/toast';

export const SettingsPage = defineComponent('SettingsPage', () => {
  const user = currentUser.peek();
  const currentPassword = createSignal('');
  const newPassword = createSignal('');
  const confirmPassword = createSignal('');

  const handlePasswordChange = async () => {
    if (newPassword.peek() !== confirmPassword.peek()) {
      showError('Mismatch', 'Passwords do not match.');
      return;
    }
    if (newPassword.peek().length < 6) {
      showError('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    const ok = await updatePassword(newPassword.peek());
    if (ok) {
      success('Password Updated', 'Your password has been changed.');
      currentPassword.set('');
      newPassword.set('');
      confirmPassword.set('');
    }
  };

  return h('div', { class: 'page page-settings' },
    h('div', { class: 'page-header' },
      h('div', null,
        h('h1', { class: 'page-title' },
          h('span', { class: 'section-icon' }, '⚙'),
          ' Settings',
        ),
        h('p', { class: 'page-subtitle' }, 'Manage your account and preferences.'),
      ),
    ),

    h('div', { class: 'settings-grid' },

      // Profile Section
      h('div', { class: 'card' },
        h('div', { class: 'card-header' },
          h('h3', { class: 'card-title' }, 'Profile'),
        ),
        h('div', { class: 'card-body' },
          h('div', { class: 'profile-section' },
            h('div', { class: 'profile-avatar-lg' },
              user?.email?.charAt(0).toUpperCase() || '?',
            ),
            h('div', { class: 'profile-info' },
              h('div', { class: 'form-group' },
                h('label', { class: 'form-label' }, 'Full Name'),
                h('input', {
                  type: 'text',
                  class: 'form-input',
                  value: user?.user_metadata?.full_name || '',
                  readonly: true,
                }),
              ),
              h('div', { class: 'form-group' },
                h('label', { class: 'form-label' }, 'Email'),
                h('input', {
                  type: 'email',
                  class: 'form-input',
                  value: user?.email || '',
                  readonly: true,
                }),
              ),
              h('div', { class: 'form-group' },
                h('label', { class: 'form-label' }, 'User ID'),
                h('input', {
                  type: 'text',
                  class: 'form-input form-mono',
                  value: user?.id || '',
                  readonly: true,
                }),
              ),
            ),
          ),
        ),
      ),

      // Appearance
      h('div', { class: 'card' },
        h('div', { class: 'card-header' },
          h('h3', { class: 'card-title' }, 'Appearance'),
        ),
        h('div', { class: 'card-body' },
          h('div', { class: 'setting-row' },
            h('div', { class: 'setting-info' },
              h('span', { class: 'setting-label' }, 'Theme'),
              h('span', { class: 'setting-desc' }, 'Choose your preferred theme'),
            ),
            h('div', { class: 'theme-toggle' },
              h('button', {
                class: `btn btn-sm ${appStore.get.peek().theme === 'dark' ? 'btn-primary' : 'btn-ghost'}`,
                onClick: () => appStore.actions.toggleTheme(),
              }, '☾ Dark'),
              h('button', {
                class: `btn btn-sm ${appStore.get.peek().theme === 'light' ? 'btn-primary' : 'btn-ghost'}`,
                onClick: () => appStore.actions.toggleTheme(),
              }, '☀ Light'),
            ),
          ),
          h('div', { class: 'setting-row' },
            h('div', { class: 'setting-info' },
              h('span', { class: 'setting-label' }, 'Sidebar'),
              h('span', { class: 'setting-desc' }, 'Toggle sidebar visibility'),
            ),
            h('button', {
              class: 'btn btn-sm btn-ghost',
              onClick: () => appStore.actions.toggleSidebar(),
            }, appStore.get.peek().sidebarOpen ? 'Collapse' : 'Expand'),
          ),
        ),
      ),

      // Security
      h('div', { class: 'card' },
        h('div', { class: 'card-header' },
          h('h3', { class: 'card-title' }, 'Security'),
        ),
        h('div', { class: 'card-body' },
          h('div', { class: 'form-group' },
            h('label', { class: 'form-label' }, 'New Password'),
            h('input', {
              type: 'password',
              class: 'form-input',
              placeholder: 'Enter new password',
              value: newPassword.peek(),
              onInput: (e: Event) => newPassword.set((e.target as HTMLInputElement).value),
            }),
          ),
          h('div', { class: 'form-group' },
            h('label', { class: 'form-label' }, 'Confirm Password'),
            h('input', {
              type: 'password',
              class: 'form-input',
              placeholder: 'Confirm new password',
              value: confirmPassword.peek(),
              onInput: (e: Event) => confirmPassword.set((e.target as HTMLInputElement).value),
            }),
          ),
          h('button', {
            class: 'btn btn-primary',
            onClick: handlePasswordChange,
          }, 'Update Password'),
        ),
      ),

      // System Info
      h('div', { class: 'card' },
        h('div', { class: 'card-header' },
          h('h3', { class: 'card-title' }, 'System'),
        ),
        h('div', { class: 'card-body' },
          h('div', { class: 'info-grid' },
            createInfoItem('Framework', 'VORTEX v1.0.0'),
            createInfoItem('Build', 'Production'),
            createInfoItem('Runtime', 'Browser SPA'),
            createInfoItem('Backend', 'Supabase'),
          ),
          h('div', { class: 'form-actions' },
            h('button', {
              class: 'btn btn-danger',
              onClick: () => {
                localStorage.clear();
                success('Cache Cleared', 'All local data has been cleared.');
              },
            }, 'Clear Local Data'),
            h('button', {
              class: 'btn btn-danger',
              onClick: signOut,
            }, 'Sign Out'),
          ),
        ),
      ),
    ),
  );
});

function createInfoItem(label: string, value: string) {
  return h('div', { class: 'info-item' },
    h('span', { class: 'info-label' }, label),
    h('span', { class: 'info-value' }, value),
  );
}
