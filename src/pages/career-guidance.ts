/**
 * ═══════════════════════════════════════════════════════════
 *  Career Guidance — Counseling, Internships, Mentorship
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { createSignal } from '../vortex/signals';
import { Modal } from '../components/modal';
import { getCareerResources, type CareerResource } from '../stores/content-store';

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
  // Signal for selected resource detail modal
  const selectedResource = createSignal<CareerResource | null>(null);
  // Signal for current/past tab toggle
  const showPast = createSignal(false);
  // Signal for full-screen image lightbox
  const lightboxImage = createSignal<string | null>(null);

  // Category metadata
  const catLabels: Record<string, string> = {
    'job': '🏢 Career & Job Opportunities',
    'internship': '💼 Internships',
    'scholarship': '🎓 Scholarships',
    'higher-education': '📚 Higher Education',
    'training': '🔧 Training Programs',
    'general': '📋 General Resources',
  };
  const catColors: Record<string, string> = {
    'job': '#f59e0b',
    'internship': '#8b5cf6',
    'scholarship': '#10b981',
    'higher-education': '#3b82f6',
    'training': '#ef4444',
    'general': '#6b7280',
  };

  return h('div', { class: 'career-page' },

    // ═══ Hero ═══
    h('section', { class: 'career-hero' },
      h('div', { class: 'career-hero-image-bg' }),
      h('div', { class: 'career-hero-overlay' }),
      h('div', { class: 'career-hero-bg' }),
      h('div', { class: 'career-hero-content hero-stagger' },
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

    // ═══ Stats ═══
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

    // ═══ Career Opportunities (Current vs Past) ═══
    (() => {
      const resources = getCareerResources();
      if (resources.length === 0) return null;

      const catOrder = ['job', 'internship', 'scholarship', 'higher-education', 'training', 'general'] as const;

      // Helper: parse deadline string → Date or null
      function parseDeadline(d: string): Date | null {
        if (!d) return null;
        const s = d.trim();
        // Try ISO / standard parse first
        const dt = new Date(s);
        if (!isNaN(dt.getTime())) return dt;
        // Try DD/MM/YYYY or DD-MM-YYYY
        const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
        return null;
      }

      function formatDate(d: string): string {
        if (!d) return '';
        if (/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(d)) return d;
        const dt = new Date(d);
        if (!isNaN(dt.getTime())) return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        return d;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const currentResources: CareerResource[] = [];
      const pastResources: CareerResource[] = [];
      for (const r of resources) {
        // Admin manually marked as expired, OR deadline has passed
        const dl = parseDeadline(r.deadline);
        const deadlinePassed = dl ? dl < today : false;
        if (r.expired || deadlinePassed) pastResources.push(r);
        else currentResources.push(r);
      }

      // Build category-grouped cards for a given list
      function renderResourceCards(list: CareerResource[], isPast: boolean) {
        const grouped = new Map<string, CareerResource[]>();
        for (const r of list) {
          const arr = grouped.get(r.category) || [];
          arr.push(r);
          grouped.set(r.category, arr);
        }
        return h('div', { class: 'cr-categories' },
          ...catOrder
            .filter(cat => grouped.has(cat))
            .map(cat => {
              const items = grouped.get(cat)!;
              const color = catColors[cat] || '#3b82f6';
              return h('div', { class: 'cr-category-block' },
                h('div', { class: 'cr-category-header', style: `--cr-cat-color:${color};` },
                  h('span', { class: 'cr-cat-icon' }, catLabels[cat]?.split(' ')[0] || '📋'),
                  h('span', { class: 'cr-cat-name' }, catLabels[cat]?.split(' ').slice(1).join(' ') || cat),
                  h('span', { class: 'cr-cat-count' }, `${items.length}`),
                ),
                h('div', { class: `cr-grid${isPast ? ' cr-grid-past' : ''}` },
                  ...items.map(res => {
                    const resColor = res.color || color;
                    return h('div', {
                      class: `cr-card${isPast ? ' cr-card-past' : ''}`,
                      style: `--cr-accent:${resColor};`,
                      onClick: () => { selectedResource.set(res); },
                    },
                      h('div', { class: 'cr-card-accent' }),
                      res.image_url ? h('div', {
                        class: 'cr-card-image-wrap',
                        onClick: (e: Event) => { e.stopPropagation(); lightboxImage.set(res.image_url); },
                        style: 'cursor:zoom-in;',
                      },
                        h('img', { src: res.image_url, alt: res.title, class: 'cr-card-image', loading: 'lazy' }),
                        h('div', { class: 'cr-card-image-zoom' }, '🔍'),
                      ) : null,
                      h('div', { class: 'cr-card-body' },
                        h('div', { class: 'cr-card-top' },
                          h('span', { class: 'cr-card-icon' }, res.icon),
                          h('span', { class: 'cr-card-badge', style: `color:${resColor}; background:${resColor}15;` },
                            catLabels[cat]?.split(' ').slice(1).join(' ') || cat,
                          ),
                        ),
                        h('h3', { class: 'cr-card-title' }, res.title),
                        res.description ? h('p', { class: 'cr-card-desc' }, res.description) : null,
                        h('div', { class: 'cr-card-meta' },
                          res.location ? h('span', { class: 'cr-meta-item' }, `📍 ${res.location}`) : null,
                          res.deadline ? h('span', { class: 'cr-meta-item' }, `⏰ ${formatDate(res.deadline)}`) : null,
                          res.contact_info ? h('span', { class: 'cr-meta-item' }, `📞 ${res.contact_info}`) : null,
                        ),
                        h('div', { class: 'cr-card-footer' },
                          h('span', { class: 'cr-view-btn', style: `color:${resColor};` }, isPast ? 'View Details →' : 'View Details →'),
                          isPast ? h('span', { class: 'cr-expired-tag' }, '⏰ Expired') : (res.featured ? h('span', { class: 'cr-featured-tag' }, '⭐ Featured') : null),
                        ),
                      ),
                    );
                  }),
                ),
              );
            }),
        );
      }

      return h('section', { class: 'content-section cr-section' },
        h('div', { class: 'section-header reveal' },
          h('div', { class: 'cr-header-row' },
            h('h2', { class: 'cr-section-title' }, 'CAREER OPPORTUNITIES'),
            h('span', { class: 'cr-updated-badge' }, '✨ UPDATED'),
          ),
          h('p', null, 'Latest career opportunities, internships, and higher education pathways — updated regularly'),
        ),
        // Tab toggle
        h('div', { class: 'cr-tabs' },
          h('button', {
            class: `cr-tab${!showPast() ? ' cr-tab-active' : ''}`,
            onClick: () => { showPast.set(false); },
          },
            h('span', null, '🟢'),
            ` Currently Available (${currentResources.length})`,
          ),
          pastResources.length > 0 ? h('button', {
            class: `cr-tab${showPast() ? ' cr-tab-active' : ''}`,
            onClick: () => { showPast.set(true); },
          },
            h('span', null, '⚫'),
            ` Past Opportunities (${pastResources.length})`,
          ) : null,
        ),
        // Reactive content — swaps between current and past
        () => showPast()
          ? (pastResources.length > 0
            ? renderResourceCards(pastResources, true)
            : h('div', { class: 'cr-empty' }, 'No past opportunities'))
          : renderResourceCards(currentResources, false),
        // ─── Resource Detail Modal (reactive function child) ───
        () => {
          const res = selectedResource();
          if (!res) return null;
          const color = res.color || catColors[res.category] || '#3b82f6';
          return h(Modal, {
              open: true,
              title: res.title || 'Resource Details',
              size: 'lg',
              onClose: () => { selectedResource.set(null); },
            },
            h('div', { class: 'cr-modal-content' },
              // Image
              res.image_url ? h('div', {
                class: 'cr-modal-image-wrap',
                onClick: () => { lightboxImage.set(res.image_url); },
                style: 'cursor:zoom-in;',
              },
                h('img', { src: res.image_url, alt: res.title, class: 'cr-modal-image' }),
                h('div', { class: 'cr-modal-image-zoom-hint' }, '🔍 Click to view full size'),
              ) : null,
              // Info
              h('div', { class: 'cr-modal-info' },
                h('div', { class: 'cr-modal-badges' },
                  h('span', { class: 'cr-modal-badge', style: `color:${color}; background:${color}15; border:1px solid ${color}30;` },
                    catLabels[res.category]?.split(' ').slice(1).join(' ') || res.category,
                  ),
                  res.featured ? h('span', { class: 'cr-modal-badge cr-featured-badge' }, '⭐ Featured') : null,
                ),
                res.description ? h('p', { class: 'cr-modal-desc' }, res.description) : null,
                // Detail rows
                h('div', { class: 'cr-modal-details' },
                  res.location ? h('div', { class: 'cr-modal-detail-row' },
                    h('span', { class: 'cr-modal-detail-label' }, '📍 Location'),
                    h('span', { class: 'cr-modal-detail-value' }, res.location),
                  ) : null,
                  res.deadline ? h('div', { class: 'cr-modal-detail-row' },
                    h('span', { class: 'cr-modal-detail-label' }, '⏰ Deadline'),
                    h('span', { class: 'cr-modal-detail-value' }, formatDate(res.deadline)),
                  ) : null,
                  res.contact_info ? h('div', { class: 'cr-modal-detail-row' },
                    h('span', { class: 'cr-modal-detail-label' }, '📞 Contact'),
                    h('span', { class: 'cr-modal-detail-value' }, res.contact_info),
                  ) : null,
                  h('div', { class: 'cr-modal-detail-row' },
                    h('span', { class: 'cr-modal-detail-label' }, '📂 Category'),
                    h('span', { class: 'cr-modal-detail-value' }, catLabels[res.category] || res.category),
                  ),
                ),
                // Actions
                res.link_url ? h('div', { class: 'cr-modal-actions' },
                  h('a', {
                    href: res.link_url,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    class: 'btn btn-primary btn-glow',
                    style: `background:${color}; border-color:${color};`,
                  }, 'Open Resource ↗'),
                ) : null,
              ),
            ),
          );
        },
      );
    })(),

    // ═══ Programs Grid ═══
    h('section', { class: 'content-section' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, 'OUR PROGRAMS'),
        h('p', null, 'Comprehensive career support to help you find your path'),
      ),
      h('div', { class: 'career-programs-grid' },
        ...programs.map(p =>
          h('div', { class: 'career-program-card card-hover-lift card-shine' },
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

    // ═══ NIE Career Assessments ═══
    h('section', { class: 'content-section', style: 'background:var(--bg-secondary);' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, 'CAREER ASSESSMENTS'),
        h('p', null, 'Take official career tests from the National Institute of Education (NIE) Sri Lanka to discover your strengths and ideal career path'),
      ),
      h('div', { class: 'career-tests-grid' },
        ...nieTests.map(t =>
          h('div', { class: 'career-test-card card-hover-lift card-shine', style: `--test-accent:${t.color}` },
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

    // ═══ Industries ═══
    h('section', { class: 'content-section', style: 'background:var(--bg-secondary);' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, 'INDUSTRIES WE COVER'),
        h('p', null, 'Our alumni mentors and partners span a wide range of professional fields'),
      ),
      h('div', { class: 'career-industries-grid' },
        ...industries.map(ind =>
          h('div', { class: 'career-industry-card card-hover-lift' },
            h('div', { class: 'career-industry-icon' }, ind.icon),
            h('div', { class: 'career-industry-name' }, ind.name),
          ),
        ),
      ),
    ),

    // ═══ How It Works ═══
    h('section', { class: 'content-section' },
      h('div', { class: 'section-header reveal' },
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

    // ═══ CTA ═══
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

    // ═══ Full-Screen Image Lightbox ═══
    () => {
      const imgSrc = lightboxImage();
      if (!imgSrc) return null;
      return h('div', {
        class: 'cr-lightbox-overlay',
        onClick: () => { lightboxImage.set(null); },
      },
        h('div', { class: 'cr-lightbox-close' }, '✕'),
        h('img', {
          src: imgSrc,
          class: 'cr-lightbox-image',
          onClick: (e: Event) => { e.stopPropagation(); },
        }),
      );
    },
  );
});
