/**
 * ═══════════════════════════════════════════════════════════
 *  C2 Society — Student-led community for Richmond College
 *  Leadership, Debate, Civic Engagement, Resources
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { getCurrentSpotlightStudent, getBestC2Students, c2StudentsVersion } from '../stores/content-store';

const pillars = [
  {
    icon: '🏛️',
    title: 'Leadership Development',
    desc: 'Building tomorrow\'s leaders through workshops, student government, and hands-on community projects that develop confidence and decision-making skills.',
    features: ['Student Council Programs', 'Leadership Workshops', 'Community Project Management', 'Public Speaking Training'],
  },
  {
    icon: '💬',
    title: 'Debate & Discourse',
    desc: 'Cultivating critical thinking and articulate expression through structured debates, Model UN, and inter-school competitions.',
    features: ['Inter-School Debate League', 'Model United Nations', 'Critical Thinking Seminars', 'Oxford-Style Debates'],
  },
  {
    icon: '🤝',
    title: 'Civic Engagement',
    desc: 'Connecting students with their community through volunteer programs, social awareness campaigns, and civic responsibility initiatives.',
    features: ['Community Volunteering', 'Social Impact Campaigns', 'Environmental Awareness', 'Civic Responsibility Programs'],
  },
];

const educationResources = [
  { icon: '📚', title: 'Textbook Library', desc: 'Access a shared collection of textbooks and reference materials for all subjects and grade levels.' },
  { icon: '💻', title: 'Digital Learning Hub', desc: 'Computer labs, online course access, and digital literacy programs for the modern student.' },
  { icon: '🎓', title: 'Scholarship Portal', desc: 'Discover and apply for scholarships from local and international institutions supporting Richmond students.' },
  { icon: '📐', title: 'STEM Resources', desc: 'Science kits, math tools, and engineering project supplies for hands-on STEM education.' },
];

const counselingServices = [
  { icon: '🧠', title: 'Personal Counseling', desc: 'Confidential one-on-one sessions with trained counselors to support mental health and emotional wellbeing.' },
  { icon: '📖', title: 'Academic Support', desc: 'Guidance for academic challenges, study strategies, and exam preparation from experienced mentors.' },
  { icon: '🏥', title: 'Health Referrals', desc: 'Professional referrals to healthcare providers and mental health specialists when needed.' },
  { icon: '👥', title: 'Peer Support Groups', desc: 'Facilitated group sessions where students share experiences and support one another in a safe space.' },
];

const careerPrograms = [
  { icon: '🎯', title: 'Career Counseling', desc: 'One-on-one sessions to help students identify strengths, interests, and potential career paths.' },
  { icon: '🏢', title: 'Internship Connections', desc: 'Partnerships with local businesses and organizations to provide real-world work experience.' },
  { icon: '👨‍🏫', title: 'Alumni Mentorship', desc: 'Connect with Richmond alumni working in diverse fields for guidance and inspiration.' },
  { icon: '🎤', title: 'Industry Talks', desc: 'Regular sessions featuring professionals from medicine, law, engineering, tech, and the arts.' },
];

const upcomingEvents = [
  { date: 'Jul 15, 2026', title: 'C2 Society Launch Event', desc: 'Inaugural ceremony with guest speakers, student performances, and the unveiling of this year\'s programs.' },
  { date: 'Jul 22, 2026', title: 'Inter-School Debate Championship', desc: 'Richmond hosts schools from across the Southern Province for a two-day debate tournament.' },
  { date: 'Aug 05, 2026', title: 'Career Fair & Alumni Meet', desc: 'Annual career fair featuring Richmond alumni from 20+ professional fields.' },
  { date: 'Aug 15, 2026', title: 'Community Volunteer Day', desc: 'A day of service where C2 Society members give back to the Galle community.' },
];

const teamMembers = [
  { name: 'Student President', role: 'C2 Society Chair', avatar: '👤' },
  { name: 'Vice President', role: 'Programs & Events', avatar: '👤' },
  { name: 'Secretary', role: 'Communications', avatar: '👤' },
  { name: 'Treasurer', role: 'Finance & Resources', avatar: '👤' },
];

export const C2SocietyPage = defineComponent('C2SocietyPage', () => {
  return h('div', { class: 'c2-page' },

    // ─── Hero Section ───────────────────────────────────
    h('section', { class: 'c2-hero' },
      h('div', { class: 'c2-hero-image-bg' }),
      h('div', { class: 'c2-hero-overlay' }),
      h('div', { class: 'c2-hero-bg' },
        h('div', { class: 'c2-hero-grid' }),
      ),
      h('div', { class: 'c2-hero-content hero-stagger' },
        h('img', { src: '/c2-society-logo.png', alt: 'C2 Society Logo', class: 'c2-hero-logo' }),
        h('div', { class: 'c2-badge' },
          h('span', { class: 'c2-badge-dot' }),
          'RICHMOND COLLEGE, GALLE',
        ),
        h('h1', { class: 'c2-hero-title' },
          h('span', { class: 'c2-title-accent' }, 'C²'),
          ' Society',
        ),
        h('p', { class: 'c2-hero-subtitle' },
          'A student-led community fostering leadership, debate, and civic engagement among Richmond students. Empowering the next generation of leaders, thinkers, and changemakers.',
        ),
        h('div', { class: 'c2-hero-actions' },
          h('button', {
            class: 'btn btn-primary btn-lg btn-glow',
          onClick: () => { history.pushState(null, '', '/contact?ref=c2-society'); dispatchEvent(new PopStateEvent('popstate')); },
          }, 'Join C2 Society →'),
          h('button', {
            class: 'btn btn-outline btn-lg',
            onClick: () => {
              const el = document.querySelector('.c2-pillars');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            },
          }, 'Explore Programs'),
        ),
        h('div', { class: 'c2-hero-stats' },
          h('div', { class: 'c2-stat' },
            h('span', { class: 'c2-stat-number' }, '3'),
            h('span', { class: 'c2-stat-label' }, 'Core Pillars'),
          ),
          h('div', { class: 'c2-stat' },
            h('span', { class: 'c2-stat-number' }, '12+'),
            h('span', { class: 'c2-stat-label' }, 'Programs'),
          ),
          h('div', { class: 'c2-stat' },
            h('span', { class: 'c2-stat-number' }, '100+'),
            h('span', { class: 'c2-stat-label' }, 'Student Members'),
          ),
        ),
      ),
    ),

    // ─── Three Pillars ──────────────────────────────────
    h('section', { class: 'c2-pillars content-section' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, 'OUR THREE PILLARS'),
        h('p', null, 'The foundation of C2 Society — developing well-rounded student leaders'),
      ),
      h('div', { class: 'c2-pillars-grid reveal' },
        ...pillars.map(p =>
          h('div', { class: 'c2-pillar-card card-hover-lift card-shine' },
            h('div', { class: 'c2-pillar-icon' }, p.icon),
            h('h3', { class: 'c2-pillar-title' }, p.title),
            h('p', { class: 'c2-pillar-desc' }, p.desc),
            h('ul', { class: 'c2-pillar-features' },
              ...p.features.map(f =>
                h('li', null,
                  h('span', { class: 'c2-check' }, '✓'),
                  f,
                ),
              ),
            ),
          ),
        ),
      ),
    ),

    // ─── Resource Map ──────────────────────────────────
    h('section', { class: 'content-section', style: 'background:var(--bg-secondary);' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, '\u{1F5FA}\uFE0F RESOURCE MAP'),
        h('p', null, '\u0DC3\u0DB8\u0DCA\u0DB4\u0DAD\u0DCA \u0DC3\u0DD2\u0DAD\u0DD2\u0BAE\u0BAE\u0DCA — Directory of support services, health professionals, legal aid, and career guidance contacts for students'),
      ),
      h('div', { style: 'text-align:center; max-width:600px; margin:0 auto;' },
        h('p', {
          style: 'font-size:15px; color:var(--text-secondary); line-height:1.7; margin-bottom:24px;',
        }, 'Access a comprehensive directory of Education Ministry, Counseling, Psychiatry, Health, Legal, Child Protection, Social Services, and Career Guidance contacts available to Richmond College students.'),
        h('button', {
          class: 'btn btn-primary btn-lg btn-glow',
          onClick: () => { history.pushState(null, '', '/resource-map'); dispatchEvent(new PopStateEvent('popstate')); },
        }, 'Browse Resource Map \u2192'),
      ),
    ),

    // ─── Education Resources ────────────────────────────
    h('section', { class: 'c2-education content-section' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, '📖 EDUCATION RESOURCES'),
        h('p', null, 'Access to textbooks, digital learning materials, and scholarship opportunities for academic excellence'),
      ),
      h('div', { class: 'c2-resources-grid reveal' },
        ...educationResources.map(r =>
          h('div', { class: 'c2-resource-card card-hover-lift card-shine' },
            h('div', { class: 'c2-resource-icon' }, r.icon),
            h('h4', { class: 'c2-resource-title' }, r.title),
            h('p', { class: 'c2-resource-desc' }, r.desc),
          ),
        ),
      ),
      h('div', { style: 'text-align:center; margin-top:32px;' },
        h('button', {
          class: 'btn btn-primary btn-lg',
          onClick: () => { history.pushState(null, '', '/education-resources'); dispatchEvent(new PopStateEvent('popstate')); },
        }, 'Explore Education Resources →'),
      ),
    ),

    // ─── Counseling & Referral ──────────────────────────
    h('section', { class: 'c2-counseling content-section', style: 'background:var(--bg-secondary);' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, '🧠 COUNSELING & REFERRAL'),
        h('p', null, 'Professional counseling services and referrals for students facing personal or academic challenges'),
      ),
      h('div', { class: 'c2-resources-grid reveal' },
        ...counselingServices.map(r =>
          h('div', { class: 'c2-resource-card c2-resource-card--counseling card-hover-lift' },
            h('div', { class: 'c2-resource-icon' }, r.icon),
            h('h4', { class: 'c2-resource-title' }, r.title),
            h('p', { class: 'c2-resource-desc' }, r.desc),
          ),
        ),
      ),
      h('div', { class: 'c2-cta-box' },
        h('div', { class: 'c2-cta-icon' }, '🆘'),
        h('div', null,
          h('h4', { class: 'c2-cta-title' }, 'Need Immediate Support?'),
          h('p', { class: 'c2-cta-desc' }, 'If you or someone you know is struggling, reach out to our counseling team. All conversations are confidential.'),
        ),
        h('button', {
          class: 'btn btn-primary',
          onClick: () => { history.pushState(null, '', '/counseling'); dispatchEvent(new PopStateEvent('popstate')); },
        }, 'Explore Counseling Services →'),
      ),
    ),

    // ─── Career Guidance ────────────────────────────────
    h('section', { class: 'c2-career content-section' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, '🎯 CAREER GUIDANCE'),
        h('p', null, 'Career counseling, internship connections, and mentorship from Richmond alumni in diverse fields'),
      ),
      h('div', { class: 'c2-resources-grid reveal' },
        ...careerPrograms.map(r =>
          h('div', { class: 'c2-resource-card c2-resource-card--career card-hover-lift' },
            h('div', { class: 'c2-resource-icon' }, r.icon),
            h('h4', { class: 'c2-resource-title' }, r.title),
            h('p', { class: 'c2-resource-desc' }, r.desc),
          ),
        ),
      ),
      h('div', { style: 'text-align:center; margin-top:32px;' },
        h('button', {
          class: 'btn btn-primary btn-lg',
          onClick: () => { history.pushState(null, '', '/career-guidance'); dispatchEvent(new PopStateEvent('popstate')); },
        }, 'Explore Career Guidance →'),
      ),
    ),

    // ─── Upcoming Events ────────────────────────────────
    h('section', { class: 'c2-events content-section', style: 'background:var(--bg-secondary);' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, 'UPCOMING EVENTS'),
        h('p', null, 'Mark your calendar — exciting programs ahead'),
      ),
      h('div', { class: 'c2-events-list reveal' },
        ...upcomingEvents.map(ev =>
          h('div', { class: 'c2-event-card card-hover-lift' },
            h('div', { class: 'c2-event-date' }, ev.date),
            h('div', { class: 'c2-event-info' },
              h('h4', { class: 'c2-event-title' }, ev.title),
              h('p', { class: 'c2-event-desc' }, ev.desc),
            ),
          ),
        ),
      ),
    ),

    // ─── Leadership Team ────────────────────────────────
    h('section', { class: 'c2-team content-section' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, 'LEADERSHIP TEAM'),
        h('p', null, 'Student leaders driving C2 Society forward'),
      ),
      h('div', { class: 'c2-team-grid reveal' },
        ...teamMembers.map(m =>
          h('div', { class: 'c2-team-card card-hover-lift' },
            h('div', { class: 'c2-team-avatar' }, m.avatar),
            h('h4', { class: 'c2-team-name' }, m.name),
            h('p', { class: 'c2-team-role' }, m.role),
          ),
        ),
      ),
    ),

    // ─── Best C2 Student — Monthly Spotlight ──────────────
    (() => {
      c2StudentsVersion.peek(); // reactive trigger
      const current = getCurrentSpotlightStudent();
      const recent = getBestC2Students().slice(0, 3);
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      if (!current) return h('section', { class: 'c2-spotlight-section content-section', style: 'background:var(--bg-secondary);' },
        h('div', { class: 'section-header reveal' },
          h('h2', null, '⭐ BEST C2 STUDENT'),
          h('p', null, 'Monthly spotlight recognizing outstanding C2 Society members'),
        ),
        h('div', { class: 'c2-spotlight-empty' },
          h('span', { style: 'font-size:48px;display:block;margin-bottom:12px;' }, '🌟'),
          h('p', { style: 'color:var(--text-muted);' }, 'No spotlight student selected yet.'),
        ),
      );

      return h('section', { class: 'c2-spotlight-section content-section', style: 'background:var(--bg-secondary);' },
        h('div', { class: 'section-header reveal' },
          h('h2', null, '⭐ BEST C2 STUDENT'),
          h('p', null, 'Monthly spotlight recognizing outstanding C2 Society members'),
        ),

        // Featured spotlight card
        h('div', { class: 'c2-spotlight-card reveal' },
          h('div', { class: 'c2-spotlight-glow' }),
          h('div', { class: 'c2-spotlight-badge' },
            h('span', { class: 'c2-spotlight-badge-dot' }),
            `${monthNames[current.spotlightMonth - 1]} ${current.spotlightYear} Spotlight`,
          ),
          h('div', { class: 'c2-spotlight-content' },
            h('div', { class: 'c2-spotlight-avatar' },
              current.photoUrl
                ? h('img', { src: current.photoUrl, alt: current.studentName, class: 'c2-spotlight-photo' })
                : h('span', { class: 'c2-spotlight-avatar-fallback' }, '⭐'),
            ),
            h('div', { class: 'c2-spotlight-info' },
              h('h3', { class: 'c2-spotlight-name' }, current.studentName),
              h('span', { class: 'c2-spotlight-grade' }, current.grade),
              h('div', { class: 'c2-spotlight-achievement' },
                h('span', { class: 'c2-spotlight-trophy' }, '🏆'),
                h('span', null, current.achievement),
              ),
              h('p', { class: 'c2-spotlight-desc' }, current.description),
            ),
          ),
        ),

        // Past spotlights
        recent.length > 1
          ? h('div', { class: 'c2-past-spotlights reveal' },
              h('h3', { class: 'c2-past-title' }, '📅 Past Spotlights'),
              h('div', { class: 'c2-past-grid' },
                ...recent.filter(s => s.id !== current.id).slice(0, 2).map(s =>
                  h('div', { class: 'c2-past-card card-hover-lift' },
                    h('div', { class: 'c2-past-month' }, `${monthNames[s.spotlightMonth - 1]} ${s.spotlightYear}`),
                    h('div', { class: 'c2-past-name' }, s.studentName),
                    h('div', { class: 'c2-past-achievement' },
                      h('span', null, '🏆'),
                      s.achievement,
                    ),
                    h('div', { class: 'c2-past-grade' }, s.grade),
                  ),
                ),
              ),
            )
          : null,
      );
    })(),

    // ─── Handbooks ─────────────────────────────────────
    h('section', { class: 'c2-handbooks content-section', style: 'background:var(--bg-secondary);' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, '📖 C2 CENTRE HANDBOOKS'),
        h('p', null, 'Download the official C2 Centre Handbook in your preferred language'),
      ),
      h('div', { class: 'c2-handbooks-grid reveal' },
        h('div', { class: 'c2-handbook-card card-hover-lift' },
          h('div', { class: 'c2-handbook-icon' }, '📄'),
          h('h4', { class: 'c2-handbook-title' }, 'English'),
          h('p', { class: 'c2-handbook-desc' }, 'C2 Centre Handbook — English Edition'),
          h('a', { class: 'c2-handbook-btn', href: '/c2/C2-Center-Handbook-English.pdf', target: '_blank', download: '', 'data-external': '' }, '⬇ Download PDF'),
        ),
        h('div', { class: 'c2-handbook-card card-hover-lift' },
          h('div', { class: 'c2-handbook-icon' }, '📄'),
          h('h4', { class: 'c2-handbook-title' }, 'සිංහල'),
          h('p', { class: 'c2-handbook-desc' }, 'C2 Centre Handbook — සිංහල සංස්කරණය'),
          h('a', { class: 'c2-handbook-btn', href: '/c2/C2-Center-Handbook-Sinhala.pdf', target: '_blank', download: '', 'data-external': '' }, '⬇ Download PDF'),
        ),
        h('div', { class: 'c2-handbook-card card-hover-lift' },
          h('div', { class: 'c2-handbook-icon' }, '📄'),
          h('h4', { class: 'c2-handbook-title' }, 'தமிழ்'),
          h('p', { class: 'c2-handbook-desc' }, 'C2 Centre Handbook — தமிழ் பதிப்பு'),
          h('a', { class: 'c2-handbook-btn', href: '/c2/C2-Center-Handbook-Tamil.pdf', target: '_blank', download: '', 'data-external': '' }, '⬇ Download PDF'),
        ),
      ),
    ),

    // ─── Join CTA ───────────────────────────────────────
    h('section', { class: 'c2-join content-section' },
      h('div', { class: 'c2-join-content' },
        h('h2', null, 'Ready to Make a Difference?'),
        h('p', null, 'Join C2 Society and be part of a community that\'s shaping the future of Richmond College. Whether you\'re passionate about debate, leadership, or community service — there\'s a place for you.'),
        h('div', { class: 'c2-join-actions' },
          h('button', {
            class: 'btn btn-primary btn-lg btn-glow',
          onClick: () => { history.pushState(null, '', '/contact?ref=c2-society'); dispatchEvent(new PopStateEvent('popstate')); },
        }, 'Join C2 Society →'),
          h('button', {
            class: 'btn btn-outline btn-lg',
            onClick: () => { history.pushState(null, '', '/events?ref=c2-society'); dispatchEvent(new PopStateEvent('popstate')); },
          }, 'View All Events'),
        ),
      ),
    ),
  );
});
