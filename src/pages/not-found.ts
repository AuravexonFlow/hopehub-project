/**
 * ═══════════════════════════════════════════════════════════
 *  404 — Page Not Found
 *  Professional error page with navigation back to home
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';

export const NotFoundPage = defineComponent('NotFoundPage', () => {
  return h('div', { class: 'not-found-page' },
    h('div', { class: 'nf-container' },
      h('div', { class: 'nf-icon' }, '🔍'),
      h('h1', { class: 'nf-code' }, '404'),
      h('h2', { class: 'nf-title' }, 'Page Not Found'),
      h('p', { class: 'nf-desc' },
        'The page you\'re looking for doesn\'t exist or has been moved. Let\'s get you back on track.',
      ),
      h('div', { class: 'nf-actions' },
        h('button', {
          class: 'btn btn-primary btn-glow',
          onClick: () => {
            history.pushState(null, '', '/');
            dispatchEvent(new PopStateEvent('popstate'));
          },
        }, '← Back to Home'),
        h('button', {
          class: 'btn btn-outline',
          onClick: () => {
            history.back();
          },
        }, 'Go Back'),
      ),
    ),
  );
});
