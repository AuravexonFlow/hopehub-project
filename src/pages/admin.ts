/**
 * ═══════════════════════════════════════════════════════════
 *  Admin Panel — Manage all site content
 *  Notices, Events, News, Donations, Users
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { render } from '../vortex/render';
import { createSignal } from '../vortex/signals';
import { showToast, success, warning } from '../services/toast';
import {
  getAllNotices, getAllEvents, getAllNews, getAllDonations,
  addNotice, updateNotice, deleteNotice,
  addEvent, updateEvent, deleteEvent,
  addNews, updateNews, deleteNews,
  addDonation, updateDonation, deleteDonation,
  getAllTransactions, getTransactionsByType, getDonationCategories,
  addTransaction, updateTransaction, deleteTransaction, resetTxStore,
  confirmTransaction, rejectTransaction, getPendingTransactions,
  getAllRequests, addRequest, updateRequest, deleteRequest, getRequestById,
  type Notice, type EventItem, type NewsItem, type DonationCategory, type DonationTransaction, type DonationRequest, type RequestedItem,
} from '../stores/content-store';
import {
  getAllProfilesWithStatus,
  approveUser,
  rejectUser,
  updateUserRole,
  setUserStatus,
  deleteUser,
  changeUserPassword,
  createProfile,
  roleConfig,
  type UserProfile,
  type UserRole,
  type UserStatus,
} from '../services/profiles';
import { adminActiveNav } from '../components/admin-sidebar';
import { appStore } from '../stores/app-store';

// ─── Tab State ────────────────────────────────────────────

const activeTab = createSignal<string>('notices');
const editingId = createSignal<string | null>(null);
const showForm = createSignal<boolean>(false);
const passwordDialogUser = createSignal<UserProfile | null>(null);
const donationSubTab = createSignal<string>('categories');

// ─── Helper: Generate ID ──────────────────────────────────

function genId(prefix: string) { return prefix + Date.now(); }

// ─── Listen for sidebar navigation changes ────────────────

if (typeof window !== 'undefined') {
  window.addEventListener('admin-nav-change', ((e: CustomEvent) => {
    const tab = e.detail?.tab;
    if (tab) {
      activeTab.set(tab);
      editingId.set(null);
      showForm.set(false);
      donationSubTab.set('categories');
      rerenderAdmin();
    }
  }) as EventListener);
}

// ─── Admin Panel Component ────────────────────────────────

export const AdminPage = defineComponent('AdminPage', () => {
  const currentTab = activeTab.peek();

  return h('div', { class: 'admin-page' },
    // Header
    h('div', { class: 'admin-header' },
      h('div', null,
        h('h1', { class: 'admin-title' },
          currentTab === 'dashboard' ? '📊 Dashboard' :
          currentTab === 'notices' ? '📋 Notices' :
          currentTab === 'events' ? '🎉 Events' :
          currentTab === 'news' ? '📰 News' :
          currentTab === 'donations' ? '💝 Donations' :
          currentTab === 'users' ? '👥 User Management' : '⚙️ Admin',
        ),
        h('p', { class: 'admin-subtitle' },
          currentTab === 'dashboard' ? 'Overview of your platform' :
          currentTab === 'users' ? 'Manage user accounts and roles' :
          `Manage ${currentTab} — create, edit, and publish content`,
        ),
      ),
      h('div', { style: 'display: flex; align-items: center; gap: 12px;' },
        h('button', {
          class: 'btn-icon theme-toggle admin-theme-toggle',
          onClick: () => { appStore.actions.toggleTheme(); },
          title: 'Toggle dark/light theme',
        }, document.documentElement.getAttribute('data-theme') === 'light' ? '☀️' : '🌙'),
        currentTab !== 'dashboard' && currentTab !== 'users' ? h('button', {
          class: 'admin-add-btn',
          onClick: () => {
            editingId.set(null);
            showForm.set(true);
            rerenderAdmin();
          },
        }, '+ Add New') : null,
      ),
    ),

    // Content area
    h('div', { class: 'admin-content' },
      showForm.peek()
        ? renderForm()
        : renderList(),
    ),
  );
});

// ─── Re-render helper ─────────────────────────────────────

function getHeaderForTab(tab: string) {
  const title =
    tab === 'dashboard' ? '📊 Dashboard' :
    tab === 'notices' ? '📋 Notices' :
    tab === 'events' ? '🎉 Events' :
    tab === 'news' ? '📰 News' :
    tab === 'donations' ? '💝 Donations' :
    tab === 'users' ? '👥 User Management' : '⚙️ Admin';

  const subtitle =
    tab === 'dashboard' ? 'Overview of your platform' :
    tab === 'users' ? 'Manage user accounts and roles' :
    `Manage ${tab} — create, edit, and publish content`;

  const children: any[] = [
    h('div', null,
      h('h1', { class: 'admin-title' }, title),
      h('p', { class: 'admin-subtitle' }, subtitle),
    ),
  ];

  if (tab !== 'dashboard') {
    const addLabel =
      tab === 'users' ? '+ Add User' :
      tab === 'donations' ? (
        donationSubTab.peek() === 'categories' ? '+ Add Category' :
        donationSubTab.peek() === 'requests' ? '+ Add Request' :
        donationSubTab.peek() === 'received' ? '+ Add Received' :
        donationSubTab.peek() === 'distributed' ? '+ Add Distributed' :
        null
      ) :
      '+ Add New';

    const rightChildren: any[] = [
      h('button', {
        class: 'btn-icon theme-toggle admin-theme-toggle',
        onClick: () => { appStore.actions.toggleTheme(); rerenderAdmin(); },
        title: 'Toggle dark/light theme',
      }, document.documentElement.getAttribute('data-theme') === 'light' ? '☀️' : '🌙'),
    ];

    if (addLabel) {
      rightChildren.push(
        h('button', {
          class: 'admin-add-btn',
          onClick: () => {
            editingId.set(null);
            showForm.set(true);
            rerenderAdmin();
          },
        }, addLabel),
      );
    }

    children.push(h('div', { style: 'display: flex; align-items: center; gap: 12px;' }, ...rightChildren));
  } else {
    children.push(
      h('div', { style: 'display: flex; align-items: center; gap: 12px;' },
        h('button', {
          class: 'btn-icon theme-toggle admin-theme-toggle',
          onClick: () => { appStore.actions.toggleTheme(); rerenderAdmin(); },
          title: 'Toggle dark/light theme',
        }, document.documentElement.getAttribute('data-theme') === 'light' ? '☀️' : '🌙'),
      ),
    );
  }

  return h('div', { class: 'admin-header' }, ...children);
}

function rerenderAdmin() {
  // Update header
  const header = document.querySelector('.admin-header') as HTMLElement | null;
  if (header) {
    header.innerHTML = '';
    render(getHeaderForTab(activeTab.peek()), header);
  }

  // Update content area
  const el = document.querySelector('.admin-content') as HTMLElement | null;
  if (el) {
    el.innerHTML = '';
    const content = showForm.peek() ? renderForm() : renderList();
    render(content, el);
  }

  // Post-render: setup autocomplete for multi-item transaction forms
  setTimeout(() => {
    const rows = document.querySelectorAll('#multi-item-container .multi-item-row');
    rows.forEach((row) => {
      const nameInput = row.querySelector('.multi-item-name-input') as HTMLInputElement;
      const nameSelect = row.querySelector('.multi-item-name-select') as HTMLSelectElement;
      if (nameInput) {
        const idx = nameInput.getAttribute('data-field')?.replace('form-item-name-', '');
        if (idx !== undefined) setupItemAutocomplete(parseInt(idx, 10));
      }
      if (nameSelect) {
        const idx = nameSelect.getAttribute('data-field')?.replace('form-item-name-', '');
        if (idx !== undefined) setupDistributionSelect(parseInt(idx, 10));
      }
    });
  }, 50);
}

// ─── List View ────────────────────────────────────────────

function renderList() {
  const tab = activeTab.peek();
  switch (tab) {
    case 'dashboard': return renderDashboard();
    case 'notices': return renderNoticesList();
    case 'events': return renderEventsList();
    case 'news': return renderNewsList();
    case 'donations': return renderDonationsList();
    case 'users': return renderUsersList();
    default: return renderDashboard();
  }
}

// ─── Dashboard View ───────────────────────────────────────

function renderDashboard() {
  const notices = getAllNotices();
  const events = getAllEvents();
  const news = getAllNews();
  const donations = getAllDonations();
  const profiles = getAllProfilesWithStatus();
  const pendingCount = profiles.filter(p => p.status === 'pending').length;
  const totalGoal = donations.reduce((sum, d) => sum + d.goal, 0);
  const totalRaised = donations.reduce((sum, d) => sum + d.raised, 0);

  const stats = [
    { icon: '📋', label: 'Notices', value: String(notices.length), color: '#e02040' },
    { icon: '🎉', label: 'Events', value: String(events.length), color: '#0090d0' },
    { icon: '📰', label: 'News', value: String(news.length), color: '#00a050' },
    { icon: '💝', label: 'Donations', value: String(donations.length), color: '#f0a000' },
    { icon: '👥', label: 'Users', value: String(profiles.length), color: '#a040ff' },
    { icon: '⏳', label: 'Pending', value: String(pendingCount), color: pendingCount > 0 ? '#f0a000' : '#00a050' },
  ];

  return h('div', { class: 'admin-dashboard' },
    // Stats Grid
    h('div', { class: 'admin-stats-grid' },
      ...stats.map(s =>
        h('div', { class: 'admin-stat-card' },
          h('div', { class: 'admin-stat-icon', style: `background: ${s.color}22; color: ${s.color};` }, s.icon),
          h('div', { class: 'admin-stat-info' },
            h('span', { class: 'admin-stat-number' }, s.value),
            h('span', { class: 'admin-stat-desc' }, s.label),
          ),
        ),
      ),
    ),

    // Donations Progress
    h('div', { class: 'admin-dashboard-section' },
      h('h3', { class: 'admin-section-title' }, '💝 Donations Overview'),
      h('div', { class: 'admin-donation-overview' },
        h('div', { class: 'admin-donation-bar-container' },
          h('div', {
            class: 'admin-donation-bar',
            style: `width: ${totalGoal > 0 ? Math.min(100, (totalRaised / totalGoal) * 100) : 0}%`,
          }),
        ),
        h('div', { class: 'admin-donation-stats' },
          h('span', null, `Raised: LKR ${(totalRaised / 1000).toFixed(0)}K`),
          h('span', null, `Goal: LKR ${(totalGoal / 1000).toFixed(0)}K`),
          h('span', { style: 'color: var(--accent-green); font-weight: 700;' },
            `${totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0}%`,
          ),
        ),
      ),
    ),

    // Pending Users Alert
    pendingCount > 0 ? h('div', { class: 'admin-dashboard-alert' },
      h('div', { class: 'admin-alert-icon' }, '⏳'),
      h('div', { class: 'admin-alert-content' },
        h('span', { class: 'admin-alert-title' }, `${pendingCount} user${pendingCount > 1 ? 's' : ''} pending approval`),
        h('span', { class: 'admin-alert-desc' }, 'Review and approve new teacher/admin accounts'),
      ),
      h('button', {
        class: 'admin-alert-action',
        onClick: () => {
          activeTab.set('users');
          adminActiveNav.set('users');
          window.dispatchEvent(new CustomEvent('admin-nav-change', { detail: { tab: 'users' } }));
          rerenderAdmin();
        },
      }, 'Review →'),
    ) : null,
  );
}

function renderNoticesList() {
  const items = getAllNotices();
  return h('div', { class: 'admin-list' },
    ...items.map(n =>
      h('div', { class: `admin-list-item ${!n.published ? 'unpublished' : ''}` },
        h('div', { class: 'admin-item-icon' }, n.icon),
        h('div', { class: 'admin-item-info' },
          h('div', { class: 'admin-item-title' }, n.title),
          h('div', { class: 'admin-item-meta' },
            h('span', null, n.date),
            h('span', { class: `admin-tag tag-${n.tag.toLowerCase()}` }, n.tag),
            n.photos && n.photos.length > 0 ? h('span', { class: 'admin-tag tag-photos' }, `📸 ${n.photos.length}`) : null,
            !n.published ? h('span', { class: 'admin-tag tag-draft' }, 'Draft') : null,
          ),
        ),
        h('div', { class: 'admin-item-actions' },
          h('button', {
            class: 'admin-action-btn toggle-btn',
            onClick: () => {
              updateNotice(n.id, { published: !n.published });
              showToast('success', n.published ? 'Unpublished' : 'Published', n.title);
              rerenderAdmin();
            },
            title: n.published ? 'Unpublish' : 'Publish',
          }, n.published ? '👁️' : '🚫'),
          h('button', {
            class: 'admin-action-btn edit-btn',
            onClick: () => {
              editingId.set(n.id);
              showForm.set(true);
              rerenderAdmin();
            },
          }, '✏️'),
          h('button', {
            class: 'admin-action-btn delete-btn',
            onClick: () => {
              if (confirm(`Delete notice: "${n.title}"?`)) {
                deleteNotice(n.id);
                showToast('info', 'Deleted', n.title);
                rerenderAdmin();
              }
            },
          }, '🗑️'),
        ),
      ),
    ),
  );
}

function renderEventsList() {
  const items = getAllEvents();
  return h('div', { class: 'admin-list' },
    ...items.map(e =>
      h('div', { class: `admin-list-item ${!e.published ? 'unpublished' : ''}` },
        h('div', { class: 'admin-item-icon' }, e.icon),
        h('div', { class: 'admin-item-info' },
          h('div', { class: 'admin-item-title' }, e.title),
          h('div', { class: 'admin-item-meta' },
            h('span', null, e.date),
            h('span', { class: `admin-tag ${e.tag === 'Upcoming' ? 'tag-active' : 'tag-update'}` }, e.tag),
            e.stats ? h('span', { class: 'admin-item-stats' }, e.stats) : null,
            e.photos && e.photos.length > 0 ? h('span', { class: 'admin-tag tag-photos' }, `📸 ${e.photos.length}`) : null,
            !e.published ? h('span', { class: 'admin-tag tag-draft' }, 'Draft') : null,
          ),
        ),
        h('div', { class: 'admin-item-actions' },
          h('button', {
            class: 'admin-action-btn toggle-btn',
            onClick: () => {
              updateEvent(e.id, { published: !e.published });
              showToast('success', e.published ? 'Unpublished' : 'Published', e.title);
              rerenderAdmin();
            },
          }, e.published ? '👁️' : '🚫'),
          h('button', {
            class: 'admin-action-btn edit-btn',
            onClick: () => {
              editingId.set(e.id);
              showForm.set(true);
              rerenderAdmin();
            },
          }, '✏️'),
          h('button', {
            class: 'admin-action-btn delete-btn',
            onClick: () => {
              if (confirm(`Delete event: "${e.title}"?`)) {
                deleteEvent(e.id);
                showToast('info', 'Deleted', e.title);
                rerenderAdmin();
              }
            },
          }, '🗑️'),
        ),
      ),
    ),
  );
}

function renderNewsList() {
  const items = getAllNews();
  return h('div', { class: 'admin-list' },
    ...items.map(n =>
      h('div', { class: `admin-list-item ${!n.published ? 'unpublished' : ''}` },
        h('div', { class: 'admin-item-icon' }, n.icon),
        h('div', { class: 'admin-item-info' },
          h('div', { class: 'admin-item-title' }, n.title),
          h('div', { class: 'admin-item-meta' },
            h('span', null, n.date),
            h('span', { class: `admin-tag cat-${n.category.toLowerCase()}` }, n.category),
            h('span', null, n.readTime),
            !n.published ? h('span', { class: 'admin-tag tag-draft' }, 'Draft') : null,
          ),
        ),
        h('div', { class: 'admin-item-actions' },
          h('button', {
            class: 'admin-action-btn toggle-btn',
            onClick: () => {
              updateNews(n.id, { published: !n.published });
              showToast('success', n.published ? 'Unpublished' : 'Published', n.title);
              rerenderAdmin();
            },
          }, n.published ? '👁️' : '🚫'),
          h('button', {
            class: 'admin-action-btn edit-btn',
            onClick: () => {
              editingId.set(n.id);
              showForm.set(true);
              rerenderAdmin();
            },
          }, '✏️'),
          h('button', {
            class: 'admin-action-btn delete-btn',
            onClick: () => {
              if (confirm(`Delete news: "${n.title}"?`)) {
                deleteNews(n.id);
                showToast('info', 'Deleted', n.title);
                rerenderAdmin();
              }
            },
          }, '🗑️'),
        ),
      ),
    ),
  );
}

function renderDonationsList() {
  const sub = donationSubTab.peek();

  const tabs = [
    { id: 'categories', label: '💝 Categories', },
    { id: 'requests', label: '📣 Requests' },
    { id: 'received', label: '📥 Received' },
    { id: 'distributed', label: '📤 Distributed' },
    { id: 'inventory', label: '📦 Inventory' },
    { id: 'reports', label: '📊 Reports' },
  ];

  return h('div', { class: 'admin-donation-section' },
    h('div', { class: 'admin-donation-subtabs' },
      ...tabs.map(t =>
        h('button', {
          class: `admin-donation-subtab ${sub === t.id ? 'active' : ''}`,
          onClick: () => {
            donationSubTab.set(t.id);
            showForm.set(false);
            editingId.set(null);
            rerenderAdmin();
          },
        }, t.label),
      ),
    ),
    h('div', { class: 'admin-donation-subtab-content' },
      sub === 'categories' ? renderDonationCategoriesList() :
      sub === 'requests' ? renderRequestsList() :
      sub === 'received' ? renderTxList('received') :
      sub === 'distributed' ? renderTxList('distributed') :
      sub === 'inventory' ? renderInventoryView() :
      renderDonationReports(),
    ),
  );
}

function renderDonationCategoriesList() {
  const items = getAllDonations();
  return h('div', { class: 'admin-list' },
    ...items.map(d =>
      h('div', { class: `admin-list-item ${!d.published ? 'unpublished' : ''}` },
        h('div', { class: 'admin-item-icon' }, d.icon),
        h('div', { class: 'admin-item-info' },
          h('div', { class: 'admin-item-title' },
            d.title,
            d.comingSoon ? h('span', { class: 'admin-tag tag-coming-soon' }, 'Coming Soon') : null,
          ),
          h('div', { class: 'admin-item-meta' },
            h('span', null, `Goal: LKR ${(d.goal / 1000).toFixed(0)}K`),
            h('span', null, `Raised: LKR ${(d.raised / 1000).toFixed(0)}K`),
            h('span', { class: 'admin-progress-mini' },
              `${Math.round((d.raised / d.goal) * 100)}%`,
            ),
            !d.published ? h('span', { class: 'admin-tag tag-draft' }, 'Draft') : null,
          ),
        ),
        h('div', { class: 'admin-item-actions' },
          h('button', {
            class: 'admin-action-btn toggle-btn',
            onClick: () => {
              updateDonation(d.id, { published: !d.published });
              showToast('success', d.published ? 'Unpublished' : 'Published', d.title);
              rerenderAdmin();
            },
          }, d.published ? '👁️' : '🚫'),
          h('button', {
            class: 'admin-action-btn edit-btn',
            onClick: () => {
              editingId.set(d.id);
              showForm.set(true);
              rerenderAdmin();
            },
          }, '✏️'),
          h('button', {
            class: 'admin-action-btn delete-btn',
            onClick: () => {
              if (confirm(`Delete donation category: "${d.title}"?`)) {
                deleteDonation(d.id);
                showToast('info', 'Deleted', d.title);
                rerenderAdmin();
              }
            },
          }, '🗑️'),
        ),
      ),
    ),
  );
}

// ─── Transaction List ─────────────────────────────────────

function renderTxList(type: 'received' | 'distributed') {
  const txs = getTransactionsByType(type);
  const categories = getDonationCategories();
  const catMap = new Map(categories.map(c => [c.id, c]));
  const pendingTxs = type === 'received' ? getPendingTransactions() : [];
  const confirmedTxs = txs.filter(t => t.status !== 'pending');

  if (txs.length === 0 && pendingTxs.length === 0) {
    return h('div', { class: 'admin-empty-state' },
      h('div', { class: 'admin-empty-icon' }, type === 'received' ? '📥' : '📤'),
      h('div', { class: 'admin-empty-text' }, `No ${type} donations recorded yet.`),
      h('button', {
        class: 'admin-empty-btn',
        onClick: () => {
          editingId.set(null);
          showForm.set(true);
          rerenderAdmin();
        },
      }, `+ Add ${type === 'received' ? 'Received' : 'Distributed'} Donation`),
    );
  }

  return h('div', { class: 'admin-tx-list' },
    // Pending donations section (only for received)
    ...(type === 'received' && pendingTxs.length > 0 ? [
      h('div', { class: 'admin-pending-section' },
        h('div', { class: 'admin-pending-header' },
          h('span', { class: 'admin-pending-icon' }, '⏳'),
          h('span', null, `${pendingTxs.length} Pending Donation${pendingTxs.length > 1 ? 's' : ''} Awaiting Confirmation`),
          h('span', { class: 'admin-pending-hint' }, ' — These came from donors via the public page'),
        ),
        ...pendingTxs.map(tx => {
          const cat = catMap.get(tx.categoryId);
          const req = tx.requestId ? getRequestById(tx.requestId) : null;
          return h('div', { class: 'admin-tx-card admin-tx-pending' },
            h('div', { class: 'admin-tx-header' },
              h('div', { class: 'admin-tx-type-badge', style: 'background: rgba(240,160,0,0.15); color: #f0a000;' },
                '⏳ Pending',
              ),
              h('span', { class: 'admin-tx-date' }, tx.date),
            ),
            h('div', { class: 'admin-tx-body' },
              h('div', { class: 'admin-tx-contact' },
                h('span', { class: 'admin-tx-contact-name' }, tx.contactName),
                tx.contactInfo ? h('span', { class: 'admin-tx-contact-info' }, tx.contactInfo) : null,
              ),
              h('div', { class: 'admin-tx-category' },
                h('span', null, cat ? `${cat.icon} ${cat.title}` : 'Unknown Category'),
                req ? h('span', { class: 'admin-tx-req-link', style: 'margin-left:8px; font-size:0.8rem; opacity:0.7;' }, `📣 ${req.title}`) : null,
              ),
              tx.lineItems && tx.lineItems.length > 0
                ? h('div', { class: 'admin-tx-items' },
                    ...tx.lineItems.map(li => h('span', { class: 'admin-tx-line-item' }, `${li.qty}× ${li.name}`)),
                  )
                : h('div', { class: 'admin-tx-items' }, tx.items),
              tx.quantity ? h('div', { class: 'admin-tx-qty' }, `Qty: ${tx.quantity}`) : null,
              h('div', { class: 'admin-tx-financial' },
                tx.amount && tx.amount > 0
                  ? h('span', { class: 'admin-tx-amount' }, `LKR ${tx.amount.toLocaleString()}`)
                  : null,
                tx.paymentMethod ? h('span', { class: 'admin-tx-payment' }, tx.paymentMethod) : null,
              ),
              tx.notes ? h('div', { class: 'admin-tx-notes' }, tx.notes) : null,
            ),
            h('div', { class: 'admin-tx-actions' },
              h('button', {
                class: 'admin-action-btn',
                title: 'Confirm & Add to Inventory',
                style: 'color: #00a050; font-size: 1.1rem;',
                onClick: () => {
                  confirmTransaction(tx.id);
                  showToast('success', 'Confirmed', `Donation from ${tx.contactName} confirmed and added to inventory`);
                  rerenderAdmin();
                },
              }, '✅'),
              h('button', {
                class: 'admin-action-btn delete-btn',
                title: 'Reject',
                onClick: () => {
                  if (confirm(`Reject donation from ${tx.contactName}? This will permanently remove it.`)) {
                    rejectTransaction(tx.id);
                    showToast('info', 'Rejected', 'Donation rejected and removed');
                    rerenderAdmin();
                  }
                },
              }, '🗑️'),
            ),
          );
        }),
      ),
    ] : []),
    // Confirmed transactions
    ...confirmedTxs.map(tx => {
      const cat = catMap.get(tx.categoryId);
      const typeIcon = type === 'received' ? '📥' : '📤';
      const typeColor = type === 'received' ? '#00a050' : '#0090d0';
      return h('div', { class: 'admin-tx-card' },
        h('div', { class: 'admin-tx-header' },
          h('div', { class: 'admin-tx-type-badge', style: `background: ${typeColor}22; color: ${typeColor};` },
            typeIcon, ' ', type === 'received' ? 'Received' : 'Distributed',
          ),
          h('span', { class: 'admin-tx-date' }, tx.date),
        ),
        h('div', { class: 'admin-tx-body' },
          h('div', { class: 'admin-tx-contact' },
            h('span', { class: 'admin-tx-contact-name' }, tx.contactName),
            tx.contactInfo ? h('span', { class: 'admin-tx-contact-info' }, tx.contactInfo) : null,
          ),
          h('div', { class: 'admin-tx-category' },
            h('span', null, cat ? `${cat.icon} ${cat.title}` : 'Unknown Category'),
          ),
          h('div', { class: 'admin-tx-items' }, tx.items),
          tx.quantity ? h('div', { class: 'admin-tx-qty' }, `Qty: ${tx.quantity}`) : null,
          h('div', { class: 'admin-tx-financial' },
            tx.amount && tx.amount > 0
              ? h('span', { class: 'admin-tx-amount' }, `LKR ${tx.amount.toLocaleString()}`)
              : h('span', { class: 'admin-tx-amount admin-tx-amount-in-kind' }, 'In-kind'),
            tx.paymentMethod ? h('span', { class: 'admin-tx-payment' }, tx.paymentMethod) : null,
            tx.receiptNo ? h('span', { class: 'admin-tx-receipt' }, `Ref: ${tx.receiptNo}`) : null,
          ),
          tx.notes ? h('div', { class: 'admin-tx-notes' }, tx.notes) : null,
        ),
        h('div', { class: 'admin-tx-actions' },
          h('button', {
            class: 'admin-action-btn edit-btn',
            onClick: () => {
              editingId.set(tx.id);
              showForm.set(true);
              rerenderAdmin();
            },
          }, '✏️'),
          h('button', {
            class: 'admin-action-btn delete-btn',
            onClick: () => {
              if (confirm(`Delete this ${type} transaction?`)) {
                deleteTransaction(tx.id);
                showToast('info', 'Deleted', tx.contactName);
                rerenderAdmin();
              }
            },
          }, '🗑️'),
        ),
      );
    }),
  );
}

// ─── Donation Reports ─────────────────────────────────────

// ─── Donation Requests ────────────────────────────────────

function renderRequestsList() {
  const requests = getAllRequests();
  const categories = getDonationCategories();
  const catMap = new Map(categories.map(c => [c.id, c]));

  if (requests.length === 0) {
    return h('div', { class: 'admin-empty-state' },
      h('div', { class: 'admin-empty-icon' }, '📣'),
      h('p', { class: 'admin-empty-text' }, 'No donation requests yet'),
      h('p', { class: 'admin-empty-hint' }, 'Create requests to let donors know what items are needed'),
      h('button', {
        class: 'admin-add-btn',
        style: 'margin-top: 12px;',
        onClick: () => { showForm.set(true); editingId.set(null); rerenderAdmin(); },
      }, '+ Create First Request'),
    );
  }

  const urgencyColors: Record<string, { bg: string; color: string }> = {
    Critical: { bg: 'rgba(224,32,64,0.12)', color: '#e02040' },
    High: { bg: 'rgba(240,160,0,0.12)', color: '#f0a000' },
    Medium: { bg: 'rgba(0,144,208,0.12)', color: '#0090d0' },
    Low: { bg: 'rgba(0,160,80,0.12)', color: '#00a050' },
  };

  const statusColors: Record<string, { bg: string; color: string }> = {
    open: { bg: 'rgba(0,160,80,0.12)', color: '#00a050' },
    fulfilled: { bg: 'rgba(0,144,208,0.12)', color: '#0090d0' },
    closed: { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' },
  };

  return h('div', { class: 'admin-list' },
    ...requests.map(req => {
      const cat = catMap.get(req.categoryId);
      const urg = urgencyColors[req.urgency] || urgencyColors.Medium;
      const st = statusColors[req.status] || statusColors.open;
      const qtyPct = req.targetQuantity > 0 ? Math.min(100, Math.round((req.fulfilledQuantity / req.targetQuantity) * 100)) : 0;
      const amtPct = req.targetAmount > 0 ? Math.min(100, Math.round((req.raisedAmount / req.targetAmount) * 100)) : 0;
      const isClosed = req.status !== 'open';

      return h('div', { class: `admin-req-card ${isClosed ? 'admin-req-closed' : ''}` },
        h('div', { class: 'admin-req-card-header' },
          h('div', { class: 'admin-req-card-title' },
            cat ? h('span', { class: 'admin-req-cat-icon' }, cat.icon) : null,
            h('span', null, req.title),
          ),
          h('div', { class: 'admin-req-card-badges' },
            h('span', { class: 'admin-req-badge', style: `background: ${urg.bg}; color: ${urg.color};` }, req.urgency),
            h('span', { class: 'admin-req-badge', style: `background: ${st.bg}; color: ${st.color};` }, req.status),
            req.published ? null : h('span', { class: 'admin-req-badge', style: 'background: rgba(255,255,255,0.06); color: var(--text-muted);' }, 'Draft'),
          ),
        ),
        h('div', { class: 'admin-req-card-desc' }, req.description),
        h('div', { class: 'admin-req-card-meta' },
          cat ? h('span', null, `${cat.icon} ${cat.title}`) : null,
          h('span', null, `📅 Deadline: ${req.deadline}`),
          h('span', null, `👤 ${req.contactName}`),
        ),
        h('div', { class: 'admin-req-card-progress' },
          h('div', { class: 'admin-req-progress-row' },
            h('span', { class: 'admin-req-progress-label' }, '📦 Items'),
            h('span', { class: 'admin-req-progress-value' }, `${req.fulfilledQuantity} / ${req.targetQuantity}`),
          ),
          h('div', { class: 'admin-req-bar-wrap' },
            h('div', { class: 'admin-req-bar-fill', style: `width: ${qtyPct}%; background: ${qtyPct >= 100 ? '#00a050' : '#0090d0'};` }),
          ),
          h('div', { class: 'admin-req-progress-row' },
            h('span', { class: 'admin-req-progress-label' }, '💰 Amount'),
            h('span', { class: 'admin-req-progress-value' }, `LKR ${req.raisedAmount.toLocaleString()} / ${req.targetAmount.toLocaleString()}`),
          ),
          h('div', { class: 'admin-req-bar-wrap' },
            h('div', { class: 'admin-req-bar-fill', style: `width: ${amtPct}%; background: ${amtPct >= 100 ? '#00a050' : '#f0a000'};` }),
          ),
        ),
        h('div', { class: 'admin-req-card-items' },
          h('span', { class: 'admin-req-items-label' }, 'Needed:'),
          h('span', { class: 'admin-req-items-text' }, req.itemsNeeded),
        ),
        h('div', { class: 'admin-req-card-actions' },
          h('button', {
            class: 'admin-action-btn edit-btn',
            title: 'Edit',
            onClick: () => { editingId.set(req.id); showForm.set(true); rerenderAdmin(); },
          }, '✏️'),
          h('button', {
            class: 'admin-action-btn delete-btn',
            title: 'Delete',
            onClick: () => { deleteRequest(req.id); showToast('success', 'Deleted', 'Request removed'); rerenderAdmin(); },
          }, '🗑️'),
          req.status === 'open' ? h('button', {
            class: 'admin-action-btn',
            title: 'Mark Fulfilled',
            style: 'color: #00a050;',
            onClick: () => { updateRequest(req.id, { status: 'fulfilled' }); showToast('success', 'Fulfilled', 'Request marked as fulfilled'); rerenderAdmin(); },
          }, '✅') : null,
        ),
      );
    }),
  );
}

function renderRequestForm(editId: string | null) {
  const existing = editId ? getRequestById(editId) : null;
  const categories = getDonationCategories();
  const title = existing ? 'Edit Donation Request' : 'New Donation Request';

  return h('div', { class: 'admin-form' },
    h('div', { class: 'admin-form-header', style: 'border-left: 4px solid #e02040;' },
      h('h2', null, title),
      h('button', {
        class: 'admin-form-close',
        onClick: () => { showForm.set(false); editingId.set(null); rerenderAdmin(); },
      }, '✕'),
    ),
    h('div', { class: 'admin-form-body', 'data-form-type': 'request', 'data-edit-id': editId || '' },

      // Section 1: Basic Info
      h('div', { class: 'admin-form-section' },
        h('div', { class: 'admin-form-section-title' },
          h('span', { class: 'admin-form-section-icon' }, '📣'),
          'Request Details',
        ),
        formField('Title', 'text', existing?.title || '', 'form-req-title'),
        formField('Description', 'textarea', existing?.description || '', 'form-req-desc'),
        formSelectOptions('Category', categories.map(c => ({ value: c.id, label: `${c.icon} ${c.title}` })), existing?.categoryId || categories[0]?.id || '', 'form-req-category'),
        formField('Items Needed (summary)', 'textarea', existing?.itemsNeeded || '', 'form-req-items'),
      ),

      // Section 1b: Requested Items (structured)
      h('div', { class: 'admin-form-section' },
        h('div', { class: 'admin-form-section-title' },
          h('span', { class: 'admin-form-section-icon' }, '📦'),
          'Specific Items & Quantities',
          h('span', { class: 'admin-form-section-hint' }, ' — Donors will select from these'),
        ),
        h('div', { id: 'req-items-container', class: 'req-items-container' },
          ...(existing?.requestedItems || []).map((item, i) =>
            h('div', { class: 'req-item-row', 'data-req-item-index': String(i) },
              h('input', {
                type: 'text',
                class: 'admin-input req-item-name',
                value: item.name,
                placeholder: 'Item name (e.g. backpacks)',
                'data-field': `form-req-item-name-${i}`,
              }),
              h('input', {
                type: 'number',
                class: 'admin-input req-item-qty',
                value: String(item.targetQty),
                placeholder: 'Qty needed',
                min: '1',
                'data-field': `form-req-item-qty-${i}`,
              }),
              h('button', {
                class: 'multi-item-remove-btn',
                type: 'button',
                title: 'Remove item',
                onClick: (e: Event) => {
                  const btn = e.currentTarget as HTMLElement;
                  const row = btn.closest('.req-item-row');
                  if (row) row.remove();
                },
              }, '✕'),
            ),
          ),
        ),
        h('button', {
          class: 'multi-item-add-btn',
          type: 'button',
          onClick: () => {
            const container = document.getElementById('req-items-container');
            if (!container) return;
            const idx = container.querySelectorAll('.req-item-row').length;
            const row = document.createElement('div');
            row.className = 'req-item-row';
            row.setAttribute('data-req-item-index', String(idx));
            row.innerHTML = `
              <input type="text" class="admin-input req-item-name" placeholder="Item name (e.g. backpacks)" data-field="form-req-item-name-${idx}">
              <input type="number" class="admin-input req-item-qty" placeholder="Qty needed" min="1" data-field="form-req-item-qty-${idx}">
              <button class="multi-item-remove-btn" type="button" title="Remove item" onclick="this.closest('.req-item-row').remove()">✕</button>
            `;
            container.appendChild(row);
          },
        }, '+ Add Item'),
      ),

      // Section 2: Targets
      h('div', { class: 'admin-form-section' },
        h('div', { class: 'admin-form-section-title' },
          h('span', { class: 'admin-form-section-icon' }, '🎯'),
          'Targets & Tracking',
        ),
        h('div', { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px;' },
          formField('Target Quantity', 'number', existing?.targetQuantity?.toString() || '0', 'form-req-target-qty'),
          formField('Target Amount (LKR)', 'number', existing?.targetAmount?.toString() || '0', 'form-req-target-amt'),
        ),
        existing ? h('div', { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px;' },
          formField('Fulfilled Quantity', 'number', existing.fulfilledQuantity.toString(), 'form-req-fulfilled-qty'),
          formField('Raised Amount (LKR)', 'number', existing.raisedAmount.toString(), 'form-req-raised-amt'),
        ) : null,
      ),

      // Section 3: Urgency & Status
      h('div', { class: 'admin-form-section' },
        h('div', { class: 'admin-form-section-title' },
          h('span', { class: 'admin-form-section-icon' }, '⚡'),
          'Urgency & Status',
        ),
        h('div', { style: 'display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;' },
          formSelect('Urgency', ['Critical', 'High', 'Medium', 'Low'], existing?.urgency || 'Medium', 'form-req-urgency'),
          formSelect('Status', ['open', 'fulfilled', 'closed'], existing?.status || 'open', 'form-req-status'),
          formField('Deadline', 'text', existing?.deadline || '', 'form-req-deadline'),
        ),
        formCheckbox('Published', existing?.published ?? true, 'form-req-published'),
      ),

      // Section 4: Contact
      h('div', { class: 'admin-form-section' },
        h('div', { class: 'admin-form-section-title' },
          h('span', { class: 'admin-form-section-icon' }, '👤'),
          'Contact Person',
        ),
        h('div', { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px;' },
          formField('Contact Name', 'text', existing?.contactName || '', 'form-req-contact-name'),
          formField('Contact Info', 'text', existing?.contactInfo || '', 'form-req-contact-info'),
        ),
      ),

      h('div', { class: 'admin-form-actions' },
        h('button', {
          class: 'admin-save-btn',
          style: 'background: linear-gradient(135deg, #e02040, #ff4060);',
          onClick: () => saveRequestForm(editId),
        }, editId ? '💾 Save Changes' : '➕ Create Request'),
        h('button', {
          class: 'admin-cancel-btn',
          onClick: () => { showForm.set(false); editingId.set(null); rerenderAdmin(); },
        }, 'Cancel'),
      ),
    ),
  );
}

function saveRequestForm(editId: string | null) {
  const title = getFormValue('form-req-title');
  const description = getFormValue('form-req-desc');
  const categoryId = getFormValue('form-req-category');
  const itemsNeeded = getFormValue('form-req-items');
  const targetQuantity = parseInt(getFormValue('form-req-target-qty'), 10) || 0;
  const targetAmount = parseInt(getFormValue('form-req-target-amt'), 10) || 0;
  const urgency = getFormValue('form-req-urgency') as DonationRequest['urgency'];
  const status = getFormValue('form-req-status') as DonationRequest['status'];
  const deadline = getFormValue('form-req-deadline');
  const contactName = getFormValue('form-req-contact-name');
  const contactInfo = getFormValue('form-req-contact-info');
  const published = getFormChecked('form-req-published');

  if (!title || !description || !itemsNeeded || !deadline || !contactName) {
    showToast('error', 'Missing Fields', 'Please fill in title, description, items, deadline, and contact name');
    return;
  }

  const fulfilledQuantity = editId ? (parseInt(getFormValue('form-req-fulfilled-qty'), 10) || 0) : 0;
  const raisedAmount = editId ? (parseInt(getFormValue('form-req-raised-amt'), 10) || 0) : 0;

  // Collect structured requested items
  const requestedItems: RequestedItem[] = [];
  const existingReq = editId ? getRequestById(editId) : null;
  const reqItemRows = document.querySelectorAll('#req-items-container .req-item-row');
  reqItemRows.forEach((row, i) => {
    const nameEl = row.querySelector('.req-item-name') as HTMLInputElement;
    const qtyEl = row.querySelector('.req-item-qty') as HTMLInputElement;
    const itemName = nameEl?.value?.trim();
    const itemQty = parseInt(qtyEl?.value, 10) || 0;
    if (itemName && itemQty > 0) {
      // Preserve fulfilledQty from existing when editing
      const existingItem = existingReq?.requestedItems?.find(
        (ri: RequestedItem) => ri.name.toLowerCase() === itemName.toLowerCase(),
      );
      requestedItems.push({
        name: itemName,
        targetQty: itemQty,
        fulfilledQty: existingItem?.fulfilledQty || 0,
      });
    }
  });

  const data = { title, description, categoryId, itemsNeeded, requestedItems, targetQuantity, fulfilledQuantity, targetAmount, raisedAmount, urgency, status, deadline, contactName, contactInfo, published };

  if (editId) {
    updateRequest(editId, data);
    showToast('success', 'Updated', 'Donation request updated');
  } else {
    addRequest(data);
    showToast('success', 'Created', 'Donation request created');
  }
  showForm.set(false);
  editingId.set(null);
  rerenderAdmin();
}

// ─── Inventory View ────────────────────────────────────────

function renderInventoryView() {
  const received = getTransactionsByType('received');
  const distributed = getTransactionsByType('distributed');
  const categories = getDonationCategories();
  const catMap = new Map(categories.map(c => [c.id, c]));

  // Parse "50 backpacks, 200 notebooks" → Map<itemName, qty>
  function parseItems(itemsStr: string): Map<string, number> {
    const map = new Map<string, number>();
    const parts = itemsStr.split(',').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      const match = part.match(/^(\d+)\s+(.+)$/);
      if (match) {
        const qty = parseInt(match[1], 10);
        const name = match[2].trim();
        map.set(name, (map.get(name) || 0) + qty);
      }
    }
    return map;
  }

  // Build per-category inventory
  type InventoryEntry = { name: string; received: number; distributed: number; net: number; };
  type CategoryInventory = {
    catId: string;
    catTitle: string;
    catIcon: string;
    catColor: string;
    items: InventoryEntry[];
    totalReceived: number;
    totalDistributed: number;
    totalNet: number;
    hasQuantifiable: boolean;
  };

  const inventoryMap = new Map<string, CategoryInventory>();
  for (const cat of categories) {
    inventoryMap.set(cat.id, {
      catId: cat.id,
      catTitle: cat.title,
      catIcon: cat.icon,
      catColor: cat.color || '#e02040',
      items: [],
      totalReceived: 0,
      totalDistributed: 0,
      totalNet: 0,
      hasQuantifiable: false,
    });
  }

  // Accumulate received items
  const itemTracker = new Map<string, Map<string, { received: number; distributed: number }>>();
  for (const tx of received) {
    const parsed = parseItems(tx.items);
    if (parsed.size > 0) {
      if (!itemTracker.has(tx.categoryId)) itemTracker.set(tx.categoryId, new Map());
      const catItems = itemTracker.get(tx.categoryId)!;
      for (const [name, qty] of parsed) {
        const entry = catItems.get(name) || { received: 0, distributed: 0 };
        entry.received += qty;
        catItems.set(name, entry);
      }
    } else if (tx.quantity && !isNaN(parseInt(tx.quantity, 10))) {
      // Only use quantity field when items aren't parseable
      const inv = inventoryMap.get(tx.categoryId);
      if (inv) { inv.totalReceived += parseInt(tx.quantity, 10); inv.hasQuantifiable = true; }
    }
  }
  // Accumulate distributed items
  for (const tx of distributed) {
    const parsed = parseItems(tx.items);
    if (parsed.size > 0) {
      if (!itemTracker.has(tx.categoryId)) itemTracker.set(tx.categoryId, new Map());
      const catItems = itemTracker.get(tx.categoryId)!;
      for (const [name, qty] of parsed) {
        const entry = catItems.get(name) || { received: 0, distributed: 0 };
        entry.distributed += qty;
        catItems.set(name, entry);
      }
    } else if (tx.quantity && !isNaN(parseInt(tx.quantity, 10))) {
      const inv = inventoryMap.get(tx.categoryId);
      if (inv) { inv.totalDistributed += parseInt(tx.quantity, 10); inv.hasQuantifiable = true; }
    }
  }

  // Build inventory entries
  for (const [catId, catItems] of itemTracker) {
    const inv = inventoryMap.get(catId);
    if (!inv) continue;
    inv.hasQuantifiable = true;
    for (const [name, data] of catItems) {
      const net = data.received - data.distributed;
      inv.items.push({ name, received: data.received, distributed: data.distributed, net });
      inv.totalReceived += data.received;
      inv.totalDistributed += data.distributed;
      inv.totalNet += net;
    }
    // Sort items: in-stock first, then out-of-stock
    inv.items.sort((a, b) => b.net - a.net);
  }

  // Calculate totals
  const allWithItems = [...inventoryMap.values()].filter(inv => inv.hasQuantifiable);
  const grandTotalReceived = allWithItems.reduce((s, inv) => s + inv.totalReceived, 0);
  const grandTotalDistributed = allWithItems.reduce((s, inv) => s + inv.totalDistributed, 0);
  const grandTotalNet = allWithItems.reduce((s, inv) => s + inv.totalNet, 0);
  const totalUniqueItems = new Set(allWithItems.flatMap(inv => inv.items.map(i => i.name))).size;
  const outOfStockCount = allWithItems.flatMap(inv => inv.items).filter(i => i.net <= 0).length;
  const inStockCount = allWithItems.flatMap(inv => inv.items).filter(i => i.net > 0).length;

  function stockStatus(net: number) {
    if (net <= 0) return { label: 'Out of Stock', color: '#e02040', bg: 'rgba(224,32,64,0.12)' };
    if (net <= 10) return { label: 'Low Stock', color: '#f0a000', bg: 'rgba(240,160,0,0.12)' };
    return { label: 'In Stock', color: '#00a050', bg: 'rgba(0,160,80,0.12)' };
  }

  return h('div', { class: 'admin-inventory' },
    // ── Summary Cards ──
    h('div', { class: 'admin-inventory-summary' },
      h('div', { class: 'admin-inventory-card' },
        h('div', { class: 'admin-inventory-card-icon', style: 'background: rgba(0,160,80,0.12); color: #00a050;' }, '📦'),
        h('div', { class: 'admin-inventory-card-info' },
          h('span', { class: 'admin-inventory-card-number' }, String(grandTotalReceived)),
          h('span', { class: 'admin-inventory-card-label' }, 'Total Received'),
        ),
      ),
      h('div', { class: 'admin-inventory-card' },
        h('div', { class: 'admin-inventory-card-icon', style: 'background: rgba(0,144,208,0.12); color: #0090d0;' }, '🚚'),
        h('div', { class: 'admin-inventory-card-info' },
          h('span', { class: 'admin-inventory-card-number' }, String(grandTotalDistributed)),
          h('span', { class: 'admin-inventory-card-label' }, 'Total Distributed'),
        ),
      ),
      h('div', { class: 'admin-inventory-card' },
        h('div', { class: 'admin-inventory-card-icon', style: 'background: rgba(240,160,0,0.12); color: #f0a000;' }, '📋'),
        h('div', { class: 'admin-inventory-card-info' },
          h('span', { class: 'admin-inventory-card-number' }, String(grandTotalNet)),
          h('span', { class: 'admin-inventory-card-label' }, 'In Stock Now'),
        ),
      ),
      h('div', { class: 'admin-inventory-card' },
        h('div', { class: 'admin-inventory-card-icon', style: 'background: rgba(160,64,255,0.12); color: #a040ff;' }, '🏷️'),
        h('div', { class: 'admin-inventory-card-info' },
          h('span', { class: 'admin-inventory-card-number' }, String(totalUniqueItems)),
          h('span', { class: 'admin-inventory-card-label' }, 'Unique Items'),
        ),
      ),
      h('div', { class: 'admin-inventory-card' },
        h('div', { class: 'admin-inventory-card-icon', style: 'background: rgba(0,160,80,0.12); color: #00a050;' }, '✅'),
        h('div', { class: 'admin-inventory-card-info' },
          h('span', { class: 'admin-inventory-card-number' }, String(inStockCount)),
          h('span', { class: 'admin-inventory-card-label' }, 'Items Available'),
        ),
      ),
      h('div', { class: 'admin-inventory-card' },
        h('div', { class: 'admin-inventory-card-icon', style: 'background: rgba(224,32,64,0.12); color: #e02040;' }, '⚠️'),
        h('div', { class: 'admin-inventory-card-info' },
          h('span', { class: 'admin-inventory-card-number' }, String(outOfStockCount)),
          h('span', { class: 'admin-inventory-card-label' }, 'Out of Stock'),
        ),
      ),
    ),

    // ── Per-Category Inventory ──
    ...allWithItems.map(inv => {
      const pct = inv.totalReceived > 0 ? Math.round(((inv.totalReceived - inv.totalNet) / inv.totalReceived) * 100) : 0;
      return h('div', { class: 'admin-inventory-category' },
        h('div', { class: 'admin-inventory-cat-header' },
          h('div', { class: 'admin-inventory-cat-title' },
            h('span', { class: 'admin-inventory-cat-icon' }, inv.catIcon),
            h('span', null, inv.catTitle),
          ),
          h('div', { class: 'admin-inventory-cat-summary' },
            h('span', { class: 'admin-inventory-cat-stat', style: 'color: #00a050;' }, `${inv.totalReceived} in`),
            h('span', { class: 'admin-inventory-cat-sep' }, '/'),
            h('span', { class: 'admin-inventory-cat-stat', style: 'color: #0090d0;' }, `${inv.totalDistributed} out`),
            h('span', { class: 'admin-inventory-cat-sep' }, '/'),
            h('span', { class: 'admin-inventory-cat-stat', style: `color: ${inv.totalNet > 0 ? '#f0a000' : '#e02040'}; font-weight: 800;` }, `${inv.totalNet} remaining`),
          ),
        ),
        // Overall bar
        h('div', { class: 'admin-inventory-bar-wrap' },
          h('div', { class: 'admin-inventory-bar-track' },
            h('div', { class: 'admin-inventory-bar-fill distributed', style: `width: ${pct}%;` }),
          ),
          h('div', { class: 'admin-inventory-bar-labels' },
            h('span', null, `${inv.totalReceived} received`),
            h('span', null, `${pct}% distributed`),
          ),
        ),
        // Item table
        h('div', { class: 'admin-inventory-table-wrap' },
          h('table', { class: 'admin-inventory-table' },
            h('thead', null,
              h('tr', null,
                h('th', null, 'Item'),
                h('th', null, '📥 Received'),
                h('th', null, '📤 Distributed'),
                h('th', null, '📦 In Stock'),
                h('th', null, 'Status'),
              ),
            ),
            h('tbody', null,
              ...inv.items.map(item => {
                const status = stockStatus(item.net);
                const itemPct = item.received > 0 ? Math.round((item.net / item.received) * 100) : 0;
                return h('tr', null,
                  h('td', { class: 'admin-inventory-item-name' }, item.name),
                  h('td', null, String(item.received)),
                  h('td', null, String(item.distributed)),
                  h('td', { class: 'admin-inventory-item-stock' },
                    h('span', null, String(item.net)),
                    h('div', { class: 'admin-inventory-mini-bar' },
                      h('div', { class: 'admin-inventory-mini-fill', style: `width: ${Math.max(0, itemPct)}%; background: ${status.color};` }),
                    ),
                  ),
                  h('td', null,
                    h('span', { class: 'admin-inventory-status', style: `background: ${status.bg}; color: ${status.color};` }, status.label),
                  ),
                );
              }),
            ),
          ),
        ),
      );
    }),

    // Empty state if no quantifiable items
    allWithItems.length === 0 ? h('div', { class: 'admin-empty-state' },
      h('div', { class: 'admin-empty-icon' }, '📦'),
      h('p', { class: 'admin-empty-text' }, 'No quantifiable inventory data yet'),
      h('p', { class: 'admin-empty-hint' }, 'Add quantities to transactions to track inventory'),
    ) : null,
  );
}

// ─── Donation Reports ────────────────────────────────────

function renderDonationReports() {
  const allReceived = getTransactionsByType('received');
  const allDistributed = getTransactionsByType('distributed');
  const categories = getDonationCategories();
  const catMap = new Map(categories.map(c => [c.id, c]));

  const totalReceivedAmt = allReceived.reduce((s, t) => s + (t.amount || 0), 0);
  const totalInKind = [...allReceived, ...allDistributed].filter(t => !t.amount || t.amount === 0).length;
  const totalMonetary = [...allReceived, ...allDistributed].filter(t => t.amount && t.amount > 0).length;
  const avgDonation = totalMonetary > 0 ? Math.round(totalReceivedAmt / totalMonetary) : 0;

  // Group by category
  const byCategory: Record<string, { received: number; distributed: number; receivedAmt: number }> = {};
  for (const cat of categories) {
    byCategory[cat.id] = { received: 0, distributed: 0, receivedAmt: 0 };
  }
  for (const tx of allReceived) {
    if (byCategory[tx.categoryId]) {
      byCategory[tx.categoryId].received++;
      byCategory[tx.categoryId].receivedAmt += tx.amount || 0;
    }
  }
  for (const tx of allDistributed) {
    if (byCategory[tx.categoryId]) {
      byCategory[tx.categoryId].distributed++;
    }
  }

  // Group by month
  const byMonth: Record<string, { received: number; distributed: number; receivedAmt: number }> = {};
  const allTx = [...allReceived, ...allDistributed].sort((a, b) => a.date.localeCompare(b.date));
  for (const tx of allTx) {
    const parts = tx.date.split(' ');
    const monthKey = parts.length >= 3 ? `${parts[0]} ${parts[2]}` : parts[0];
    if (!byMonth[monthKey]) byMonth[monthKey] = { received: 0, distributed: 0, receivedAmt: 0 };
    if (tx.type === 'received') {
      byMonth[monthKey].received++;
      byMonth[monthKey].receivedAmt += tx.amount || 0;
    } else {
      byMonth[monthKey].distributed++;
    }
  }

  // ── Build inventory data for reports ──
  function parseItemsReport(itemsStr: string): Map<string, number> {
    const map = new Map<string, number>();
    const parts = itemsStr.split(',').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      const match = part.match(/^(\d+)\s+(.+)$/);
      if (match) map.set(match[2].trim(), (map.get(match[2].trim()) || 0) + parseInt(match[1], 10));
    }
    return map;
  }
  const rptInvTracker = new Map<string, Map<string, { received: number; distributed: number }>>();
  for (const tx of allReceived) {
    const parsed = parseItemsReport(tx.items);
    if (parsed.size > 0) {
      if (!rptInvTracker.has(tx.categoryId)) rptInvTracker.set(tx.categoryId, new Map());
      const catItems = rptInvTracker.get(tx.categoryId)!;
      for (const [name, qty] of parsed) {
        const entry = catItems.get(name) || { received: 0, distributed: 0 };
        entry.received += qty;
        catItems.set(name, entry);
      }
    }
  }
  for (const tx of allDistributed) {
    const parsed = parseItemsReport(tx.items);
    if (parsed.size > 0) {
      if (!rptInvTracker.has(tx.categoryId)) rptInvTracker.set(tx.categoryId, new Map());
      const catItems = rptInvTracker.get(tx.categoryId)!;
      for (const [name, qty] of parsed) {
        const entry = catItems.get(name) || { received: 0, distributed: 0 };
        entry.distributed += qty;
        catItems.set(name, entry);
      }
    }
  }
  const rptInvEntries: { catId: string; catTitle: string; catIcon: string; name: string; received: number; distributed: number; net: number; status: string }[] = [];
  let rptTotalReceived = 0, rptTotalDistributed = 0, rptTotalNet = 0;
  let rptInStock = 0, rptLowStock = 0, rptOutStock = 0;
  for (const [catId, catItems] of rptInvTracker) {
    const cat = catMap.get(catId);
    for (const [name, data] of catItems) {
      const net = data.received - data.distributed;
      const status = net <= 0 ? 'Out of Stock' : net <= 10 ? 'Low Stock' : 'In Stock';
      rptInvEntries.push({ catId, catTitle: cat ? cat.title : catId, catIcon: cat ? cat.icon : '📦', name, received: data.received, distributed: data.distributed, net, status });
      rptTotalReceived += data.received;
      rptTotalDistributed += data.distributed;
      rptTotalNet += net;
      if (net <= 0) rptOutStock++;
      else if (net <= 10) rptLowStock++;
      else rptInStock++;
    }
  }
  rptInvEntries.sort((a, b) => a.catTitle.localeCompare(b.catTitle) || a.name.localeCompare(b.name));

  return h('div', { class: 'admin-reports' },
    // ── Report Actions Bar ──
    h('div', { class: 'admin-reports-actions' },
      h('div', { class: 'admin-reports-filters' },
        h('div', { class: 'admin-reports-filter' },
          h('label', { class: 'admin-label', style: 'font-size:0.75rem; margin-bottom:2px;' }, 'From'),
          h('input', { type: 'date', class: 'admin-input', 'data-field': 'report-date-from', style: 'padding:6px 10px; font-size:0.8rem;' }),
        ),
        h('div', { class: 'admin-reports-filter' },
          h('label', { class: 'admin-label', style: 'font-size:0.75rem; margin-bottom:2px;' }, 'To'),
          h('input', { type: 'date', class: 'admin-input', 'data-field': 'report-date-to', style: 'padding:6px 10px; font-size:0.8rem;' }),
        ),
        h('button', {
          class: 'admin-reports-filter-btn',
          onClick: () => rerenderAdmin(),
        }, '🔍 Filter'),
      ),
      h('div', { class: 'admin-reports-export-btns' },
        h('button', {
          class: 'admin-export-btn admin-export-csv',
          onClick: () => exportDonationCSV(),
        }, '📥 Export CSV'),
        h('button', {
          class: 'admin-export-btn admin-export-print',
          onClick: () => printDonationReport(),
        }, '🖨️ Print Report'),
      ),
    ),

    // ── Summary Cards ──
    h('div', { class: 'admin-reports-summary' },
      h('div', { class: 'admin-report-card' },
        h('div', { class: 'admin-report-icon', style: 'background: #00a05022; color: #00a050;' }, '📥'),
        h('div', { class: 'admin-report-info' },
          h('span', { class: 'admin-report-number' }, String(allReceived.length)),
          h('span', { class: 'admin-report-label' }, 'Received'),
        ),
      ),
      h('div', { class: 'admin-report-card' },
        h('div', { class: 'admin-report-icon', style: 'background: #0090d022; color: #0090d0;' }, '📤'),
        h('div', { class: 'admin-report-info' },
          h('span', { class: 'admin-report-number' }, String(allDistributed.length)),
          h('span', { class: 'admin-report-label' }, 'Distributed'),
        ),
      ),
      h('div', { class: 'admin-report-card' },
        h('div', { class: 'admin-report-icon', style: 'background: #f0a00022; color: #f0a000;' }, '💰'),
        h('div', { class: 'admin-report-info' },
          h('span', { class: 'admin-report-number' }, `LKR ${(totalReceivedAmt / 1000).toFixed(0)}K`),
          h('span', { class: 'admin-report-label' }, 'Total Value'),
        ),
      ),
      h('div', { class: 'admin-report-card' },
        h('div', { class: 'admin-report-icon', style: 'background: #a040ff22; color: #a040ff;' }, '📊'),
        h('div', { class: 'admin-report-info' },
          h('span', { class: 'admin-report-number' }, `LKR ${(avgDonation / 1000).toFixed(1)}K`),
          h('span', { class: 'admin-report-label' }, 'Avg. Donation'),
        ),
      ),
      h('div', { class: 'admin-report-card' },
        h('div', { class: 'admin-report-icon', style: 'background: #e0204022; color: #e02040;' }, '📦'),
        h('div', { class: 'admin-report-info' },
          h('span', { class: 'admin-report-number' }, String(totalInKind)),
          h('span', { class: 'admin-report-label' }, 'In-Kind'),
        ),
      ),
    ),

    // ── Monthly Breakdown ──
    h('div', { class: 'admin-reports-section' },
      h('div', { class: 'admin-reports-section-header' },
        h('h3', { class: 'admin-section-title' }, '📅 Monthly Breakdown'),
      ),
      h('div', { class: 'admin-reports-table-wrap' },
        h('table', { class: 'admin-reports-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, 'Month'),
              h('th', null, '📥 Received'),
              h('th', null, '📤 Distributed'),
              h('th', null, '💰 Amount (LKR)'),
              h('th', null, 'Net'),
            ),
          ),
          h('tbody', null,
            ...Object.entries(byMonth).map(([month, data]) =>
              h('tr', null,
                h('td', { class: 'admin-reports-month' }, month),
                h('td', null, String(data.received)),
                h('td', null, String(data.distributed)),
                h('td', null, data.receivedAmt > 0 ? `LKR ${data.receivedAmt.toLocaleString()}` : '-'),
                h('td', { style: 'font-weight: 700; color: #00a050;' },
                  data.receivedAmt > 0 ? `+${((data.receivedAmt) / 1000).toFixed(0)}K` : '-',
                ),
              ),
            ),
          ),
        ),
      ),
    ),

    // ── Category Breakdown ──
    h('div', { class: 'admin-reports-section' },
      h('div', { class: 'admin-reports-section-header' },
        h('h3', { class: 'admin-section-title' }, '💝 By Category'),
      ),
      h('div', { class: 'admin-reports-category-grid' },
        ...categories.filter(c => byCategory[c.id] && (byCategory[c.id].received > 0 || byCategory[c.id].distributed > 0)).map(cat => {
          const data = byCategory[cat.id];
          const pct = cat.goal > 0 ? Math.min(100, Math.round((data.receivedAmt / cat.goal) * 100)) : 0;
          return h('div', { class: 'admin-reports-category-card' },
            h('div', { class: 'admin-reports-cat-header' },
              h('span', { class: 'admin-reports-cat-icon' }, cat.icon),
              h('span', { class: 'admin-reports-cat-title' }, cat.title),
            ),
            data.receivedAmt > 0 ? h('div', { class: 'admin-reports-cat-bar-wrap' },
              h('div', { class: 'admin-reports-cat-bar', style: `width: ${pct}%; background: ${cat.color || '#e02040'};` }),
              h('span', { class: 'admin-reports-cat-bar-label' }, `${pct}% of goal`),
            ) : null,
            h('div', { class: 'admin-reports-cat-stats' },
              h('span', null, `📥 ${data.received} received`),
              h('span', null, `📤 ${data.distributed} distributed`),
              data.receivedAmt > 0 ? h('span', { style: 'color: #00a050; font-weight: 600;' }, `LKR ${data.receivedAmt.toLocaleString()}`) : null,
            ),
          );
        }),
      ),
    ),

    // ── Inventory Summary ──
    rptInvEntries.length > 0 ? h('div', { class: 'admin-reports-section' },
      h('div', { class: 'admin-reports-section-header' },
        h('h3', { class: 'admin-section-title' }, '📦 Inventory Status'),
        h('span', { class: 'admin-reports-count' }, `${rptInvEntries.length} items tracked`),
      ),
      h('div', { class: 'admin-reports-summary' },
        h('div', { class: 'admin-reports-card' },
          h('div', { class: 'admin-reports-card-icon', style: 'background: rgba(0,160,80,0.12); color: #00a050;' }, '📦'),
          h('div', { class: 'admin-reports-card-info' },
            h('span', { class: 'admin-reports-card-value' }, String(rptTotalReceived)),
            h('span', { class: 'admin-reports-card-label' }, 'Total Received'),
          ),
        ),
        h('div', { class: 'admin-reports-card' },
          h('div', { class: 'admin-reports-card-icon', style: 'background: rgba(0,144,208,0.12); color: #0090d0;' }, '📤'),
          h('div', { class: 'admin-reports-card-info' },
            h('span', { class: 'admin-reports-card-value' }, String(rptTotalDistributed)),
            h('span', { class: 'admin-reports-card-label' }, 'Total Distributed'),
          ),
        ),
        h('div', { class: 'admin-reports-card' },
          h('div', { class: 'admin-reports-card-icon', style: 'background: rgba(0,160,80,0.12); color: #00a050;' }, '📊'),
          h('div', { class: 'admin-reports-card-info' },
            h('span', { class: 'admin-reports-card-value' }, String(rptTotalNet)),
            h('span', { class: 'admin-reports-card-label' }, 'Net In Stock'),
          ),
        ),
        h('div', { class: 'admin-reports-card' },
          h('div', { class: 'admin-reports-card-icon', style: `background: rgba(${rptOutStock > 0 ? '224,32,64' : '0,160,80'},0.12); color: ${rptOutStock > 0 ? '#e02040' : '#00a050'};` }, rptOutStock > 0 ? '⚠️' : '✅'),
          h('div', { class: 'admin-reports-card-info' },
            h('span', { class: 'admin-reports-card-value' }, `${rptInStock} / ${rptLowStock} / ${rptOutStock}`),
            h('span', { class: 'admin-reports-card-label' }, 'In Stock / Low / Out'),
          ),
        ),
      ),
      h('div', { class: 'admin-reports-table-wrap' },
        h('table', { class: 'admin-reports-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, 'Category'),
              h('th', null, 'Item'),
              h('th', null, 'Received'),
              h('th', null, 'Distributed'),
              h('th', null, 'In Stock'),
              h('th', null, 'Status'),
            ),
          ),
          h('tbody', null,
            ...rptInvEntries.map(entry => {
              const statusColor = entry.net <= 0 ? '#e02040' : entry.net <= 10 ? '#f0a000' : '#00a050';
              return h('tr', null,
                h('td', null, `${entry.catIcon} ${entry.catTitle}`),
                h('td', null, entry.name),
                h('td', null, String(entry.received)),
                h('td', null, String(entry.distributed)),
                h('td', { style: 'font-weight: 700;' }, String(entry.net)),
                h('td', { style: `color: ${statusColor}; font-weight: 600;` }, entry.status),
              );
            }),
          ),
        ),
      ),
    ) : null,

    // ── Full Transaction Log ──
    h('div', { class: 'admin-reports-section' },
      h('div', { class: 'admin-reports-section-header' },
        h('h3', { class: 'admin-section-title' }, '📋 Full Transaction Log'),
        h('span', { class: 'admin-reports-count' }, `${allTx.length} records`),
      ),
      h('div', { class: 'admin-reports-table-wrap' },
        h('table', { class: 'admin-reports-table admin-reports-full-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, 'Type'),
              h('th', null, 'Date'),
              h('th', null, 'Contact'),
              h('th', null, 'Category'),
              h('th', null, 'Items'),
              h('th', null, 'Amount'),
              h('th', null, 'Ref #'),
            ),
          ),
          h('tbody', null,
            ...allTx.map(tx => {
              const cat = catMap.get(tx.categoryId);
              const isReceived = tx.type === 'received';
              return h('tr', null,
                h('td', null,
                  h('span', {
                    class: 'admin-tx-type-pill',
                    style: `background: ${isReceived ? '#00a05022' : '#0090d022'}; color: ${isReceived ? '#00a050' : '#0090d0'};`,
                  }, isReceived ? '📥 Received' : '📤 Distributed'),
                ),
                h('td', { class: 'admin-reports-month' }, tx.date),
                h('td', null, tx.contactName),
                h('td', null, cat ? `${cat.icon} ${cat.title}` : '-'),
                h('td', { style: 'max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' }, tx.items),
                h('td', { style: `font-weight: 700; color: ${tx.amount && tx.amount > 0 ? '#00a050' : 'var(--text-muted)'};` },
                  tx.amount && tx.amount > 0 ? `LKR ${tx.amount.toLocaleString()}` : 'In-kind',
                ),
                h('td', { style: 'font-family: var(--font-code); font-size: 0.75rem; color: var(--text-muted);' }, tx.receiptNo || '-'),
              );
            }),
          ),
        ),
      ),
    ),
  );
}

// ─── CSV Export ───────────────────────────────────────────

function exportDonationCSV() {
  const received = getTransactionsByType('received');
  const distributed = getTransactionsByType('distributed');
  const categories = getDonationCategories();
  const catMap = new Map(categories.map(c => [c.id, c]));

  const allTx = [...received, ...distributed].sort((a, b) => a.date.localeCompare(b.date));

  // ── Transactions section ──
  const txHeader = ['Type', 'Date', 'Contact Name', 'Contact Info', 'Category', 'Items', 'Quantity', 'Amount (LKR)', 'Payment Method', 'Receipt/Ref', 'Notes'];
  const txRows = allTx.map(tx => {
    const cat = catMap.get(tx.categoryId);
    return [
      tx.type === 'received' ? 'Received' : 'Distributed',
      tx.date,
      tx.contactName,
      tx.contactInfo || '',
      cat ? cat.title : '',
      tx.items,
      tx.quantity || '',
      tx.amount ? String(tx.amount) : '0',
      tx.paymentMethod || '',
      tx.receiptNo || '',
      tx.notes || '',
    ];
  });

  // ── Build inventory ──
  function parseItemsCSV(itemsStr: string): Map<string, number> {
    const map = new Map<string, number>();
    const parts = itemsStr.split(',').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      const match = part.match(/^(\d+)\s+(.+)$/);
      if (match) map.set(match[2].trim(), (map.get(match[2].trim()) || 0) + parseInt(match[1], 10));
    }
    return map;
  }
  const invTracker = new Map<string, Map<string, { received: number; distributed: number }>>();
  for (const tx of received) {
    const parsed = parseItemsCSV(tx.items);
    if (parsed.size > 0) {
      if (!invTracker.has(tx.categoryId)) invTracker.set(tx.categoryId, new Map());
      const catItems = invTracker.get(tx.categoryId)!;
      for (const [name, qty] of parsed) {
        const entry = catItems.get(name) || { received: 0, distributed: 0 };
        entry.received += qty;
        catItems.set(name, entry);
      }
    }
  }
  for (const tx of distributed) {
    const parsed = parseItemsCSV(tx.items);
    if (parsed.size > 0) {
      if (!invTracker.has(tx.categoryId)) invTracker.set(tx.categoryId, new Map());
      const catItems = invTracker.get(tx.categoryId)!;
      for (const [name, qty] of parsed) {
        const entry = catItems.get(name) || { received: 0, distributed: 0 };
        entry.distributed += qty;
        catItems.set(name, entry);
      }
    }
  }
  const invHeader = ['Category', 'Item', 'Received', 'Distributed', 'In Stock', 'Status'];
  const invRows: string[][] = [];
  for (const [catId, catItems] of invTracker) {
    const cat = catMap.get(catId);
    for (const [name, data] of catItems) {
      const net = data.received - data.distributed;
      const status = net <= 0 ? 'Out of Stock' : net <= 10 ? 'Low Stock' : 'In Stock';
      invRows.push([cat ? cat.title : catId, name, String(data.received), String(data.distributed), String(net), status]);
    }
  }
  invRows.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));

  // ── Combine CSV ──
  const escCell = (cell: string) => `"${String(cell).replace(/"/g, '""')}"`;
  const csvLines = [
    'TRANSACTIONS',
    [txHeader, ...txRows].map(row => row.map(escCell).join(',')).join(''),
    '',
    'INVENTORY',
    [invHeader, ...invRows].map(row => row.map(escCell).join(',')).join(''),
  ].join('\n');

  const blob = new Blob([csvLines], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hope-hub-donations-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('success', 'CSV Exported', `${allTx.length} transactions + ${invRows.length} inventory items exported`);
}

// ─── Print Report ─────────────────────────────────────────

function printDonationReport() {
  const received = getTransactionsByType('received');
  const distributed = getTransactionsByType('distributed');
  const categories = getDonationCategories();
  const catMap = new Map(categories.map(c => [c.id, c]));

  const totalReceivedAmt = received.reduce((s, t) => s + (t.amount || 0), 0);
  const allTx = [...received, ...distributed].sort((a, b) => a.date.localeCompare(b.date));

  // ── Build inventory for print ──
  function parseItemsP(itemsStr: string): Map<string, number> {
    const map = new Map<string, number>();
    const parts = itemsStr.split(',').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      const match = part.match(/^(\d+)\s+(.+)$/);
      if (match) map.set(match[2].trim(), (map.get(match[2].trim()) || 0) + parseInt(match[1], 10));
    }
    return map;
  }
  const invTracker = new Map<string, Map<string, { received: number; distributed: number }>>();
  for (const tx of received) {
    const parsed = parseItemsP(tx.items);
    if (parsed.size > 0) {
      if (!invTracker.has(tx.categoryId)) invTracker.set(tx.categoryId, new Map());
      const catItems = invTracker.get(tx.categoryId)!;
      for (const [name, qty] of parsed) {
        const entry = catItems.get(name) || { received: 0, distributed: 0 };
        entry.received += qty;
        catItems.set(name, entry);
      }
    }
  }
  for (const tx of distributed) {
    const parsed = parseItemsP(tx.items);
    if (parsed.size > 0) {
      if (!invTracker.has(tx.categoryId)) invTracker.set(tx.categoryId, new Map());
      const catItems = invTracker.get(tx.categoryId)!;
      for (const [name, qty] of parsed) {
        const entry = catItems.get(name) || { received: 0, distributed: 0 };
        entry.distributed += qty;
        catItems.set(name, entry);
      }
    }
  }
  const invPrintRows: { cat: string; name: string; received: number; distributed: number; net: number; status: string }[] = [];
  for (const [catId, catItems] of invTracker) {
    const cat = catMap.get(catId);
    for (const [name, data] of catItems) {
      const net = data.received - data.distributed;
      const status = net <= 0 ? 'Out of Stock' : net <= 10 ? 'Low Stock' : 'In Stock';
      invPrintRows.push({ cat: cat ? cat.title : catId, name, received: data.received, distributed: data.distributed, net, status });
    }
  }
  invPrintRows.sort((a, b) => a.cat.localeCompare(b.cat) || a.name.localeCompare(b.name));

  const byMonth: Record<string, { received: number; distributed: number; receivedAmt: number }> = {};
  for (const tx of allTx) {
    const parts = tx.date.split(' ');
    const monthKey = parts.length >= 3 ? `${parts[0]} ${parts[2]}` : parts[0];
    if (!byMonth[monthKey]) byMonth[monthKey] = { received: 0, distributed: 0, receivedAmt: 0 };
    if (tx.type === 'received') {
      byMonth[monthKey].received++;
      byMonth[monthKey].receivedAmt += tx.amount || 0;
    } else {
      byMonth[monthKey].distributed++;
    }
  }

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hope Hub - Donation Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 40px; }
        .header { text-align: center; margin-bottom: 32px; border-bottom: 3px solid #e02040; padding-bottom: 20px; }
        .header h1 { font-size: 28px; color: #e02040; margin-bottom: 4px; }
        .header p { color: #666; font-size: 14px; }
        .header .date { font-size: 12px; color: #999; margin-top: 8px; }
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .summary-card { background: #f8f9fa; border-radius: 8px; padding: 16px; text-align: center; border: 1px solid #e9ecef; }
        .summary-card .number { font-size: 24px; font-weight: 800; color: #1a1a2e; }
        .summary-card .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
        h2 { font-size: 18px; color: #1a1a2e; margin: 24px 0 12px; border-bottom: 1px solid #e9ecef; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px; }
        th { background: #1a1a2e; color: white; padding: 10px 12px; text-align: left; font-weight: 600; }
        td { padding: 8px 12px; border-bottom: 1px solid #e9ecef; }
        tr:nth-child(even) { background: #f8f9fa; }
        .received { color: #00a050; font-weight: 600; }
        .distributed { color: #0090d0; font-weight: 600; }
        .amount { font-weight: 700; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #e9ecef; text-align: center; font-size: 11px; color: #999; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Richmond College Hope Hub</h1>
        <p>Donation Management Report</p>
        <p class="date">Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div class="summary">
        <div class="summary-card"><div class="number">${received.length}</div><div class="label">Received</div></div>
        <div class="summary-card"><div class="number">${distributed.length}</div><div class="label">Distributed</div></div>
        <div class="summary-card"><div class="number">LKR ${(totalReceivedAmt / 1000).toFixed(0)}K</div><div class="label">Total Value</div></div>
        <div class="summary-card"><div class="number">${allTx.length}</div><div class="label">Total Transactions</div></div>
      </div>

      <h2>Monthly Summary</h2>
      <table>
        <thead><tr><th>Month</th><th>Received</th><th>Distributed</th><th>Amount (LKR)</th></tr></thead>
        <tbody>${Object.entries(byMonth).map(([m, d]) => `<tr><td>${m}</td><td>${d.received}</td><td>${d.distributed}</td><td>${d.receivedAmt > 0 ? 'LKR ' + d.receivedAmt.toLocaleString() : '-'}</td></tr>`).join('')}</tbody>
      </table>

      <h2>Received Donations</h2>
      <table>
        <thead><tr><th>Date</th><th>Donor</th><th>Category</th><th>Items</th><th>Amount</th><th>Ref #</th></tr></thead>
        <tbody>${received.map(tx => {
          const cat = catMap.get(tx.categoryId);
          return `<tr><td>${tx.date}</td><td>${tx.contactName}</td><td>${cat ? cat.title : '-'}</td><td>${tx.items}</td><td class="amount received">${tx.amount && tx.amount > 0 ? 'LKR ' + tx.amount.toLocaleString() : 'In-kind'}</td><td>${tx.receiptNo || '-'}</td></tr>`;
        }).join('')}</tbody>
      </table>

      <h2>Distributed Donations</h2>
      <table>
        <thead><tr><th>Date</th><th>Recipient</th><th>Category</th><th>Items</th><th>Notes</th></tr></thead>
        <tbody>${distributed.map(tx => {
          const cat = catMap.get(tx.categoryId);
          return `<tr><td>${tx.date}</td><td>${tx.contactName}</td><td>${cat ? cat.title : '-'}</td><td>${tx.items}</td><td>${tx.notes || '-'}</td></tr>`;
        }).join('')}</tbody>
      </table>

      <h2>Inventory Status</h2>
      <table>
        <thead><tr><th>Category</th><th>Item</th><th>Received</th><th>Distributed</th><th>In Stock</th><th>Status</th></tr></thead>
        <tbody>${invPrintRows.length > 0 ? invPrintRows.map(r => {
          const statusColor = r.net <= 0 ? '#e02040' : r.net <= 10 ? '#f0a000' : '#00a050';
          return `<tr><td>${r.cat}</td><td>${r.name}</td><td>${r.received}</td><td>${r.distributed}</td><td style="font-weight:700;">${r.net}</td><td style="color:${statusColor};font-weight:600;">${r.status}</td></tr>`;
        }).join('') : '<tr><td colspan="6" style="text-align:center;color:#999;">No inventory data</td></tr>'}</tbody>
      </table>

      <div class="footer">
        Richmond College Hope Hub &mdash; Donation Report &mdash; Confidential
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
  showToast('success', 'Report Ready', 'Print dialog opening...');
}

// ─── Users List ───────────────────────────────────────────

function renderUsersList() {
  const profiles = getAllProfilesWithStatus();
  const statusColors: Record<string, string> = {
    active: '#00a050',
    pending: '#f0a000',
    rejected: '#e02040',
  };
  const statusLabels: Record<string, string> = {
    active: '✅ Active',
    pending: '⏳ Pending',
    rejected: '❌ Rejected',
  };

  const pwUser = passwordDialogUser.peek();

  return h('div', { class: 'admin-list admin-users-list' },
    // Password change dialog overlay
    pwUser ? renderPasswordDialog(pwUser) : null,
    // Pending approval section
    profiles.filter(p => p.status === 'pending').length > 0
      ? h('div', { class: 'admin-users-section' },
          h('h3', { class: 'admin-users-section-title' }, '⏳ Pending Approval'),
          ...profiles.filter(p => p.status === 'pending').map(p => renderUserCard(p, statusColors, statusLabels)),
        )
      : null,

    // All users section
    h('div', { class: 'admin-users-section' },
      h('h3', { class: 'admin-users-section-title' }, '👥 All Users'),
      ...profiles.map(p => renderUserCard(p, statusColors, statusLabels)),
    ),
  );
}

function renderUserCard(
  p: UserProfile,
  statusColors: Record<string, string>,
  statusLabels: Record<string, string>,
) {
  const cfg = roleConfig[p.role];

  return h('div', {
    class: `admin-list-item admin-user-item ${p.status === 'pending' ? 'user-pending' : ''} ${p.status === 'rejected' ? 'user-rejected' : ''}`,
  },
    h('div', { class: 'admin-item-icon', style: `background: ${cfg.gradient}; font-size: 1.5rem;` }, cfg.icon),
    h('div', { class: 'admin-item-info' },
      h('div', { class: 'admin-item-title' },
        p.full_name,
        h('span', {
          class: 'admin-tag',
          style: `background: ${cfg.color}22; color: ${cfg.color}; border: 1px solid ${cfg.color}44;`,
        }, cfg.label),
      ),
      h('div', { class: 'admin-item-meta' },
        h('span', null, p.email),
        h('span', {
          class: 'admin-tag',
          style: `background: ${statusColors[p.status]}22; color: ${statusColors[p.status]}; border: 1px solid ${statusColors[p.status]}44;`,
        }, statusLabels[p.status]),
        h('span', null, `Joined: ${new Date(p.created_at).toLocaleDateString()}`),
      ),
    ),
    h('div', { class: 'admin-item-actions admin-user-actions' },
      // ── Status change dropdown ──
      h('div', { class: 'admin-user-control' },
        h('label', { class: 'admin-user-control-label', style: 'font-size: 0.7rem; color: #888; margin-bottom: 2px; display: block;' }, 'Status'),
        h('select', {
          class: 'admin-select admin-status-select',
          value: p.status,
          onChange: (e: Event) => {
            const newStatus = (e.target as HTMLSelectElement).value as UserStatus;
            setUserStatus(p.id, newStatus);
            success('Status Updated', `${p.full_name} is now ${newStatus}.`);
            rerenderAdmin();
          },
        },
          h('option', { value: 'active', selected: p.status === 'active' }, '✅ Active'),
          h('option', { value: 'pending', selected: p.status === 'pending' }, '⏳ Pending'),
          h('option', { value: 'rejected', selected: p.status === 'rejected' }, '❌ Rejected'),
        ),
      ),
      // ── Role change dropdown ──
      h('div', { class: 'admin-user-control' },
        h('label', { class: 'admin-user-control-label', style: 'font-size: 0.7rem; color: #888; margin-bottom: 2px; display: block;' }, 'Role'),
        h('select', {
          class: 'admin-select admin-role-select',
          value: p.role,
          onChange: (e: Event) => {
            const newRole = (e.target as HTMLSelectElement).value as UserRole;
            updateUserRole(p.id, newRole);
            success('Role Updated', `${p.full_name} is now a ${roleConfig[newRole].label}.`);
            rerenderAdmin();
          },
        },
          h('option', { value: 'admin', selected: p.role === 'admin' }, '👑 Admin'),
          h('option', { value: 'teacher', selected: p.role === 'teacher' }, '🎓 Teacher'),
          h('option', { value: 'donor', selected: p.role === 'donor' }, '💝 Donor'),
        ),
      ),
      // ── Quick approve/reject for pending ──
      p.status === 'pending'
        ? h('button', {
            class: 'admin-action-btn btn-approve',
            onClick: () => {
              approveUser(p.id);
              success('User Approved', `${p.full_name} can now access the platform.`);
              rerenderAdmin();
            },
          }, '✅ Approve')
        : null,
      p.status === 'pending'
        ? h('button', {
            class: 'admin-action-btn btn-reject',
            onClick: () => {
              rejectUser(p.id);
              warning('User Rejected', `${p.full_name}'s access has been denied.`);
              rerenderAdmin();
            },
          }, '❌ Reject')
        : null,
      p.status === 'rejected'
        ? h('button', {
            class: 'admin-action-btn btn-approve',
            onClick: () => {
              approveUser(p.id);
              success('User Re-approved', `${p.full_name} can now access the platform.`);
              rerenderAdmin();
            },
          }, '♻️ Re-approve')
        : null,
      // ── Password change button ──
      h('button', {
        class: 'admin-action-btn btn-password',
        onClick: () => {
          passwordDialogUser.set(p);
          rerenderAdmin();
        },
      }, '🔑 Password'),
      // ── Delete button ──
      h('button', {
        class: 'admin-action-btn btn-delete-user',
        onClick: () => {
          if (confirm(`Are you sure you want to delete ${p.full_name} (${p.email})?\n\nThis action cannot be undone.`)) {
            deleteUser(p.id);
            warning('User Deleted', `${p.full_name} has been removed.`);
            rerenderAdmin();
          }
        },
      }, '🗑️ Delete'),
    ),
  );
}

// ─── Password Change Dialog ──────────────────────────────

function renderPasswordDialog(user: UserProfile) {
  return h('div', {
    class: 'admin-dialog-overlay',
    onClick: (e: Event) => {
      // Close on overlay click (not on dialog content)
      if ((e.target as HTMLElement).classList.contains('admin-dialog-overlay')) {
        passwordDialogUser.set(null);
        rerenderAdmin();
      }
    },
  },
    h('div', { class: 'admin-dialog' },
      h('div', { class: 'admin-dialog-header' },
        h('h3', null, `🔑 Change Password — ${user.full_name}`),
        h('button', {
          class: 'admin-form-close',
          onClick: () => { passwordDialogUser.set(null); rerenderAdmin(); },
        }, '✕'),
      ),
      h('div', { class: 'admin-dialog-body' },
        h('div', { class: 'admin-field' },
          h('label', { class: 'admin-label' }, `New password for ${user.email}`),
          h('input', {
            type: 'password',
            class: 'admin-input',
            'data-field': 'dialog-new-password',
            placeholder: 'Enter new password (min 6 characters)',
            autocomplete: 'new-password',
          }),
        ),
        h('div', { class: 'admin-field' },
          h('label', { class: 'admin-label' }, 'Confirm password'),
          h('input', {
            type: 'password',
            class: 'admin-input',
            'data-field': 'dialog-confirm-password',
            placeholder: 'Confirm new password',
            autocomplete: 'new-password',
          }),
        ),
        h('div', { class: 'admin-form-note' },
          h('span', { style: 'color: #888; font-size: 0.85rem;' },
            '⚠️ This changes the local sign-in password. The user will need to use this new password to log in.',
          ),
        ),
      ),
      h('div', { class: 'admin-dialog-actions' },
        h('button', {
          class: 'admin-save-btn',
          onClick: () => {
            const newPw = (document.querySelector('[data-field="dialog-new-password"]') as HTMLInputElement)?.value || '';
            const confirmPw = (document.querySelector('[data-field="dialog-confirm-password"]') as HTMLInputElement)?.value || '';
            if (newPw.length < 6) {
              warning('Weak Password', 'Password must be at least 6 characters.');
              return;
            }
            if (newPw !== confirmPw) {
              warning('Passwords Don\'t Match', 'Please re-enter the same password in both fields.');
              return;
            }
            changeUserPassword(user.id, newPw);
            success('Password Changed', `Password updated for ${user.full_name}.`);
            passwordDialogUser.set(null);
            rerenderAdmin();
          },
        }, '💾 Save Password'),
        h('button', {
          class: 'admin-cancel-btn',
          onClick: () => { passwordDialogUser.set(null); rerenderAdmin(); },
        }, 'Cancel'),
      ),
    ),
  );
}

// ─── Form View ────────────────────────────────────────────

function renderForm() {
  const tab = activeTab.peek();
  const editId = editingId.peek();

  switch (tab) {
    case 'notices': return renderNoticeForm(editId);
    case 'events': return renderEventForm(editId);
    case 'news': return renderNewsForm(editId);
    case 'donations': {
      const sub = donationSubTab.peek();
      if (sub === 'requests') return renderRequestForm(editId);
      if (sub === 'received') return renderTxForm(editId, 'received');
      if (sub === 'distributed') return renderTxForm(editId, 'distributed');
      return renderDonationForm(editId);
    }
    case 'users': return renderUserForm();
    default: return h('div', null, 'Unknown tab');
  }
}

function renderNoticeForm(editId: string | null) {
  const existing = editId ? getAllNotices().find(n => n.id === editId) : null;
  const title = existing ? 'Edit Notice' : 'Add New Notice';

  // Form state
  const fTitle = createSignal(existing?.title || '');
  const fExcerpt = createSignal(existing?.excerpt || '');
  const fFull = createSignal(existing?.full || '');
  const fTag = createSignal(existing?.tag || 'Active');
  const fIcon = createSignal(existing?.icon || '📋');
  const fDate = createSignal(existing?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  const fPublished = createSignal(existing?.published ?? true);

  return h('div', { class: 'admin-form' },
    h('div', { class: 'admin-form-header' },
      h('h2', null, title),
      h('button', {
        class: 'admin-form-close',
        onClick: () => { showForm.set(false); editingId.set(null); rerenderAdmin(); },
      }, '✕'),
    ),

    // Inline form with direct DOM (VORTEX signals don't persist across re-renders in forms)
    h('div', { class: 'admin-form-body', 'data-form-type': 'notice', 'data-edit-id': editId || '' },
      formField('Icon', 'text', existing?.icon || '📋', 'form-icon'),
      formField('Date', 'text', existing?.date || fDate.peek(), 'form-date'),
      formField('Title', 'text', existing?.title || '', 'form-title'),
      formField('Excerpt', 'textarea', existing?.excerpt || '', 'form-excerpt'),
      formField('Full Content', 'textarea', existing?.full || '', 'form-full'),
      formSelect('Tag', ['Active', 'Update', 'Event', 'Report'], existing?.tag || 'Active', 'form-tag'),
      formField('Photos (one URL per line)', 'textarea', existing?.photos?.join('\n') || '', 'form-notice-photos'),
      h('div', { class: 'admin-field-help' }, 'Paste image URLs or upload below. One URL per line.'),
      formCheckbox('Published', existing?.published ?? true, 'form-published'),
      h('div', { class: 'admin-form-actions' },
        h('button', {
          class: 'admin-save-btn',
          onClick: () => saveNoticeForm(editId),
        }, editId ? '💾 Save Changes' : '➕ Create Notice'),
        h('button', {
          class: 'admin-cancel-btn',
          onClick: () => { showForm.set(false); editingId.set(null); rerenderAdmin(); },
        }, 'Cancel'),
      ),
    ),
  );
}

// ── Image Compression Helper ─────────────────────────────

function compressImage(file: File, maxWidth = 1200, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function initPhotoUpload() {
  const zone = document.getElementById('photo-upload-zone');
  const input = document.getElementById('photo-file-input') as HTMLInputElement;
  const progress = document.getElementById('upload-progress');
  const progressBar = document.getElementById('upload-progress-bar');
  const progressText = document.getElementById('upload-progress-text');
  const textarea = document.querySelector('[data-field="form-photos"]') as HTMLTextAreaElement;
  if (!zone || !input || !textarea) return;

  zone.addEventListener('click', () => input.click());

  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length) handlePhotoFiles(files, textarea, progress, progressBar, progressText);
  });

  input.addEventListener('change', () => {
    const files = Array.from(input.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length) handlePhotoFiles(files, textarea, progress, progressBar, progressText);
    input.value = '';
  });
}

async function handlePhotoFiles(
  files: File[],
  textarea: HTMLTextAreaElement,
  progress: HTMLElement | null,
  progressBar: HTMLElement | null,
  progressText: HTMLElement | null,
) {
  if (progress) progress.style.display = 'flex';
  const existing = textarea.value.split('\n').map(s => s.trim()).filter(Boolean);
  const total = files.length;

  for (let i = 0; i < total; i++) {
    if (progressText) progressText.textContent = `Compressing ${i + 1} of ${total}...`;
    if (progressBar) progressBar.style.width = `${((i) / total) * 100}%`;
    try {
      const dataUrl = await compressImage(files[i]);
      existing.push(dataUrl);
    } catch (err) {
      console.warn('Failed to compress:', files[i].name, err);
    }
  }

  if (progressBar) progressBar.style.width = '100%';
  if (progressText) progressText.textContent = `✅ ${total} photo${total > 1 ? 's' : ''} added!`;
  textarea.value = existing.join('\n');

  // Hide progress after a moment, keep photos in textarea
  setTimeout(() => {
    if (progress) progress.style.display = 'none';
  }, 1200);
}

function renderEventForm(editId: string | null) {
  const existing = editId ? getAllEvents().find(e => e.id === editId) : null;
  const title = existing ? 'Edit Event' : 'Add New Event';
  const photos = existing?.photos || [];
  const thumbIdx = existing?.thumbnailIndex ?? 0;
  const heroIdx = existing?.heroIndex ?? 0;

  const form = h('div', { class: 'admin-form' },
    h('div', { class: 'admin-form-header' },
      h('h2', null, title),
      h('button', {
        class: 'admin-form-close',
        onClick: () => { showForm.set(false); editingId.set(null); rerenderAdmin(); },
      }, '✕'),
    ),

    h('div', { class: 'admin-form-body', 'data-form-type': 'event', 'data-edit-id': editId || '' },
      formField('Icon', 'text', existing?.icon || '🎉', 'form-icon'),
      formField('Date', 'text', existing?.date || '', 'form-date'),
      formField('Title', 'text', existing?.title || '', 'form-title'),
      formField('Short Description', 'textarea', existing?.desc || '', 'form-desc'),
      formField('Full Description', 'textarea', existing?.full || '', 'form-full'),
      formField('Stats Badge', 'text', existing?.stats || '', 'form-stats'),
      formSelect('Status', ['Upcoming', 'Completed'], existing?.tag || 'Upcoming', 'form-tag'),

      // ── Photo Upload Zone ──
      h('div', { class: 'admin-field' },
        h('label', { class: 'admin-label' }, '📸 Event Photos'),
        h('div', { class: 'admin-upload-zone', id: 'photo-upload-zone' },
          h('div', { class: 'admin-upload-icon' }, '📁'),
          h('div', { class: 'admin-upload-text' }, 'Click or drag & drop images here'),
          h('div', { class: 'admin-upload-hint' }, 'JPG, PNG, WEBP — auto-compressed to ~150KB each'),
          h('input', {
            type: 'file',
            id: 'photo-file-input',
            accept: 'image/jpeg,image/png,image/webp',
            multiple: 'multiple',
            style: 'display:none',
          }),
        ),
        h('div', { class: 'admin-upload-progress', id: 'upload-progress', style: 'display:none' },
          h('div', { class: 'admin-upload-progress-bar', id: 'upload-progress-bar' }),
          h('span', { id: 'upload-progress-text' }, 'Compressing...'),
        ),
        h('textarea', {
          class: 'admin-input admin-textarea',
          'data-field': 'form-photos',
          rows: '4',
          placeholder: 'One image path or data URL per line...\nYou can also type paths: /events/gratitude/gratitude-01.jpg',
        }, photos.join('\n')),
        h('div', { class: 'admin-field-help' }, 'Upload images above, or enter paths manually. Both file paths and uploaded images are supported.'),
      ),

      // ── Thumbnail & Hero selectors (only if photos exist) ──
      photos.length > 0 ? h('div', { class: 'admin-photo-pickers' },
        h('div', { class: 'admin-field' },
          h('label', { class: 'admin-label' }, '🖼️ Thumbnail Photo'),
          h('div', { class: 'admin-photo-selector', 'data-field': 'form-thumbnail-index' },
            ...photos.map((p, i) =>
              h('div', {
                class: `admin-photo-thumb ${i === thumbIdx ? 'selected' : ''}`,
                'data-index': String(i),
                onClick: (ev: Event) => {
                  const container = document.querySelector('[data-field="form-thumbnail-index"]');
                  container?.querySelectorAll('.admin-photo-thumb').forEach(el => el.classList.remove('selected'));
                  (ev.currentTarget as HTMLElement).classList.add('selected');
                },
              },
                h('img', { src: p, alt: `Photo ${i + 1}` }),
                h('span', { class: 'admin-photo-idx' }, `#${i + 1}`),
                i === thumbIdx ? h('span', { class: 'admin-photo-badge' }, 'Thumbnail') : null,
              ),
            ),
          ),
        ),
        h('div', { class: 'admin-field' },
          h('label', { class: 'admin-label' }, '🏔️ Hero Banner Photo'),
          h('div', { class: 'admin-photo-selector', 'data-field': 'form-hero-index' },
            ...photos.map((p, i) =>
              h('div', {
                class: `admin-photo-thumb ${i === heroIdx ? 'selected' : ''}`,
                'data-index': String(i),
                onClick: (ev: Event) => {
                  const container = document.querySelector('[data-field="form-hero-index"]');
                  container?.querySelectorAll('.admin-photo-thumb').forEach(el => el.classList.remove('selected'));
                  (ev.currentTarget as HTMLElement).classList.add('selected');
                },
              },
                h('img', { src: p, alt: `Photo ${i + 1}` }),
                h('span', { class: 'admin-photo-idx' }, `#${i + 1}`),
                i === heroIdx ? h('span', { class: 'admin-photo-badge' }, 'Hero') : null,
              ),
            ),
          ),
        ),
      ) : null,

      formCheckbox('Published', existing?.published ?? true, 'form-published'),
      h('div', { class: 'admin-form-actions' },
        h('button', {
          class: 'admin-save-btn',
          onClick: () => saveEventForm(editId),
        }, editId ? '💾 Save Changes' : '➕ Create Event'),
        h('button', {
          class: 'admin-cancel-btn',
          onClick: () => { showForm.set(false); editingId.set(null); rerenderAdmin(); },
        }, 'Cancel'),
      ),
    ),
  );

  // Initialize photo upload zone after DOM renders
  setTimeout(initPhotoUpload, 50);
  return form;
}

function renderNewsForm(editId: string | null) {
  const existing = editId ? getAllNews().find(n => n.id === editId) : null;
  const title = existing ? 'Edit News' : 'Add New Article';

  return h('div', { class: 'admin-form' },
    h('div', { class: 'admin-form-header' },
      h('h2', null, title),
      h('button', {
        class: 'admin-form-close',
        onClick: () => { showForm.set(false); editingId.set(null); rerenderAdmin(); },
      }, '✕'),
    ),

    h('div', { class: 'admin-form-body', 'data-form-type': 'news', 'data-edit-id': editId || '' },
      formField('Icon', 'text', existing?.icon || '📰', 'form-icon'),
      formField('Date', 'text', existing?.date || '', 'form-date'),
      formField('Title', 'text', existing?.title || '', 'form-title'),
      formField('Excerpt', 'textarea', existing?.excerpt || '', 'form-excerpt'),
      formField('Full Article', 'textarea', existing?.full || '', 'form-full'),
      formSelect('Category', ['Partnership', 'Milestone', 'Impact', 'Story', 'Report'], existing?.category || 'Story', 'form-category'),
      formField('Read Time', 'text', existing?.readTime || '3 min read', 'form-readtime'),
      formCheckbox('Published', existing?.published ?? true, 'form-published'),
      h('div', { class: 'admin-form-actions' },
        h('button', {
          class: 'admin-save-btn',
          onClick: () => saveNewsForm(editId),
        }, editId ? '💾 Save Changes' : '➕ Create Article'),
        h('button', {
          class: 'admin-cancel-btn',
          onClick: () => { showForm.set(false); editingId.set(null); rerenderAdmin(); },
        }, 'Cancel'),
      ),
    ),
  );
}

function renderDonationForm(editId: string | null) {
  const existing = editId ? getAllDonations().find(d => d.id === editId) : null;
  const title = existing ? 'Edit Donation Category' : 'Add Donation Category';

  return h('div', { class: 'admin-form' },
    h('div', { class: 'admin-form-header' },
      h('h2', null, title),
      h('button', {
        class: 'admin-form-close',
        onClick: () => { showForm.set(false); editingId.set(null); rerenderAdmin(); },
      }, '✕'),
    ),

    h('div', { class: 'admin-form-body', 'data-form-type': 'donation', 'data-edit-id': editId || '' },
      formField('Icon', 'text', existing?.icon || '💝', 'form-icon'),
      formField('Title', 'text', existing?.title || '', 'form-title'),
      formField('Description', 'textarea', existing?.description || '', 'form-description'),
      formField('Goal (LKR)', 'number', String(existing?.goal || 0), 'form-goal'),
      formField('Raised (LKR)', 'number', String(existing?.raised || 0), 'form-raised'),
      formField('Color', 'color', existing?.color || '#e02040', 'form-color'),
      formSelect('Urgency', ['Critical', 'High', 'Medium', 'Low'], existing?.urgency || 'Medium', 'form-urgency'),
      formCheckbox('Published', existing?.published ?? true, 'form-published'),
      h('div', { class: 'admin-form-actions' },
        h('button', {
          class: 'admin-save-btn',
          onClick: () => saveDonationForm(editId),
        }, editId ? '💾 Save Changes' : '➕ Create Category'),
        h('button', {
          class: 'admin-cancel-btn',
          onClick: () => { showForm.set(false); editingId.set(null); rerenderAdmin(); },
        }, 'Cancel'),
      ),
    ),
  );
}

function renderUserForm() {
  return h('div', { class: 'admin-form' },
    h('div', { class: 'admin-form-header' },
      h('h2', null, '➕ Add New User'),
      h('button', {
        class: 'admin-form-close',
        onClick: () => { showForm.set(false); editingId.set(null); rerenderAdmin(); },
      }, '✕'),
    ),

    h('div', { class: 'admin-form-body', 'data-form-type': 'user' },
      formField('Full Name', 'text', '', 'form-user-name'),
      formField('Email', 'email', '', 'form-user-email'),
      formSelect('Role', ['Admin', 'Teacher', 'Donor'], 'Donor', 'form-user-role'),
      formSelect('Status', ['Active', 'Pending'], 'Active', 'form-user-status'),
      h('div', { class: 'admin-form-note' },
        h('span', { style: 'color: #888; font-size: 0.85rem;' },
          '⚠️ This creates a local profile. The user will need to sign up with this email to authenticate via Supabase.',
        ),
      ),
      h('div', { class: 'admin-form-actions' },
        h('button', {
          class: 'admin-save-btn',
          onClick: () => saveUserForm(),
        }, '➕ Create User'),
        h('button', {
          class: 'admin-cancel-btn',
          onClick: () => { showForm.set(false); editingId.set(null); rerenderAdmin(); },
        }, 'Cancel'),
      ),
    ),
  );
}

function saveUserForm() {
  const body = document.querySelector('.admin-form-body');
  if (!body) return;

  const name = (body.querySelector('[data-field="form-user-name"]') as HTMLInputElement)?.value?.trim();
  const email = (body.querySelector('[data-field="form-user-email"]') as HTMLInputElement)?.value?.trim();
  const roleRaw = (body.querySelector('[data-field="form-user-role"]') as HTMLSelectElement)?.value?.toLowerCase();
  const statusRaw = (body.querySelector('[data-field="form-user-status"]') as HTMLSelectElement)?.value?.toLowerCase();

  if (!name || !email) {
    warning('Missing Fields', 'Please fill in both name and email.');
    return;
  }

  if (!email.includes('@')) {
    warning('Invalid Email', 'Please enter a valid email address.');
    return;
  }

  // Check for duplicate email
  const existing = getAllProfilesWithStatus().find(p => p.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    warning('Duplicate Email', `A user with email "${email}" already exists.`);
    return;
  }

  const role = (['admin', 'teacher', 'donor'].includes(roleRaw) ? roleRaw : 'donor') as UserRole;
  const status = statusRaw === 'pending' ? 'pending' : 'active';

  const profile = createProfile(`user-${Date.now()}`, email, name, role);

  // Override status if needed (createProfile auto-sets based on role)
  if (status === 'active' && profile.status !== 'active') {
    profile.status = 'active';
    try {
      const raw = localStorage.getItem('hope-hub-profiles');
      if (raw) {
        const profiles = JSON.parse(raw);
        const prof = profiles.find((p: UserProfile) => p.id === profile.id);
        if (prof) prof.status = 'active';
        localStorage.setItem('hope-hub-profiles', JSON.stringify(profiles));
      }
    } catch { /* ignore */ }
  }

  success('User Created', `${name} added as ${roleConfig[role].label} (${status}).`);
  showForm.set(false);
  editingId.set(null);
  rerenderAdmin();
}

