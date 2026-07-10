/**
 * ═══════════════════════════════════════════════════════════
 *  Animation Utilities — Scroll Reveal, Page Transitions,
 *  Navbar Effects, Theme Smoothing
 * ═══════════════════════════════════════════════════════════
 */

// ─── Scroll Reveal (IntersectionObserver) ─────────────────

let revealObserver: IntersectionObserver | null = null;

const REVEAL_CLASSES = [
  'reveal',
  'reveal-left',
  'reveal-right',
  'reveal-scale',
  'reveal-rotate',
];

function getRevealObserver(): IntersectionObserver {
  if (revealObserver) return revealObserver;

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Once revealed, stop observing
          revealObserver?.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  return revealObserver;
}

/**
 * Initialize scroll-reveal on all elements with reveal classes.
 * Call this after each page render/route change.
 */
export function initScrollReveal(container?: Element): void {
  const root = container || document;
  const observer = getRevealObserver();

  // Observe all reveal elements
  REVEAL_CLASSES.forEach((cls) => {
    root.querySelectorAll(`.${cls}`).forEach((el) => {
      // Skip if already revealed
      if (!el.classList.contains('revealed')) {
        observer.observe(el);
      }
    });
  });

  // Also observe section dividers
  root.querySelectorAll('.section-divider').forEach((el) => {
    if (!el.classList.contains('revealed')) {
      observer.observe(el);
    }
  });
}

/**
 * Cleanup the reveal observer.
 */
export function cleanupScrollReveal(): void {
  if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }
}

// ─── Page Transition Helper ───────────────────────────────

/**
 * Apply a page exit animation, then call the callback.
 * Returns a promise that resolves after the exit animation completes.
 */
export function pageTransition(
  container: HTMLElement,
  type: 'slide' | 'fade' = 'slide'
): Promise<void> {
  return new Promise((resolve) => {
    const exitClass = type === 'slide' ? 'page-exit' : 'page-fade-exit';
    container.classList.add(exitClass);

    const onEnd = () => {
      container.removeEventListener('animationend', onEnd);
      container.classList.remove(exitClass);
      resolve();
    };

    container.addEventListener('animationend', onEnd);

    // Fallback if animation doesn't fire
    setTimeout(() => {
      container.classList.remove(exitClass);
      resolve();
    }, 300);
  });
}

/**
 * Apply a page enter animation to the container.
 */
export function pageEnter(
  container: HTMLElement,
  type: 'slide' | 'fade' = 'slide'
): void {
  const enterClass = type === 'slide' ? 'page-enter' : 'page-fade-enter';
  container.classList.add(enterClass);

  const onEnd = () => {
    container.removeEventListener('animationend', onEnd);
    container.classList.remove(enterClass);
  };

  container.addEventListener('animationend', onEnd);

  // Fallback cleanup
  setTimeout(() => {
    container.classList.remove(enterClass);
  }, 600);
}

// ─── Navbar Scroll Effect ─────────────────────────────────

let navScrollHandler: (() => void) | null = null;

/**
 * Add glassmorphism effect to navbar on scroll.
 * Pass the navbar selector (e.g., '.public-nav', '.app-navbar').
 */
export function initNavbarScroll(navSelector: string): void {
  cleanupNavbarScroll();

  const nav = document.querySelector(navSelector);
  if (!nav) return;

  let ticking = false;

  navScrollHandler = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 30) {
          nav.classList.add('navbar-scrolled');
        } else {
          nav.classList.remove('navbar-scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', navScrollHandler, { passive: true });

  // Check initial state
  if (window.scrollY > 30) {
    nav.classList.add('navbar-scrolled');
  }
}

export function cleanupNavbarScroll(): void {
  if (navScrollHandler) {
    window.removeEventListener('scroll', navScrollHandler);
    navScrollHandler = null;
  }
}

// ─── Theme Transition Smoothing ───────────────────────────

/**
 * Apply smooth theme transition.
 * Call this BEFORE changing the theme attribute.
 */
export function smoothThemeSwitch(callback: () => void): void {
  document.documentElement.classList.add('theme-transitioning');
  callback();

  setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning');
  }, 400);
}

// ─── Stagger Animation Helper ─────────────────────────────

/**
 * Add stagger reveal classes to children of a container.
 */
