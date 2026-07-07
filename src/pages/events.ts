/**
 * ═══════════════════════════════════════════════════════════
 *  Events — Hero + Card Grid with Modal Detail View
 *  Upcoming event hero + past events grid — events with photos
 *  show one thumbnail card; clicking opens full detail modal
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { createSignal } from '../vortex/signals';
import { showToast } from '../services/toast';
import { getEvents, type EventItem } from '../stores/content-store';

/* ── Lightbox (fullscreen photo viewer with nav) ──────── */

function openLightbox(photos: string[], startIndex: number) {
  let current = startIndex;

  function renderLB() {
    const existing = document.querySelector('.event-lightbox');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'event-lightbox';
    overlay.innerHTML = `
      <div class="event-lightbox-backdrop"></div>
      <div class="event-lightbox-container">
        <button class="lb-nav lb-prev" ${current === 0 ? 'disabled' : ''}>‹</button>
        <div class="lb-stage">
          <img src="${photos[current]}" class="event-lightbox-img" alt="Photo ${current + 1}">
          <div class="lb-counter">${current + 1} / ${photos.length}</div>
        </div>
        <button class="lb-nav lb-next" ${current === photos.length - 1 ? 'disabled' : ''}>›</button>
        <button class="event-lightbox-close">✕</button>
      </div>`;

    overlay.querySelector('.event-lightbox-backdrop')!.addEventListener('click', () => overlay.remove());
    overlay.querySelector('.event-lightbox-close')!.addEventListener('click', () => overlay.remove());
    overlay.querySelector('.lb-prev')!.addEventListener('click', (e) => {
      e.stopPropagation();
      if (current > 0) { current--; renderLB(); }
    });
    overlay.querySelector('.lb-next')!.addEventListener('click', (e) => {
      e.stopPropagation();
      if (current < photos.length - 1) { current++; renderLB(); }
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onKey); }
      if (e.key === 'ArrowLeft' && current > 0) { current--; renderLB(); }
      if (e.key === 'ArrowRight' && current < photos.length - 1) { current++; renderLB(); }
    };
    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
  }

  renderLB();
}

/* ── Event Detail Modal ───────────────────────────────── */

