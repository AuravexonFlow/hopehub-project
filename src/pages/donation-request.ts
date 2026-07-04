/**
 * ═══════════════════════════════════════════════════════════
 *  Donation Request — Public page showing live requests & donor contribution
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { showToast } from '../services/toast';
import { getDonations, getPublishedRequests, getDonationCategories, addTransaction, contributeToRequest } from '../stores/content-store';

/* ── Donation modal state (simple DOM-based) ── */
let _donateModalRequestId: string | null = null;

function openDonateModal(requestId: string) {
  _donateModalRequestId = requestId;
  renderDonateModal();
}

function closeDonateModal() {
  _donateModalRequestId = null;
  const overlay = document.querySelector('.donate-modal-overlay');
  if (overlay) overlay.remove();
}

function renderDonateModal() {
  const existing = document.querySelector('.donate-modal-overlay');
  if (existing) existing.remove();

  if (!_donateModalRequestId) return;
  const req = getPublishedRequests().find(r => r.id === _donateModalRequestId);
  if (!req) return;
  const cat = getDonationCategories().find(c => c.id === req.categoryId);

  const qtyPct = req.targetQuantity > 0 ? Math.min(100, Math.round(req.fulfilledQuantity / req.targetQuantity * 100)) : 0;
  const amtPct = req.targetAmount > 0 ? Math.min(100, Math.round(req.raisedAmount / req.targetAmount * 100)) : 0;

  const overlay = document.createElement('div');
  overlay.className = 'donate-modal-overlay';
  overlay.innerHTML = `
    <div class="donate-modal">
      <div class="donate-modal-header">
        <h2>${cat?.icon || '💝'} ${req.title}</h2>
        <button class="donate-modal-close">✕</button>
      </div>
      <div class="donate-modal-body">
        <p class="donate-modal-desc">${req.description}</p>
        <div class="donate-modal-items">
          <span class="donate-modal-items-label">📦 Items Needed:</span>
          <span class="donate-modal-items-text">${req.itemsNeeded}</span>
        </div>
        <div class="donate-modal-progress">
          <div class="donate-modal-progress-row">
            <span>📦 Items</span>
            <span class="donate-modal-progress-val">${req.fulfilledQuantity} / ${req.targetQuantity}</span>
          </div>
          <div class="donate-modal-bar-wrap">
            <div class="donate-modal-bar-fill" style="width: ${qtyPct}%"></div>
          </div>
          <div class="donate-modal-progress-row">
            <span>💰 Amount</span>
            <span class="donate-modal-progress-val">LKR ${req.raisedAmount.toLocaleString()} / ${req.targetAmount.toLocaleString()}</span>
          </div>
          <div class="donate-modal-bar-wrap">
            <div class="donate-modal-bar-fill donate-modal-bar-amt" style="width: ${amtPct}%"></div>
          </div>
        </div>

        <div class="donate-form-section">
          <h3 class="donate-form-title">🤝 Your Contribution</h3>
          <div class="donate-form-grid">
            <div class="donate-field">
              <label>Your Name *</label>
              <input type="text" id="donate-name" class="donate-input" placeholder="Full name">
            </div>
            <div class="donate-field">
              <label>Contact Info</label>
              <input type="text" id="donate-contact" class="donate-input" placeholder="Phone or email">
            </div>
          </div>
          <div class="donate-field">
            <label>Items You're Donating</label>
            <textarea id="donate-items" class="donate-input donate-textarea" placeholder="e.g. 10 school bags, 20 notebooks, 5 uniforms"></textarea>
          </div>
          <div class="donate-form-grid">
            <div class="donate-field">
              <label>Item Quantity</label>
              <input type="number" id="donate-qty" class="donate-input" placeholder="0" min="0">
            </div>
            <div class="donate-field">
              <label>Cash Amount (LKR)</label>
              <input type="number" id="donate-amt" class="donate-input" placeholder="0" min="0">
            </div>
          </div>
          <div class="donate-form-grid">
            <div class="donate-field">
              <label>Payment Method</label>
              <select id="donate-payment" class="donate-input donate-select">
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Online">Online Payment</option>
                <option value="In-Kind">In-Kind (Items)</option>
              </select>
            </div>
            <div class="donate-field">
              <label>Receipt / Reference No.</label>
              <input type="text" id="donate-receipt" class="donate-input" placeholder="Optional">
            </div>
          </div>
          <div class="donate-field">
            <label>Notes</label>
            <textarea id="donate-notes" class="donate-input donate-textarea" placeholder="Any additional notes..."></textarea>
          </div>
          <div class="donate-form-actions">
            <button class="donate-submit-btn">💝 Donate Now</button>
            <button class="donate-cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    </div>`;

  overlay.querySelector('.donate-modal-close')!.addEventListener('click', closeDonateModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDonateModal(); });
  overlay.querySelector('.donate-cancel-btn')!.addEventListener('click', closeDonateModal);
  overlay.querySelector('.donate-submit-btn')!.addEventListener('click', () => submitDonation(req.id, req.categoryId));

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { closeDonateModal(); document.removeEventListener('keydown', onKey); }
  };
  document.addEventListener('keydown', onKey);

  document.body.appendChild(overlay);
}

