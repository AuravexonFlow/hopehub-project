/**
 * ═══════════════════════════════════════════════════════════
 *  Resource Map — Directory of Support Services & Contacts
 *  Combined: Resource Map + නව සියලු ආයතන (Government Institutions)
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { createSignal } from '../vortex/signals';
import { nawasAyaluCategories, nawasAyaluTotalContacts, nawasAyaluTotalCategories } from '../data/nawas-ayalu-data';

interface ResourceContact {
  name: string;
  field: string;
  institution?: string;
  address?: string;
  phone?: string;
}

interface ResourceCategory {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  color: string;
  contacts: ResourceContact[];
}

const resourceCategories: ResourceCategory[] = [
  {
    id: 'education-ministry',
    title: 'අධ්‍යාපන අමාත්‍යාංශය',
    titleEn: 'Education Ministry',
    icon: '🏛️',
    color: '#3b82f6',
    contacts: [
      {
        name: 'චන්දිමා රත්නායක මිය',
        field: 'සහකාර අධ්‍යාපන අධ්‍යක්ෂක',
        institution: 'අධ්‍යාපන අමාත්‍යාංශය',
        phone: '071-9443413',
      },
    ],
  },
  {
    id: 'education-dept',
    title: 'අධ්‍යාපන දෙපාර්තමේන්තුව',
    titleEn: 'Education Department',
    icon: '🎓',
    color: '#6366f1',
    contacts: [
      {
        name: 'සහකාර අධ්‍යාපන අධ්‍යක්ෂ රුසිරු මද්දුමහේවාගේ',
        field: 'අධ්‍යාපන',
        institution: 'දකුණුපළාත් අධ්‍යාපන දෙපාර්තමේන්තුව',
        address: 'දකුණු පළාත් අධ්‍යාපන දෙපාර්තමේන්තුව, ගාල්ල',
      },
      {
        name: 'ප්‍රසාංජලී ගමගේ',
        field: 'අධ්‍යාපන',
        institution: 'කලාප අධ්‍යාපන කාර්යාලය, ගාල්ල',
        address: 'කලාප අධ්‍යාපන කාර්යාලය, ගාල්ල',
      },
      {
        name: 'නලින්ද ජයසේකර',
        field: 'අධ්‍යාපන හා උපදේශන',
        institution: 'මනෝ සමාජයීය කළමනාකරණ සම්පත් මධ්‍යස්ථානභාර සහය කළමනාකරු',
        phone: '071-8187035',
      },
    ],
  },
  {
    id: 'nie',
    title: 'ජාතික අධ්‍යාපන ආයතනය',
    titleEn: 'National Institute of Education (NIE)',
    icon: '🏫',
    color: '#8b5cf6',
    contacts: [
      {
        name: 'සහකාර කථිකාචාර්ය, ජී. පී. ඩබ්. ඒ. ප්‍රභාත් මහතා',
        field: 'අධ්‍යාපන',
        institution: 'ජාතික අධ්‍යාපන ආයතනය',
        phone: '071-2095161',
      },
    ],
  },
  {
    id: 'counseling',
    title: 'උපදේශන සේවා',
    titleEn: 'Counseling Services',
    icon: '💬',
    color: '#10b981',
    contacts: [
      {
        name: 'නලින්ද ජයසේකර',
        field: 'අධ්‍යාපන හා උපදේශන',
        institution: 'මනෝ සමාජයීය කළමනාකරණ සම්පත් මධ්‍යස්ථානභාර සහය කළමනාකරු',
        phone: '071-8187035',
      },
    ],
  },
  {
    id: 'psychiatry',
    title: 'මනෝ වෛද්‍ය සේවා',
    titleEn: 'Psychiatry & Mental Health',
    icon: '🧠',
    color: '#ec4899',
    contacts: [
      {
        name: 'විශේෂඥ මනෝ වෛද්‍ය රූබි රූබන් මහතා',
        field: 'විශේෂඥ මනෝ වෛද්‍ය',
        institution: 'ළමා හා නවයොවුන් ඒකකය, කරාපිටිය',
        phone: '071-6865407',
      },
      {
        name: 'වෛද්‍ය සජීවා හේමාලි මහත්මිය',
        field: 'ප්‍රජා සෞඛ්‍ය වෛද්‍ය නිලධාරී',
        institution: 'ජාතික රෝහල, කරාපිටිය',
        phone: '071-4884681',
      },
      {
        name: 'වෛද්‍ය අජන්තා කුමාරි මහත්මිය',
        phone: '071-8026615',
      },
      {
        name: 'විශේෂඥ ළමා මනෝ වෛද්‍ය වසූදා මතගවීර මහත්මිය',
        field: 'විශේෂඥ මනෝ වෛද්‍ය',
        institution: 'ළමා හා නවයොවුන් ඒකකය, කරාපිටිය',
        phone: '077-3697480',
      },
      {
        name: 'වෛද්‍ය සමන්ති අබේසූරිය මහත්මිය',
        field: 'වෛද්‍ය',
        institution: 'ආයති මධ්‍යස්ථානය, ජාතික රෝහල, කරාපිටිය',
        phone: '076-7595445',
      },
    ],
  },
  {
    id: 'health',
    title: 'සෞඛ්‍ය සේවා',
    titleEn: 'Health Services',
    icon: '🏥',
    color: '#ef4444',
    contacts: [
      {
        name: 'වෛද්‍ය සජීවා හේමාලි මහත්මිය',
        field: 'ප්‍රජා සෞඛ්‍ය වෛද්‍ය නිලධාරී',
        institution: 'ජාතික රෝහල, කරාපිටිය',
        phone: '071-4884681',
      },
      {
        name: 'වෛද්‍ය අජන්තා කුමාරි මහත්මිය',
        phone: '071-8026615',
      },
      {
        name: 'විශේෂඥ ළමා මනෝ වෛද්‍ය වසූදා මතගවීර මහත්මිය',
        field: 'විශේෂඥ මනෝ වෛද්‍ය',
        institution: 'ළමා හා නවයොවුන් ඒකකය, ජාතික රෝහල, කරාපිටිය',
        phone: '077-3697480',
      },
      {
        name: 'වෛද්‍ය නදී පී විජේසිංහ මහත්මිය',
        field: 'වෛද්‍ය',
        phone: '070-3003200',
      },
      {
        name: 'විශේෂඥ වෛද්‍ය බී.එච්. යූ. සංජීව මහතා',
        field: 'වෛද්‍ය',
        phone: '077-7569134',
      },
      {
        name: 'වෛද්‍ය සමන්ති අබේසූරිය මහත්මිය',
        field: 'වෛද්‍ය',
        institution: 'ආයති මධ්‍යස්ථානය, ජාතික රෝහල, කරාපිටිය',
        phone: '076-7595445',
      },
      {
        name: 'විශේෂඥ මනෝ වෛද්‍ය රූබි රූබන් මහතා',
        field: 'විශේෂඥ මනෝ වෛද්‍ය',
        institution: 'ළමා හා නවයොවුන් ඒකකය, ජාතික රෝහල, කරාපිටිය',
        phone: '071-6865407',
      },
      {
        name: 'විශේෂඥ වෛද්‍ය, රුහුණු විශ්වවිද්‍යාලයේ කථිකාචාර්ය වර්ෂාද සොයිසා මහත්මිය',
        field: 'වෛද්‍යරැ අධ්‍යාපන',
        institution: 'වෛද්‍ය පීඨය, රුහුණ විශ්වවිද්‍යාලය',
        phone: '077-2014156',
      },
      {
        name: 'වෛද්‍ය රොහාන් ධර්මදාස මහතා',
        field: 'වෛද්‍ය',
        phone: '077-7909662',
      },
      {
        name: 'වෛද්‍ය යූ. එස්. පී සුගතපාල මහතා',
        field: 'වෛද්‍ය',
        phone: '070-2707061',
      },
      {
        name: 'වෛද්‍ය',
        field: 'වෛද්‍ය',
        institution: 'මහජන සෞඛ්‍ය කාර්යාලය, අක්මීමන',
        phone: '077-3583495',
      },
      {
        name: 'වෛද්‍ය සුබෝධි',
        field: 'වෛද්‍ය',
        institution: 'මහජන සෞඛ්‍ය කාර්යාලය, අක්මීමන',
        phone: '071-8055173',
      },
      {
        name: 'වෛද්‍ය අප්සරා',
        field: 'වෛද්‍ය',
        institution: 'මහජන සෞඛ්‍ය කාර්යාලය, හබරාදූව',
        phone: '077-7369718',
      },
      {
        name: 'වෛද්‍ය හේමන්ත',
        field: 'වෛද්‍ය',
        institution: 'මහජන සෞඛ්‍ය කාර්යාලය, උණවටුන',
        phone: '077-2988546',
      },
      {
        name: 'වෛද්‍ය සජීවා හේමන්ති',
        field: 'වෛද්‍ය',
        institution: 'මහජන සෞඛ්‍ය කාර්යාලය, බෝපෙ පෝද්දල',
        phone: '071-4884681',
      },
      {
        name: 'වෛද්‍ය උදයංග',
        field: 'වෛද්‍ය',
        institution: 'මහජන සෞඛ්‍ය කාර්යාලය, බද්දේගම',
        phone: '077-2513690',
      },
      {
        name: 'වෛද්‍ය පවිත්‍රා',
        field: 'වෛද්‍ය',
        institution: 'මහජන සෞඛ්‍ය කාර්යාලය, උණවටුන',
        phone: '077-2671033',
      },
      {
        name: 'වෛද්‍ය බර්ට්‍රම්',
        field: 'වෛද්‍ය',
        institution: 'මහජන සෞඛ්‍ය කාර්යාලය, බද්දේගම',
        phone: '077-2363676',
      },
      {
        name: 'වෛද්‍ය ලසන්ත',
        field: 'වෛද්‍ය',
        institution: 'මහජන සෞඛ්‍ය කාර්යාලය, ගාල්ල',
        phone: '077-7627480',
      },
      {
        name: 'වෛද්‍ය අජන්තා',
        field: 'වෛද්‍ය',
        institution: 'මහජන සෞඛ්‍ය කාර්යාලය, ගාල්ල',
      },
    ],
  },
  {
    id: 'law',
    title: 'නීති සේවා',
    titleEn: 'Legal Services',
    icon: '⚖️',
    color: '#f59e0b',
    contacts: [
      {
        name: 'නීතීඥ කේ. ඩී ඉන්ද්‍රානි මහත්මිය',
        field: 'නීති',
        phone: '077-2681529',
      },
    ],
  },
  {
    id: 'child-protection',
    title: 'ළමා ආරක්ෂණ',
    titleEn: 'Child Protection',
    icon: '🛡️',
    color: '#f97316',
    contacts: [
      {
        name: 'මනෝජි මහත්මිය',
        field: 'ළමා රක්ෂණ නිලධාරි',
        institution: 'ප්‍රාදේශීය ලේකම් කාර්යාලය, ගාල්ල කඩවත්සතර',
        phone: '076-9905065',
      },
      {
        name: 'උපදේශන නිලධාරි',
        field: 'උපදේශන නිලධාරි',
        institution: 'ප්‍රාදේශීය ලේකම් කාර්යාලය, ගාල්ල කඩවත්සතර',
        phone: '077-3583883',
      },
      {
        name: 'ක්‍රිෂ්ණා මිය',
        field: 'සමාජ සේවා නිලධාරි',
        institution: 'ප්‍රාදේශීය ලේකම් කාර්යාලය, ගාල්ල කඩවත්සතර',
        phone: '070-7823486',
      },
      {
        name: 'ශ්‍යාමලි මිය',
        field: 'ළමා රක්ෂණ නිලධාරි',
        institution: 'ප්‍රාදේශීය ලේකම් කාර්යාලය, බෝපෙ පෝද්දල',
        phone: '071-0532196',
      },
    ],
  },
  {
    id: 'social-services',
    title: 'සමාජ සේවා',
    titleEn: 'Social Services',
    icon: '🤝',
    color: '#14b8a6',
    contacts: [
      {
        name: 'ක්‍රිෂ්ණා මිය',
        field: 'සමාජ සේවා නිලධාරි',
        institution: 'ප්‍රාදේශීය ලේකම් කාර්යාලය, ගාල්ල කඩවත්සතර',
        phone: '070-7823486',
      },
    ],
  },
  {
    id: 'career-guidance',
    title: 'වෘත්තීය මාර්ගෝපදේශන',
    titleEn: 'Career Guidance',
    icon: '🎯',
    color: '#a855f7',
    contacts: [
      {
        name: 'නිරෝෂි මිය',
        field: 'වෘත්තීය මාර්ගෝපදේශන නිලධාරී',
        institution: 'ටැල්බට් ටවුම, ගාල්ල',
        phone: '071-0318997',
      },
      {
        name: 'රුවනි මිය',
        field: 'වෘත්තීය මාර්ගෝපදේශන නිලධාරී',
        institution: 'ප්‍රාදේශීය ලේකම් කාර්යාලය, බෝපෙ පෝද්දල',
        phone: '071-5809001',
      },
    ],
  },
];

// ─── Shared category card renderer ─────────────────────────

function renderCategoryCard(cat: { id: string; title: string; titleEn: string; icon: string; color: string; contacts: { name: string; field?: string; institution?: string; address?: string; phone?: string }[] }) {
  return h('div', {
    class: 'card-hover-lift',
    style: `background:var(--bg-card, #fff); border:1px solid var(--border-subtle, rgba(0,0,0,0.08)); border-radius:16px; padding:0; overflow:hidden; transition:transform 0.2s, box-shadow 0.2s;`,
  },
    h('div', {
      style: `background:${cat.color}12; border-bottom:1px solid ${cat.color}22; padding:16px 20px; display:flex; align-items:center; gap:12px;`,
    },
      h('span', { style: `font-size:28px; background:${cat.color}18; width:48px; height:48px; display:flex; align-items:center; justify-content:center; border-radius:12px;` }, cat.icon),
      h('div', null,
        h('h3', { style: 'margin:0; font-size:16px; font-weight:800; color:var(--text-primary); letter-spacing:0.5px;' }, cat.titleEn),
        h('p', { style: 'margin:2px 0 0; font-size:12px; color:var(--text-secondary); opacity:0.8;' }, cat.title),
      ),
      h('span', { style: `margin-left:auto; font-size:12px; font-weight:700; color:${cat.color}; background:${cat.color}12; padding:4px 10px; border-radius:20px;` }, `${cat.contacts.length}`),
    ),
    h('div', { style: 'padding:12px 16px;' },
      ...cat.contacts.map((contact, i) =>
        h('div', {
          style: `padding:12px 4px; ${i < cat.contacts.length - 1 ? 'border-bottom:1px solid var(--border-subtle, rgba(0,0,0,0.06));' : ''}`,
        },
          h('div', { style: 'display:flex; align-items:flex-start; gap:10px;' },
            h('span', { style: 'font-size:16px; margin-top:2px; opacity:0.6;' }, '👤'),
            h('div', { style: 'flex:1; min-width:0;' },
              h('div', {
                style: 'font-size:14px; font-weight:600; color:var(--text-primary); line-height:1.4;',
                title: contact.name,
              }, contact.name),
              contact.field ? h('div', {
                style: `font-size:12px; color:${cat.color}; font-weight:500; margin-top:2px;`,
              }, contact.field) : null,
              contact.institution ? h('div', {
                style: 'font-size:12px; color:var(--text-secondary); margin-top:2px; line-height:1.3;',
              }, contact.institution) : null,
              contact.address ? h('div', {
                style: 'font-size:11px; color:var(--text-secondary); margin-top:2px; opacity:0.7;',
              }, `📍 ${contact.address}`) : null,
              contact.phone ? h('a', {
                href: `tel:${contact.phone.replace(/[^0-9+]/g, '').split(',')[0].trim()}`,
                style: `display:inline-flex; align-items:center; gap:4px; margin-top:6px; font-size:13px; font-weight:600; color:${cat.color}; text-decoration:none; padding:4px 10px; background:${cat.color}10; border-radius:8px; transition:background 0.15s;`,
              }, `📞 ${contact.phone}`) : null,
            ),
          ),
        ),
      ),
    ),
  );
}

// ─── Component ────────────────────────────────────────────

export const ResourceMapPage = defineComponent('ResourceMapPage', () => {
  const activeTab = createSignal<'resource-map' | 'nawas-ayalu'>('resource-map');

  const totalResourceContacts = resourceCategories.reduce((s, c) => s + c.contacts.length, 0);

  function handleTabSwitch(tab: 'resource-map' | 'nawas-ayalu') {
    activeTab.set(tab);
  }

  return h('div', { class: 'resource-map-page' },

    // ── Hero ──
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
          h('span', { class: 'counseling-hero-icon' }, '🗺️'),
          ' සම්පත් පැතිකඩ',
        ),
        h('p', { class: 'counseling-hero-subtitle' },
          'Resource Map — A comprehensive directory of support services, professionals, and government institutions available for Richmond College students and the Galle district community.',
        ),
        h('div', { class: 'counseling-hero-actions' },
          h('button', {
            class: 'btn btn-primary btn-lg btn-glow',
            onClick: () => {
              const el = document.getElementById('resource-content');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            },
          }, 'Browse Resources ↓'),
          h('button', {
            class: 'btn btn-outline btn-lg',
            onClick: () => { history.pushState(null, '', '/c2-society'); dispatchEvent(new PopStateEvent('popstate')); },
          }, '← Back to C2 Society'),
        ),
      ),
    ),

    // ── Stats ──
    h('section', { style: 'background:var(--bg-secondary); border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);' },
      h('div', { class: 'stats-row' },
        h('div', { class: 'stat-block' },
          h('div', { class: 'stat-block-number' }, String(resourceCategories.length + nawasAyaluTotalCategories)),
          h('div', { class: 'stat-block-label' }, 'Service Categories'),
        ),
        h('div', { class: 'stat-block' },
          h('div', { class: 'stat-block-number' }, String(totalResourceContacts + nawasAyaluTotalContacts)),
          h('div', { class: 'stat-block-label' }, 'Resource Contacts'),
        ),
        h('div', { class: 'stat-block' },
          h('div', { class: 'stat-block-number' }, '24/7'),
          h('div', { class: 'stat-block-label' }, 'Emergency Support'),
        ),
        h('div', { class: 'stat-block' },
          h('div', { class: 'stat-block-number' }, 'Free'),
          h('div', { class: 'stat-block-label' }, 'All Services'),
        ),
      ),
    ),

    // ── Tab Navigation + Search ──
    h('section', { id: 'resource-content', class: 'content-section', style: 'padding-bottom:0;' },
      h('div', { style: 'max-width:1200px; margin:0 auto; padding:0 20px;' },
        h('div', { style: 'display:flex; gap:4px; margin-bottom:20px; background:var(--bg-secondary); border-radius:12px; padding:4px; border:1px solid var(--border-subtle);' },
          h('button', {
            class: 'tab-btn',
            style: () => `flex:1; padding:12px 20px; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; transition:all 0.2s; ${activeTab() === 'resource-map' ? 'background:var(--primary); color:#fff; box-shadow:0 2px 8px rgba(99,102,241,0.3);' : 'background:transparent; color:var(--text-secondary);'}`,
            onClick: () => handleTabSwitch('resource-map'),
          }, '🗺️ සම්පත් සිතියම'),
          h('button', {
            class: 'tab-btn',
            style: () => `flex:1; padding:12px 20px; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; transition:all 0.2s; ${activeTab() === 'nawas-ayalu' ? 'background:var(--primary); color:#fff; box-shadow:0 2px 8px rgba(99,102,241,0.3);' : 'background:transparent; color:var(--text-secondary);'}`,
            onClick: () => handleTabSwitch('nawas-ayalu'),
          }, '🏛️ නව සියලු ආයතන'),
        ),

      ),
    ),

    // ── Dynamic Content ──
    h('section', { style: 'padding-top:0;' },
      h('div', { style: 'max-width:1200px; margin:0 auto; padding:0 20px;' },
        h('div', { class: 'section-header reveal', style: 'margin-bottom:24px;' },
          h('h2', null, () => activeTab() === 'resource-map' ? 'SERVICE DIRECTORY' : 'ගාල්ල දිස්ත්\u200dරික් රජයේ ආයතන'),
          h('p', null, () => activeTab() === 'resource-map'
            ? 'සේවා නාමාවලිය — Find the right support for your needs'
            : `Galle District Government Institutions — ${nawasAyaluTotalCategories} categories, ${nawasAyaluTotalContacts} contacts`),
        ),
        h('div', {
          style: 'display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:20px;',
        },
          () => activeTab() === 'resource-map'
            ? resourceCategories.map(cat => renderCategoryCard(cat))
            : [
                h('div', {
                  style: 'grid-column:1/-1; background:linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08)); border:2px dashed rgba(99,102,241,0.3); border-radius:16px; padding:32px 24px; text-align:center;',
                },
                  h('span', { style: 'font-size:48px; display:block; margin-bottom:12px;' }, '🚧'),
                  h('h3', { style: 'margin:0 0 8px; font-size:18px; font-weight:800; color:var(--primary);' }, 'Under Development'),
                  h('p', { style: 'margin:0; font-size:14px; color:var(--text-secondary); line-height:1.6;' },
                    'ගාල්ල දිස්ත්\u200dරික් රජයේ ආයතන දත්ත මේ වන විට සකස් කරමින් පවතී. සම්පත් සිතියම පත්‍රය භාවිතා කරන්න.'
                  ),
                ),
                ...nawasAyaluCategories.map(cat => renderCategoryCard(cat)),
              ],
        ),
      ),
    ),

    // ── Emergency Banner ──
    h('section', { style: 'background:rgba(16,185,129,0.06); border-top:1px solid rgba(16,185,129,0.15);' },
      h('div', { style: 'max-width:800px; margin:0 auto; padding:24px; display:flex; align-items:center; gap:20px; flex-wrap:wrap; justify-content:center;' },
        h('span', { style: 'font-size:32px;' }, '🆘'),
        h('div', { style: 'flex:1; min-width:200px;' },
          h('strong', { style: 'color:var(--text-primary); display:block; margin-bottom:4px;' }, 'Need Immediate Support?'),
          h('span', { style: 'font-size:14px; color:var(--text-secondary);' }, 'If you or someone you know is in crisis, reach out to any of the contacts above or visit the C2 Centre at Richmond College.'),
        ),
        h('button', {
          class: 'btn btn-primary',
          onClick: () => { history.pushState(null, '', '/contact?ref=resource-map'); dispatchEvent(new PopStateEvent('popstate')); },
        }, 'Contact Hope Hub'),
      ),
    ),

    // ── Footer Note ──
    h('section', { class: 'content-section', style: 'background:var(--bg-secondary);' },
      h('div', { style: 'text-align:center; max-width:600px; margin:0 auto;' },
        h('p', {
          style: 'font-size:13px; color:var(--text-secondary); line-height:1.6; opacity:0.7;',
        }, '📋 This resource directory is maintained by the Richmond College Hope Hub & C2 Society. Government institution data sourced from නව සියලු ආයතන 2025. Contact details are updated periodically.'),
      ),
    ),
  );
});
