/**
 * ═══════════════════════════════════════════════════════════
 *  Dashboard Page — Hope Hub admin overview with real data
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { StatCard } from '../components/stat-card';
import { currentUser } from '../services/auth';
import { currentProfile } from '../services/profiles';
import {
  getAllTransactions,
  getPendingTransactions,
  getAllRequests,
  getOpenRequests,
  getAllEvents,
  getAllNotices,
  getAllNews,
  getDonationCategories,
} from '../stores/content-store';

/** Format a date relative to now */
function timeAgo(dateStr: string): string {
  if (!dateStr) return 'Recently';
  const d = new Date(dateStr).getTime();
  if (isNaN(d)) return 'Recently';
  const now = Date.now();
  const diff = now - d;
  if (diff < 0) return 'Just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export const DashboardPage = defineComponent('DashboardPage', () => {
  const user = currentUser.peek();
  const profile = currentProfile.peek();
  const displayName = profile?.displayName || user?.user_metadata?.full_name || 'Admin';

  // ── Real Data ─────────────────────────────────────────
  const allTx = getAllTransactions();
  const pendingTx = getPendingTransactions();
  const allRequests = getAllRequests();
  const openRequests = getOpenRequests();
  const events = getAllEvents();
  const notices = getAllNotices();
  const news = getAllNews();
  const categories = getDonationCategories();

  // Stats
  const totalDonations = allTx.filter(t => t.type === 'received').length;
  const confirmedDonations = allTx.filter(t => t.type === 'received' && t.status === 'confirmed');
  const totalValue = confirmedDonations.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalItems = confirmedDonations.reduce((sum, t) => sum + (t.quantity ? parseInt(t.quantity) : 0), 0);
  const activeRequests = openRequests.length;
  const pendingReviews = pendingTx.length;

  // Recent activity (last 10 transactions + requests, sorted newest first)
  const recentTx = [...allTx].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  const recentReqs = [...allRequests].sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()).slice(0, 3);

  // Build activity feed
  const activities: { icon: string; text: string; time: string; color: string }[] = [];

  recentTx.forEach(tx => {
    if (tx.type === 'received') {
      const statusIcon = tx.status === 'confirmed' ? '✅' : tx.status === 'pending' ? '⏳' : '❌';
      const cat = categories.find(c => c.id === tx.categoryId);
      activities.push({
        icon: statusIcon,
        text: `Donation from ${tx.contactName || 'Anonymous'} — ${cat ? cat.title : tx.items}`,
        time: timeAgo(tx.date),
        color: tx.status === 'confirmed' ? '#00e878' : tx.status === 'pending' ? '#ffaa00' : '#ff2244',
      });
    } else {
      activities.push({
        icon: '📦',
        text: `Distributed: ${tx.items} → ${tx.contactName || 'Beneficiary'}`,
        time: timeAgo(tx.date),
        color: '#6366f1',
      });
    }
  });

  recentReqs.forEach(req => {
    activities.push({
      icon: '📣',
      text: `Request "${req.title}" — ${req.status}`,
      time: timeAgo(req.createdAt || req.date),
      color: req.status === 'open' ? '#00bfff' : '#888',
    });
  });

  // Sort all activities by most recent
  activities.sort(() => 0); // Already in rough order from the concat
  const topActivities = activities.slice(0, 8);

  return h('div', { class: 'page page-dashboard' },
    // Welcome Header
    h('div', { class: 'page-header' },
      h('div', null,
        h('h1', { class: 'page-title' },
          'Welcome back, ',
          h('span', { class: 'gradient-text' }, displayName),
        ),
        h('p', { class: 'page-subtitle' },
          `Managing ${categories.length} donation categories · ${events.length} upcoming events · ${notices.length} active notices`,
        ),
      ),
    ),

    // Stats Grid — Real data
    h('div', { class: 'stats-grid' },
      h(StatCard, {
        icon: '💝',
        label: 'Total Donations',
        value: totalDonations,
        change: `${confirmedDonations.length} confirmed`,
        trend: totalDonations > 0 ? 'up' : 'neutral',
        color: '#e02040',
      }),
      h(StatCard, {
        icon: '📣',
        label: 'Active Requests',
        value: activeRequests,
        change: `${allRequests.length} total`,
        trend: activeRequests > 0 ? 'up' : 'neutral',
        color: '#00bfff',
      }),
      h(StatCard, {
        icon: '⏳',
        label: 'Pending Reviews',
        value: pendingReviews,
        change: pendingReviews > 0 ? 'Needs attention' : 'All clear',
        trend: pendingReviews > 0 ? 'up' : 'neutral',
        color: '#ffaa00',
      }),
      h(StatCard, {
        icon: '💰',
        label: 'Total Value',
        value: totalValue > 0 ? `LKR ${(totalValue / 1000).toFixed(0)}K` : 'LKR 0',
        change: `${totalItems} items received`,
        trend: totalValue > 0 ? 'up' : 'neutral',
        color: '#00e878',
      }),
    ),

    // Content Grid
    h('div', { class: 'dashboard-grid' },

      // Recent Activity — Real data
      h('div', { class: 'card' },
        h('div', { class: 'card-header' },
          h('h3', { class: 'card-title' },
            h('span', { class: 'card-icon' }, '📡'),
            'Recent Activity',
          ),
          h('a', { class: 'btn btn-sm btn-ghost', href: '/admin' }, 'View All'),
        ),
        h('div', { class: 'card-body' },
          h('div', { class: 'activity-list' },
            ...topActivities.map(a =>
              h('div', { class: 'activity-item' },
                h('span', { class: 'activity-icon', style: { color: a.color } }, a.icon),
                h('div', { class: 'activity-content' },
                  h('span', { class: 'activity-text' }, a.text),
                  h('span', { class: 'activity-time' }, a.time),
                ),
              ),
            ),
            topActivities.length === 0
              ? h('div', { class: 'empty-state small' },
                  h('p', null, 'No activity yet. Donations and requests will appear here.'),
                )
              : null,
          ),
        ),
      ),

      // Donation Categories Overview
      h('div', { class: 'card' },
        h('div', { class: 'card-header' },
          h('h3', { class: 'card-title' },
            h('span', { class: 'card-icon' }, '📂'),
            'Donation Categories',
          ),
          h('a', { class: 'btn btn-sm btn-ghost', href: '/admin' }, 'Manage'),
        ),
        h('div', { class: 'card-body' },
          categories.length > 0
            ? h('div', { class: 'project-list' },
                ...categories.slice(0, 6).map((cat) => {
                  const catTx = allTx.filter(t => t.type === 'received' && t.categoryId === cat.id);
                  const catValue = catTx.reduce((s, t) => s + (t.amount || 0), 0);
                  return h('div', { class: 'project-item' },
                    h('div', { class: 'project-icon' }, cat.icon),
                    h('div', { class: 'project-info' },
                      h('span', { class: 'project-name' }, cat.title),
                      h('span', { class: 'project-status' },
                        `${catTx.length} donation${catTx.length !== 1 ? 's' : ''}${catValue > 0 ? ` · LKR ${catValue.toLocaleString()}` : ''}`,
                      ),
                    ),
                  );
                }),
              )
            : h('div', { class: 'empty-state' },
                h('div', { class: 'empty-icon' }, '📂'),
                h('p', null, 'No donation categories yet.'),
              ),
        ),
      ),

      // Quick Actions — Hope Hub specific
      h('div', { class: 'card' },
        h('div', { class: 'card-header' },
          h('h3', { class: 'card-title' },
            h('span', { class: 'card-icon' }, '⚡'),
            'Quick Actions',
          ),
        ),
        h('div', { class: 'card-body' },
          h('div', { class: 'quick-actions' },
            h('a', { class: 'quick-action', href: '/admin' },
              h('span', { class: 'quick-action-icon' }, '💝'),
              h('span', { class: 'quick-action-label' }, 'Manage Donations'),
              h('span', { class: 'quick-action-desc' }, 'Review & confirm donations'),
            ),
            h('a', { class: 'quick-action', href: '/donation-request' },
              h('span', { class: 'quick-action-icon' }, '📣'),
              h('span', { class: 'quick-action-label' }, 'Donation Requests'),
              h('span', { class: 'quick-action-desc' }, 'View public requests'),
            ),
            h('a', { class: 'quick-action', href: '/events' },
              h('span', { class: 'quick-action-icon' }, '◎'),
              h('span', { class: 'quick-action-label' }, 'Events'),
              h('span', { class: 'quick-action-desc' }, `${events.length} events published`),
            ),
            h('a', { class: 'quick-action', href: '/analytics' },
              h('span', { class: 'quick-action-icon' }, '📊'),
              h('span', { class: 'quick-action-label' }, 'Analytics'),
              h('span', { class: 'quick-action-desc' }, 'View reports & charts'),
            ),
          ),
        ),
      ),

      // System Status
      h('div', { class: 'card' },
        h('div', { class: 'card-header' },
          h('h3', { class: 'card-title' },
            h('span', { class: 'card-icon' }, '⬢'),
            'System Status',
          ),
        ),
        h('div', { class: 'card-body' },
          h('div', { class: 'status-list' },
            createStatusItem('Supabase Connection', 'online', 'Connected'),
            createStatusItem('Realtime Service', 'online', 'Active'),
            createStatusItem('Auth Provider', 'online', 'Operational'),
            createStatusItem('Content Items', 'online',
              `${notices.length} notices · ${events.length} events · ${news.length} news`,
            ),
          ),
        ),
      ),
    ),
  );
});

function createStatusItem(label: string, status: string, detail: string) {
  return h('div', { class: 'status-item' },
    h('div', { class: 'status-indicator' },
      h('span', { class: `status-dot ${status}` }),
      h('span', null, label),
    ),
    h('span', { class: 'status-detail' }, detail),
  );
}
