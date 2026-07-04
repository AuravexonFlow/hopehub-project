/**
 * ═══════════════════════════════════════════════════════════
 *  About — Richmond Hope Hub mission, history, and impact
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';

export const AboutPage = defineComponent('AboutPage', () => {
  return h('div', { class: 'about-page' },
    // Hero with School Image Banner
    h('section', { class: 'about-hero-banner' },
      h('img', { src: '/school.jpg', alt: 'Richmond College, Galle', class: 'about-hero-img' }),
      h('div', { class: 'about-hero-overlay' },
        h('img', { src: '/logo.png', alt: 'Richmond College Crest', class: 'about-school-crest' }),
        h('h1', { class: 'about-hero-title' }, 'RICHMOND COLLEGE'),
        h('p', { class: 'about-hero-subtitle' }, 'Galle, Sri Lanka — Est. 1876'),
      ),
    ),

    // Intro
    h('section', { class: 'content-section', style: 'text-align:center; padding-top:60px;' },
      h('h1', {
        style: 'font-family:var(--font-display); font-size:40px; font-weight:900; color:var(--text-primary); letter-spacing:3px; margin-bottom:12px;',
      }, 'ABOUT US'),
      h('p', {
        style: 'font-size:17px; color:var(--text-secondary); max-width:700px; margin:0 auto; line-height:1.7;',
      }, 'Richmond Hope Hub is a non-profit initiative dedicated to supporting the students and community of Richmond College, Galle — one of Sri Lanka\'s most historic institutions.'),
    ),

    // Mission
    h('section', { class: 'content-section' },
      h('div', { style: 'max-width:900px; margin:0 auto;' },
        h('h2', {
          style: 'font-family:var(--font-display); font-size:24px; font-weight:700; color:var(--primary); letter-spacing:2px; margin-bottom:16px; text-align:center;',
        }, 'OUR MISSION'),
        h('p', {
          style: 'font-size:16px; color:var(--text-secondary); line-height:1.8; text-align:center; margin-bottom:40px;',
        }, 'To empower Richmond College students by providing essential resources, educational support, career guidance, and community care — ensuring no student is left behind due to financial hardship or lack of access.'),
      ),
    ),

    // Stats
    h('section', { style: 'background:var(--bg-secondary); border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);' },
      h('div', { class: 'stats-row' },
        h('div', { class: 'stat-block' },
          h('div', { class: 'stat-block-number' }, '1000+'),
          h('div', { class: 'stat-block-label' }, 'Donors'),
        ),
        h('div', { class: 'stat-block' },
          h('div', { class: 'stat-block-number' }, '500+'),
          h('div', { class: 'stat-block-label' }, 'Requests Fulfilled'),
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

    // History
    h('section', { class: 'content-section' },
      h('div', { style: 'max-width:900px; margin:0 auto;' },
        h('h2', {
          style: 'font-family:var(--font-display); font-size:24px; font-weight:700; color:var(--primary); letter-spacing:2px; margin-bottom:16px; text-align:center;',
        }, 'OUR STORY'),
        h('p', {
          style: 'font-size:15px; color:var(--text-secondary); line-height:1.8; margin-bottom:16px;',
        }, 'Founded by alumni of Richmond College, Galle, the Hope Hub began as a grassroots effort to collect and distribute school supplies to students in need. Over the years, it has grown into a comprehensive support platform covering education, nutrition, sports, counseling, and career guidance.'),
        h('p', {
          style: 'font-size:15px; color:var(--text-secondary); line-height:1.8; margin-bottom:16px;',
        }, 'Richmond College, established in 1876, sits atop Richmond Hill in Galle — a UNESCO World Heritage city. The college has produced generations of leaders, scholars, and public servants. The Hope Hub carries forward this legacy of excellence and service.'),
        h('p', {
          style: 'font-size:15px; color:var(--text-secondary); line-height:1.8;',
        }, 'Today, powered by Auravexon Codex technology and the generosity of our donor community, Richmond Hope Hub serves as the bridge between those who want to help and students who need it most.'),
      ),
    ),

    // Values
    h('section', { class: 'content-section' },
      h('div', { class: 'section-header' },
        h('h2', null, 'OUR VALUES'),
        h('p', null, 'The principles that guide everything we do'),
      ),
      h('div', { class: 'resource-grid' },
        h('div', { class: 'resource-card' },
          h('div', { class: 'resource-icon' }, '🤝'),
          h('div', { class: 'resource-title' }, 'TRANSPARENCY'),
          h('div', { class: 'resource-desc' }, 'Every donation is tracked and accounted for. Donors can see exactly how their contributions are making a difference.'),
        ),
        h('div', { class: 'resource-card' },
          h('div', { class: 'resource-icon' }, '💡'),
          h('div', { class: 'resource-title' }, 'INNOVATION'),
          h('div', { class: 'resource-desc' }, 'We leverage technology to streamline the donation process and maximize the impact of every contribution.'),
        ),
        h('div', { class: 'resource-card' },
          h('div', { class: 'resource-icon' }, '🌱'),
          h('div', { class: 'resource-title' }, 'SUSTAINABILITY'),
          h('div', { class: 'resource-desc' }, 'We build lasting programs that create self-sustaining cycles of support, not one-time handouts.'),
        ),
        h('div', { class: 'resource-card' },
          h('div', { class: 'resource-icon' }, '❤️'),
          h('div', { class: 'resource-title' }, 'COMPASSION'),
          h('div', { class: 'resource-desc' }, 'At the heart of everything we do is genuine care for the wellbeing and future of every Richmond student.'),
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
        h('span', null, '© 2025 Richmond Hope Hub — Powered by Auravexon Codex'),
      ),
    ),
  );
});
