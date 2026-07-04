/**
 * ═══════════════════════════════════════════════════════════
 *  Toast Container — Renders reactive toast notifications
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { getToasts, dismissToast, type Toast } from '../services/toast';

const iconMap: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

function renderToast(toast: Toast) {
  return h('div', {
    class: `toast toast-${toast.type}`,
    key: toast.id,
  },
    h('div', { class: 'toast-icon' }, iconMap[toast.type] || 'ℹ'),
    h('div', { class: 'toast-body' },
      h('div', { class: 'toast-title' }, toast.title),
      toast.message ? h('div', { class: 'toast-message' }, toast.message) : null,
    ),
    h('button', {
      class: 'toast-dismiss',
      onClick: () => dismissToast(toast.id),
    }, '✕'),
  );
}

export const ToastContainer = defineComponent('ToastContainer', () => {
  const toastList = getToasts();
  const current = toastList.peek();

  if (current.length === 0) {
    return h('div', { class: 'toast-container', style: 'display:none' });
  }

  return h('div', { class: 'toast-container' },
    ...current.map(renderToast),
  );
});