// ─── Form Field Helpers ───────────────────────────────────

function formField(label: string, type: string, value: string, name: string) {
  if (type === 'textarea') {
    return h('div', { class: 'admin-field' },
      h('label', { class: 'admin-label' }, label),
      h('textarea', {
        class: 'admin-input admin-textarea',
        'data-field': name,
        rows: '3',
      }, value),
    );
  }
  return h('div', { class: 'admin-field' },
    h('label', { class: 'admin-label' }, label),
    h('input', {
      type,
      class: 'admin-input',
      value,
      'data-field': name,
    }),
  );
}

function formSelect(label: string, options: string[], value: string, name: string) {
  return h('div', { class: 'admin-field' },
    h('label', { class: 'admin-label' }, label),
    h('select', {
      class: 'admin-input admin-select',
      'data-field': name,
    },
      ...options.map(opt =>
        h('option', { value: opt, selected: opt === value }, opt),
      ),
    ),
  );
}

function formSelectOptions(label: string, options: { value: string; label: string }[], value: string, name: string) {
  return h('div', { class: 'admin-field' },
    h('label', { class: 'admin-label' }, label),
    h('select', {
      class: 'admin-input admin-select',
      'data-field': name,
    },
      ...options.map(opt =>
        h('option', { value: opt.value, selected: opt.value === value }, opt.label),
      ),
    ),
  );
}

