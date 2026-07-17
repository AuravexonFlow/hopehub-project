/**
 * ═══════════════════════════════════════════════════════════
 *  Donations — Public Transparency Page
 *  Recent donations, received & distributed, best donors
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { createSignal } from '../vortex/signals';
import {
  getAllTransactions,
  getDonationCategories,
  donationDataVersion,
  type DonationTransaction,
  type DonationCategory,
} from '../stores/content-store';

/* ── Helpers ────────────────────────────────────────────── */

function fmtDate(d: string): string {
  if (!d) return '';
  if (/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(d)) return d;
  const dt = new Date(d);
  if (!isNaN(dt.getTime())) return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  return d;
}

function fmtAmount(a?: number): string {
  if (!a) return '';
  return 'Rs. ' + a.toLocaleString('en-LK');
}

function timeAgo(d: string): string {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '';
  const diff = Date.now() - dt.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function isToday(d: string): boolean {
  const dt = new Date(d);
  const now = new Date();
  return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth() && dt.getDate() === now.getDate();
}

function isThisWeek(d: string): boolean {
  const dt = new Date(d);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return dt >= startOfWeek;
}

function isThisMonth(d: string): boolean {
  const dt = new Date(d);
  const now = new Date();
  return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
}

/* ── Best Donor Computation ─────────────────────────────── */

interface DonorStat {
  name: string;
  totalAmount: number;
  donationCount: number;
  latestDate: string;
  items: string[];
}

function computeBestDonors(transactions: DonationTransaction[], filter: (d: string) => boolean): DonorStat[] {
  const map = new Map<string, DonorStat>();
  for (const tx of transactions) {
    if (tx.type !== 'received') continue;
    if (!filter(tx.date)) continue;
    const key = tx.contactName.trim();
    if (!key) continue;
    const existing = map.get(key);
    if (existing) {
      existing.totalAmount += tx.amount || 0;
      existing.donationCount++;
      if (tx.date > existing.latestDate) existing.latestDate = tx.date;
      if (tx.items) existing.items.push(tx.items);
    } else {
      map.set(key, {
        name: key,
        totalAmount: tx.amount || 0,
        donationCount: 1,
        latestDate: tx.date,
        items: tx.items ? [tx.items] : [],
      });
    }
  }
  return [...map.values()].sort((a, b) => b.totalAmount - a.totalAmount || b.donationCount - a.donationCount);
}

function computeOverallBestDonors(transactions: DonationTransaction[]): DonorStat[] {
  return computeBestDonors(transactions, () => true);
}

/* ── Leaderboard Card ───────────────────────────────────── */

function renderLeaderboard(title: string, icon: string, donors: DonorStat[], emptyMsg: string) {
  const top3 = donors.slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];
  const medalColors = ['#fbbf24', '#94a3b8', '#cd7f32'];

  return h('div', { class: 'dono-leaderboard card-hover-lift' },
    h('div', { class: 'dono-lb-header' },
      h('span', { class: 'dono-lb-icon' }, icon),
      h('h3', { class: 'dono-lb-title' }, title),
    ),
    top3.length === 0
      ? h('div', { class: 'dono-lb-empty' }, emptyMsg)
      : h('div', { class: 'dono-lb-list' },
          ...top3.map((d, i) =>
            h('div', {
              class: `dono-lb-entry ${i === 0 ? 'dono-lb-gold' : ''}`,
              style: `--medal-color: ${medalColors[i] || 'transparent'}`,
            },
              h('div', { class: 'dono-lb-rank' }, medals[i] || `${i + 1}`),
              h('div', { class: 'dono-lb-info' },
                h('div', { class: 'dono-lb-name' }, d.name),
                h('div', { class: 'dono-lb-meta' },
                  `${d.donationCount} donation${d.donationCount > 1 ? 's' : ''}`,
                  d.totalAmount > 0 ? ` · ${fmtAmount(d.totalAmount)}` : '',
                ),
              ),
            ),
          ),
        ),
  );
}

/* ── Donation Card ──────────────────────────────────────── */

