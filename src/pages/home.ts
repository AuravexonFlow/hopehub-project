/**
 * ═══════════════════════════════════════════════════════════
 *  Home — Richmond Hope Hub main landing page
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { createSignal } from '../vortex/signals';
import { showToast } from '../services/toast';
import { getDonations, getNotices, getEvents } from '../stores/content-store';

const donationCategories = getDonations();

const studentResources = [
  { icon: '🏛️', title: 'C2 Society', desc: 'A student-led community fostering leadership, debate, and civic engagement among Richmond students.', path: '/c2-society' },
  { icon: '📖', title: 'Education Resources', desc: 'Access to textbooks, digital learning materials, and scholarship opportunities for academic excellence.', path: '/education-resources' },
  { icon: '🧠', title: 'Counseling & Referral', desc: 'Professional counseling services and referrals for students facing personal or academic challenges.', path: '/counseling' },
  { icon: '🎯', title: 'Career Guidance', desc: 'Career counseling, internship connections, and mentorship from Richmond alumni in diverse fields.', path: '/career-guidance' },
];

export const HomePage = defineComponent('HomePage', () => {
  return h('div', { class: 'home-page' },

    // ─── Hero Section ───────────────────────────────────
    h('section', { class: 'hero' },
      h('div', { class: 'hero-bg' },
        h('div', { class: 'grid-overlay' }),
        h('div', { class: 'particle-field' }),
      ),
      h('div', { class: 'hero-content hero-stagger' },
        h('div', { class: 'hero-badge' },
          h('span', { class: 'badge-dot' }),
          'RICHMOND COLLEGE, GALLE',
        ),
        h('h1', { class: 'hero-title' },
          'Empower Education,',
          h('br', null),
          'One ',
          h('span', { class: 'gradient-text' }, 'Donation'),
          ' at a Time',
        ),
        h('p', { class: 'hero-subtitle' },
          'Richmond Hope Hub connects generous donors with students in need — providing essentials, education, nutrition, and opportunities for a brighter future.',
        ),
        h('div', { class: 'hero-actions' },
          h('button', {
            class: 'btn btn-primary btn-lg btn-glow btn-ripple',
            onClick: () => { history.pushState(null, '', '/donation-request'); dispatchEvent(new PopStateEvent('popstate')); },
          },
            'Donate Now →',
          ),
          h('button', {
            class: 'btn btn-outline btn-lg btn-ripple',
            onClick: () => { history.pushState(null, '', '/about'); dispatchEvent(new PopStateEvent('popstate')); },
          }, 'Learn More'),
        ),
        h('div', { class: 'hero-stats' },
          h('div', { class: 'stat' },
            h('span', { class: 'stat-number' }, '1000+'),
            h('span', { class: 'stat-label' }, 'Donors'),
          ),
          h('div', { class: 'stat' },
            h('span', { class: 'stat-number' }, '500+'),
            h('span', { class: 'stat-label' }, 'Requests'),
          ),
          h('div', { class: 'stat' },
            h('span', { class: 'stat-number' }, '200+'),
            h('span', { class: 'stat-label' }, 'Communities'),
          ),
        ),
      ),
    ),

    // ─── Stats Section ──────────────────────────────────
    h('section', { class: 'reveal', style: 'background:var(--bg-secondary); border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);' },
      h('div', { class: 'stats-row' },
        h('div', { class: 'stat-block' },
          h('div', { class: 'stat-block-number' }, '1000+'),
          h('div', { class: 'stat-block-label' }, 'Donors Worldwide'),
        ),
        h('div', { class: 'stat-block' },
          h('div', { class: 'stat-block-number' }, '500+'),
          h('div', { class: 'stat-block-label' }, 'Students Supported'),
        ),
        h('div', { class: 'stat-block' },
          h('div', { class: 'stat-block-number' }, '200+'),
          h('div', { class: 'stat-block-label' }, 'Communities'),
        ),
        h('div', { class: 'stat-block' },
          h('div', { class: 'stat-block-number' }, '50+'),
          h('div', { class: 'stat-block-label' }, 'Events Held'),
        ),
      ),
    ),

    // ─── Events Slideshow ─────────────────────────────
    (() => {
      const events = getEvents();
      const heroSlides = events
        .filter(e => e.photos && e.photos.length > 0)
        .slice(0, 8)
        .map(e => ({
          src: e.photos![e.heroIndex ?? 0],
          icon: e.icon,
          date: e.date,
          title: e.title,
          stats: e.stats,
          tag: e.tag,
        }));

      if (heroSlides.length === 0) return null;

      const slideIdx = createSignal(0);
      let timer: ReturnType<typeof setInterval> | null = null;

      const container = h('section', { class: 'content-section', style: 'padding-bottom: 0;' },
        h('div', { class: 'section-header reveal' },
          h('h2', null, 'EVENTS'),
          h('p', null, 'Highlights from our recent events and upcoming activities'),
        ),
        h('div', { class: 'hero-slideshow' },
          h('div', { class: 'hero-slides-track' },
            ...heroSlides.map((s, i) =>
              h('div', {
                class: `hero-slide ${i === 0 ? 'active' : ''}`,
                'data-slide-idx': String(i),
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
                        history.pushState(null, '', '/events');
                        dispatchEvent(new PopStateEvent('popstate'));
                      },
                    }, 'View Event →'),
                  ),
                ),
              ),
            ),
          ),
          h('button', { class: 'hero-arrow hero-arrow-prev' }, '‹'),
          h('button', { class: 'hero-arrow hero-arrow-next' }, '›'),
          h('div', { class: 'hero-dots' },
            ...heroSlides.map((_, i) =>
              h('button', {
                class: `hero-dot ${i === 0 ? 'active' : ''}`,
                'data-dot-idx': String(i),
              }),
            ),
          ),
        ),
      );

      // Wire up after mount
      setTimeout(() => {
        const root = document.querySelector('.home-page .hero-slideshow');
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

    // ─── Donation Categories ────────────────────────────
    h('section', { class: 'content-section' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, 'DONATION CATEGORIES'),
        h('p', null, 'Choose how you\'d like to support Richmond students'),
      ),
      h('div', { class: 'donation-grid' },
        ...donationCategories.map(cat =>
          h('div', { class: 'donation-card card-hover-lift card-shine' },
            h('div', { class: 'donation-card-body' },
              h('div', { style: 'font-size:32px; margin-bottom:12px;' }, cat.icon),
              h('div', { class: 'donation-card-title' }, cat.title),
              h('div', { class: 'donation-card-desc' }, cat.description),
              h('button', {
                class: 'btn btn-outline btn-sm',
                onClick: () => { history.pushState(null, '', `/donation-request#cat-${cat.id}`); dispatchEvent(new PopStateEvent('popstate')); },
              }, 'View Requests →'),
            ),
          ),
        ),
      ),
    ),

    // ─── Student Resources ──────────────────────────────
    h('section', { class: 'content-section' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, 'STUDENT RESOURCES'),
        h('p', null, 'Supporting the whole student — mind, body, and future'),
      ),
      h('div', { class: 'resource-grid' },
        ...studentResources.map(r =>
          h('div', {
            class: 'resource-card card-hover-lift card-shine',
            style: 'cursor:pointer; position:relative;',
            onClick: () => { history.pushState(null, '', r.path); dispatchEvent(new PopStateEvent('popstate')); },
          },
            r.path === '/career-guidance'
              ? h('span', {
                  style: 'position:absolute; top:12px; right:12px; background:linear-gradient(135deg,#ef4444,#f59e0b); color:#fff; font-size:10px; font-weight:800; padding:3px 10px; border-radius:20px; letter-spacing:1px; z-index:1;',
                }, '✨ UPDATED')
              : null,
            h('div', { class: 'resource-icon' }, r.icon),
            h('div', { class: 'resource-title' }, r.title),
            h('div', { class: 'resource-desc' }, r.desc),
          ),
        ),
      ),
    ),

    // ─── Latest Notices Preview ─────────────────────────
    h('section', { class: 'content-section' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, 'LATEST NOTICES'),
        h('p', null, 'Stay updated with Richmond Hope Hub'),
      ),
      h('div', { class: 'notice-list' },
        ...getNotices().slice(0, 3).map(n =>
          h('div', { class: 'notice-card card-hover-lift' },
            h('div', { class: 'notice-date' }, n.date),
            h('div', { class: 'notice-content' },
              h('div', { class: 'notice-title' }, n.title),
              h('div', { class: 'notice-excerpt' }, n.excerpt),
            ),
          ),
        ),
      ),
      h('div', { style: 'text-align:center; margin-top:24px;' },
        h('a', { href: '/notices', class: 'btn btn-outline' }, 'View All Notices →'),
      ),
    ),

    // ─── Footer ─────────────────────────────────────────
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
