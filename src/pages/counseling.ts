/**
 * ═══════════════════════════════════════════════════════════
 *  Counseling & Referral — Mental Health & Academic Support
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';

const services = [
  {
    icon: '🧠',
    title: 'Personal Counseling',
    desc: 'Confidential one-on-one sessions with trained counselors to support mental health and emotional wellbeing.',
    details: [
      'Confidential sessions with qualified counselors',
      'Stress and anxiety management techniques',
      'Self-esteem and confidence building',
      'Emotional regulation and coping strategies',
    ],
  },
  {
    icon: '📖',
    title: 'Academic Support',
    desc: 'Guidance for academic challenges, study strategies, and exam preparation from experienced mentors.',
    details: [
      'Personalized study plans and strategies',
      'Exam preparation and revision techniques',
      'Time management and organization skills',
      'Subject-specific tutoring connections',
    ],
  },
  {
    icon: '🏥',
    title: 'Health Referrals',
    desc: 'Professional referrals to healthcare providers and mental health specialists when needed.',
    details: [
      'Referrals to licensed mental health professionals',
      'Connections with local healthcare providers',
      'Follow-up support after specialist visits',
      'Health education and awareness programs',
    ],
  },
  {
    icon: '👥',
    title: 'Peer Support Groups',
    desc: 'Facilitated group sessions where students share experiences and support one another in a safe space.',
    details: [
      'Weekly facilitated group sessions',
      'Safe and judgment-free environment',
      'Topics include stress, relationships, and academics',
      'Build lasting friendships and support networks',
    ],
  },
];

const stats = [
  { number: '200+', label: 'Students Supported' },
  { number: '15+', label: 'Trained Counselors' },
  { number: '50+', label: 'Group Sessions Held' },
  { number: '95%', label: 'Satisfaction Rate' },
];

export const CounselingPage = defineComponent('CounselingPage', () => {
  return h('div', { class: 'counseling-page' },

    // Hero
    h('section', { class: 'counseling-hero' },
      h('div', { class: 'counseling-hero-image-bg' }),
      h('div', { class: 'counseling-hero-overlay' }),
      h('div', { class: 'counseling-hero-bg' }),
      h('div', { class: 'counseling-hero-content hero-stagger' },
        h('div', { class: 'counseling-badge' },
          h('span', { class: 'counseling-badge-dot' }),
          'C2 SOCIETY',
        ),
        h('h1', { class: 'counseling-hero-title' },
          h('span', { class: 'counseling-hero-icon' }, '🧠'),
          ' Counseling & Referral',
        ),
        h('p', { class: 'counseling-hero-subtitle' },
          'Professional counseling services and referrals for students facing personal or academic challenges. Your wellbeing matters — we\'re here to help.',
        ),
        h('div', { class: 'counseling-hero-actions' },
          h('button', {
            class: 'btn btn-primary btn-lg btn-glow',
            onClick: () => { history.pushState(null, '', '/contact?ref=counseling'); dispatchEvent(new PopStateEvent('popstate')); },
          }, 'Get Support Now →'),
          h('button', {
            class: 'btn btn-outline btn-lg',
            onClick: () => { history.pushState(null, '', '/c2-society'); dispatchEvent(new PopStateEvent('popstate')); },
          }, '← Back to C2 Society'),
        ),
      ),
    ),

    // Emergency CTA
    h('section', { class: 'reveal-scale', style: 'background:rgba(16,185,129,0.06); border-bottom:1px solid rgba(16,185,129,0.15);' },
      h('div', { style: 'max-width:800px; margin:0 auto; padding:24px; display:flex; align-items:center; gap:20px; flex-wrap:wrap; justify-content:center;' },
        h('span', { style: 'font-size:32px;' }, '🆘'),
        h('div', { style: 'flex:1; min-width:200px;' },
          h('strong', { style: 'color:var(--text-primary); display:block; margin-bottom:4px;' }, 'Need Immediate Support?'),
          h('span', { style: 'font-size:14px; color:var(--text-secondary);' }, 'If you or someone you know is in crisis, reach out immediately. All conversations are confidential.'),
        ),
        h('button', {
          class: 'btn btn-primary',
          onClick: () => { history.pushState(null, '', '/contact?ref=counseling'); dispatchEvent(new PopStateEvent('popstate')); },
        }, 'Contact Us Now'),
      ),
    ),

    // Stats
    h('section', { style: 'background:var(--bg-secondary); border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);' },
      h('div', { class: 'stats-row reveal' },
        ...stats.map(s =>
          h('div', { class: 'stat-block' },
            h('div', { class: 'stat-block-number' }, s.number),
            h('div', { class: 'stat-block-label' }, s.label),
          ),
        ),
      ),
    ),

    // Services Grid
    h('section', { class: 'content-section' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, 'OUR SERVICES'),
        h('p', null, 'Comprehensive support for your mental health and academic journey'),
      ),
      h('div', { class: 'counseling-services-grid reveal' },
        ...services.map(s =>
          h('div', { class: 'counseling-service-card card-hover-lift card-shine' },
            h('div', { class: 'counseling-service-header' },
              h('div', { class: 'counseling-service-icon' }, s.icon),
              h('div', null,
                h('h3', { class: 'counseling-service-title' }, s.title),
                h('p', { class: 'counseling-service-desc' }, s.desc),
              ),
            ),
            h('ul', { class: 'counseling-service-features' },
              ...s.details.map(d =>
                h('li', null,
                  h('span', { class: 'counseling-check' }, '✓'),
                  d,
                ),
              ),
            ),
            h('button', {
              class: 'btn btn-outline btn-sm',
              onClick: () => { history.pushState(null, '', '/contact?ref=counseling'); dispatchEvent(new PopStateEvent('popstate')); },
            }, 'Learn More →'),
          ),
        ),
      ),
    ),

    // Our Approach
    h('section', { class: 'content-section', style: 'background:var(--bg-secondary);' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, 'OUR APPROACH'),
        h('p', null, 'How we support students through every challenge'),
      ),
      h('div', { class: 'counseling-steps' },
        h('div', { class: 'counseling-step' },
          h('div', { class: 'counseling-step-number' }, '1'),
          h('h4', null, 'Reach Out'),
          h('p', null, 'Contact us through the website, visit our office, or speak to a teacher or mentor.'),
        ),
        h('div', { class: 'counseling-step-arrow' }, '→'),
        h('div', { class: 'counseling-step' },
          h('div', { class: 'counseling-step-number' }, '2'),
          h('h4', null, 'Initial Assessment'),
          h('p', null, 'A trained counselor will have a confidential conversation to understand your needs.'),
        ),
        h('div', { class: 'counseling-step-arrow' }, '→'),
        h('div', { class: 'counseling-step' },
          h('div', { class: 'counseling-step-number' }, '3'),
          h('h4', null, 'Ongoing Support'),
          h('p', null, 'Receive personalized support through sessions, group meetings, or specialist referrals.'),
        ),
      ),
    ),

    // Testimonial
    h('section', { class: 'content-section' },
      h('div', { style: 'max-width:700px; margin:0 auto; text-align:center;' },
        h('div', { style: 'font-size:48px; margin-bottom:20px;' }, '💬'),
        h('blockquote', {
          style: 'font-size:18px; color:var(--text-primary); line-height:1.8; font-style:italic; margin:0 0 20px;',
        }, '"The counseling team at Hope Hub helped me through one of the toughest times in my academic life. I went from feeling lost to finding my path. I\'m forever grateful."'),
        h('p', {
          style: 'font-size:14px; color:var(--primary); font-weight:700; letter-spacing:1px;',
        }, '— Richmond Student, A/L Batch'),
      ),
    ),

    // CTA
    h('section', { class: 'content-section', style: 'background:var(--bg-secondary);' },
      h('div', { style: 'text-align:center; max-width:600px; margin:0 auto;' },
        h('h2', {
          style: 'font-family:var(--font-display); font-size:28px; font-weight:900; color:var(--text-primary); letter-spacing:2px; margin-bottom:16px;',
        }, 'You\'re Not Alone'),
        h('p', {
          style: 'font-size:16px; color:var(--text-secondary); line-height:1.7; margin-bottom:28px;',
        }, 'Every student faces challenges. What matters is knowing there\'s support available. Reach out to our counseling team — we\'re here for you.'),
        h('div', { style: 'display:flex; gap:12px; justify-content:center; flex-wrap:wrap;' },
          h('button', {
            class: 'btn btn-primary btn-lg btn-glow',
            onClick: () => { history.pushState(null, '', '/contact?ref=counseling'); dispatchEvent(new PopStateEvent('popstate')); },
          }, 'Get Help Today →'),
          h('button', {
            class: 'btn btn-outline btn-lg',
            onClick: () => { history.pushState(null, '', '/resource-map'); dispatchEvent(new PopStateEvent('popstate')); },
          }, '🗺️ Resource Map'),
        ),
      ),
    ),
  );
});