function submitDonation(requestId: string, categoryId: string) {
  const name = (document.getElementById('donate-name') as HTMLInputElement)?.value?.trim();
  const contact = (document.getElementById('donate-contact') as HTMLInputElement)?.value?.trim();
  const items = (document.getElementById('donate-items') as HTMLTextAreaElement)?.value?.trim();
  const qty = parseInt((document.getElementById('donate-qty') as HTMLInputElement)?.value, 10) || 0;
  const amt = parseInt((document.getElementById('donate-amt') as HTMLInputElement)?.value, 10) || 0;
  const payment = (document.getElementById('donate-payment') as HTMLSelectElement)?.value || 'Cash';
  const receipt = (document.getElementById('donate-receipt') as HTMLInputElement)?.value?.trim();
  const notes = (document.getElementById('donate-notes') as HTMLTextAreaElement)?.value?.trim();

  if (!name) {
    showToast('error', 'Name Required', 'Please enter your name');
    return;
  }
  if (!items && qty === 0 && amt === 0) {
    showToast('error', 'No Contribution', 'Please specify items, quantity, or amount to donate');
    return;
  }

  // Create a received transaction
  addTransaction({
    type: 'received',
    contactName: name,
    contactInfo: contact || undefined,
    categoryId,
    requestId,
    items: items || 'Cash donation',
    quantity: qty > 0 ? qty.toString() : undefined,
    date: new Date().toISOString().split('T')[0],
    amount: amt > 0 ? amt : undefined,
    receiptNo: receipt || undefined,
    paymentMethod: payment,
    notes: notes || undefined,
  });

  // Update the request progress
  contributeToRequest(requestId, amt, qty);

  closeDonateModal();
  showToast('success', 'Thank You!', `Your donation has been recorded. Richmond College appreciates your generosity! 💝`);
}

/* ── Main Page Component ── */

