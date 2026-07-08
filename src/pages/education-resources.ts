/**
 * ═══════════════════════════════════════════════════════════
 *  Education Resources — Textbooks, Digital Learning, STEM
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';

const resources = [
  {
    icon: '📚',
    title: 'Textbook Library',
    desc: 'Access a shared collection of textbooks and reference materials for all subjects and grade levels.',
    details: [
      'Complete textbook sets for O/L and A/L curricula',
      'Reference materials for science, arts, and commerce streams',
      'Study guides and past paper collections',
      'Book borrowing system with flexible return policies',
    ],
  },
  {
    icon: '💻',
    title: 'Digital Learning Hub',
    desc: 'Computer labs, online course access, and digital literacy programs for the modern student.',
    details: [
      'Fully equipped computer lab with high-speed internet',
      'Access to online learning platforms (Coursera, Khan Academy)',
      'Digital literacy workshops for beginners',
      'Typing and coding bootcamps',
    ],
  },
  {
    icon: '🎓',
    title: 'Scholarship Portal',
    desc: 'Discover and apply for scholarships from local and international institutions supporting Richmond students.',
    details: [
      'Curated scholarship database updated monthly',
      'Application assistance and essay review',
      'Interview preparation workshops',
      'Financial aid guidance and counseling',
    ],
  },
  {
    icon: '📐',
    title: 'STEM Resources',
    desc: 'Science kits, math tools, and engineering project supplies for hands-on STEM education.',
    details: [
      'Laboratory equipment for physics, chemistry, and biology',
      'Mathematics competition preparation materials',
      'Robotics and engineering project kits',
      'Science fair mentorship and guidance',
    ],
  },
];

const stats = [
  { number: '500+', label: 'Textbooks Available' },
  { number: '50+', label: 'Digital Courses' },
  { number: '30+', label: 'Scholarships Listed' },
  { number: '100+', label: 'Students Supported' },
];

export const EducationResourcesPage = defineComponent('EducationResourcesPage', () => {
  return h('div', { class: 'edu-page' },

    // Hero
    h('section', { class: 'edu-hero' },
      h('div', { class: 'edu-hero-image-bg' }),
      h('div', { class: 'edu-hero-overlay' }),
      h('div', { class: 'edu-hero-bg' }),
      h('div', { class: 'edu-hero-content hero-stagger' },
        h('div', { class: 'edu-badge' },
          h('span', { class: 'edu-badge-dot' }),
          'C2 SOCIETY',
        ),
        h('h1', { class: 'edu-hero-title' },
          h('span', { class: 'edu-hero-icon' }, '📖'),
          ' Education Resources',
        ),
        h('p', { class: 'edu-hero-subtitle' },
          'Access to textbooks, digital learning materials, and scholarship opportunities for academic excellence. Empowering Richmond students with the tools they need to succeed.',
        ),
        h('div', { class: 'edu-hero-actions' },
          h('button', {
            class: 'btn btn-primary btn-lg btn-glow',
            onClick: () => { history.pushState(null, '', '/contact?ref=education-resources'); dispatchEvent(new PopStateEvent('popstate')); },
          }, 'Request Resources →'),
          h('button', {
            class: 'btn btn-outline btn-lg',
            onClick: () => { history.pushState(null, '', '/c2-society'); dispatchEvent(new PopStateEvent('popstate')); },
          }, '← Back to C2 Society'),
        ),
      ),
    ),

    // Stats
    h('section', { style: 'background:var(--bg-secondary); border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);' },
      h('div', { class: 'stats-row' },
        ...stats.map(s =>
          h('div', { class: 'stat-block' },
            h('div', { class: 'stat-block-number' }, s.number),
            h('div', { class: 'stat-block-label' }, s.label),
          ),
        ),
      ),
    ),

    // Resources Grid
    h('section', { class: 'content-section' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, 'WHAT WE OFFER'),
        h('p', null, 'Comprehensive educational support for every Richmond student'),
      ),
      h('div', { class: 'edu-resources-grid' },
        ...resources.map(r =>
          h('div', { class: 'edu-resource-card card-hover-lift card-shine' },
            h('div', { class: 'edu-resource-header' },
              h('div', { class: 'edu-resource-icon' }, r.icon),
              h('div', null,
                h('h3', { class: 'edu-resource-title' }, r.title),
                h('p', { class: 'edu-resource-desc' }, r.desc),
              ),
            ),
            h('ul', { class: 'edu-resource-features' },
              ...r.details.map(d =>
                h('li', null,
                  h('span', { class: 'edu-check' }, '✓'),
                  d,
                ),
              ),
            ),
            h('button', {
              class: 'btn btn-outline btn-sm',
              onClick: () => { history.pushState(null, '', '/contact?ref=education-resources'); dispatchEvent(new PopStateEvent('popstate')); },
            }, 'Learn More →'),
          ),
        ),
      ),
    ),

    // How It Works
    h('section', { class: 'content-section', style: 'background:var(--bg-secondary);' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, 'HOW IT WORKS'),
        h('p', null, 'Getting access to educational resources is simple'),
      ),
      h('div', { class: 'edu-steps' },
        h('div', { class: 'edu-step' },
          h('div', { class: 'edu-step-number' }, '1'),
          h('h4', null, 'Browse Resources'),
          h('p', null, 'Explore our catalog of textbooks, digital courses, and scholarship opportunities.'),
        ),
        h('div', { class: 'edu-step-arrow' }, '→'),
        h('div', { class: 'edu-step' },
          h('div', { class: 'edu-step-number' }, '2'),
          h('h4', null, 'Submit Request'),
          h('p', null, 'Fill out a simple request form specifying what you need and your grade level.'),
        ),
        h('div', { class: 'edu-step-arrow' }, '→'),
        h('div', { class: 'edu-step' },
          h('div', { class: 'edu-step-number' }, '3'),
          h('h4', null, 'Receive Support'),
          h('p', null, 'Our team reviews your request and connects you with the resources you need.'),
        ),
      ),
    ),

    // CTA
    h('section', { class: 'content-section' },
      h('div', { style: 'text-align:center; max-width:600px; margin:0 auto;' },
        h('h2', {
          style: 'font-family:var(--font-display); font-size:28px; font-weight:900; color:var(--text-primary); letter-spacing:2px; margin-bottom:16px;',
        }, 'Need Educational Support?'),
        h('p', {
          style: 'font-size:16px; color:var(--text-secondary); line-height:1.7; margin-bottom:28px;',
        }, 'Don\'t let lack of resources hold you back. Reach out to us and we\'ll help you access the materials you need for academic success.'),
        h('button', {
          class: 'btn btn-primary btn-lg btn-glow',
          onClick: () => { history.pushState(null, '', '/contact?ref=education-resources'); dispatchEvent(new PopStateEvent('popstate')); },
        }, 'Contact Us Today →'),
      ),
    ),
  );
});
