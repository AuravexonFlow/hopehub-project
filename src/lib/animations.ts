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

// ─── Master Init (call on route change) ───────────────────

/**
 * Initialize all animation effects for the current page.
 * Call this after each route change / page render.
 */
export function initPageAnimations(): void {
  // Small delay to let the DOM render
  requestAnimationFrame(() => {
    initScrollReveal();
    initImageReveal();
  });
}
