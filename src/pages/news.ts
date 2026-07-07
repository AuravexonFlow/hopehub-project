/**
 * ═══════════════════════════════════════════════════════════
 *  News — Magazine / Blog Layout
 *  Featured hero article + 2-column grid with expandable cards
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { createSignal } from '../vortex/signals';
import { showToast } from '../services/toast';
import { getNews } from '../stores/content-store';

export const NewsPage = defineComponent('NewsPage', () => {
  const expandedNews = createSignal<number | null>(null);
  const newsItems = getNews();
  const featured = newsItems[0];
  const rest = newsItems.slice(1);

  return h('div', { class: 'news-page' },
    h('section', { class: 'content-section', style: 'padding-top:80px;' },
      h('div', { class: 'section-header' },
        h('h1', {
          style: 'font-family:var(--font-display); font-size:36px; font-weight:900; color:var(--text-primary); letter-spacing:3px;',
        }, 'NEWS'),
        h('p', null, 'Latest updates, stories, and milestones from Richmond Hope Hub'),
      ),

      // Featured article hero
      h('div', { class: 'news-featured' },
        h('div', { class: 'news-featured-badge' },
          h('span', { class: 'news-featured-badge-dot' }),
          'Latest Story',
        ),
        h('div', { class: 'news-featured-content' },
          h('div', { class: 'news-featured-icon' }, featured.icon),
          h('div', { class: 'news-featured-info' },
            h('div', { class: 'news-featured-meta' },
              h('span', { class: `news-category-badge cat-${featured.category.toLowerCase()}` }, featured.category),
              h('span', { class: 'news-read-time' }, featured.readTime),
              h('span', { class: 'news-date' }, featured.date),
            ),
            h('h2', { class: 'news-featured-title' }, featured.title),
            h('p', { class: 'news-featured-excerpt' }, featured.excerpt),
            h('button', {
              class: 'news-read-btn',
              onClick: () => {
                expandedNews.set(expandedNews.peek() === -1 ? null : -1);
                const el = document.querySelector('.news-featured-detail');
                if (el) {
                  (el as HTMLElement).style.display = expandedNews.peek() === -1 ? 'block' : 'none';
                }
              },
            }, '📖 Read Full Story'),
            h('div', { class: 'news-featured-detail', style: 'display:none;' },
              h('p', { class: 'news-full-text' }, featured.full),
              h('div', { class: 'news-share-bar' },
                h('button', {
                  class: 'news-share-btn',
                  onClick: () => showToast('success', 'Shared!', 'Link copied to clipboard.'),
                }, '🔗 Share'),
                h('button', {
                  class: 'news-share-btn',
                  onClick: () => showToast('info', 'Bookmarked!', 'Article saved to your reading list.'),
                }, '🔖 Bookmark'),
              ),
            ),
          ),
        ),
      ),

      // News grid
      h('div', { class: 'news-grid-header' },
        h('h2', { class: 'news-grid-title' }, '📰 More Stories'),
      ),

      h('div', { class: 'news-grid' },
        ...rest.map((n, i) =>
          h('div', {
            class: `news-card ${expandedNews.peek() === i ? 'expanded' : ''}`,
            onClick: () => {
              expandedNews.set(expandedNews.peek() === i ? null : i);
              const el = document.querySelector(`[data-news-idx="${i}"]`);
              if (el) {
                el.classList.toggle('expanded', expandedNews.peek() === i);
                const detail = el.querySelector('.news-card-detail');
                if (detail) {
                  (detail as HTMLElement).style.display = expandedNews.peek() === i ? 'block' : 'none';
                }
              }
            },
            'data-news-idx': i,
          },
            h('div', { class: 'news-card-top' },
              h('div', { class: 'news-card-icon' }, n.icon),
              h('div', { class: 'news-card-meta' },
                h('span', { class: `news-category-badge cat-${n.category.toLowerCase()}` }, n.category),
                h('span', { class: 'news-card-date' }, n.date),
              ),
              h('div', { class: 'news-card-expand' }, expandedNews.peek() === i ? '▾' : '▸'),
            ),
            h('h3', { class: 'news-card-title' }, n.title),
            h('p', { class: 'news-card-excerpt' }, n.excerpt),
            h('div', { class: 'news-card-footer' },
              h('span', { class: 'news-read-time' }, n.readTime),
            ),
            h('div', { class: 'news-card-detail', style: 'display:none;' },
              h('p', { class: 'news-full-text' }, n.full),
              h('div', { class: 'news-share-bar' },
                h('button', {
                  class: 'news-share-btn',
                  onClick: (e: Event) => {
                    e.stopPropagation();
                    showToast('success', 'Shared!', 'Link copied to clipboard.');
                  },
                }, '🔗 Share'),
                h('button', {
                  class: 'news-share-btn',
                  onClick: (e: Event) => {
                    e.stopPropagation();
                    showToast('info', 'Bookmarked!', 'Article saved to your reading list.');
                  },
                }, '🔖 Bookmark'),
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
          h('div', { class: 'footer-phone' }, 'Mr. Thilan Lasantha: +94 77 794 3085'),
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
        h('span', null, '© 2026 Richmond Hope Hub — Powered by Auravexon Codex'),
      ),
    ),
  );
});
