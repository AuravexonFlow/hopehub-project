/**
 * ═══════════════════════════════════════════════════════════
 *  Donation Request — Public page showing live requests & donor contribution
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { showToast } from '../services/toast';
import { getDonations, getPublishedRequests, getDonationCategories, addTransaction, contributeToRequest, getRequestById, submitDonorInterest } from '../stores/content-store';
import type { RequestedItem } from '../stores/content-store';
import { currentUser } from '../services/auth';
import { currentProfile } from '../services/profiles';
import { getSupabase } from '../lib/supabase';

/* ── Date formatting helper ── */
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  // Already in display format
  if (/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(dateStr)) return dateStr;
  // ISO format
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  return dateStr;
}

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
  const hasItems = req.requestedItems && req.requestedItems.length > 0;

  const qtyPct = req.targetQuantity > 0 ? Math.min(100, Math.round(req.fulfilledQuantity / req.targetQuantity * 100)) : 0;
  const amtPct = req.targetAmount > 0 ? Math.min(100, Math.round(req.raisedAmount / req.targetAmount * 100)) : 0;

  // Build item selection HTML
  let itemSelectionHTML = '';
  if (hasItems) {
    itemSelectionHTML = `
      <div class="donate-items-section">
        <h3 class="donate-form-title">📦 Select Items to Donate</h3>
        <p class="donate-items-hint">Choose the items and quantities you'd like to contribute:</p>
        <div class="donate-items-grid">
          ${req.requestedItems!.map((item, i) => {
            const remaining = Math.max(0, item.targetQty - item.fulfilledQty);
            const pct = item.targetQty > 0 ? Math.min(100, Math.round(item.fulfilledQty / item.targetQty * 100)) : 0;
            const isComplete = remaining <= 0;
            return `
              <div class="donate-item-row ${isComplete ? 'donate-item-complete' : ''}" data-item-index="${i}">
                <div class="donate-item-info">
                  <span class="donate-item-name">${item.name}</span>
                  <span class="donate-item-progress">${item.fulfilledQty} / ${item.targetQty} fulfilled</span>
                  <div class="donate-item-bar-wrap">
                    <div class="donate-item-bar-fill" style="width: ${pct}%; background: ${isComplete ? '#00a050' : '#0090d0'};"></div>
                  </div>
                </div>
                <div class="donate-item-input-wrap">
                  ${isComplete
                    ? '<span class="donate-item-done">✅ Fulfilled</span>'
                    : `<input type="number" class="donate-input donate-item-qty" data-item-name="${item.name}" data-item-remaining="${remaining}" value="" placeholder="0" min="0" max="${remaining}" step="1" inputmode="numeric">`
                  }
                  ${!isComplete ? `<span class="donate-item-max">max ${remaining}</span>` : ''}
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }

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
        ${hasItems ? '' : `
        <div class="donate-modal-items">
          <span class="donate-modal-items-label">📦 Items Needed:</span>
          <span class="donate-modal-items-text">${req.itemsNeeded}</span>
        </div>
        `}
        ${hasItems ? `
        <div class="donate-type-notice">
          <span>💡</span>
          <span>You can donate <strong>items</strong>, <strong>cash</strong>, or <strong>both</strong> — item donations can also include a cost value.</span>
        </div>
        ` : ''}
        <div class="donate-modal-progress">
          ${hasItems ? '' : `
          <div class="donate-modal-progress-row">
            <span>📦 Items</span>
            <span class="donate-modal-progress-val">${req.fulfilledQuantity} / ${req.targetQuantity}</span>
          </div>
          <div class="donate-modal-bar-wrap">
            <div class="donate-modal-bar-fill" style="width: ${qtyPct}%"></div>
          </div>
          `}
          ${req.targetAmount > 0 ? `
          <div class="donate-modal-progress-row">
            <span>💰 Amount</span>
            <span class="donate-modal-progress-val">LKR ${req.raisedAmount.toLocaleString()} / ${req.targetAmount.toLocaleString()}</span>
          </div>
          <div class="donate-modal-bar-wrap">
            <div class="donate-modal-bar-fill donate-modal-bar-amt" style="width: ${amtPct}%"></div>
          </div>
          ` : ''}
        </div>

        ${itemSelectionHTML}

        <div class="donate-form-section">
          <h3 class="donate-form-title">🤝 Your Information</h3>
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
          ${hasItems ? '' : `
          <div class="donate-field">
            <label>Items You're Donating</label>
            <textarea id="donate-items" class="donate-input donate-textarea" placeholder="e.g. 10 school bags, 20 notebooks, 5 uniforms"></textarea>
          </div>
          `}
          <div class="donate-form-grid">
            <div class="donate-field">
              <label>Cash Amount (LKR) ${hasItems ? '<span style="opacity:0.6;font-weight:400;">— optional if donating items</span>' : ''}</label>
              <input type="number" id="donate-amt" class="donate-input" placeholder="0" min="0">
            </div>
            <div class="donate-field">
              <label>Payment Method</label>
              <select id="donate-payment" class="donate-input donate-select">
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Online">Online Payment</option>
                <option value="In-Kind">In-Kind (Items)</option>
              </select>
            </div>
          </div>
          <div class="donate-form-grid">
            <div class="donate-field">
              <label>Receipt / Reference No.</label>
              <input type="text" id="donate-receipt" class="donate-input" placeholder="Optional">
            </div>
            <div class="donate-field">
              <label>Notes</label>
              <input type="text" id="donate-notes" class="donate-input" placeholder="Any additional notes...">
            </div>
          </div>
          <div class="donate-form-actions">
            <button class="donate-submit-btn">💝 Submit Donation</button>
            <button class="donate-cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    </div>`;

  // Clamp qty inputs to max on input and handle focus
  overlay.querySelectorAll('.donate-item-qty').forEach(input => {
    const el = input as HTMLInputElement;
    el.addEventListener('input', () => {
      const max = parseInt(el.dataset.itemRemaining || el.getAttribute('data-item-remaining') || '0', 10);
      const val = parseInt(el.value, 10);
      if (isNaN(val) || val < 0) { el.value = ''; return; }
      if (val > max) el.value = String(max);
    });
    el.addEventListener('focus', () => { el.select(); });
  });

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
  const itemsTextarea = document.getElementById('donate-items') as HTMLTextAreaElement | null;
  const amt = parseInt((document.getElementById('donate-amt') as HTMLInputElement)?.value, 10) || 0;
  const payment = (document.getElementById('donate-payment') as HTMLSelectElement)?.value || 'Cash';
  const receipt = (document.getElementById('donate-receipt') as HTMLInputElement)?.value?.trim();
  const notes = (document.getElementById('donate-notes') as HTMLInputElement)?.value?.trim();

  if (!name) {
    showToast('error', 'Name Required', 'Please enter your name');
    return;
  }

  // Collect per-item quantities from the grid
  const itemInputs = document.querySelectorAll('.donate-item-qty') as NodeListOf<HTMLInputElement>;
  const lineItems: { category: string; name: string; qty: number }[] = [];
  let totalQty = 0;
  itemInputs.forEach(input => {
    const itemName = input.dataset.itemName || '';
    const qty = parseInt(input.value, 10) || 0;
    if (itemName && qty > 0) {
      lineItems.push({ category: categoryId, name: itemName, qty });
      totalQty += qty;
    }
  });

  // Fallback: free-text items textarea (for requests without structured items)
  const freeTextItems = itemsTextarea?.value?.trim() || '';

  if (lineItems.length === 0 && !freeTextItems && amt === 0) {
    showToast('error', 'No Contribution', 'Please select items to donate or enter a cash amount');
    return;
  }

  // Build items string from lineItems or free text
  let itemsStr = '';
  if (lineItems.length > 0) {
    itemsStr = lineItems.map(li => `${li.qty} ${li.name}`).join(', ');
  } else if (freeTextItems) {
    itemsStr = freeTextItems;
  } else {
    itemsStr = 'Cash donation';
  }

  // Create a PENDING received transaction
  addTransaction({
    type: 'received',
    status: 'pending',
    contactName: name,
    contactInfo: contact || undefined,
    categoryId,
    requestId,
    items: itemsStr,
    quantity: totalQty > 0 ? totalQty.toString() : undefined,
    date: new Date().toISOString().split('T')[0],
    amount: amt > 0 ? amt : undefined,
    receiptNo: receipt || undefined,
    paymentMethod: payment,
    notes: notes || undefined,
    lineItems: lineItems.length > 0 ? lineItems : undefined,
  });

  // Update cash amount on the request immediately
  if (amt > 0) {
    contributeToRequest(requestId, amt, 0);
  }

  // Send automated email notification to admin (fire-and-forget)
  // Uses the working send-contact-email edge function with donation formatting
  const cat = getDonationCategories().find(c => c.id === categoryId);
  const req = getRequestById(requestId);
  const supabase = getSupabase();

  // Build a detailed message for the admin email
  const parts: string[] = [];
  parts.push(`📣 DONATION REQUEST: ${req?.title || 'Unknown'}`);
  parts.push(`\n📁 Category: ${cat ? `${cat.icon} ${cat.title}` : 'Unknown'}`);
  parts.push(`👤 Donor: ${name}`);
  if (contact) parts.push(`📞 Contact: ${contact}`);
  if (lineItems.length > 0) {
    parts.push(`\n📦 Items:`);
    lineItems.forEach(li => parts.push(`  • ${li.qty}× ${li.name}`));
  }
  parts.push(`📊 Total Qty: ${totalQty > 0 ? totalQty : 'N/A'}`);
  if (amt > 0) parts.push(`💰 Cash Amount: LKR ${amt.toLocaleString()}`);
  if (payment) parts.push(`💳 Payment Method: ${payment}`);
  if (receipt) parts.push(`🧾 Receipt No: ${receipt}`);
  if (notes) parts.push(`\n📝 Notes: ${notes}`);
  parts.push(`\n⏳ Status: PENDING — Review in Admin Panel`);

  supabase.functions.invoke('send-contact-email', {
    body: {
      name: `💝 Donation — ${name}`,
      email: contact || 'noreply@hopehub.lk',
      subject: `New Donation: ${req?.title || 'Unknown'} — ${name}`,
      message: parts.join('\n'),
    },
  }).then(({ error }: { error: any }) => {
    if (error) console.error('Donation notification email failed:', error);
    else console.log('Donation notification email sent');
  }).catch((err: any) => {
    console.error('Donation notification email error:', err);
  });

  closeDonateModal();
  showToast('success', 'Thank You!', `Your donation has been submitted for review. The admin team will confirm and add it to inventory. Richmond College appreciates your generosity! 💝`);
}

