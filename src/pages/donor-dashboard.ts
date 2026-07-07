/**
 * ═══════════════════════════════════════════════════════════
 *  Donor Dashboard — Personalized view for donors
 *  Shows impact stats, active requests, donation history,
 *  and interest status
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { createSignal } from '../vortex/signals';
import { currentUser } from '../services/auth';
import { currentProfile } from '../services/profiles';
import {
  getOpenRequests, getDonationCategories, getDonations,
  getAllTransactions, getDonorInterests, type DonationRequest, type DonationTransaction
} from '../stores/content-store';

interface DonorInterest {
  id: string;
  request_id: string;
  request_title: string;
  category_id: string;
  donor_name: string;
  donor_email: string | null;
  donor_phone: string | null;
  message: string | null;
  interest_type: string;
  estimated_amount: number;
  estimated_items: string | null;
  status: string;
  admin_response: string | null;
  created_at: string;
}

export const DonorDashboardPage = defineComponent('DonorDashboardPage', () => {
  const user = currentUser.peek();
  const profile = currentProfile.peek();
  const requests = getOpenRequests();
  const categories = getDonations();
  const transactions = getAllTransactions();
  const interests = createSignal<DonorInterest[]>([]);
  const loading = createSignal(true);

  // Load donor interests from Supabase
  const loadInterests = async () => {
    try {
      const user = currentUser.peek();
      const result = await getDonorInterests(user?.id);
      interests.set(result as DonorInterest[]);
    } catch (err) {
      console.warn('[DonorDashboard] Failed to load interests:', err);
    }
    loading.set(false);
  };
  loadInterests();

  // Compute donor-specific stats
  const myDonations = transactions.filter(t =>
    t.type === 'received' && t.status === 'confirmed'
  );
  const myPending = transactions.filter(t =>
    t.type === 'received' && t.status === 'pending'
  );
  const totalDonated = myDonations.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalItems = myDonations.reduce((sum, t) => sum + (parseInt(t.quantity || '0') || 0), 0);

  const name = profile?.full_name || user?.user_metadata?.full_name || 'Donor';
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return h('div', { class: 'donor-dashboard' },
    // ─── Welcome Hero ───
    h('div', { class: 'donor-welcome' },
      h('div', { class: 'donor-welcome-content' },
        h('h1', { class: 'donor-welcome-title' },
          `${greeting}, `,
          h('span', { class: 'gradient-text' }, name),
          ' 👋',
        ),
        h('p', { class: 'donor-welcome-sub' },
          'Welcome to your Hope Hub dashboard. Here\'s your impact at a glance.',
        ),
      ),
      h('div', { class: 'donor-welcome-actions' },
        h('a', {
          href: '/donation-request',
          class: 'donor-btn donor-btn-primary',
          onClick: (e: Event) => {
            e.preventDefault();
            window.history.pushState(null, '', '/donation-request');
            window.dispatchEvent(new PopStateEvent('popstate'));
          },
        }, '💝 Browse Requests'),
      ),
    ),

    // ─── Impact Stats ───
    h('div', { class: 'donor-stats-grid' },
      h('div', { class: 'donor-stat-card' },
        h('div', { class: 'donor-stat-icon' }, '💝'),
        h('div', { class: 'donor-stat-info' },
          h('span', { class: 'donor-stat-value' }, `${myDonations.length}`),
          h('span', { class: 'donor-stat-label' }, 'Confirmed Donations'),
        ),
      ),
      h('div', { class: 'donor-stat-card' },
        h('div', { class: 'donor-stat-icon' }, '💰'),
        h('div', { class: 'donor-stat-info' },
          h('span', { class: 'donor-stat-value' }, `LKR ${totalDonated.toLocaleString()}`),
          h('span', { class: 'donor-stat-label' }, 'Total Contributed'),
        ),
      ),
      h('div', { class: 'donor-stat-card' },
        h('div', { class: 'donor-stat-icon' }, '📦'),
        h('div', { class: 'donor-stat-info' },
          h('span', { class: 'donor-stat-value' }, `${totalItems}`),
          h('span', { class: 'donor-stat-label' }, 'Items Donated'),
        ),
      ),
      h('div', { class: 'donor-stat-card' },
        h('div', { class: 'donor-stat-icon' }, '🤝'),
        h('div', { class: 'donor-stat-info' },
          h('span', { class: 'donor-stat-value' }, `${interests.peek().length}`),
          h('span', { class: 'donor-stat-label' }, 'Interests Expressed'),
        ),
      ),
    ),

    // ─── Active Requests ───
    h('div', { class: 'donor-section' },
      h('div', { class: 'donor-section-header' },
        h('h2', { class: 'donor-section-title' }, '🎯 Active Requests'),
        h('a', {
          href: '/donation-request',
          class: 'donor-section-link',
          onClick: (e: Event) => {
            e.preventDefault();
            window.history.pushState(null, '', '/donation-request');
            window.dispatchEvent(new PopStateEvent('popstate'));
          },
        }, 'View All →'),
      ),
      requests.length > 0
        ? h('div', { class: 'donor-requests-grid' },
            ...requests.slice(0, 4).map(req => {
              const cat = categories.find(c => c.id === req.categoryId);
              const qtyPct = req.targetQuantity > 0 ? Math.min(100, Math.round(req.fulfilledQuantity / req.targetQuantity * 100)) : 0;
              const urgencyColors: Record<string, string> = {
                Critical: '#e02040', High: '#f0a000', Medium: '#0090d0', Low: '#00a050'
              };
              return h('div', { class: 'donor-request-card' },
                h('div', { class: 'donor-req-card-header' },
                  h('span', { class: 'donor-req-card-icon' }, cat?.icon || '💝'),
                  h('div', { class: 'donor-req-card-badges' },
                    h('span', {
                      class: 'donor-req-urgency',
                      style: `color: ${urgencyColors[req.urgency] || '#888'}`,
                    }, req.urgency),
                    h('span', { class: 'donor-req-deadline' }, `📅 ${req.deadline}`),
                  ),
                ),
                h('h3', { class: 'donor-req-card-title' }, req.title),
                h('p', { class: 'donor-req-card-desc' }, req.description.slice(0, 120) + '...'),
                h('div', { class: 'donor-req-progress' },
                  h('div', { class: 'donor-req-progress-row' },
                    h('span', null, '📦 Items'),
                    h('span', null, `${req.fulfilledQuantity} / ${req.targetQuantity}`),
                  ),
                  h('div', { class: 'donor-req-bar' },
                    h('div', { class: 'donor-req-bar-fill', style: `width: ${qtyPct}%` }),
                  ),
                ),
                h('div', { class: 'donor-req-card-footer' },
                  h('span', { class: 'donor-req-contact' }, `👤 ${req.contactName}`),
                  h('button', {
                    class: 'donor-req-donate-btn',
                    onClick: () => {
                      window.history.pushState(null, '', '/donation-request');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    },
                  }, '💝 Donate'),
                ),
              );
            }),
          )
        : h('div', { class: 'donor-empty-state' },
            h('div', { class: 'donor-empty-icon' }, '🎯'),
            h('p', null, 'No active donation requests at the moment.'),
            h('p', { class: 'donor-empty-hint' }, 'Check back soon — new requests are added regularly.'),
          ),
    ),

    // ─── My Interests ───
    h('div', { class: 'donor-section' },
      h('div', { class: 'donor-section-header' },
        h('h2', { class: 'donor-section-title' }, '🤝 My Interests'),
      ),
      loading.peek()
        ? h('div', { class: 'donor-loading' }, 'Loading...')
        : interests.peek().length > 0
          ? h('div', { class: 'donor-interests-list' },
              ...interests.peek().map((int: DonorInterest) => {
                const statusColors: Record<string, string> = {
                  new: '#0090d0', contacted: '#f0a000', in_progress: '#8b5cf6',
                  converted: '#00a050', closed: '#888',
                };
                const statusLabels: Record<string, string> = {
                  new: '⏳ Pending', contacted: '📞 Contacted', in_progress: '🔄 In Progress',
                  converted: '✅ Completed', closed: '🔒 Closed',
                };
                return h('div', { class: 'donor-interest-card' },
                  h('div', { class: 'donor-interest-header' },
                    h('h3', { class: 'donor-interest-title' }, int.request_title),
                    h('span', {
                      class: 'donor-interest-status',
                      style: `background: ${statusColors[int.status] || '#888'}20; color: ${statusColors[int.status] || '#888'}; border: 1px solid ${statusColors[int.status] || '#888'}40;`,
                    }, statusLabels[int.status] || int.status),
                  ),
                  h('div', { class: 'donor-interest-meta' },
                    h('span', null, `📅 ${new Date(int.created_at).toLocaleDateString()}`),
                    h('span', null, `🤝 ${int.interest_type === 'general' ? 'General' : int.interest_type === 'items' ? 'Items' : int.interest_type === 'cash' ? 'Cash' : 'Items + Cash'}`),
                    int.estimated_amount > 0 ? h('span', null, `💰 LKR ${int.estimated_amount.toLocaleString()}`) : null,
                  ),
                  int.message ? h('p', { class: 'donor-interest-message' }, `"${int.message}"`) : null,
                  int.admin_response ? h('div', { class: 'donor-interest-response' },
                    h('span', { class: 'donor-interest-response-label' }, '💬 Admin Response:'),
                    h('p', null, int.admin_response),
                  ) : null,
                );
              }),
            )
          : h('div', { class: 'donor-empty-state' },
              h('div', { class: 'donor-empty-icon' }, '🤝'),
              h('p', null, 'You haven\'t expressed interest in any requests yet.'),
              h('p', { class: 'donor-empty-hint' }, 'Browse active requests and click "I\'m Interested" to let us know how you can help.'),
            ),
    ),

    // ─── Pending Donations ───
    myPending.length > 0 ? h('div', { class: 'donor-section' },
      h('div', { class: 'donor-section-header' },
        h('h2', { class: 'donor-section-title' }, '⏳ Pending Confirmations'),
      ),
      h('div', { class: 'donor-pending-list' },
        ...myPending.map(tx => {
          const cat = categories.find(c => c.id === tx.categoryId);
          return h('div', { class: 'donor-pending-card' },
            h('div', { class: 'donor-pending-icon' }, cat?.icon || '💝'),
            h('div', { class: 'donor-pending-info' },
              h('span', { class: 'donor-pending-items' }, tx.items),
              h('span', { class: 'donor-pending-date' }, tx.date),
            ),
            tx.amount ? h('span', { class: 'donor-pending-amount' }, `LKR ${tx.amount.toLocaleString()}`) : null,
            h('span', { class: 'donor-pending-status' }, '⏳ Pending Review'),
          );
        }),
      ),
    ) : null,

    // ─── Community Impact ───
    h('div', { class: 'donor-section' },
      h('div', { class: 'donor-section-header' },
        h('h2', { class: 'donor-section-title' }, '🌍 Community Impact'),
      ),
      h('div', { class: 'donor-impact-grid' },
        ...getDonations().slice(0, 4).map(cat => {
          const pct = cat.goal > 0 ? Math.min(100, Math.round(cat.raised / cat.goal * 100)) : 0;
          return h('div', { class: 'donor-impact-card' },
            h('div', { class: 'donor-impact-icon' }, cat.icon),
            h('h3', { class: 'donor-impact-title' }, cat.title),
            h('div', { class: 'donor-impact-bar-wrap' },
              h('div', { class: 'donor-impact-bar-fill', style: `width: ${pct}%; background: ${cat.color};` }),
            ),
            h('div', { class: 'donor-impact-amounts' },
              h('span', null, `LKR ${cat.raised.toLocaleString()} raised`),
              h('span', null, `Goal: LKR ${cat.goal.toLocaleString()}`),
            ),
            h('span', { class: 'donor-impact-pct' }, `${pct}%`),
          );
        }),
      ),
    ),
  );
});
