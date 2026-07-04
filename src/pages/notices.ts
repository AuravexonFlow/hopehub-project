/**
 * ═══════════════════════════════════════════════════════════
 *  Notices — Timeline Feed Layout
 *  Vertical timeline with expandable notice cards
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { createSignal } from '../vortex/signals';
import { showToast } from '../services/toast';
import { getNotices } from '../stores/content-store';

export const NoticesPage = defineComponent('NoticesPage', () => {
  const expanded = createSignal<number | null>(null);
  const notices = getNotices();

  return h('div', { class: 'notices-page' },
    h('section', { class: 'content-section', style: 'padding-top:80px;' },
      h('div', { class: 'section-header' },
        h('h1', {
          style: 'font-family:var(--font-display); font-size:36px; font-weight:900; color:var(--text-primary); letter-spacing:3px;',
        }, 'NOTICES'),
        h('p', null, 'Stay updated with the latest announcements — click any notice to read more'),
      ),

      // Filter bar
      h('div', { class: 'notice-filters' },
        ...['All', 'Active', 'Update', 'Event', 'Report'].map(f =>
          h('button', {
            class: `notice-filter-btn ${f === 'All' ? 'active' : ''}`,
            onClick: () => showToast('info', 'Filter', `Showing ${f} notices`),
          }, f),
        ),
      ),

      // Timeline layout
      h('div', { class: 'notice-timeline' },
        ...notices.map((n, i) =>
          h('div', {
            class: `timeline-item ${expanded.peek() === i ? 'expanded' : ''}`,
            onClick: () => {
              expanded.set(expanded.peek() === i ? null : i);
              // Force re-render of this component
              const el = document.querySelector(`[data-timeline-idx="${i}"]`);
              if (el) {
                el.classList.toggle('expanded', expanded.peek() === i);
                const detail = el.querySelector('.timeline-detail');
                if (detail) {
                  (detail as HTMLElement).style.display = expanded.peek() === i ? 'block' : 'none';
                }
              }
            },
            'data-timeline-idx': i,
          },
            // Timeline connector line + dot
            h('div', { class: 'timeline-connector' },
              h('div', { class: 'timeline-dot', style: `background:${n.tag === 'Active' ? 'var(--accent-green)' : n.tag === 'Update' ? 'var(--accent-blue)' : n.tag === 'Event' ? 'var(--primary)' : 'var(--accent-yellow)'};` }),
              i < notices.length - 1 ? h('div', { class: 'timeline-line' }) : null,
            ),
            // Card content
            h('div', { class: 'timeline-card' },
              h('div', { class: 'timeline-card-header' },
                h('div', { class: 'timeline-icon' }, n.icon),
                h('div', { class: 'timeline-meta' },
                  h('span', { class: 'timeline-date' }, n.date),
                  h('span', {
                    class: `timeline-tag tag-${n.tag.toLowerCase()}`,
                  }, n.tag),
                ),
                h('div', { class: 'timeline-expand-icon' }, expanded.peek() === i ? '▾' : '▸'),
              ),

              h('h3', { class: 'timeline-title' }, n.title),
              h('p', { class: 'timeline-excerpt' }, n.excerpt),
              h('div', { class: 'timeline-detail', style: 'display:none;' },
                n.photos && n.photos.length > 0 ? h('div', { class: 'timeline-detail-photo-wrap' },
                  h('img', { src: n.photos[0], alt: n.title, class: 'timeline-detail-photo' }),
                ) : null,
                h('p', { class: 'timeline-full' }, n.full),
                h('button', {
                  class: 'timeline-action-btn',
                  onClick: (e: Event) => {
                    e.stopPropagation();
                    showToast('success', 'Noted!', 'We\'ll keep you updated on this notice.');
                  },
                }, '🔔 Stay Updated'),
              ),
            ),
          ),
        ),
      ),
    ),

    // Footer
    h('footer', { class: 'site-footer' },
      h('div', { class: 'footer-inner' },
        h('div', { class: 'footer-brand' },
          h('img', { src: '/logo.png', alt: 'Hope Hub', class: 'footer-logo-img' }),
          h('div', { class: 'footer-phone' }, 'Phone: +94 77 123 4567'),
          h('div', { class: 'footer-location' }, '3633+2W4, Richmond Hill Rd, Galle 80000'),
        ),
        h('div', { class: 'footer-links' },
          h('div', { class: 'footer-link-group' },
            h('h4', null, 'Quick Links'),
            h('a', { href: '/' }, 'Home'),
            h('a', { href: '/about' }, 'About'),
            h('a', { href: '/contact' }, 'Contact'),
          ),
          h('div', { class: 'footer-link-group' },
            h('h4', null, 'Support'),
            h('a', { href: '/donation-request' }, 'Donate Now'),
            h('a', { href: '/notices' }, 'Notices'),
            h('a', { href: '/events' }, 'Events'),
          ),
        ),
        h('div', { class: 'footer-social' },
          h('a', { href: '#', title: 'Facebook' }, '📘'),
          h('a', { href: '#', title: 'Instagram' }, '📷'),
          h('a', { href: '#', title: 'YouTube' }, '🎬'),
          h('a', { href: '#', title: 'LinkedIn' }, '💼'),
        ),
      ),
      h('div', { class: 'footer-bottom' },
        h('span', null, '© 2025 Richmond Hope Hub — Powered by Auravexon Codex'),
      ),
    ),
  );
});
