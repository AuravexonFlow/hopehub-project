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
    h('section', { class: 'content-section reveal', style: 'text-align:center; padding-top:60px;' },
      h('h1', {
        style: 'font-family:var(--font-display); font-size:40px; font-weight:900; color:var(--text-primary); letter-spacing:3px; margin-bottom:12px;',
      }, 'ABOUT US'),
      h('p', {
        style: 'font-size:17px; color:var(--text-secondary); max-width:700px; margin:0 auto; line-height:1.7;',
      }, 'Richmond Hope Hub is a non-profit initiative dedicated to supporting the students and community of Richmond College, Galle — one of Sri Lanka\'s most historic institutions.'),
    ),

    // Mission
    h('section', { class: 'content-section reveal-left' },
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
      h('div', { class: 'stats-row reveal' },
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
    h('section', { class: 'content-section reveal-right' },
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

    // Founding Credit — '94 Richmondites
    h('section', { class: 'content-section reveal-scale', style: 'background: linear-gradient(135deg, rgba(224,32,64,0.04), rgba(0,144,208,0.04)); border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);' },
      h('div', { style: 'max-width:900px; margin:0 auto; text-align:center;' },
        h('div', {
          style: 'display:inline-block; padding:6px 24px; border-radius:999px; background:linear-gradient(135deg, rgba(224,32,64,0.12), rgba(0,144,208,0.12)); border:1px solid rgba(224,32,64,0.25); font-size:12px; font-weight:700; letter-spacing:1.5px; color:var(--primary,#e02040); text-transform:uppercase; margin-bottom:20px;',
        }, '★ Special Recognition'),
        h('h2', {
          style: 'font-family:var(--font-display); font-size:28px; font-weight:900; color:var(--text-primary); letter-spacing:2px; margin-bottom:8px;',
        }, "THE '94 RICHMONDITES"),
        h('p', {
          style: 'font-size:14px; color:var(--primary,#e02040); font-weight:600; letter-spacing:1px; margin-bottom:24px;',
        }, 'Founding Visionaries of Richmond Hope Hub'),
        h('div', {
          style: 'max-width:700px; margin:0 auto;',
        },
          h('p', {
            style: 'font-size:16px; color:var(--text-secondary); line-height:1.8; margin-bottom:16px;',
          }, "Richmond Hope Hub owes its very existence to the pioneering spirit of the '94 Richmondites — the batch of 1994 alumni who envisioned a platform where past students could give back and ensure no Richmondite is left behind."),
          h('p', {
            style: 'font-size:16px; color:var(--text-secondary); line-height:1.8; margin-bottom:16px;',
          }, "It was their collective determination, sacrifice, and unwavering bond with Richmond College that planted the seed from which Hope Hub has grown. From the first donation drive to establishing the C2 Society and this digital platform, every milestone traces back to their founding vision."),
          h('p', {
            style: 'font-size:16px; color:var(--text-secondary); line-height:1.8;',
          }, "We honour their legacy and invite every Richmondite to carry forward the torch of service they so proudly lit."),
        ),
        h('div', {
          style: 'margin-top:32px; padding:20px 32px; border-radius:16px; background:rgba(224,32,64,0.06); border:1px solid rgba(224,32,64,0.15); display:inline-block;',
        },
          h('div', {
            style: 'font-size:32px; margin-bottom:8px;',
          }, '🎓'),
          h('div', {
            style: 'font-family:var(--font-display); font-size:20px; font-weight:800; color:var(--text-primary); letter-spacing:1px;',
          }, "Founded by the '94 Richmondites"),
          h('div', {
            style: 'font-size:13px; color:var(--text-secondary); margin-top:4px;',
          }, 'With gratitude, we carry their legacy forward'),
        ),
      ),
    ),

    // Values
    h('section', { class: 'content-section' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, 'OUR VALUES'),
        h('p', null, 'The principles that guide everything we do'),
      ),
      h('div', { class: 'resource-grid reveal' },
        h('div', { class: 'resource-card card-hover-lift card-shine' },
          h('div', { class: 'resource-icon' }, '🤝'),
          h('div', { class: 'resource-title' }, 'TRANSPARENCY'),
          h('div', { class: 'resource-desc' }, 'Every donation is tracked and accounted for. Donors can see exactly how their contributions are making a difference.'),
        ),
        h('div', { class: 'resource-card card-hover-lift card-shine' },
          h('div', { class: 'resource-icon' }, '💡'),
          h('div', { class: 'resource-title' }, 'INNOVATION'),
          h('div', { class: 'resource-desc' }, 'We leverage technology to streamline the donation process and maximize the impact of every contribution.'),
        ),
        h('div', { class: 'resource-card card-hover-lift card-shine' },
          h('div', { class: 'resource-icon' }, '🌱'),
          h('div', { class: 'resource-title' }, 'SUSTAINABILITY'),
          h('div', { class: 'resource-desc' }, 'We build lasting programs that create self-sustaining cycles of support, not one-time handouts.'),
        ),
        h('div', { class: 'resource-card card-hover-lift card-shine' },
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
          h('div', { class: 'footer-phone' }, 'Mr. Thilan Lasantha: ', h('a', { href: 'tel:+94777943085', style: 'color:inherit; text-decoration:none;' }, '+94 77 794 3085')),
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
