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
  const filter = createSignal<string>('All');
  const allNotices = getNotices();

  const filters = ['All', 'Active', 'Update', 'Event', 'Report'];

  function getFiltered() {
    const f = filter.peek();
    if (f === 'All') return allNotices;
    return allNotices.filter(n => n.tag === f);
  }

  function renderTimeline() {
    const filtered = getFiltered();
    const container = document.querySelector('.notice-timeline');
    if (!container) return;
    container.innerHTML = '';

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'notice-empty';
      empty.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--text-secondary);"><div style="font-size:48px;margin-bottom:16px;">📭</div><h3 style="color:var(--text-primary);margin:0 0 8px;">No notices found</h3><p style="margin:0;">There are no notices matching this filter.</p></div>';
      container.appendChild(empty);
      return;
    }

    filtered.forEach((n) => {
      const idx = allNotices.indexOf(n);
      const isExpanded = expanded.peek() === idx;
      const item = document.createElement('div');
      item.className = `timeline-item${isExpanded ? ' expanded' : ''}`;
      item.setAttribute('data-timeline-idx', String(idx));

      const dotColor = n.tag === 'Active' ? 'var(--accent-green)'
        : n.tag === 'Update' ? 'var(--accent-blue)'
        : n.tag === 'Event' ? 'var(--primary)'
        : 'var(--accent-yellow)';

      const showLine = filtered.indexOf(n) < filtered.length - 1;

      item.innerHTML = `
        <div class="timeline-connector">
          <div class="timeline-dot" style="background:${dotColor}"></div>
          ${showLine ? '<div class="timeline-line"></div>' : ''}
        </div>
        <div class="timeline-card card-hover-lift">
          <div class="timeline-card-header">
            <div class="timeline-icon">${n.icon}</div>
            <div class="timeline-meta">
              <span class="timeline-date">${n.date}</span>
              <span class="timeline-tag tag-${n.tag.toLowerCase()}">${n.tag}</span>
            </div>
            <div class="timeline-expand-icon">${isExpanded ? '▾' : '▸'}</div>
          </div>
          <h3 class="timeline-title">${n.title}</h3>
          <p class="timeline-excerpt">${n.excerpt}</p>
          <div class="timeline-detail" style="display:${isExpanded ? 'block' : 'none'};">
            ${n.photos && n.photos.length > 0 ? `<div class="timeline-detail-photo-wrap"><img src="${n.photos[0]}" alt="${n.title}" class="timeline-detail-photo"></div>` : ''}
            <p class="timeline-full">${n.full}</p>
            <button class="timeline-action-btn" data-notice-stay="${idx}">🔔 Stay Updated</button>
          </div>
        </div>
      `;

      item.addEventListener('click', () => {
        const wasExpanded = expanded.peek() === idx;
        expanded.set(wasExpanded ? null : idx);
        renderTimeline();
      });

      container.appendChild(item);
    });

    container.querySelectorAll('[data-notice-stay]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showToast('success', 'Noted!', 'We\'ll keep you updated on this notice.');
      });
    });
  }

  function renderFilters() {
    const container = document.querySelector('.notice-filters');
    if (!container) return;
    container.innerHTML = '';

    filters.forEach(f => {
      const btn = document.createElement('button');
      btn.className = `notice-filter-btn${f === filter.peek() ? ' active' : ''}`;
      btn.textContent = f;
      btn.addEventListener('click', () => {
        if (filter.peek() === f) return;
        filter.set(f);
        container.querySelectorAll('.notice-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTimeline();
      });
      container.appendChild(btn);
    });
  }

  setTimeout(() => {
    renderFilters();
    renderTimeline();
  }, 0);

  return h('div', { class: 'notices-page' },
    h('section', { class: 'content-section', style: 'padding-top:80px;' },
      h('div', { class: 'section-header reveal' },
        h('h1', {
          style: 'font-family:var(--font-display); font-size:36px; font-weight:900; color:var(--text-primary); letter-spacing:3px;',
        }, 'NOTICES'),
        h('p', null, 'Stay updated with the latest announcements — click any notice to read more'),
      ),

      h('div', { class: 'notice-filters reveal' }),
      h('div', { class: 'notice-timeline' }),
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