function renderDonationCard(tx: DonationTransaction, cat: DonationCategory | undefined) {
  const isReceived = tx.type === 'received';
  return h('div', {
    class: `dono-card card-hover-lift ${isReceived ? 'dono-card-received' : 'dono-card-distributed'}`,
  },
    h('div', { class: 'dono-card-badge-row' },
      h('span', {
        class: `dono-card-type-badge ${isReceived ? 'badge-received' : 'badge-distributed'}`,
      }, isReceived ? '↙ Received' : '↗ Distributed'),
      h('span', { class: 'dono-card-time' }, timeAgo(tx.date || tx.created_at)),
    ),
    h('div', { class: 'dono-card-body' },
      isReceived
        ? h('div', { class: 'dono-card-donor-row' },
            h('span', { class: 'dono-card-donor-icon' }, '🤝'),
            h('span', { class: 'dono-card-donor-name' }, tx.contactName),
          )
        : null,
      h('div', { class: 'dono-card-items' },
        h('span', { class: 'dono-card-items-icon' }, cat?.icon || '📦'),
        h('span', null, tx.items),
      ),
      tx.amount
        ? h('div', { class: 'dono-card-amount' }, fmtAmount(tx.amount))
        : null,
    ),
    h('div', { class: 'dono-card-footer' },
      h('span', { class: 'dono-card-date' }, '📅 ' + fmtDate(tx.date)),
      cat ? h('span', { class: 'dono-card-cat' }, cat.title) : null,
    ),
  );
}

/* ── Main Page Component ────────────────────────────────── */