function openEventModal(evt: EventItem) {
  const existing = document.querySelector('.event-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'event-modal-overlay';

  const photos = evt.photos || [];
  const photoGrid = photos.length > 0
    ? photos.map((p, i) => `
        <div class="em-photo" data-idx="${i}">
          <img src="${p}" alt="${evt.title} photo ${i + 1}" loading="lazy">
          <div class="em-photo-hover"><span>🔍</span></div>
        </div>`).join('')
    : '';

  const videoSection = evt.videoUrl
    ? `<div class="em-video-section">
        <div class="em-video-header">
          <h3>🎬 Event Video</h3>
        </div>
        <div class="em-video-wrapper">
          <iframe
            src="${evt.videoUrl}"
            title="${evt.title}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
      </div>`
    : '';

  overlay.innerHTML = `
    <div class="event-modal-backdrop"></div>
    <div class="event-modal">
      <button class="event-modal-close">✕</button>
      <div class="event-modal-hero">
        ${photos.length > 0 ? `<img src="${photos[evt.heroIndex ?? 0]}" class="event-modal-hero-img" alt="${evt.title}">` : ''}
        ${!photos.length && evt.videoUrl ? `<div class="event-modal-hero-video-bg"><iframe src="${evt.videoUrl}?autoplay=1&mute=1&controls=0&loop=1&playlist=m2Tokhz1eCI" frameborder="0" allow="autoplay" allowfullscreen></iframe></div>` : ''}
        <div class="event-modal-hero-overlay">
          <span class="em-hero-icon">${evt.icon}</span>
          <div>
            <div class="em-hero-date">📅 ${evt.date}</div>
            <h2 class="em-hero-title">${evt.title}</h2>
            ${evt.stats ? `<span class="em-hero-stats">${evt.stats}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="event-modal-body">
        ${videoSection}
        <p class="em-description">${evt.full}</p>
        ${photos.length > 0 ? `
          <div class="em-gallery-section">
            <div class="em-gallery-header">
              <h3>📸 Event Gallery</h3>
              <span class="em-photo-count">${photos.length} photos</span>
            </div>
            <div class="em-photo-grid">${photoGrid}</div>
          </div>` : ''}
      </div>
    </div>`;

  // Close handlers
  overlay.querySelector('.event-modal-backdrop')!.addEventListener('click', () => overlay.remove());
  overlay.querySelector('.event-modal-close')!.addEventListener('click', () => overlay.remove());

  // Photo click → lightbox
  overlay.querySelectorAll('.em-photo').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(el.getAttribute('data-idx') || '0');
      openLightbox(photos, idx);
    });
  });

  // Escape key
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onKey); }
  };
  document.addEventListener('keydown', onKey);

  document.body.appendChild(overlay);
}

/* ── Main Page ────────────────────────────────────────── */

export const EventsPage = defineComponent('EventsPage', () => {
  const expandedEvent = createSignal<number | null>(null);
  const events = getEvents();

  const upcoming = events.filter(e => e.tag === 'Upcoming');
  const past = events.filter(e => e.tag === 'Completed');

  return h('div', { class: 'events-page' },
    h('section', { class: 'content-section', style: 'padding-top:80px;' },
      h('div', { class: 'section-header' },
        h('h1', {
          style: 'font-family:var(--font-display); font-size:36px; font-weight:900; color:var(--text-primary); letter-spacing:3px;',
        }, 'EVENTS'),
        h('p', null, 'Explore our past events and upcoming activities at Richmond Hope Hub'),
      ),

      // ── Hero Slideshow ───────────────────────────────
      (() => {
        const heroSlides = events
          .filter(e => e.photos && e.photos.length > 0)
          .map(e => ({
            src: e.photos![e.heroIndex ?? 0],
            icon: e.icon,
            date: e.date,
            title: e.title,
            stats: e.stats,
            tag: e.tag,
            evt: e,
          }));

        if (heroSlides.length === 0) return null;

        const slideIdx = createSignal(0);
        let timer: ReturnType<typeof setInterval> | null = null;

        const container = h('div', { class: 'hero-slideshow' },
          // Slides wrapper
          h('div', { class: 'hero-slides-track' },
            ...heroSlides.map((s, i) =>
              h('div', {
                class: `hero-slide ${i === 0 ? 'active' : ''}`,
                'data-slide-idx': i,
              },
                h('img', { src: s.src, alt: s.title, class: 'hero-slide-img' }),
                h('div', { class: 'hero-slide-overlay' },
                  h('div', { class: 'hero-slide-content' },
                    h('span', { class: 'hero-slide-tag' }, s.tag === 'Upcoming' ? '🟢 Upcoming' : '✓ Completed'),
                    h('div', { class: 'hero-slide-icon' }, s.icon),
                    h('div', { class: 'hero-slide-date' }, `📅 ${s.date}`),
                    h('h2', { class: 'hero-slide-title' }, s.title),
                    s.stats ? h('div', { class: 'hero-slide-stats' }, s.stats) : null,
                    h('button', {
                      class: 'hero-slide-btn',
                      onClick: (e: Event) => {
                        e.stopPropagation();
                        openEventModal(s.evt);
                      },
                    }, 'View Event →'),
                  ),
                ),
              ),
            ),
          ),
          // Prev / Next arrows
          h('button', { class: 'hero-arrow hero-arrow-prev' }, '‹'),
          h('button', { class: 'hero-arrow hero-arrow-next' }, '›'),
          // Dots
          h('div', { class: 'hero-dots' },
            ...heroSlides.map((_, i) =>
              h('button', {
                class: `hero-dot ${i === 0 ? 'active' : ''}`,
                'data-dot-idx': i,
              }),
            ),
          ),
        );

        // Wire up after mount
        setTimeout(() => {
          const root = document.querySelector('.hero-slideshow');
          if (!root) return;
          const slides = root.querySelectorAll('.hero-slide');
          const dots = root.querySelectorAll('.hero-dot');
          const prevBtn = root.querySelector('.hero-arrow-prev');
          const nextBtn = root.querySelector('.hero-arrow-next');
          if (slides.length === 0) return;

          function goTo(idx: number) {
            const total = slides.length;
            const next = ((idx % total) + total) % total;
            slides.forEach((s, i) => s.classList.toggle('active', i === next));
            dots.forEach((d, i) => d.classList.toggle('active', i === next));
            slideIdx.set(next);
          }

          function startAuto() {
            if (timer) clearInterval(timer);
            timer = setInterval(() => goTo(slideIdx.peek() + 1), 5000);
          }

          prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); goTo(slideIdx.peek() - 1); startAuto(); });
          nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); goTo(slideIdx.peek() + 1); startAuto(); });
          dots.forEach((d, i) => d.addEventListener('click', (e) => { e.stopPropagation(); goTo(i); startAuto(); }));

          startAuto();
        }, 50);

        return container;
      })(),

      // ── Past events header ───────────────────────────
      h('div', { class: 'events-past-header' },
        h('h2', { class: 'events-past-title' }, '📋 Past Events'),
        h('p', { class: 'events-past-subtitle' }, 'Click any event to explore'),
      ),

      // ── Past events grid ─────────────────────────────
      h('div', { class: 'events-grid' },
        ...past.map((evt, i) => {
          const hasPhotos = evt.photos && evt.photos.length > 0;

          // ── Photo card: one thumbnail, opens detail modal ──
          if (hasPhotos || evt.videoUrl) {
            return h('div', {
                class: 'event-photo-card',
                onClick: () => openEventModal(evt),
              },
              h('div', { class: 'epc-image-wrap' },
                hasPhotos
                  ? h('img', { src: evt.photos![evt.thumbnailIndex ?? 0], alt: evt.title, class: 'epc-image', loading: 'lazy' })
                  : h('div', { class: 'epc-video-placeholder' },
                      h('span', { class: 'epc-video-play' }, '▶'),
                    ),
                h('div', { class: 'epc-image-overlay' },
                  h('span', { class: 'epc-view-btn' },
                    evt.videoUrl && !hasPhotos ? '▶ Watch Video' : `View ${evt.photos!.length} Photos →`,
                  ),
                ),
              ),
              h('div', { class: 'epc-body' },
                h('div', { class: 'epc-badge' },
                  h('span', null, evt.icon),
                  h('span', null, evt.stats || 'Event'),
                ),
                h('h3', { class: 'epc-title' }, evt.title),
                h('p', { class: 'epc-date' }, `📅 ${evt.date}`),
                h('p', { class: 'epc-desc' }, evt.desc),
              ),
            );
          }

          // ── Regular expandable card (no photos) ──────
          return h('div', {
              class: `event-expand-card ${expandedEvent.peek() === i ? 'expanded' : ''}`,
              onClick: () => {
                expandedEvent.set(expandedEvent.peek() === i ? null : i);
                const el = document.querySelector(`[data-event-idx="${i}"]`);
                if (el) {
                  el.classList.toggle('expanded', expandedEvent.peek() === i);
                  const detail = el.querySelector('.event-expand-detail');
                  if (detail) {
                    (detail as HTMLElement).style.display = expandedEvent.peek() === i ? 'block' : 'none';
                  }
                }
              },
              'data-event-idx': i,
            },
            h('div', { class: 'event-expand-header' },
              h('div', { class: 'event-expand-icon' }, evt.icon),
              h('div', { class: 'event-expand-meta' },
                h('span', { class: 'event-expand-date' }, evt.date),
                h('span', { class: 'event-expand-stats' }, evt.stats || ''),
              ),
              h('div', { class: 'event-expand-toggle' }, expandedEvent.peek() === i ? '▾' : '▸'),
            ),
            h('h3', { class: 'event-expand-title' }, evt.title),
            h('p', { class: 'event-expand-desc' }, evt.desc),
            h('div', { class: 'event-expand-detail', style: 'display:none;' },
              h('p', { class: 'event-expand-full' }, evt.full),
              h('div', { class: 'event-expand-actions' },
                h('button', {
                  class: 'event-action-btn secondary',
                  onClick: (e: Event) => {
                    e.stopPropagation();
                    showToast('success', 'Shared!', 'Event link copied to clipboard.');
                  },
                }, '🔗 Share'),
              ),
            ),
          );
        }),
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