function formCheckbox(label: string, checked: boolean, name: string) {
  return h('div', { class: 'admin-field admin-field-check' },
    h('input', {
      type: 'checkbox',
      'data-field': name,
      checked: checked,
      id: name,
    }),
    h('label', { class: 'admin-label', for: name }, label),
  );
}

// ─── Form Save Handlers (DOM-based) ──────────────────────

function getFormValue(field: string): string {
  const el = document.querySelector(`[data-field="${field}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  return el?.value || '';
}

function getFormChecked(field: string): boolean {
  const el = document.querySelector(`[data-field="${field}"]`) as HTMLInputElement;
  return el?.checked || false;
}

function saveNoticeForm(editId: string | null) {
  const data = {
    icon: getFormValue('form-icon'),
    date: getFormValue('form-date'),
    title: getFormValue('form-title'),
    excerpt: getFormValue('form-excerpt'),
    full: getFormValue('form-full'),
    tag: getFormValue('form-tag') as Notice['tag'],
    published: getFormChecked('form-published'),
    photos: getFormValue('form-notice-photos').split('\n').map(s => s.trim()).filter(Boolean) || undefined,
  };
  if (!data.title) { showToast('error', 'Error', 'Title is required'); return; }
  if (editId) {
    updateNotice(editId, data);
    showToast('success', 'Notice Updated', data.title);
  } else {
    addNotice(data);
    showToast('success', 'Notice Created', data.title);
  }
  showForm.set(false);
  editingId.set(null);
  rerenderAdmin();
}

function saveEventForm(editId: string | null) {
  const photosRaw = getFormValue('form-photos');
  const photos = photosRaw.split('\n').map(s => s.trim()).filter(Boolean);

  // Get selected thumbnail/hero index from the visual selectors
  const thumbContainer = document.querySelector('[data-field="form-thumbnail-index"]');
  const heroContainer = document.querySelector('[data-field="form-hero-index"]');
  const selectedThumb = thumbContainer?.querySelector('.admin-photo-thumb.selected')?.getAttribute('data-index');
  const selectedHero = heroContainer?.querySelector('.admin-photo-thumb.selected')?.getAttribute('data-index');

  const data: Partial<EventItem> = {
    icon: getFormValue('form-icon'),
    date: getFormValue('form-date'),
    title: getFormValue('form-title'),
    desc: getFormValue('form-desc'),
    full: getFormValue('form-full'),
    stats: getFormValue('form-stats'),
    tag: getFormValue('form-tag') as EventItem['tag'],
    published: getFormChecked('form-published'),
    photos: photos.length > 0 ? photos : undefined,
    thumbnailIndex: selectedThumb !== undefined ? Number(selectedThumb) : 0,
    heroIndex: selectedHero !== undefined ? Number(selectedHero) : 0,
  };
  if (!data.title) { showToast('error', 'Error', 'Title is required'); return; }
  if (editId) {
    updateEvent(editId, data);
    showToast('success', 'Event Updated', data.title!);
  } else {
    addEvent(data as Omit<EventItem, 'id' | 'created_at'>);
    showToast('success', 'Event Created', data.title!);
  }
  showForm.set(false);
  editingId.set(null);
  rerenderAdmin();
}

function saveNewsForm(editId: string | null) {
  const data = {
    icon: getFormValue('form-icon'),
    date: getFormValue('form-date'),
    title: getFormValue('form-title'),
    excerpt: getFormValue('form-excerpt'),
    full: getFormValue('form-full'),
    category: getFormValue('form-category') as NewsItem['category'],
    readTime: getFormValue('form-readtime'),
    published: getFormChecked('form-published'),
  };
  if (!data.title) { showToast('error', 'Error', 'Title is required'); return; }
  if (editId) {
    updateNews(editId, data);
    showToast('success', 'Article Updated', data.title);
  } else {
    addNews(data);
    showToast('success', 'Article Created', data.title);
  }
  showForm.set(false);
  editingId.set(null);
  rerenderAdmin();
}

function saveDonationForm(editId: string | null) {
  const data = {
    icon: getFormValue('form-icon'),
    title: getFormValue('form-title'),
    description: getFormValue('form-description'),
    goal: Number(getFormValue('form-goal')) || 0,
    raised: Number(getFormValue('form-raised')) || 0,
    color: getFormValue('form-color'),
    urgency: getFormValue('form-urgency'),
    published: getFormChecked('form-published'),
  };
  if (!data.title) { showToast('error', 'Error', 'Title is required'); return; }
  if (editId) {
    updateDonation(editId, data);
    showToast('success', 'Category Updated', data.title);
  } else {
    addDonation(data);
    showToast('success', 'Category Created', data.title);
  }
  showForm.set(false);
  editingId.set(null);
  rerenderAdmin();
}

// ─── Multi-Item Builder Helpers ───────────────────────────

let _itemRowCount = 0;

function buildInitialItemRows(existing: DonationTransaction | null | undefined, categories: DonationCategory[], txType: 'received' | 'distributed' = 'received') {
  if (existing?.lineItems && existing.lineItems.length > 0) {
    return existing.lineItems.map((li, i) => {
      _itemRowCount = i;
      return buildItemRowDOM(li.category || categories[0]?.id || '', li.name, li.qty, categories, i, txType);
    });
  }
  // Single item fallback from existing items string
  if (existing?.items) {
    const parsed = parseItemString(existing.items);
    if (parsed.length > 0) {
      return parsed.map((p, i) => {
        _itemRowCount = i;
        return buildItemRowDOM(existing.categoryId || categories[0]?.id || '', p.name, p.qty, categories, i, txType);
      });
    }
  }
  _itemRowCount = 0;
  return [buildItemRowDOM(categories[0]?.id || '', '', 0, categories, 0, txType)];
}

function parseItemString(itemsStr: string): { name: string; qty: number }[] {
  const parts = itemsStr.split(',').map(s => s.trim()).filter(Boolean);
  const result: { name: string; qty: number }[] = [];
  for (const part of parts) {
    const match = part.match(/^(\d+)\s+(.+)$/);
    if (match) {
      result.push({ qty: parseInt(match[1], 10), name: match[2].trim() });
    } else {
      result.push({ name: part, qty: 0 });
    }
  }
  return result;
}

function buildInventorySnapshot(excludeTxId?: string) {
  const inventory = new Map<string, Map<string, number>>();
  const txs = getAllTransactions().filter(tx => tx.id !== excludeTxId && tx.status !== 'pending');

  for (const tx of txs) {
    const items = tx.lineItems && tx.lineItems.length > 0
      ? tx.lineItems.map((item) => ({
          categoryId: item.category || tx.categoryId,
          name: item.name.trim(),
          qty: item.qty || 0,
        }))
      : parseItemString(tx.items).map((item) => ({
          categoryId: tx.categoryId,
          name: item.name.trim(),
          qty: item.qty,
        }));

    for (const item of items) {
      if (!item.name || item.qty <= 0) continue;
      const categoryStock = inventory.get(item.categoryId) || new Map<string, number>();
      const current = categoryStock.get(item.name) || 0;
      const delta = tx.type === 'received' ? item.qty : -item.qty;
      categoryStock.set(item.name, current + delta);
      inventory.set(item.categoryId, categoryStock);
    }
  }

  return inventory;
}

function validateDistributionStock(
  lineItems: { category: string; name: string; qty: number }[],
  excludeTxId?: string,
): boolean {
  const categories = getDonationCategories();
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const inventory = buildInventorySnapshot(excludeTxId);

  for (const item of lineItems) {
    if (item.qty <= 0) {
      showToast('error', 'Invalid Quantity', `"${item.name}" needs a quantity greater than 0 to be distributed.`);
      return false;
    }

    const categoryStock = inventory.get(item.category);
    if (!categoryStock || categoryStock.size === 0) {
      const categoryLabel = categoryMap.get(item.category)?.title || item.category || 'selected category';
      showToast('error', 'No Inventory', `There are no items available in ${categoryLabel} to distribute.`);
      return false;
    }

    // Case-insensitive lookup for available stock
    let available = 0;
    let matchedName = item.name;
    for (const [stockName, stockQty] of categoryStock) {
      if (stockName.toLowerCase() === item.name.toLowerCase()) {
        available = stockQty;
        matchedName = stockName;
        break;
      }
    }

    if (available <= 0) {
      showToast('error', 'Not In Stock',
        `"${item.name}" is not in inventory. You can only distribute items that have already been received.`);
      return false;
    }

    if (available < item.qty) {
      const categoryLabel = categoryMap.get(item.category)?.title || item.category || 'selected category';
      showToast('error', 'Insufficient Stock',
        `Only ${available} "${matchedName}" available in ${categoryLabel}, but you tried to distribute ${item.qty}.`);
      return false;
    }
  }

  return true;
}

function buildItemRowDOM(categoryId: string, itemName: string, qty: number, categories: DonationCategory[], index: number, txType: 'received' | 'distributed' = 'received') {
  const isDistribution = txType === 'distributed';

  // For distribution: build a <select> with only in-stock items
  let itemNameField;
  if (isDistribution) {
    const availableItems = getAvailableItemsForCategory(categoryId);
    const options = [
      h('option', { value: '', disabled: true, selected: !itemName }, '— Select an item —'),
      ...availableItems.map(item =>
        h('option', { value: item.name, selected: item.name === itemName }, `${item.name} (${item.available} in stock)`),
      ),
    ];
    if (availableItems.length === 0) {
      options.push(h('option', { value: '', disabled: true }, 'No items in stock'));
    }
    itemNameField = h('div', { class: 'multi-item-field multi-item-name' },
      h('label', null, 'Item Name'),
      h('select', {
        class: 'admin-input admin-select multi-item-name-select',
        'data-field': `form-item-name-${index}`,
      }, ...options),
    );
  } else {
    itemNameField = h('div', { class: 'multi-item-field multi-item-name' },
      h('label', null, 'Item Name'),
      h('div', { class: 'autocomplete-wrap' },
        h('input', {
          type: 'text',
          class: 'admin-input multi-item-name-input',
          'data-field': `form-item-name-${index}`,
          value: itemName,
          placeholder: 'Type item name...',
          autocomplete: 'off',
        }),
        h('div', { class: 'autocomplete-dropdown', 'data-dropdown-for': `form-item-name-${index}` }),
      ),
    );
  }

  return h('div', { class: 'multi-item-row', 'data-item-index': String(index) },
    h('div', { class: 'multi-item-row-fields' },
      h('div', { class: 'multi-item-field multi-item-cat' },
        h('label', null, 'Category'),
        h('select', {
          class: 'admin-input admin-select multi-item-cat-select',
          'data-field': `form-item-cat-${index}`,
        },
          ...categories.map(c =>
            h('option', { value: c.id, selected: c.id === categoryId }, `${c.icon} ${c.title}`),
          ),
        ),
      ),
      itemNameField,
      h('div', { class: 'multi-item-field multi-item-qty' },
        h('label', null, 'Qty'),
        h('input', {
          type: 'number',
          class: 'admin-input multi-item-qty-input',
          'data-field': `form-item-qty-${index}`,
          value: qty > 0 ? String(qty) : '',
          placeholder: '0',
          min: '0',
        }),
      ),
    ),
    h('button', {
      class: 'multi-item-remove-btn',
      type: 'button',
      title: 'Remove item',
      onClick: (e: Event) => {
        const btn = e.currentTarget as HTMLElement;
        const row = btn.closest('.multi-item-row');
        const container = document.getElementById('multi-item-container');
        if (row && container && container.querySelectorAll('.multi-item-row').length > 1) {
          row.remove();
          reindexItemRows();
        } else {
          showToast('error', 'Cannot Remove', 'At least one item is required');
        }
      },
    }, '✕'),
  );
}

function addItemRow(txType: 'received' | 'distributed' = 'received') {
  const container = document.getElementById('multi-item-container');
  if (!container) return;
  _itemRowCount++;
  const categories = getDonationCategories();
  const row = buildItemRowDOM(categories[0]?.id || '', '', 0, categories, _itemRowCount, txType);
  const wrapper = document.createElement('div');
  container.appendChild(wrapper);
  render(row, wrapper);
  if (txType === 'received') setupItemAutocomplete(_itemRowCount);
  else setupDistributionSelect(_itemRowCount);
}

function removeItemRow(btn: HTMLElement) {
  const row = btn.closest('.multi-item-row');
  const container = document.getElementById('multi-item-container');
  if (row && container && container.querySelectorAll('.multi-item-row').length > 1) {
    row.remove();
    reindexItemRows();
  } else {
    showToast('error', 'Cannot Remove', 'At least one item is required');
  }
}

function reindexItemRows() {
  const rows = document.querySelectorAll('#multi-item-container .multi-item-row');
  rows.forEach((row, i) => {
    row.setAttribute('data-item-index', String(i));
    const catSelect = row.querySelector('.multi-item-cat-select') as HTMLSelectElement;
    const nameInput = row.querySelector('.multi-item-name-input') as HTMLInputElement;
    const nameSelect = row.querySelector('.multi-item-name-select') as HTMLSelectElement;
    const qtyInput = row.querySelector('.multi-item-qty-input') as HTMLInputElement;
    const dropdown = row.querySelector('.autocomplete-dropdown') as HTMLElement;
    if (catSelect) catSelect.setAttribute('data-field', `form-item-cat-${i}`);
    if (nameInput) nameInput.setAttribute('data-field', `form-item-name-${i}`);
    if (nameSelect) nameSelect.setAttribute('data-field', `form-item-name-${i}`);
    if (qtyInput) qtyInput.setAttribute('data-field', `form-item-qty-${i}`);
    if (dropdown) dropdown.setAttribute('data-dropdown-for', `form-item-name-${i}`);
  });
}

function setupItemAutocomplete(index: number) {
  const input = document.querySelector(`[data-field="form-item-name-${index}"]`) as HTMLInputElement;
  const dropdown = document.querySelector(`[data-dropdown-for="form-item-name-${index}"]`) as HTMLElement;
  if (!input || !dropdown) return;

  const formBody = input.closest('[data-tx-type]');
  const isDistribution = formBody?.getAttribute('data-tx-type') === 'distributed';

  function showSuggestions(val: string) {
    const row = input.closest('.multi-item-row');
    const catSelect = row?.querySelector('.multi-item-cat-select') as HTMLSelectElement;
    const catId = catSelect?.value || '';

    if (isDistribution) {
      const available = getAvailableItemsForCategory(catId);
      const matches = available.filter(item => item.name.toLowerCase().includes(val));

      dropdown.innerHTML = '';
      if (matches.length === 0) {
        const msg = document.createElement('div');
        msg.className = 'autocomplete-option autocomplete-none';
        msg.textContent = available.length === 0
          ? 'No items in stock for this category'
          : 'No matching items in stock';
        dropdown.appendChild(msg);
        dropdown.style.display = 'block';
        return;
      }

      dropdown.style.display = 'block';
      for (const match of matches.slice(0, 8)) {
        const opt = document.createElement('div');
        opt.className = 'autocomplete-option';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = match.name;
        const stockSpan = document.createElement('span');
        stockSpan.className = 'autocomplete-stock';
        stockSpan.textContent = ` (${match.available} in stock)`;
        opt.appendChild(nameSpan);
        opt.appendChild(stockSpan);
        opt.addEventListener('mousedown', (e) => {
          e.preventDefault();
          input.value = match.name;
          dropdown.style.display = 'none';
          updateItemQtyMax(input, match.available);
          input.classList.remove('input-invalid');
        });
        dropdown.appendChild(opt);
      }
    } else {
      const existing = getExistingItemsForCategory(catId);
      const matches = existing.filter(item => item.toLowerCase().includes(val));
      if (matches.length === 0) { dropdown.style.display = 'none'; return; }

      dropdown.innerHTML = '';
      dropdown.style.display = 'block';
      for (const match of matches.slice(0, 8)) {
        const opt = document.createElement('div');
        opt.className = 'autocomplete-option';
        opt.textContent = match;
        opt.addEventListener('mousedown', (e) => {
          e.preventDefault();
          input.value = match;
          dropdown.style.display = 'none';
        });
        dropdown.appendChild(opt);
      }
    }
  }

  input.addEventListener('input', () => {
    const val = input.value.trim().toLowerCase();
    if (val.length < 1) {
      dropdown.style.display = 'none';
      if (isDistribution) clearItemQtyMax(input);
      return;
    }
    showSuggestions(val);
  });

  input.addEventListener('focus', () => {
    if (input.value.length > 0) {
      input.dispatchEvent(new Event('input'));
    } else if (isDistribution) {
      showSuggestions('');
    }
  });

  // For distributions: validate typed name against inventory on blur
  if (isDistribution) {
    input.addEventListener('blur', () => {
      setTimeout(() => {
        const val = input.value.trim();
        if (!val) { clearItemQtyMax(input); input.classList.remove('input-invalid'); return; }

        const row = input.closest('.multi-item-row');
        const catSelect = row?.querySelector('.multi-item-cat-select') as HTMLSelectElement;
        const catId = catSelect?.value || '';
        const available = getAvailableItemsForCategory(catId);
        const match = available.find(item => item.name.toLowerCase() === val.toLowerCase());

        if (match) {
          input.value = match.name;
          updateItemQtyMax(input, match.available);
          input.classList.remove('input-invalid');
        } else {
          input.classList.add('input-invalid');
          clearItemQtyMax(input);
        }
      }, 150);
    });
  }

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target as Node) && e.target !== input) {
      dropdown.style.display = 'none';
    }
  });

  // Refresh suggestions and clear item when category changes
  const row = input.closest('.multi-item-row');
  const catSelect = row?.querySelector('.multi-item-cat-select') as HTMLSelectElement;
  if (catSelect) {
    catSelect.addEventListener('change', () => {
      if (isDistribution) {
        input.value = '';
        clearItemQtyMax(input);
        input.classList.remove('input-invalid');
      }
      if (input.value.length > 0) input.dispatchEvent(new Event('input'));
    });
  }
}

function populateStockSelect(catSelect: HTMLSelectElement, selectedName?: string) {
  const row = catSelect.closest('.multi-item-row');
  const nameSelect = row?.querySelector('.multi-item-name-select') as HTMLSelectElement;
  if (!nameSelect) return;

  const catId = catSelect.value;
  const availableItems = getAvailableItemsForCategory(catId);
  const qtyInput = row?.querySelector('.multi-item-qty-input') as HTMLInputElement;

  nameSelect.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.disabled = true;
  placeholder.selected = !selectedName;
  placeholder.textContent = availableItems.length === 0 ? 'No items in stock' : '— Select an item —';
  nameSelect.appendChild(placeholder);

  if (availableItems.length === 0) {
    if (qtyInput) { qtyInput.max = '0'; qtyInput.value = ''; }
    return;
  }

  for (const item of availableItems) {
    const opt = document.createElement('option');
    opt.value = item.name;
    opt.textContent = `${item.name} (${item.available} in stock)`;
    if (item.name === selectedName) opt.selected = true;
    nameSelect.appendChild(opt);
  }

  // If there was a selected item, set qty max
  if (selectedName) {
    const match = availableItems.find(i => i.name === selectedName);
    if (match && qtyInput) {
      qtyInput.max = String(match.available);
      qtyInput.title = `Max available: ${match.available}`;
    }
  }
}

function setupDistributionSelect(index: number) {
  const nameSelect = document.querySelector(`[data-field="form-item-name-${index}"]`) as HTMLSelectElement;
  if (!nameSelect) return;

  const row = nameSelect.closest('.multi-item-row');
  const catSelect = row?.querySelector('.multi-item-cat-select') as HTMLSelectElement;
  const qtyInput = row?.querySelector('.multi-item-qty-input') as HTMLInputElement;

  function getMaxStock(): number {
    const selectedName = nameSelect.value;
    const catId = catSelect?.value || '';
    const availableItems = getAvailableItemsForCategory(catId);
    const match = availableItems.find(i => i.name === selectedName);
    return match ? match.available : 0;
  }

  nameSelect.addEventListener('change', () => {
    const maxStock = getMaxStock();
    if (qtyInput) {
      qtyInput.max = String(maxStock);
      qtyInput.title = `Max available: ${maxStock}`;
      if (parseInt(qtyInput.value, 10) > maxStock) {
        qtyInput.value = String(maxStock);
      }
    }
    nameSelect.classList.remove('input-invalid');
  });

  // Enforce max stock in real-time as the user types
  if (qtyInput) {
    qtyInput.addEventListener('input', () => {
      const maxStock = getMaxStock();
      if (maxStock <= 0) return;
      const val = parseInt(qtyInput.value, 10);
      if (!isNaN(val) && val > maxStock) {
        qtyInput.value = String(maxStock);
      }
    });
  }

  if (catSelect) {
    catSelect.addEventListener('change', () => {
      populateStockSelect(catSelect);
      if (qtyInput) { qtyInput.value = ''; qtyInput.removeAttribute('max'); }
    });
  }
}

function getExistingItemsForCategory(catId: string): string[] {
  const allTx = getAllTransactions();
  const itemSet = new Set<string>();
  for (const tx of allTx) {
    if (tx.categoryId !== catId) continue;
    const parsed = parseItemString(tx.items);
    for (const p of parsed) {
      if (p.name) itemSet.add(p.name);
    }
  }
  // Also include default transaction items
  for (const tx of getDefaultTransactions()) {
    if (tx.categoryId !== catId) continue;
    const parsed = parseItemString(tx.items);
    for (const p of parsed) {
      if (p.name) itemSet.add(p.name);
    }
  }
  return [...itemSet].sort();
}

function getDefaultTransactions(): { categoryId: string; items: string }[] {
  // Read from the default tx data in content-store
  try {
    const stored = localStorage.getItem('hope-hub-donation-tx');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

function getAvailableItemsForCategory(catId: string): { name: string; available: number }[] {
  const inventory = buildInventorySnapshot();
  const categoryStock = inventory.get(catId);
  if (!categoryStock) return [];
  const result: { name: string; available: number }[] = [];
  for (const [name, qty] of categoryStock) {
    if (qty > 0) result.push({ name, available: qty });
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

function updateItemQtyMax(nameInput: HTMLInputElement, maxQty: number) {
  const row = nameInput.closest('.multi-item-row');
  const qtyInput = row?.querySelector('.multi-item-qty-input') as HTMLInputElement;
  if (qtyInput) {
    qtyInput.max = String(maxQty);
    qtyInput.title = `Max available: ${maxQty}`;
    if (parseInt(qtyInput.value, 10) > maxQty) {
      qtyInput.value = String(maxQty);
    }
  }
}

function clearItemQtyMax(nameInput: HTMLInputElement) {
  const row = nameInput.closest('.multi-item-row');
  const qtyInput = row?.querySelector('.multi-item-qty-input') as HTMLInputElement;
  if (qtyInput) {
    qtyInput.removeAttribute('max');
    qtyInput.title = '';
  }
}

function collectLineItems(): { categoryId: string; items: string; quantity: string; lineItems: { category: string; name: string; qty: number }[] } | null {
  const container = document.getElementById('multi-item-container');
  if (!container) return null;

  const rows = container.querySelectorAll('.multi-item-row');
  const lineItems: { category: string; name: string; qty: number }[] = [];
  const itemParts: string[] = [];
  let totalQty = 0;
  let firstCatId = '';

  for (let i = 0; i < rows.length; i++) {
    const catVal = getFormValue(`form-item-cat-${i}`);
    const nameVal = getFormValue(`form-item-name-${i}`).trim();
    const qtyVal = parseInt(getFormValue(`form-item-qty-${i}`), 10) || 0;

    if (!nameVal) continue;
    if (!firstCatId) firstCatId = catVal;

    lineItems.push({ category: catVal, name: nameVal, qty: qtyVal });
    if (qtyVal > 0) {
      itemParts.push(`${qtyVal} ${nameVal}`);
      totalQty += qtyVal;
    } else {
      itemParts.push(nameVal);
    }
  }

  if (lineItems.length === 0) return null;

  return {
    categoryId: firstCatId,
    items: itemParts.join(', '),
    quantity: totalQty > 0 ? String(totalQty) : '',
    lineItems,
  };
}

// ─── Transaction Form ─────────────────────────────────────

function renderTxForm(editId: string | null, type: 'received' | 'distributed') {
  const existing = editId ? getAllTransactions().find(t => t.id === editId) : null;
  const title = existing
    ? `Edit ${type === 'received' ? 'Received' : 'Distributed'} Donation`
    : `Record ${type === 'received' ? '📥 Donation Received' : '📤 Donation Distributed'}`;
  const categories = getDonationCategories();
  const accentColor = type === 'received' ? '#00a050' : '#0090d0';

  return h('div', { class: 'admin-form' },
    h('div', { class: 'admin-form-header', style: `border-left: 4px solid ${accentColor};` },
      h('h2', null, title),
      h('button', {
        class: 'admin-form-close',
        onClick: () => { showForm.set(false); editingId.set(null); rerenderAdmin(); },
      }, '✕'),
    ),

    h('div', { class: 'admin-form-body', 'data-form-type': 'tx', 'data-edit-id': editId || '', 'data-tx-type': type },
      // Section: Contact
      h('div', { class: 'admin-form-section' },
        h('div', { class: 'admin-form-section-title' },
          h('span', { class: 'admin-form-section-icon' }, type === 'received' ? '👤' : '🏢'),
          type === 'received' ? 'Donor Information' : 'Recipient Information',
        ),
        formField(type === 'received' ? 'Donor Name' : 'Recipient Name', 'text', existing?.contactName || '', 'form-tx-contact'),
        formField('Contact (Phone / Email)', 'text', existing?.contactInfo || '', 'form-tx-contact-info'),
      ),

      // Section: Donation Details — Multi-Item Builder
      h('div', { class: 'admin-form-section' },
        h('div', { class: 'admin-form-section-title' },
          h('span', { class: 'admin-form-section-icon' }, '📦'),
          'Donation Items',
          h('span', { class: 'admin-form-section-hint' }, ' — Add one or more items, each with its own category'),
        ),
        h('div', { id: 'multi-item-container', class: 'multi-item-container' },
          ...buildInitialItemRows(existing, categories, type),
        ),
        h('button', {
          class: 'multi-item-add-btn',
          type: 'button',
          onClick: () => addItemRow(type),
        }, '+ Add Another Item'),
      ),

      // Section: Financial
      h('div', { class: 'admin-form-section' },
        h('div', { class: 'admin-form-section-title' },
          h('span', { class: 'admin-form-section-icon' }, '💰'),
          'Financial Details',
        ),
        formField('Date', 'text', existing?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 'form-tx-date'),
        type === 'received' ? formField('Amount (LKR) — 0 for in-kind', 'number', String(existing?.amount || 0), 'form-tx-amount') : null,
        type === 'received' ? formSelect('Payment Method', ['Cash', 'Bank Transfer', 'Check', 'Online', 'In-Kind', 'Other'], existing?.paymentMethod || 'Cash', 'form-tx-payment') : null,
        formField('Receipt / Reference No.', 'text', existing?.receiptNo || '', 'form-tx-receipt'),
      ),

      // Section: Notes
      h('div', { class: 'admin-form-section' },
        h('div', { class: 'admin-form-section-title' },
          h('span', { class: 'admin-form-section-icon' }, '📝'),
          'Additional Notes',
        ),
        formField('Notes (optional)', 'textarea', existing?.notes || '', 'form-tx-notes'),
      ),

      h('div', { class: 'admin-form-actions' },
        h('button', {
          class: 'admin-save-btn',
          style: `background: ${accentColor};`,
          onClick: () => saveTxForm(editId, type),
        }, editId ? '💾 Save Changes' : `➕ Record ${type === 'received' ? 'Received' : 'Distributed'}`),
        h('button', {
          class: 'admin-cancel-btn',
          onClick: () => { showForm.set(false); editingId.set(null); rerenderAdmin(); },
        }, 'Cancel'),
      ),
    ),
  );
}

function saveTxForm(editId: string | null, type: 'received' | 'distributed') {
  const contactName = getFormValue('form-tx-contact').trim();
  const contactInfo = getFormValue('form-tx-contact-info').trim();
  const date = getFormValue('form-tx-date').trim();
  const amount = type === 'received' ? Number(getFormValue('form-tx-amount')) || 0 : undefined;
  const paymentMethod = type === 'received' ? getFormValue('form-tx-payment') : undefined;
  const receiptNo = getFormValue('form-tx-receipt').trim();
  const notes = getFormValue('form-tx-notes').trim();

  const collected = collectLineItems();
  if (!contactName) { showToast('error', 'Error', 'Name is required'); return; }
  if (!collected) { showToast('error', 'Error', 'At least one item with a name is required'); return; }
  if (!date) { showToast('error', 'Error', 'Date is required'); return; }

  if (type === 'distributed' && !validateDistributionStock(collected.lineItems, editId || undefined)) {
    return;
  }

  const { categoryId, items, quantity, lineItems } = collected;

  if (editId) {
    updateTransaction(editId, { contactName, contactInfo, categoryId, items, quantity, date, amount, paymentMethod, receiptNo, notes, lineItems });
    showToast('success', 'Transaction Updated', contactName);
  } else {
    addTransaction({ type, contactName, contactInfo, categoryId, items, quantity, date, amount, paymentMethod, receiptNo, notes, lineItems });
    showToast('success', `${type === 'received' ? '📥 Received' : '📤 Distributed'} Recorded`, contactName);
  }
  showForm.set(false);
  editingId.set(null);
  rerenderAdmin();
}
