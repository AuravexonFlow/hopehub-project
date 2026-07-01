/**
 * ═══════════════════════════════════════════════════════════
 *  Toast Notification System — Reactive toast manager
 * ═══════════════════════════════════════════════════════════
 */

import { createSignal, type Signal } from '../vortex/signals';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration: number;
}

const toasts: Signal<Toast[]> = createSignal<Toast[]>([]);

export function showToast(
  type: Toast['type'],
  title: string,
  message?: string,
  duration = 4000
) {
  const toast: Toast = {
    id: crypto.randomUUID(),
    type,
    title,
    message,
    duration,
  };

  toasts.set([...toasts.peek(), toast]);

  if (duration > 0) {
    setTimeout(() => {
      dismissToast(toast.id);
    }, duration);
  }
}

export function dismissToast(id: string) {
  toasts.set(toasts.peek().filter((t) => t.id !== id));
}

export function getToasts(): Signal<Toast[]> {
  return toasts;
}

export function success(title: string, msg?: string) { showToast('success', title, msg); }
export function error(title: string, msg?: string) { showToast('error', title, msg, 6000); }
export function info(title: string, msg?: string) { showToast('info', title, msg); }
export function warning(title: string, msg?: string) { showToast('warning', title, msg, 5000); }
