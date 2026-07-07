/**
 * ═══════════════════════════════════════════════════════════
 *  Career Guidance — Counseling, Internships, Mentorship
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';

const programs = [
  {
    icon: '🎯',
    title: 'Career Counseling',
    desc: 'One-on-one sessions to help students identify strengths, interests, and potential career paths.',
    details: [
      'Personalized career assessment and profiling',
      'Strengths identification and skill mapping',
      'Career pathway planning for O/L and A/L students',
      'University and course selection guidance',
    ],
  },
  {
    icon: '🏢',
    title: 'Internship Connections',
    desc: 'Partnerships with local businesses and organizations to provide real-world work experience.',
    details: [
      'Partnerships with 20+ local businesses',
      'Summer and term-time internship placements',
      'Work experience in healthcare, tech, law, and more',
      'Internship preparation and resume workshops',
    ],
  },
  {
    icon: '👨‍🏫',
    title: 'Alumni Mentorship',
    desc: 'Connect with Richmond alumni working in diverse fields for guidance and inspiration.',
    details: [
      'One-on-one mentorship with Richmond alumni',
      'Alumni spanning medicine, engineering, law, arts, and tech',
      'Monthly mentorship meetups and check-ins',
      'Long-term career guidance and networking',
    ],
  },
  {
    icon: '🎤',
    title: 'Industry Talks',
    desc: 'Regular sessions featuring professionals from medicine, law, engineering, tech, and the arts.',
    details: [
      'Monthly guest speaker sessions',
      'Professionals from 10+ industries',
      'Q&A and interactive workshops',
      'Exposure to emerging career fields',
    ],
  },
];

const stats = [
  { number: '20+', label: 'Partner Organizations' },
  { number: '50+', label: 'Internships Placed' },
  { number: '30+', label: 'Alumni Mentors' },
  { number: '15+', label: 'Industries Covered' },
];

const industries = [
  { icon: '⚕️', name: 'Medicine' },
  { icon: '⚖️', name: 'Law' },
  { icon: '🔧', name: 'Engineering' },
  { icon: '💻', name: 'Technology' },
  { icon: '🎨', name: 'Arts & Design' },
  { icon: '📊', name: 'Business' },
  { icon: '🔬', name: 'Research' },
  { icon: '📚', name: 'Education' },
];

const nieTests = [
  {
    icon: '🎯',
    title: 'Career Interest Test',
    desc: 'Discover your interests and find careers that align with what you enjoy doing.',
    details: [
      'Based on Prof. James Athanasou\'s career interest theory',
      'Identifies your interests to guide career decisions',
      'Helps with Grade 9 bucket subject selection',
      'Available in Sinhala, Tamil, and English',
    ],
    url: 'https://guidance.nie.ac.lk/ctest/moreinfo1.html',
    color: '#3b82f6',
  },
  {
    icon: '🔑',
    title: 'Career Key Test',
    desc: 'Identify your personality type and find work environments that suit you best.',
    details: [
      'Based on Prof. John Holland\'s career development theory',
      'A/L විශය තෝරා ගැනීම / A-Level subject selection',
      'වෘත්තිය තෝරාගැනීම / Career path selection',
      'SWOT analysis සඳහා පරීක්ෂණය / SWOT analysis assessment',
    ],
    url: 'https://guidance.nie.ac.lk/ctest/moreinfo2.html',
    color: '#8b5cf6',
  },
  {
    icon: '🧠',
    title: 'Multiple Intelligence Test',
    desc: 'Understand your natural strengths, learning style, and intelligence type.',
    details: [
      'Based on Prof. Howard Gardner\'s Multiple Intelligence theory',
      'Assesses 8 types of intelligence',
      'Identify your learning methods / තමට ගැලපෙන පාඩම් මතක තබා ගැනීමේ ක්‍රමය හඳුනා ගැනීම',
      'Helps discover your preferred study & memory techniques',
    ],
    url: 'https://guidance.nie.ac.lk/ctest/moreinfo3.html',
    color: '#10b981',
  },
  {
    icon: '📊',
    title: 'Career Aptitude & Interest Assessment',
    desc: 'Comprehensive assessment combining aptitude and interest evaluation for career planning.',
    details: [
      'Based on John Holland\'s career choice theory',
      'Evaluates both interests and aptitudes together',
      'Maps personality to 16 career fields',
      'Provides detailed career field recommendations',
    ],
    url: 'https://guidance.nie.ac.lk/ctest/moreinfo4.html',
    color: '#f59e0b',
  },
  {
    icon: '🧩',
    title: 'Interest, Ability & Personality Assessment',
    desc: 'A comprehensive evaluation combining interest, ability, and personality traits for career planning.',
    details: [
      'Based on John Holland\'s career choice theory',
      'Evaluates interests across people, data, materials & ideas',
      'හැකියාවට හා ලැදියාවට අදාල ක්‍රීඩා හඳුනා ගැනීම / Identify sports matching your ability & interest',
      'විෂය සමගාමී ක්‍රියාකාරකම් හඳුනා ගැනීම / Identify subject-co-curricular activities',
    ],
    url: 'https://guidance.nie.ac.lk/ctest/moreinfo5.html',
    color: '#ec4899',
  },
];

export const CareerGuidancePage = defineComponent('CareerGuidancePage', () => {
  return h('div', { class: 'career-page' },

    // Hero
    h('section', { class: 'career-hero' },
      h('div', { class: 'career-hero-image-bg' }),
      h('div', { class: 'career-hero-overlay' }),
      h('div', { class: 'career-hero-bg' }),
      h('div', { class: 'career-hero-content' },
        h('div', { class: 'career-badge' },
          h('span', { class: 'career-badge-dot' }),
          'C2 SOCIETY',
        ),
        h('h1', { class: 'career-hero-title' },
          h('span', { class: 'career-hero-icon' }, '🎯'),
          ' Career Guidance',
        ),
        h('p', { class: 'career-hero-subtitle' },
          'Career counseling, internship connections, and mentorship from Richmond alumni in diverse fields. Helping you discover your path and achieve your dreams.',
        ),
        h('div', { class: 'career-hero-actions' },
          h('button', {
            class: 'btn btn-primary btn-lg btn-glow',
            onClick: () => { history.pushState(null, '', '/contact?ref=career-guidance'); dispatchEvent(new PopStateEvent('popstate')); },
          }, 'Explore Opportunities →'),
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

    // Programs Grid
    h('section', { class: 'content-section' },
      h('div', { class: 'section-header' },
        h('h2', null, 'OUR PROGRAMS'),
        h('p', null, 'Comprehensive career support to help you find your path'),
      ),
      h('div', { class: 'career-programs-grid' },
        ...programs.map(p =>
          h('div', { class: 'career-program-card' },
            h('div', { class: 'career-program-header' },
              h('div', { class: 'career-program-icon' }, p.icon),
              h('div', null,
                h('h3', { class: 'career-program-title' }, p.title),
                h('p', { class: 'career-program-desc' }, p.desc),
              ),
            ),
            h('ul', { class: 'career-program-features' },
              ...p.details.map(d =>
                h('li', null,
                  h('span', { class: 'career-check' }, '✓'),
                  d,
                ),
              ),
            ),
            h('button', {
              class: 'btn btn-outline btn-sm',
              onClick: () => { history.pushState(null, '', '/contact?ref=career-guidance'); dispatchEvent(new PopStateEvent('popstate')); },
            }, 'Learn More →'),
          ),
        ),
      ),
    ),

    // NIE Career Assessments
    h('section', { class: 'content-section', style: 'background:var(--bg-secondary);' },
      h('div', { class: 'section-header' },
        h('h2', null, 'CAREER ASSESSMENTS'),
        h('p', null, 'Take official career tests from the National Institute of Education (NIE) Sri Lanka to discover your strengths and ideal career path'),
      ),
      h('div', { class: 'career-tests-grid' },
        ...nieTests.map(t =>
          h('div', { class: 'career-test-card', style: `--test-accent:${t.color}` },
            h('div', { class: 'career-test-header' },
              h('div', { class: 'career-test-icon' }, t.icon),
              h('div', null,
                h('h3', { class: 'career-test-title' }, t.title),
                h('p', { class: 'career-test-desc' }, t.desc),
              ),
            ),
            h('ul', { class: 'career-test-features' },
              ...t.details.map(d =>
                h('li', null,
                  h('span', { class: 'career-check' }, '✓'),
                  d,
                ),
              ),
            ),
            h('div', { class: 'career-test-actions' },
              h('a', {
                href: t.url,
                target: '_blank',
                rel: 'noopener noreferrer',
                class: 'btn btn-primary btn-sm btn-glow',
              }, 'Take Test →'),
              h('a', {
                href: t.url,
                target: '_blank',
                rel: 'noopener noreferrer',
                class: 'btn btn-outline btn-sm',
              }, 'Learn More'),
            ),
          ),
        ),
      ),
      h('p', {
        style: 'text-align:center; margin-top:24px; font-size:13px; color:var(--text-muted); font-style:italic;',
      }, 'Provided by the Guidance & Counselling Unit, National Institute of Education, Sri Lanka'),
    ),

    // Industries
    h('section', { class: 'content-section', style: 'background:var(--bg-secondary);' },
      h('div', { class: 'section-header' },
        h('h2', null, 'INDUSTRIES WE COVER'),
        h('p', null, 'Our alumni mentors and partners span a wide range of professional fields'),
      ),
      h('div', { class: 'career-industries-grid' },
        ...industries.map(ind =>
          h('div', { class: 'career-industry-card' },
            h('div', { class: 'career-industry-icon' }, ind.icon),
            h('div', { class: 'career-industry-name' }, ind.name),
          ),
        ),
      ),
    ),

    // How It Works
    h('section', { class: 'content-section' },
      h('div', { class: 'section-header' },
        h('h2', null, 'HOW IT WORKS'),
        h('p', null, 'Your journey from student to professional starts here'),
      ),
      h('div', { class: 'career-steps' },
        h('div', { class: 'career-step' },
          h('div', { class: 'career-step-number' }, '1'),
          h('h4', null, 'Discover'),
          h('p', null, 'Take a career assessment from NIE Sri Lanka and explore different fields that match your interests and strengths.'),
        ),
        h('div', { class: 'career-step-arrow' }, '→'),
        h('div', { class: 'career-step' },
          h('div', { class: 'career-step-number' }, '2'),
          h('h4', null, 'Connect'),
          h('p', null, 'Get matched with an alumni mentor and explore internship opportunities in your field of interest.'),
        ),
        h('div', { class: 'career-step-arrow' }, '→'),
        h('div', { class: 'career-step' },
          h('div', { class: 'career-step-number' }, '3'),
          h('h4', null, 'Grow'),
          h('p', null, 'Gain real-world experience through internships, attend industry talks, and build your professional network.'),
        ),
      ),
    ),

    // CTA
    h('section', { class: 'content-section', style: 'background:var(--bg-secondary);' },
      h('div', { style: 'text-align:center; max-width:600px; margin:0 auto;' },
        h('h2', {
          style: 'font-family:var(--font-display); font-size:28px; font-weight:900; color:var(--text-primary); letter-spacing:2px; margin-bottom:16px;',
        }, 'Ready to Find Your Path?'),
        h('p', {
          style: 'font-size:16px; color:var(--text-secondary); line-height:1.7; margin-bottom:28px;',
        }, 'Whether you dream of becoming a doctor, engineer, artist, or entrepreneur — we\'re here to help you get there. Start your career journey today.'),
        h('button', {
          class: 'btn btn-primary btn-lg btn-glow',
          onClick: () => { history.pushState(null, '', '/contact?ref=career-guidance'); dispatchEvent(new PopStateEvent('popstate')); },
        }, 'Get Started →'),
      ),
    ),
  );
});
