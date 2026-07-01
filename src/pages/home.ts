/**
 * ═══════════════════════════════════════════════════════════
 *  Home Page — Landing / Hero section
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { currentUser } from '../services/auth';

export const HomePage = defineComponent('HomePage', () => {
  const user = currentUser.peek();

  return h('div', { class: 'page page-home' },
    // Hero Section
    h('section', { class: 'hero' },
      h('div', { class: 'hero-bg' },
        h('div', { class: 'grid-overlay' }),
        h('div', { class: 'particle-field' }),
      ),
      h('div', { class: 'hero-content' },
        h('div', { class: 'hero-badge' },
          h('span', { class: 'badge-dot' }),
          'Powered by VORTEX Framework',
        ),
        h('h1', { class: 'hero-title' },
          'Welcome to ',
          h('span', { class: 'gradient-text' }, 'Hope HUb'),
        ),
        h('p', { class: 'hero-subtitle' },
          'Next-generation workspace platform. Manage projects, track tasks, and collaborate in real-time with a futuristic interface built on reactive signals.',
        ),
        h('div', { class: 'hero-actions' },
          user
            ? h('a', {
                href: '/dashboard',
                class: 'btn btn-primary btn-glow',
                onClick: (e: Event) => {
                  e.preventDefault();
                  window.history.pushState(null, '', '/dashboard');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                },
              }, 'Enter Dashboard →')
            : h('a', {
                href: '/auth',
                class: 'btn btn-primary btn-glow',
                onClick: (e: Event) => {
                  e.preventDefault();
                  window.history.pushState(null, '', '/auth');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                },
              }, 'Get Started →'),
          h('a', {
            href: '#features',
            class: 'btn btn-outline',
          }, 'Explore Features'),
        ),
      ),
    ),

    // Features Section
    h('section', { id: 'features', class: 'features-section' },
      h('h2', { class: 'section-title' },
        h('span', { class: 'section-icon' }, '◈'),
        'Core Capabilities',
      ),
      h('div', { class: 'features-grid' },
        createFeatureCard('⚡', 'Signal-Based Reactivity', 'Fine-grained reactive state management with automatic dependency tracking and minimal re-renders.'),
        createFeatureCard('🔐', 'Secure Auth', 'Multi-provider authentication with Supabase — email, OAuth, magic links, and session management.'),
        createFeatureCard('📡', 'Real-Time Sync', 'Live data subscriptions, presence tracking, and broadcast channels for instant collaboration.'),
        createFeatureCard('📊', 'Smart Analytics', 'Built-in dashboards with real-time metrics, charts, and actionable insights.'),
        createFeatureCard('🎨', 'Futuristic UI', 'Cyberpunk-inspired design with glassmorphism, neon accents, and smooth animations.'),
        createFeatureCard('🚀', 'Production Ready', 'Optimized builds, code splitting, lazy loading, and comprehensive error handling.'),
      ),
    ),

    // Tech Stack
    h('section', { class: 'tech-section' },
      h('h2', { class: 'section-title' },
        h('span', { class: 'section-icon' }, '⬢'),
        'Built With',
      ),
      h('div', { class: 'tech-grid' },
        createTechBadge('VORTEX', 'v1.0.0', 'Custom Framework'),
        createTechBadge('Supabase', 'v2.x', 'Backend-as-a-Service'),
        createTechBadge('TypeScript', 'v5.x', 'Type Safety'),
        createTechBadge('Vite', 'v5.x', 'Build Tool'),
      ),
    ),

    // Footer
    h('footer', { class: 'home-footer' },
      h('div', { class: 'footer-content' },
        h('span', { class: 'footer-logo' }, '◆ Hope HUb'),
        h('span', { class: 'footer-divider' }, '·'),
        h('span', { class: 'footer-text' }, 'Built with VORTEX Framework'),
        h('span', { class: 'footer-divider' }, '·'),
        h('span', { class: 'footer-text' }, '© 2026 AURAVEXON'),
      ),
    ),
  );
});

function createFeatureCard(icon: string, title: string, desc: string) {
  return h('div', { class: 'feature-card' },
    h('div', { class: 'feature-icon' }, icon),
    h('h3', { class: 'feature-title' }, title),
    h('p', { class: 'feature-desc' }, desc),
    h('div', { class: 'feature-glow' }),
  );
}

function createTechBadge(name: string, version: string, desc: string) {
  return h('div', { class: 'tech-badge' },
    h('div', { class: 'tech-name' }, name),
    h('div', { class: 'tech-version' }, version),
    h('div', { class: 'tech-desc' }, desc),
  );
}