/* ── Interest Modal (donor expresses interest → admin) ── */

let _interestModalReq: any = null;

function openInterestModal(req: any) {
  _interestModalReq = req;
  renderInterestModal();
}

function closeInterestModal() {
  _interestModalReq = null;
  const overlay = document.querySelector('.interest-modal-overlay');
  if (overlay) overlay.remove();
}

function renderInterestModal() {
  const existing = document.querySelector('.interest-modal-overlay');
  if (existing) existing.remove();
  if (!_interestModalReq) return;

  const req = _interestModalReq;

  const overlay = document.createElement('div');
  overlay.className = 'interest-modal-overlay';
  overlay.innerHTML = `
    <div class="interest-modal-box">
      <div class="modal-head">
        <h3>🤝 Express Interest — ${req.title}</h3>
        <button class="modal-close">✕</button>
      </div>
      <p class="interest-modal-desc">Let the admin team know how you'd like to help. They'll reach out to coordinate!</p>
      <div class="interest-form">
        <label>How would you like to help?</label>
        <select id="interest-type" class="interest-field">
          <option value="general">💬 General — I want to help in any way</option>
          <option value="items">📦 Items — I can donate specific items</option>
          <option value="cash">💰 Cash — I want to contribute financially</option>
          <option value="both">🎁 Both — Items & Cash</option>
        </select>
        <label>Your message (optional)</label>
        <textarea id="interest-message" class="interest-field" rows="3" placeholder="Tell us what you can provide or how you'd like to help..."></textarea>
        <label>Estimated contribution (LKR, optional)</label>
        <input id="interest-amount" class="interest-field" type="number" min="0" placeholder="e.g. 5000">
        <label>Items you can provide (optional)</label>
        <input id="interest-items" class="interest-field" type="text" placeholder="e.g. 10 notebooks, 5 pencil cases">
        <label>Your name</label>
        <input id="interest-name" class="interest-field" type="text" placeholder="Full name">
        <label>Phone number (optional)</label>
        <input id="interest-phone" class="interest-field" type="tel" placeholder="07X XXX XXXX">
        <button class="interest-submit-btn">🤝 Submit Interest</button>
      </div>
    </div>`;

  overlay.querySelector('.modal-close')!.addEventListener('click', closeInterestModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeInterestModal(); });
  overlay.querySelector('.interest-submit-btn')!.addEventListener('click', () => submitInterest());

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { closeInterestModal(); document.removeEventListener('keydown', onKey); }
  };
  document.addEventListener('keydown', onKey);

  document.body.appendChild(overlay);
}