export const DonationsPage = defineComponent('DonationsPage', () => {
  const activeTab = createSignal<'all' | 'received' | 'distributed'>('all');
  const lbPeriod = createSignal<'daily' | 'weekly' | 'monthly' | 'overall'>('overall');
  const visibleCount = createSignal<number>(12);

  // Reactive refresh trigger
  donationDataVersion.peek();

  const allTx = getAllTransactions();
  const categories = getDonationCategories();

  const received = allTx.filter(t => t.type === 'received');
  const distributed = allTx.filter(t => t.type === 'distributed');
  const totalReceived = received.reduce((s, t) => s + (t.amount || 0), 0);
  const totalDistributed = distributed.reduce((s, t) => s + (t.amount || 0), 0);
  const uniqueDonors = new Set(received.map(t => t.contactName.trim())).size;

  // Best donors
  const dailyDonors = computeBestDonors(allTx, isToday);
  const weeklyDonors = computeBestDonors(allTx, isThisWeek);
  const monthlyDonors = computeBestDonors(allTx, isThisMonth);
  const overallDonors = computeOverallBestDonors(allTx);

  function getFilteredTx(): DonationTransaction[] {
    const tab = activeTab.peek();
    if (tab === 'received') return received;
    if (tab === 'distributed') return distributed;
    return allTx;
  }

  function getLbData(): { title: string; icon: string; donors: DonorStat[]; empty: string } {
    const period = lbPeriod.peek();
    if (period === 'daily') return { title: 'Today\'s Best Donor', icon: '☀️', donors: dailyDonors, empty: 'No donations today yet' };
    if (period === 'weekly') return { title: 'This Week\'s Best Donor', icon: '📅', donors: weeklyDonors, empty: 'No donations this week yet' };
    if (period === 'monthly') return { title: 'This Month\'s Best Donor', icon: '🗓️', donors: monthlyDonors, empty: 'No donations this month yet' };
    return { title: 'All-Time Best Donors', icon: '🏆', donors: overallDonors, empty: 'No donations recorded yet' };
  }

  function renderGrid() {
    const grid = document.querySelector('.dono-grid');
    const loadMoreWrap = document.querySelector('.dono-load-more');
    if (!grid) return;
    const filtered = getFilteredTx();
    const limit = visibleCount.peek();
    const visible = filtered.slice(0, limit);
    grid.innerHTML = '';
    if (filtered.length === 0) {
      grid.appendChild(
        h('div', { class: 'dono-empty' },
          h('span', { class: 'dono-empty-icon' }, '📭'),
          h('p', null, 'No donations in this category yet.'),
        ).el as HTMLElement,
      );
    } else {
      visible.forEach(tx => {
        const cat = categories.find(c => c.id === tx.categoryId);
        grid.appendChild(renderDonationCard(tx, cat).el as HTMLElement);
      });
    }
    // Load More button
    if (loadMoreWrap) {
      loadMoreWrap.innerHTML = '';
      if (filtered.length > limit) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline btn-load-more';
        btn.textContent = `Load More (${filtered.length - limit} remaining)`;
        btn.onclick = () => {
          visibleCount.set(visibleCount.peek() + 12);
          renderGrid();
        };
        loadMoreWrap.appendChild(btn);
      }
    }
  }

  const tabItems = [
    { key: 'all' as const, label: 'All Donations', icon: '📋', count: allTx.length },
    { key: 'received' as const, label: 'Received', icon: '↙', count: received.length },
    { key: 'distributed' as const, label: 'Distributed', icon: '↗', count: distributed.length },
  ];

  const lbPeriods = [
    { key: 'daily' as const, label: 'Daily', icon: '☀️' },
    { key: 'weekly' as const, label: 'Weekly', icon: '📅' },
    { key: 'monthly' as const, label: 'Monthly', icon: '🗓️' },
    { key: 'overall' as const, label: 'Overall', icon: '🏆' },
  ];

  // Build the reactive DOM
  const page = h('div', { class: 'dono-page' },

    // ── Hero ──
    h('section', { class: 'dono-hero' },
      h('div', { class: 'dono-hero-bg' }),
      h('div', { class: 'dono-hero-overlay' }),
      h('div', { class: 'dono-hero-content hero-stagger' },
        h('div', { class: 'dono-badge' },
          h('span', { class: 'dono-badge-dot' }),
          'TRANSPARENCY',
        ),
        h('h1', { class: 'dono-hero-title' },
          h('span', { class: 'dono-hero-icon' }, '💝'),
          ' Donations',
        ),
        h('p', { class: 'dono-hero-subtitle' },
          'Full transparency on every donation received and distributed. See where the generosity goes and who\'s making a difference.',
        ),
      ),
    ),

    // ── Stats Row ──
    h('section', { class: 'dono-stats-section' },
      h('div', { class: 'dono-stats-row reveal' },
        h('div', { class: 'dono-stat-block' },
          h('div', { class: 'dono-stat-icon' }, '🎁'),
          h('div', { class: 'dono-stat-number' }, String(allTx.length)),
          h('div', { class: 'dono-stat-label' }, 'Total Donations'),
        ),
        h('div', { class: 'dono-stat-block' },
          h('div', { class: 'dono-stat-icon' }, '🤝'),
          h('div', { class: 'dono-stat-number' }, String(uniqueDonors)),
          h('div', { class: 'dono-stat-label' }, 'Unique Donors'),
        ),
        h('div', { class: 'dono-stat-block' },
          h('div', { class: 'dono-stat-icon' }, '↙'),
          h('div', { class: 'dono-stat-number' }, String(received.length)),
          h('div', { class: 'dono-stat-label' }, 'Received'),
          totalReceived > 0 ? h('div', { class: 'dono-stat-sub' }, fmtAmount(totalReceived)) : null,
        ),
        h('div', { class: 'dono-stat-block' },
          h('div', { class: 'dono-stat-icon' }, '↗'),
          h('div', { class: 'dono-stat-number' }, String(distributed.length)),
          h('div', { class: 'dono-stat-label' }, 'Distributed'),
          totalDistributed > 0 ? h('div', { class: 'dono-stat-sub' }, fmtAmount(totalDistributed)) : null,
        ),
      ),
    ),

    // ── Best Donor Leaderboard ──
    h('section', { class: 'content-section' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, '🏆 BEST DONORS'),
        h('p', null, 'Recognizing the most generous contributors'),
      ),

      // Period toggle
      h('div', { class: 'dono-lb-tabs reveal' },
        ...lbPeriods.map(p =>
          h('button', {
            class: `dono-lb-tab ${lbPeriod.peek() === p.key ? 'active' : ''}`,
            'data-period': p.key,
            onClick: () => {
              lbPeriod.set(p.key);
              // Update active state
              document.querySelectorAll('.dono-lb-tab').forEach(el => {
                el.classList.toggle('active', (el as HTMLElement).dataset.period === p.key);
              });
              // Re-render leaderboard
              const container = document.querySelector('.dono-lb-container');
              if (container) {
                const data = getLbData();
                container.innerHTML = '';
                container.appendChild(renderLeaderboard(data.title, data.icon, data.donors, data.empty).el as HTMLElement);
              }
            },
          }, `${p.icon} ${p.label}`),
        ),
      ),

      // Leaderboard container
      h('div', { class: 'dono-lb-container reveal' },
        (() => {
          const data = getLbData();
          return renderLeaderboard(data.title, data.icon, data.donors, data.empty);
        })(),
      ),
    ),

    // ── Recent Donations ──
    h('section', { class: 'content-section', style: 'background: var(--bg-secondary);' },
      h('div', { class: 'section-header reveal' },
        h('h2', null, '📋 RECENT DONATIONS'),
        h('p', null, 'Every contribution tracked and displayed'),
      ),

      // Tab bar
      h('div', { class: 'dono-tabs reveal' },
        ...tabItems.map(t =>
          h('button', {
            class: `dono-tab ${activeTab.peek() === t.key ? 'active' : ''}`,
            'data-tab': t.key,
            onClick: () => {
              activeTab.set(t.key);
              visibleCount.set(12);
              document.querySelectorAll('.dono-tab').forEach(el => {
                el.classList.toggle('active', (el as HTMLElement).dataset.tab === t.key);
              });
              renderGrid();
            },
          },
            h('span', { class: 'dono-tab-icon' }, t.icon),
            t.label,
            h('span', { class: 'dono-tab-count' }, String(t.count)),
          ),
        ),
      ),

      // Donations grid
      h('div', { class: 'dono-grid reveal' },
        ...(() => {
          const filtered = getFilteredTx();
          const visible = filtered.slice(0, 12);
          if (filtered.length === 0) {
            return [h('div', { class: 'dono-empty' },
              h('span', { class: 'dono-empty-icon' }, '📭'),
              h('p', null, 'No donations in this category yet.'),
            )];
          }
          return visible.map(tx => {
            const cat = categories.find(c => c.id === tx.categoryId);
            return renderDonationCard(tx, cat);
          });
        })(),
      ),

      // Load More
      h('div', { class: 'dono-load-more' },
        allTx.length > 12
          ? (() => {
              const btn = h('button', {
                class: 'btn btn-outline btn-load-more',
                onClick: () => {
                  visibleCount.set(visibleCount.peek() + 12);
                  renderGrid();
                },
              }, `Load More (${allTx.length - 12} remaining)`);
              return btn;
            })()
          : null,
      ),
    ),

    // ── CTA ──
    h('section', { class: 'content-section' },
      h('div', { class: 'dono-cta reveal' },
        h('h2', { class: 'dono-cta-title' }, 'Want to Make a Difference?'),
        h('p', { class: 'dono-cta-desc' },
          'Every donation counts. Join our community of generous donors and help Richmond students thrive.',
        ),
        h('div', { class: 'dono-cta-actions' },
          h('button', {
            class: 'btn btn-primary btn-lg btn-glow',
            onClick: () => { history.pushState(null, '', '/donation-request'); dispatchEvent(new PopStateEvent('popstate')); },
          }, 'View Active Requests →'),
          h('button', {
            class: 'btn btn-outline btn-lg',
            onClick: () => { history.pushState(null, '', '/contact?ref=donations'); dispatchEvent(new PopStateEvent('popstate')); },
          }, 'Contact Us'),
        ),
      ),
    ),
  );

  return page;
});
