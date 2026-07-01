/**
 * ═══════════════════════════════════════════════════════════
 *  Modal — Reusable modal dialog
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent, type PropsWithChildren } from '../vortex/component';
import { createSignal, type Signal } from '../vortex/signals';

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: any;
}

export const Modal = defineComponent<ModalProps>('Modal', (props) => {
  if (!props.open) return h('div', { style: 'display:none' });

  return h('div', {
    class: 'modal-overlay',
    onClick: (e: Event) => {
      if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
        props.onClose();
      }
    },
  },
    h('div', { class: `modal-content modal-${props.size || 'md'}` },
      h('div', { class: 'modal-header' },
        h('h2', { class: 'modal-title' }, props.title),
        h('button', {
          class: 'modal-close',
          onClick: props.onClose,
        }, '✕'),
      ),
      h('div', { class: 'modal-body' },
        props.children,
      ),
    ),
  );
});

// ─── useModal hook ────────────────────────────────────────

export function useModal(initial = false): {
  isOpen: Signal<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
} {
  const isOpen = createSignal(initial);
  return {
    isOpen,
    open: () => isOpen.set(true),
    close: () => isOpen.set(false),
    toggle: () => isOpen.set(!isOpen.peek()),
  };
}