async function submitInterest() {
  const type = (document.getElementById('interest-type') as HTMLSelectElement)?.value || 'general';
  const message = (document.getElementById('interest-message') as HTMLTextAreaElement)?.value || '';
  const amount = parseFloat((document.getElementById('interest-amount') as HTMLInputElement)?.value || '0');
  const items = (document.getElementById('interest-items') as HTMLInputElement)?.value || '';
  const name = (document.getElementById('interest-name') as HTMLInputElement)?.value || '';
  const phone = (document.getElementById('interest-phone') as HTMLInputElement)?.value || '';

  if (!name.trim()) {
    showToast('error', 'Missing Name', 'Please enter your name so the admin team can contact you.');
    return;
  }

  const req = _interestModalReq;
  if (!req) return;

  const user = currentUser.peek();
  const profile = currentProfile.peek();

  const ok = await submitDonorInterest({
    request_id: req.id,
    request_title: req.title,
    category_id: req.categoryId,
    donor_name: name.trim(),
    donor_email: profile?.email || user?.email || '',
    donor_phone: phone || undefined,
    message: message || undefined,
    interest_type: type as any,
    estimated_amount: amount > 0 ? amount : undefined,
    estimated_items: items || undefined,
  });

  closeInterestModal();
  if (ok) {
    showToast('success', 'Interest Submitted! 🤝', 'The admin team has been notified and will reach out to you. Thank you for your willingness to help!');
  } else {
    showToast('error', 'Submission Failed', 'Something went wrong. Please try again or contact the admin team directly.');
  }
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
      h('div', { class: 'section-header reveal' },
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

      // ── Donation Types Notice ──
      h('div', { class: 'donate-types-notice reveal' },
        h('div', { class: 'donate-types-icon' }, '💡'),
        h('div', { class: 'donate-types-content' },
          h('strong', {}, 'Two Ways to Donate'),
          h('div', { class: 'donate-types-grid' },
            h('div', { class: 'donate-type-card' },
              h('span', { class: 'donate-type-emoji' }, '💰'),
              h('div', {},
                h('strong', {}, 'Cash Donations'),
                h('span', {}, 'Contribute any amount via cash, bank transfer, or online payment'),
              ),
            ),
            h('div', { class: 'donate-type-card' },
              h('span', { class: 'donate-type-emoji' }, '📦'),
              h('div', {},
                h('strong', {}, 'Item Donations'),
                h('span', {}, 'Donate physical items — you can also set a cost value for the items you provide'),
              ),
            ),
          ),
        ),
      ),

      // ── Contact Admin Bar ──
      h('div', { class: 'donate-contact-bar reveal' },
        h('div', { class: 'donate-contact-info' },
          h('span', { class: 'donate-contact-icon' }, '📞'),
          h('div', {},
            h('strong', {}, 'Have questions? Contact us directly!'),
            h('span', { class: 'donate-contact-sub' }, 'Reach out via WhatsApp, phone, email, or our contact form'),
          ),
        ),
        h('div', { class: 'donate-contact-actions' },
          h('a', {
            class: 'donate-contact-btn donate-contact-whatsapp',
            href: 'https://wa.me/94777943085?text=' + encodeURIComponent('Hello! I\'m interested in making a donation to Richmond Hope Hub. Could you please provide more details?'),
            target: '_blank',
            rel: 'noopener',
          }, '💬 WhatsApp'),
          h('a', {
            class: 'donate-contact-btn donate-contact-call',
            href: 'tel:+94777943085',
          }, '📞 Call Us'),
          h('a', {
            class: 'donate-contact-btn donate-contact-email',
            href: 'mailto:richmondc2society@gmail.com?subject=' + encodeURIComponent('Donation Inquiry - Hope Hub'),
          }, '📧 Email'),
          h('a', {
            class: 'donate-contact-btn donate-contact-form',
            href: '/contact?ref=donation',
          }, '✉️ Contact Form'),
        ),
      ),

      // Open requests grouped by category
      ...Array.from(byCat.entries()).map(([catId, reqs]) => {
        const cat = categories.find(c => c.id === catId);
        if (!cat) return null;
        return h('div', { class: 'donate-cat-section reveal', id: `cat-${catId}` },
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
              return h('div', { class: 'donate-req-card card-hover-lift' },
                h('div', { class: 'donate-req-card-top' },
                  h('h3', { class: 'donate-req-title' }, req.title),
                  h('div', { class: 'donate-req-badges' },
                    h('span', {
                      class: 'donate-req-badge',
                      style: `background: ${urgencyColors[req.urgency]}; color: ${urgencyTextColors[req.urgency]};`,
                    }, req.urgency),
                    h('span', { class: 'donate-req-badge donate-req-deadline' }, `📅 ${formatDate(req.deadline)}`),
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
                  h('div', { class: 'donate-btn-row' },
                    h('button', {
                      class: 'donate-req-btn donate-req-btn-interest',
                      onClick: () => openInterestModal(req),
                    }, '🤝 I\'m Interested'),
                    h('button', {
                      class: 'donate-req-btn',
                      onClick: () => openDonateModal(req.id),
                    }, '💝 Donate Now'),
                  ),
                ),
              );
            }),
          ),
        );
      }),

      // Fulfilled / closed requests
      otherRequests.length > 0 ? h('div', { class: 'donate-cat-section donate-closed-section reveal' },
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
            return h('div', { class: 'donate-req-card donate-req-closed card-hover-lift' },
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
      openRequests.length === 0 && otherRequests.length === 0 ? h('div', { class: 'donate-empty reveal' },
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
          h('div', { class: 'footer-phone' }, 'Mr. Thilan Lasantha: ', h('a', { href: 'tel:+94777943085', style: 'color:inherit; text-decoration:none;' }, '+94 77 794 3085')),
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
        h('span', null, '© 2026 Richmond Hope Hub — Powered by Auravexon Codex'),
      ),
    ),
  );

});