export function staggerReveal(
  container: Element,
  baseClass: string = 'reveal',
  maxChildren: number = 10
): void {
  const children = container.children;
  for (let i = 0; i < Math.min(children.length, maxChildren); i++) {
    const child = children[i] as HTMLElement;
    if (!child.classList.contains(baseClass)) {
      child.classList.add(baseClass);
    }
    child.classList.add(`stagger-${i + 1}`);
  }
}

// ─── Image Lazy Load with Reveal ──────────────────────────

/**
 * Initialize lazy image loading with reveal effect.
 */
export function initImageReveal(): void {
  document.querySelectorAll('img.img-reveal').forEach((img) => {
    const imgEl = img as HTMLImageElement;
    if (imgEl.complete) {
      imgEl.classList.add('loaded');
    } else {
      imgEl.addEventListener('load', () => {
        imgEl.classList.add('loaded');
      }, { once: true });
    }
  });
}

// ─── Smooth Scroll to Element ─────────────────────────────

/**
 * Smoothly scroll to an element with offset for fixed navbars.
 */
export function smoothScrollTo(selector: string, offset: number = 80): void {
  const el = document.querySelector(selector);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

// ─── Parallax Scroll Effect ───────────────────────────────

let parallaxHandler: (() => void) | null = null;
let parallaxTicking = false;

/**
 * Add subtle parallax scrolling to hero backgrounds and floating elements.
 */
export function initParallax(): void {
  cleanupParallax();

  parallaxHandler = () => {
    if (!parallaxTicking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        // Hero background parallax
        document.querySelectorAll('.hero-bg, .c2-hero-image-bg, .edu-hero-image-bg, .counseling-hero-image-bg, .career-hero-image-bg').forEach((el) => {
          const htmlEl = el as HTMLElement;
          const parent = htmlEl.parentElement;
          if (parent) {
            const rect = parent.getBoundingClientRect();
            if (rect.bottom > 0) {
              htmlEl.style.transform = `translateY(${scrollY * 0.3}px)`;
            }
          }
        });

        // Grid overlay parallax (slower)
        document.querySelectorAll('.grid-overlay, .c2-hero-grid').forEach((el) => {
          const htmlEl = el as HTMLElement;
          const parent = htmlEl.parentElement;
          if (parent) {
            const rect = parent.getBoundingClientRect();
            if (rect.bottom > 0) {
              htmlEl.style.transform = `translateY(${scrollY * 0.15}px)`;
            }
          }
        });

        // Floating elements parallax
        document.querySelectorAll('.float-element').forEach((el) => {
          const htmlEl = el as HTMLElement;
          const speed = parseFloat(htmlEl.dataset.speed || '0.1');
          const rect = htmlEl.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const yOffset = (rect.top - window.innerHeight / 2) * speed;
            htmlEl.style.transform = `translateY(${yOffset}px)`;
          }
        });

        parallaxTicking = false;
      });
      parallaxTicking = true;
    }
  };

  window.addEventListener('scroll', parallaxHandler, { passive: true });
  parallaxHandler(); // Initial position
}

export function cleanupParallax(): void {
  if (parallaxHandler) {
    window.removeEventListener('scroll', parallaxHandler);
    parallaxHandler = null;
  }
}

// ─── Button Ripple Effect ─────────────────────────────────

/**
 * Add ripple effect to buttons on click.
 */
export function initButtonRipple(): void {
  document.addEventListener('click', (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('.btn-ripple, .btn-primary, .btn-glow, .donate-req-btn, .donate-submit-btn, .hero-slide-btn, .event-action-btn, .timeline-action-btn');
    if (!target) return;

    const btn = target as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';

    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

    btn.style.position = btn.style.position || 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);

    ripple.addEventListener('animationend', () => ripple.remove());
  }, { passive: true });
}

// ─── Card Tilt / Magnetic Hover ───────────────────────────

/**
 * Add subtle 3D tilt effect on cards with .card-tilt class.
 */
export function initCardTilt(): void {
  document.querySelectorAll('.card-tilt, .feature-card, .donation-card, .resource-card, .event-photo-card, .donate-req-card, .project-card').forEach((card) => {
    const el = card as HTMLElement;
    // Skip if already initialized
    if (el.dataset.tiltInit) return;
    el.dataset.tiltInit = 'true';

    el.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    }, { passive: true });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    }, { passive: true });
  });
}