export const DonationRequestPage = defineComponent('DonationRequestPage', () => {
  const categories = getDonationCategories();
  const requests = getPublishedRequests();
  const openRequests = requests.filter(r => r.status === 'open');
  const otherRequests = requests.filter(r => r.status !== 'open');

  // Group open requests by category
  const byCat = new Map<string, typeof openRequests>();
  for (const r of openRequests) {
    if (!byCat.has(r.categoryId)) byCat.set(r.categoryId, []);
    byCat.get(r.categoryId)!.push(r);
  }

  const urgencyColors: Record<string, string> = {
    Critical: 'rgba(224,32,64,0.12)',
    High: 'rgba(240,160,0,0.12)',
    Medium: 'rgba(0,144,208,0.12)',
    Low: 'rgba(0,160,80,0.12)',
  };
  const urgencyTextColors: Record<string, string> = {
    Critical: '#e02040',
    High: '#f0a000',
    Medium: '#0090d0',
    Low: '#00a050',
  };

  return h('div', { class: 'donation-request-page' },
    h('section', { class: 'content-section', style: 'padding-top:80px;' },
      h('div', { class: 'section-header' },
        h('h1', {
          style: 'font-family:var(--font-display); font-size:36px; font-weight:900; color:var(--text-primary); letter-spacing:3px;',
        }, 'DONATION REQUESTS'),
        h('p', null, 'Browse active requests and help a Richmond student in need. Every contribution makes a difference.'),
        openRequests.length > 0 ? h('div', { class: 'donate-stats-bar' },
          h('span', { class: 'donate-stat' }, `📣 ${openRequests.length} Active Requests`),
          h('span', { class: 'donate-stat' }, `🎯 ${openRequests.reduce((s, r) => s + r.targetQuantity, 0)} Items Needed`),
          h('span', { class: 'donate-stat' }, `💰 LKR ${openRequests.reduce((s, r) => s + r.targetAmount, 0).toLocaleString()} Target`),
        ) : null,
      ),

      // Open requests grouped by category
      ...Array.from(byCat.entries()).map(([catId, reqs]) => {
        const cat = categories.find(c => c.id === catId);
        if (!cat) return null;
        return h('div', { class: 'donate-cat-section', id: `cat-${catId}` },
          h('div', { class: 'donate-cat-header' },
            h('span', { class: 'donate-cat-icon' }, cat.icon),
            h('div', {},
              h('h2', { class: 'donate-cat-title' }, cat.title),
              h('p', { class: 'donate-cat-desc' }, cat.description),
            ),
          ),
          h('div', { class: 'donate-req-grid' },
            ...reqs.map(req => {
              const qtyPct = req.targetQuantity > 0 ? Math.min(100, Math.round(req.fulfilledQuantity / req.targetQuantity * 100)) : 0;
              const amtPct = req.targetAmount > 0 ? Math.min(100, Math.round(req.raisedAmount / req.targetAmount * 100)) : 0;
              return h('div', { class: 'donate-req-card' },
                h('div', { class: 'donate-req-card-top' },
                  h('h3', { class: 'donate-req-title' }, req.title),
                  h('div', { class: 'donate-req-badges' },
                    h('span', {
                      class: 'donate-req-badge',
                      style: `background: ${urgencyColors[req.urgency]}; color: ${urgencyTextColors[req.urgency]};`,
                    }, req.urgency),
                    h('span', { class: 'donate-req-badge donate-req-deadline' }, `📅 ${req.deadline}`),
                  ),
                ),
                h('p', { class: 'donate-req-desc' }, req.description),
                h('div', { class: 'donate-req-items' },
                  h('span', { class: 'donate-req-items-label' }, '📦 Items Needed:'),
                  h('span', { class: 'donate-req-items-text' }, req.itemsNeeded),
                ),
                h('div', { class: 'donate-req-progress' },
                  h('div', { class: 'donate-req-progress-row' },
                    h('span', null, '📦 Items'),
                    h('span', { class: 'donate-req-progress-val' }, `${req.fulfilledQuantity} / ${req.targetQuantity}`),
                  ),
                  h('div', { class: 'donate-req-bar-wrap' },
                    h('div', { class: 'donate-req-bar-fill', style: `width: ${qtyPct}%; background: ${qtyPct >= 100 ? '#00a050' : '#0090d0'};` }),
                  ),
                  h('div', { class: 'donate-req-progress-row' },
                    h('span', null, '💰 Amount'),
                    h('span', { class: 'donate-req-progress-val' }, `LKR ${req.raisedAmount.toLocaleString()} / ${req.targetAmount.toLocaleString()}`),
                  ),
                  h('div', { class: 'donate-req-bar-wrap' },
                    h('div', { class: 'donate-req-bar-fill donate-req-bar-amt', style: `width: ${amtPct}%; background: ${amtPct >= 100 ? '#00a050' : '#f0a000'};` }),
                  ),
                ),
                h('div', { class: 'donate-req-footer' },
                  h('span', { class: 'donate-req-contact' }, `👤 ${req.contactName}`),
                  h('button', {
                    class: 'donate-req-btn',
                    onClick: () => openDonateModal(req.id),
                  }, '💝 Donate Now'),
                ),
              );
            }),
          ),
        );
      }),

      // Fulfilled / closed requests
      otherRequests.length > 0 ? h('div', { class: 'donate-cat-section donate-closed-section' },
        h('div', { class: 'donate-cat-header' },
          h('span', { class: 'donate-cat-icon' }, '✅'),
          h('div', {},
            h('h2', { class: 'donate-cat-title' }, 'Fulfilled & Closed'),
            h('p', { class: 'donate-cat-desc' }, 'These requests have been completed or are no longer accepting donations.'),
          ),
        ),
        h('div', { class: 'donate-req-grid' },
          ...otherRequests.map(req => {
            const cat = categories.find(c => c.id === req.categoryId);
            return h('div', { class: 'donate-req-card donate-req-closed' },
              h('div', { class: 'donate-req-card-top' },
                h('h3', { class: 'donate-req-title' }, `${cat?.icon || ''} ${req.title}`),
                h('span', {
                  class: 'donate-req-badge',
                  style: `background: rgba(255,255,255,0.06); color: var(--text-muted);`,
                }, req.status),
              ),
              h('p', { class: 'donate-req-desc' }, req.description),
              h('div', { class: 'donate-req-meta' },
                h('span', null, `📦 ${req.fulfilledQuantity}/${req.targetQuantity} items`),
                h('span', null, `💰 LKR ${req.raisedAmount.toLocaleString()}/${req.targetAmount.toLocaleString()}`),
              ),
            );
          }),
        ),
      ) : null,

      // Empty state
      openRequests.length === 0 && otherRequests.length === 0 ? h('div', { class: 'donate-empty' },
        h('div', { class: 'donate-empty-icon' }, '💝'),
        h('p', { class: 'donate-empty-text' }, 'No active donation requests at this time'),
        h('p', { class: 'donate-empty-hint' }, 'Check back soon — new requests are added regularly'),
      ) : null,
    ),

    // Footer
    h('footer', { class: 'site-footer' },
      h('div', { class: 'footer-inner' },
        h('div', { class: 'footer-brand' },
          h('img', { src: '/logo.png', alt: 'Hope Hub', class: 'footer-logo-img' }),
          h('div', { class: 'footer-phone' }, 'Mr. Thilan Lasantha: +94 77 794 3085'),
          h('div', { class: 'footer-location' }, '3633+2W4, Richmond Hill Rd, Galle 80000'),
        ),
        h('div', { class: 'footer-links' },
          h('div', { class: 'footer-link-group' },
            h('h4', null, 'Quick Links'),
            h('a', { href: '/' }, 'Home'),
            h('a', { href: '/about' }, 'About'),
            h('a', { href: '/contact' }, 'Contact'),
          ),
          h('div', { class: 'footer-link-group' },
            h('h4', null, 'Support'),
            h('a', { href: '/donation-request' }, 'Donate Now'),
            h('a', { href: '/notices' }, 'Notices'),
            h('a', { href: '/events' }, 'Events'),
          ),
        ),
        h('div', { class: 'footer-social' },
          h('a', { href: '#', title: 'Facebook' }, '📘'),
          h('a', { href: '#', title: 'Instagram' }, '📷'),
          h('a', { href: '#', title: 'YouTube' }, '🎬'),
          h('a', { href: '#', title: 'LinkedIn' }, '💼'),
        ),
      ),
      h('div', { class: 'footer-bottom' },
        h('span', null, '© 2025 Richmond Hope Hub — Powered by Auravexon Codex'),
      ),
    ),
  );

});
