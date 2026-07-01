/**
 * ═══════════════════════════════════════════════════════════
 *  Loading — Futuristic loading indicators
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';

export const Spinner = defineComponent('Spinner', () =>
  h('div', { class: 'vortex-spinner' },
    h('div', { class: 'spinner-ring' }),
    h('div', { class: 'spinner-ring' }),
    h('div', { class: 'spinner-ring' }),
  )
);

export const SkeletonLine = defineComponent<{ width?: string; height?: string }>('SkeletonLine', (props) =>
  h('div', {
    class: 'skeleton-line',
    style: { width: props.width || '100%', height: props.height || '16px' },
  })
);

export const PageLoader = defineComponent('PageLoader', () =>
  h('div', { class: 'page-loader' },
    h('div', { class: 'loader-content' },
      h('div', { class: 'loader-logo' }, '◆'),
      h('div', { class: 'loader-bar' },
        h('div', { class: 'loader-bar-fill' }),
      ),
      h('p', { class: 'loader-text' }, 'Initializing VORTEX...'),
    ),
  )
);