// ─── Animated Counter ─────────────────────────────────────

/**
 * Animate number counters on scroll into view.
 * Elements with .counter-animate and data-target attribute.
 */
export function initCounters(): void {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target as HTMLElement;
        if (el.dataset.counted) return;
        el.dataset.counted = 'true';

        const text = el.textContent || '';
        const match = text.match(/^([\d,]+)/);
        if (!match) return;

        const target = parseInt(match[1].replace(/,/g, ''), 10);
        const suffix = text.replace(match[1], '');
        const duration = 1500;
        const start = performance.now();

        const animate = (now: number) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          el.textContent = current.toLocaleString() + suffix;

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.stat-block-number, .stat-number, .hero-stats .stat-number').forEach((el) => {
    counterObserver.observe(el);
  });
}

// ─── Auto Stagger for Grids ───────────────────────────────

/**
 * Automatically add reveal + stagger classes to grid/list children.
 */
export function initAutoStagger(): void {
  // Auto-stagger grid children that don't already have reveal classes
  const gridSelectors = [
    '.features-grid > *',
    '.donation-grid > *',
    '.resource-grid > *',
    '.event-grid > *',
    '.events-grid > *',
    '.notice-list > *',
    '.stats-row > *',
    '.hero-stats > *',
    '.c2-pillars-grid > *',
    '.c2-resources-grid > *',
    '.c2-events-list > *',
    '.c2-team-grid > *',
    '.c2-handbooks-grid > *',
    '.edu-resources-grid > *',
    '.edu-steps > *',
    '.counseling-services-grid > *',
    '.counseling-steps > *',
    '.cr-grid > *',
    '.cr-categories > *',
    '.tech-grid > *',
    '.donate-req-grid > *',
  ];

  const observer = getRevealObserver();

  gridSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.classList.contains('revealed')) return;

      // Add reveal class if not present
      const hasReveal = REVEAL_CLASSES.some(cls => htmlEl.classList.contains(cls));
      if (!hasReveal) {
        htmlEl.classList.add('reveal');
      }

      // Add stagger delay (max 8)
      const staggerIdx = Math.min(index + 1, 8);
      if (!htmlEl.classList.contains(`stagger-${staggerIdx}`)) {
        // Remove any existing stagger class
        for (let i = 1; i <= 8; i++) {
          htmlEl.classList.remove(`stagger-${i}`);
        }
        htmlEl.classList.add(`stagger-${staggerIdx}`);
      }

      observer.observe(htmlEl);
    });
  });
}

// ─── Floating Orbs (CSS-based background decoration) ──────

/**
 * Add floating orb decorations to a container.
 * Pure CSS animation — no canvas needed.
 */
export function addFloatingOrbs(container: HTMLElement, count: number = 5): () => void {
  const orbs: HTMLElement[] = [];

  for (let i = 0; i < count; i++) {
    const orb = document.createElement('div');
    orb.className = 'floating-orb';
    const size = 4 + Math.random() * 8;
    orb.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${10 + Math.random() * 80}%;
      top: ${10 + Math.random() * 80}%;
      animation-delay: ${Math.random() * 5}s;
      animation-duration: ${6 + Math.random() * 8}s;
    `;
    container.appendChild(orb);
    orbs.push(orb);
  }

  return () => {
    orbs.forEach(orb => orb.remove());
  };
}

// ─── Master Init (call on route change) ───────────────────

let currentCleanup: (() => void) | null = null;

/**
 * Initialize all animation effects for the current page.
 * Call this after each route change / page render.
 */
export function initPageAnimations(): void {
  // Cleanup previous page effects
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  // Small delay to let the DOM render
  requestAnimationFrame(() => {
    initScrollReveal();
    initImageReveal();
    initAutoStagger();
    initCardTilt();
    initCounters();
    initParallax();
  });
}

/**
 * One-time initialization for effects that persist across routes.
 * Call once on app startup.
 */
export function initGlobalAnimations(): void {
  initButtonRipple();
}

/**
 * Cleanup all animation effects.
 */
export function cleanupAllAnimations(): void {
  cleanupScrollReveal();
  cleanupParallax();
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }
}
