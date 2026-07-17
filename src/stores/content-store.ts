/**
 * ═══════════════════════════════════════════════════════════
 *  Content Store — Supabase-backed with localStorage fallback
 *  Full CRUD sync with real-time updates
 * ═══════════════════════════════════════════════════════════
 */

import { createSignal } from '../vortex/signals';
import { getSupabase, getSupabaseAdmin } from '../lib/supabase';
import { inventorySheetTransactions } from '../data/inventory-sheets';

// ─── Types ────────────────────────────────────────────────

export interface Notice {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  full: string;
  tag: 'Active' | 'Update' | 'Event' | 'Report';
  icon: string;
  photos?: string[];
  published: boolean;
  created_at: string;
}

export interface EventItem {
  id: string;
  date: string;
  title: string;
  desc: string;
  full: string;
  tag: 'Upcoming' | 'Completed';
  icon: string;
  stats: string;
  photos?: string[];
  thumbnailIndex?: number;
  heroIndex?: number;
  videoUrl?: string;
  published: boolean;
  created_at: string;
}

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  full: string;
  category: 'Partnership' | 'Milestone' | 'Impact' | 'Story' | 'Report';
  icon: string;
  readTime: string;
  published: boolean;
  created_at: string;
}

export interface DonationCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  goal: number;
  raised: number;
  color: string;
  urgency: string;
  published: boolean;
  comingSoon?: boolean;
  created_at: string;
}

export type CareerResourceCategory = 'internship' | 'job' | 'scholarship' | 'higher-education' | 'training' | 'general';

export interface CareerResource {
  id: string;
  title: string;
  description: string;
  category: CareerResourceCategory;
  icon: string;
  color: string;
  image_url: string;
  link_url: string;
  location: string;
  deadline: string;
  contact_info: string;
  published: boolean;
  featured: boolean;
  expired: boolean;
  created_at: string;
}

export interface RequestedItem {
  name: string;
  targetQty: number;
  fulfilledQty: number;
}

export interface DonationRequest {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  itemsNeeded: string;
  requestedItems?: RequestedItem[];
  targetQuantity: number;
  fulfilledQuantity: number;
  targetAmount: number;
  raisedAmount: number;
  urgency: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'open' | 'fulfilled' | 'closed';
  deadline: string;
  contactName: string;
  contactInfo?: string;
  published: boolean;
  created_at: string;
}

export interface DonationTransaction {
  id: string;
  type: 'received' | 'distributed';
  status?: 'pending' | 'confirmed';
  contactName: string;
  contactInfo?: string;
  categoryId: string;
  requestId?: string;
  items: string;
  quantity?: string;
  date: string;
  amount?: number;
  receiptNo?: string;
  paymentMethod?: string;
  notes?: string;
  lineItems?: { category: string; name: string; qty: number; unitCost?: number }[];
  created_at: string;
}

export interface BestC2Student {
  id: string;
  studentName: string;
  grade: string;
  achievement: string;
  description: string;
  photoUrl: string;
  spotlightMonth: number;
  spotlightYear: number;
  published: boolean;
  created_at: string;
}

interface ContentState {
  notices: Notice[];
  events: EventItem[];
  news: NewsItem[];
  donations: DonationCategory[];
  careerResources: CareerResource[];
}

// ─── Donation Transactions (separate store) ───────────────

const TX_KEY = 'hope-hub-donation-tx';
const TX_VERSION_KEY = 'hope-hub-donation-tx-version';
const TX_VERSION = '2.2'; // Bump when inventory data changes

const defaultTransactions: DonationTransaction[] = [
  ...inventorySheetTransactions,
  // ── Hope Hub Donations 2026 ──
  {
    id: 'don2026-06-11', type: 'received', status: 'confirmed',
    contactName: 'Richmond 94 batch',
    contactInfo: 'Dinesh Kumarasinghe, Neelaka Jayamanna, Thilan Lasantha',
    categoryId: 'd6', items: 'Office table and 6 chairs',
    amount: 300000, date: '2026-06-11',
    notes: 'By Richmond 94 batch / Hope Hub Donation – 11th June 2026. A table and six chairs were donated on 11th June and handed over to Thilaka Madam for the Education Development Unit. Cost Rs. 300,000.',
    created_at: '2026-06-11',
  },
  {
    id: 'don2026-07-03', type: 'received', status: 'confirmed',
    contactName: 'Richmond 94 batch',
    categoryId: 'd3', items: 'Sofa set',
    amount: 100000, date: '2026-07-03',
    notes: 'By Richmond 94 batch / Hope Hub Donation – 3rd July 2026. A sofa set was donated on 3rd July and handed over to Thilaka Madam for the C2 Center. The item already recorded in the inventory.',
    created_at: '2026-07-03',
  },
];

// ─── Donation Requests (separate store) ──────────────────

const REQ_KEY = 'hope-hub-donation-requests';

const defaultRequests: DonationRequest[] = [
  {
    id: 'dr1', title: 'Grade 6 Starter Kits',
    description: 'We need backpacks, notebooks, and stationery for 50 incoming Grade 6 students who cannot afford basic school supplies.',
    categoryId: 'd1', itemsNeeded: '50 backpacks, 200 notebooks, 100 pencil sets, 50 rulers',
    requestedItems: [
      { name: 'backpacks', targetQty: 50, fulfilledQty: 25 },
      { name: 'notebooks', targetQty: 200, fulfilledQty: 120 },
      { name: 'pencil sets', targetQty: 100, fulfilledQty: 50 },
      { name: 'rulers', targetQty: 50, fulfilledQty: 30 },
    ],
    targetQuantity: 400, fulfilledQuantity: 225, targetAmount: 150000, raisedAmount: 75000,
    urgency: 'Critical', status: 'open', deadline: 'Mar 31, 2026',
    contactName: 'Mr. Anura Perera', contactInfo: 'anura@example.com', published: true, created_at: '2026-01-10',
  },
  {
    id: 'dr2', title: 'Winter Uniform Drive',
    description: '30 students need new winter uniforms. Old ones are torn and beyond repair. Help us keep them warm and looking professional.',
    categoryId: 'd2', itemsNeeded: '30 school uniforms (boys), 20 school uniforms (girls)',
    requestedItems: [
      { name: 'school uniforms (boys)', targetQty: 30, fulfilledQty: 18 },
      { name: 'school uniforms (girls)', targetQty: 20, fulfilledQty: 12 },
    ],
    targetQuantity: 50, fulfilledQuantity: 30, targetAmount: 200000, raisedAmount: 120000,
    urgency: 'High', status: 'open', deadline: 'Apr 15, 2026',
    contactName: 'Mrs. Kumari Silva', contactInfo: '+94 77 234 5678', published: true, created_at: '2026-01-20',
  },
  {
    id: 'dr3', title: 'Cricket Season Equipment',
    description: 'Our cricket team qualified for the divisional tournament. We need proper equipment for 15 players to compete.',
    categoryId: 'd4', itemsNeeded: '15 cricket bats, 30 cricket balls, 15 batting pads, 15 pairs of gloves',
    requestedItems: [
      { name: 'cricket bats', targetQty: 15, fulfilledQty: 10 },
      { name: 'cricket balls', targetQty: 30, fulfilledQty: 20 },
      { name: 'batting pads', targetQty: 15, fulfilledQty: 10 },
      { name: 'pairs of gloves', targetQty: 15, fulfilledQty: 15 },
    ],
    targetQuantity: 75, fulfilledQuantity: 55, targetAmount: 250000, raisedAmount: 120000,
    urgency: 'High', status: 'open', deadline: 'Feb 28, 2026',
    contactName: 'Coach Priyantha', contactInfo: '+94 71 345 6789', published: true, created_at: '2026-01-25',
  },
  {
    id: 'dr4', title: 'Monthly Meal Program - February',
    description: 'Support our school kitchen feeding 80 underprivileged students daily. Monthly rice, dhal, and vegetable supplies needed.',
    categoryId: 'd5', itemsNeeded: '400 kg rice, 100 kg dhal, 80 kg vegetables, 20 kg cooking oil',
    requestedItems: [
      { name: 'rice', targetQty: 400, fulfilledQty: 250 },
      { name: 'dhal', targetQty: 100, fulfilledQty: 80 },
      { name: 'vegetables', targetQty: 80, fulfilledQty: 50 },
      { name: 'cooking oil', targetQty: 20, fulfilledQty: 20 },
    ],
    targetQuantity: 600, fulfilledQuantity: 400, targetAmount: 180000, raisedAmount: 135000,
    urgency: 'Critical', status: 'open', deadline: 'Feb 28, 2026',
    contactName: 'Mrs. Fernando', contactInfo: 'kitchen@richmond.lk', published: true, created_at: '2026-02-01',
  },
  {
    id: 'dr5', title: 'GCE O/L Exam Prep Books',
    description: 'Help our O/L students prepare with past paper collections and model papers. Targeting 100 students sitting exams this year.',
    categoryId: 'd6', itemsNeeded: '200 GCE O/L past paper books, 100 model papers, 50 subject guides',
    requestedItems: [
      { name: 'GCE O/L past paper books', targetQty: 200, fulfilledQty: 120 },
      { name: 'model papers', targetQty: 100, fulfilledQty: 60 },
      { name: 'subject guides', targetQty: 50, fulfilledQty: 20 },
    ],
    targetQuantity: 350, fulfilledQuantity: 200, targetAmount: 175000, raisedAmount: 100000,
    urgency: 'Medium', status: 'open', deadline: 'May 31, 2026',
    contactName: 'Dr. Nimal Rajapaksa', contactInfo: '+94 70 456 7890', published: true, created_at: '2026-02-10',
  },
  {
    id: 'dr6', title: 'Counseling Room Setup',
    description: 'Setting up a dedicated counseling room. Need furniture, books, and calming materials for student wellbeing sessions.',
    categoryId: 'd7', itemsNeeded: '2 comfortable chairs, 1 bookshelf, 50 self-help books, art supplies',
    requestedItems: [
      { name: 'comfortable chairs', targetQty: 2, fulfilledQty: 1 },
      { name: 'bookshelf', targetQty: 1, fulfilledQty: 0 },
      { name: 'self-help books', targetQty: 50, fulfilledQty: 5 },
      { name: 'art supplies', targetQty: 10, fulfilledQty: 4 },
    ],
    targetQuantity: 55, fulfilledQuantity: 10, targetAmount: 300000, raisedAmount: 45000,
    urgency: 'Low', status: 'open', deadline: 'Jun 30, 2026',
    contactName: 'Ms. Dilini Fernando', contactInfo: 'counseling@richmond.lk', published: true, created_at: '2026-03-01',
  },
];

let _reqState: DonationRequest[] = (() => {
  try {
    const raw = localStorage.getItem(REQ_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [...defaultRequests];
})();

function persistReq() { localStorage.setItem(REQ_KEY, JSON.stringify(_reqState)); }

function initReqStore() {
  if (!localStorage.getItem(REQ_KEY)) {
    _reqState = [...defaultRequests];
    persistReq();
  }
}
initReqStore();

/** Row mappers for Supabase ↔ local */
function rowToTx(r: any): DonationTransaction {
  return {
    id: r.id, type: r.type, status: r.status,
    contactName: r.contact_name, contactInfo: r.contact_info || undefined,
    categoryId: r.category_id || '', requestId: r.request_id || undefined,
    items: r.items || '', quantity: r.quantity || undefined,
    date: r.date, amount: r.amount ? Number(r.amount) : undefined,
    receiptNo: r.receipt_no || undefined, paymentMethod: r.payment_method || undefined,
    notes: r.notes || undefined,
    lineItems: Array.isArray(r.line_items) ? r.line_items : (r.line_items ? JSON.parse(r.line_items) : []),
    created_at: r.created_at || new Date().toISOString(),
  };
}

function rowToReq(r: any): DonationRequest {
  return {
    id: r.id, title: r.title, description: r.description || '',
    categoryId: r.category_id || '', itemsNeeded: r.items_needed || '',
    requestedItems: Array.isArray(r.requested_items) ? r.requested_items : (r.requested_items ? JSON.parse(r.requested_items) : []),
    targetQuantity: r.target_quantity || 0, fulfilledQuantity: r.fulfilled_quantity || 0,
    targetAmount: Number(r.target_amount) || 0, raisedAmount: Number(r.raised_amount) || 0,
    urgency: r.urgency || 'Medium', status: r.status || 'open',
    deadline: r.deadline || '', contactName: r.contact_name || '',
    contactInfo: r.contact_info || undefined, published: r.published ?? true,
    created_at: r.created_at || new Date().toISOString(),
  };
}

function txToRow(tx: DonationTransaction) {
  return {
    id: tx.id, type: tx.type, status: tx.status || 'confirmed',
    contact_name: tx.contactName, contact_info: tx.contactInfo || null,
    category_id: tx.categoryId || null, request_id: tx.requestId || null,
    items: tx.items || '', quantity: tx.quantity || null,
    date: tx.date, amount: tx.amount || 0,
    receipt_no: tx.receiptNo || null, payment_method: tx.paymentMethod || null,
    notes: tx.notes || null, line_items: JSON.stringify(tx.lineItems || []),
    created_at: tx.created_at,
  };
}

function reqToRow(req: DonationRequest) {
  return {
    id: req.id, title: req.title, description: req.description || '',
    category_id: req.categoryId || null, items_needed: req.itemsNeeded || '',
    requested_items: JSON.stringify(req.requestedItems || []),
    target_quantity: req.targetQuantity, fulfilled_quantity: req.fulfilledQuantity,
    target_amount: req.targetAmount, raised_amount: req.raisedAmount,
    urgency: req.urgency, status: req.status,
    deadline: req.deadline || null, contact_name: req.contactName || '',
    contact_info: req.contactInfo || null, published: req.published,
    created_at: req.created_at,
  };
}

let _txState: DonationTransaction[] = (() => {
  try {
    const raw = localStorage.getItem(TX_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [...defaultTransactions];
})();

function persistTx() { localStorage.setItem(TX_KEY, JSON.stringify(_txState)); }

function initTxStore() {
  const storedVersion = localStorage.getItem(TX_VERSION_KEY);
  if (!localStorage.getItem(TX_KEY) || storedVersion !== TX_VERSION) {
    _txState = [...defaultTransactions];
    persistTx();
    localStorage.setItem(TX_VERSION_KEY, TX_VERSION);
  }
}
initTxStore();

// ─── Donation data version signal (triggers UI re-render on sync) ──
export const donationDataVersion = createSignal<number>(0);
function bumpDonationVersion() { donationDataVersion.set(donationDataVersion.peek() + 1); }

// ─── Supabase Sync for Transactions & Requests ───────────

/**
 * Sync donation data to Supabase (ecpyryxierymdqgqsomi) using the admin client directly.
 * Replaces the old edge function approach that pointed to the wrong project.
 */
async function syncCall(action: string, payload: Record<string, any> = {}): Promise<any> {
  try {
    const sb = getSupabaseAdmin();
    const table = payload.table as string;

    if (action === 'get_all') {
      const { data, error } = await sb.from(table).select('*');
      if (error) return { error: error.message };
      return data;
    }

    if (action === 'upsert') {
      const rows = Array.isArray(payload.data) ? payload.data : [payload.data];
      const { error } = await sb.from(table).upsert(rows, { onConflict: 'id' });
      if (error) return { error: error.message };
      return { success: true };
    }

    if (action === 'update') {
      const { error } = await sb.from(table).update(payload.updates).eq('id', payload.id);
      if (error) return { error: error.message };
      return { success: true };
    }

    if (action === 'delete') {
      const { error } = await sb.from(table).delete().eq('id', payload.id);
      if (error) return { error: error.message };
      return { success: true };
    }

    return { error: `Unknown action: ${action}` };
  } catch (err) {
    console.warn('[ContentStore] Sync call failed:', action, err);
    return { error: String(err) };
  }
}

async function loadTxFromSupabase(): Promise<void> {
  try {
    const [txResult, reqResult] = await Promise.all([
      syncCall('get_all', { table: 'donation_transactions' }),
      syncCall('get_all', { table: 'donation_requests' }),
    ]);
    let changed = false;

    // ── Merge transactions: Supabase is source of truth, but push local-only records up ──
    if (Array.isArray(txResult) && txResult.length > 0) {
      const remoteIds = new Set(txResult.map((r: any) => r.id));
      const localOnly = _txState.filter(t => !remoteIds.has(t.id));
      if (localOnly.length > 0) {
        console.log(`[ContentStore] Pushing ${localOnly.length} local-only transactions to Supabase`);
        await syncCall('upsert', { table: 'donation_transactions', data: localOnly.map(txToRow) });
      }
      // Remote takes priority for shared IDs, but keep local-only records
      const merged = [...txResult.map(rowToTx), ...localOnly];
      _txState = merged;
      persistTx();
      changed = true;
    } else if (_txState.length > 0) {
      // Supabase empty — seed from local
      const { error } = await syncCall('upsert', { table: 'donation_transactions', data: _txState.map(txToRow) });
      if (error) console.warn('[ContentStore] Tx seed failed:', error);
    }

    // ── Merge requests: same logic ──
    if (Array.isArray(reqResult) && reqResult.length > 0) {
      const remoteIds = new Set(reqResult.map((r: any) => r.id));
      const localOnly = _reqState.filter(r => !remoteIds.has(r.id));
      if (localOnly.length > 0) {
        console.log(`[ContentStore] Pushing ${localOnly.length} local-only requests to Supabase`);
        await syncCall('upsert', { table: 'donation_requests', data: localOnly.map(reqToRow) });
      }
      const merged = [...reqResult.map(rowToReq), ...localOnly];
      _reqState = merged;
      persistReq();
      changed = true;
    } else if (_reqState.length > 0) {
      const { error } = await syncCall('upsert', { table: 'donation_requests', data: _reqState.map(reqToRow) });
      if (error) console.warn('[ContentStore] Req seed failed:', error);
    }

    if (changed) bumpDonationVersion();
  } catch (err) {
    console.warn('[ContentStore] Tx sync failed, using localStorage:', err);
  }
}

// Fire-and-forget sync on load
loadTxFromSupabase();

export function resetTxStore() {
  _txState = [...defaultTransactions];
  persistTx();
}

// ─── Default Data ─────────────────────────────────────────

const defaultNotices: Notice[] = [
  {
    id: 'n1',
    date: 'Apr 30, 2026',
    title: 'Special Counseling Session for Parents – Public Day',
    excerpt: 'The Richmond College Counseling & Career Guidance Unit (C2-Center) warmly invites all parents to participate in special counseling sessions held every Wednesday (Public Day) from 1:30 PM onwards.',
    full: 'The Richmond College Counseling & Career Guidance Unit (C2-Center) warmly invites all parents to participate in special counseling sessions held every Wednesday (Public Day) from 1:30 PM onwards. These sessions offer a meaningful opportunity to engage in your child\'s future, discuss academic progress, and receive guidance on career pathways. Professional counselors are available to address concerns about student well-being, mental health, and educational planning.',
    tag: 'Event',
    icon: '🧠',
    photos: ['https://api.richmondhopehub.lk/storage/notices/1777519038_Screenshot%202026-04-30%20084630.png'],
    published: true,
    created_at: '2026-04-30',
  },
  {
    id: 'n2',
    date: 'Dec 31, 2025',
    title: '2026 Calendar with New Year Greeting',
    excerpt: 'The Richmond College Hope Hub & C2 Society wish the entire college community a bright and successful year ahead. The comprehensive 2026 calendar is now available.',
    full: 'The Richmond College Hope Hub & C2 Society wish the entire college community a bright and successful year ahead. To help you plan your academic journey, we have released the comprehensive 2026 calendar featuring all important academic dates, event schedules, and holiday periods. Pick up your copy from the school office or download it from the Hope Hub center.',
    tag: 'Update',
    icon: '📅',
    photos: ['https://api.richmondhopehub.lk/storage/notices/1767197530_26%20calander%20prev%202.jpg'],
    published: true,
    created_at: '2025-12-31',
  },
];

const defaultEvents: EventItem[] = [
  {
    id: 'e0',
    date: 'Apr 20, 2026',
    title: 'Official Launch of the National Student Counseling and Career Guidance Framework',
    desc: 'On April 20, a significant national program was successfully held in collaboration with the Ministry of Education, launching the National Student Counseling and Career Guidance Framework.',
    full: 'On April 20, a significant national program was successfully held in collaboration with the Ministry of Education. The event marked the official launch of the National Student Counseling and Career Guidance Framework, a landmark initiative aimed at providing structured counseling and career guidance services to students across the country. Richmond College Hope Hub played a key role in supporting this framework, which will benefit thousands of students in making informed decisions about their academic and career paths.',
    tag: 'Completed',
    icon: '🏛️',
    stats: 'National Program',
    photos: ['https://api.richmondhopehub.lk/storage/events/JfXAWjNEVlrGJL5oIO1J3IGazC8ynX8ptFsWpnSV.jpg'],
    thumbnailIndex: 0,
    heroIndex: 0,
    published: true,
    created_at: '2026-04-20',
  },
  {
    id: 'e1',
    date: 'Jan 09, 2026',
    title: 'Token of Gratitude for the HopeHub Team',
    desc: 'The Hope Hub and C2 Society team were formally recognized for their dedication and leadership at Richmond College.',
    full: 'The Hope Hub and C2 Society team were formally recognized for their dedication and leadership at Richmond College. This heartfelt ceremony celebrated the dedicated team behind Richmond Hope Hub with recognition awards, shared memories, and appreciation for those who make it all possible. From organizing donation drives to mentoring students, every member of the team plays a vital role in empowering Richmond College students. This celebration was a reminder that behind every successful initiative is a team united by compassion and purpose.',
    tag: 'Completed',
    icon: '🙏',
    stats: 'Team Celebration',
    photos: [
      'https://api.richmondhopehub.lk/storage/events/DTZFkU9c3LlbbleBWSt1BNile7A1XNFtKjroyOqS.png',
      '/events/gratitude/gratitude-01.jpg',
      '/events/gratitude/gratitude-02.jpg',
      '/events/gratitude/gratitude-03.jpg',
      '/events/gratitude/gratitude-04.jpg',
      '/events/gratitude/gratitude-05.jpg',
      '/events/gratitude/gratitude-06.jpg',
      '/events/gratitude/gratitude-07.jpg',
      '/events/gratitude/gratitude-08.jpg',
      '/events/gratitude/gratitude-09.jpg',
      '/events/gratitude/gratitude-10.jpg',
      '/events/gratitude/gratitude-11.jpg',
      '/events/gratitude/gratitude-12.jpg',
      '/events/gratitude/gratitude-13.jpg',
      '/events/gratitude/gratitude-14.jpg',
    ],
    thumbnailIndex: 3,
    heroIndex: 0,
    published: true,
    created_at: '2026-01-09',
  },
  {
    id: 'e2',
    date: 'Jan 01, 2026',
    title: 'C2 Society Room Enhancement',
    desc: 'The C2 Society room was restructured into a beautiful, calm space with scenic views, creating a peaceful environment for student activities.',
    full: 'The C2 Society room was restructured into a beautiful, calm space with scenic views, creating a peaceful environment for student activities and collaborative learning. The renovation included new furniture, improved lighting, creative wall art, and an organized resource corner. This enhanced space now serves as a hub for student-led initiatives, study groups, counseling sessions, and creative projects. The room reflects the Hope Hub\'s commitment to providing students with inspiring spaces that foster growth and well-being.',
    tag: 'Completed',
    icon: '🏠',
    stats: 'Room Renovation',
    photos: ['https://api.richmondhopehub.lk/storage/events/84ozo61LPDm1a7r6fVZxE4VgjFpV32suwTq4OkYU.png'],
    thumbnailIndex: 0,
    heroIndex: 0,
    published: true,
    created_at: '2026-01-01',
  },
  {
    id: 'e3',
    date: 'Aug 25, 2025',
    title: 'Grand Opening of Richmond College HOPE HUB',
    desc: 'The HOPE HUB at Richmond College Galle officially opened its doors to "Innovate, Collaborate, and Elevate" — a new era of student support.',
    full: 'The HOPE HUB at Richmond College Galle officially opened its doors with the mission to "Innovate, Collaborate, and Elevate." This landmark event marked the beginning of a new era of student support at Richmond College. The Hope Hub serves as a central point for coordinating donations, student resources, counseling services, career guidance, and community outreach. The opening ceremony was attended by school administrators, alumni, parents, and community leaders who celebrated this milestone achievement.',
    tag: 'Completed',
    icon: '🎊',
    stats: 'Grand Opening',
    photos: ['https://api.richmondhopehub.lk/storage/events/COgtd8aSzrUu1qOXw4afO2aKY7CuSXpEZENxcogD.jpg'],
    thumbnailIndex: 0,
    heroIndex: 0,
    published: true,
    created_at: '2025-08-25',
  },
  {
    id: 'e4',
    date: 'Jul 07, 2026',
    title: 'A Year Of Journey — Richmond Hope Hub',
    desc: 'A cinematic recap celebrating one year of Richmond Hope Hub — from our grand opening to every milestone, every student empowered, and every life touched.',
    full: 'This video takes you through the incredible journey of Richmond Hope Hub over the past year. From the grand opening ceremony to national programs, team celebrations, room renovations, and countless moments of impact — it has been a year of innovation, collaboration, and elevation. Watch as we look back at the milestones, the people, and the passion that made it all possible. Richmond Hope Hub continues to empower students, connect communities, and build a brighter future for everyone.',
    tag: 'Completed',
    icon: '🎬',
    stats: 'Anniversary Video',
    videoUrl: 'https://www.youtube.com/embed/m2Tokhz1eCI',
    published: true,
    created_at: '2026-07-07',
  },
];

const defaultNews: NewsItem[] = [
  {
    id: 'w1',
    date: 'Jan 18, 2025',
    title: 'Hope Hub Partners with Auravexon Codex for Digital Literacy Program',
    excerpt: 'A new partnership will bring computer literacy training to 100+ Richmond students, with Auravexon Codex providing lab access and certified instructors.',
    full: 'This groundbreaking partnership between Hope Hub and Auravexon Codex will introduce a 6-month digital literacy program starting February 2025. The curriculum covers basic computer skills, internet safety, Microsoft Office, coding fundamentals, and digital communication. Auravexon Codex is providing state-of-the-art computer lab facilities, certified instructors, and course materials at no cost to students. The program targets 100+ students from Grades 9-13, with priority given to students from underserved families. Upon completion, students will receive industry-recognized certificates.',
    category: 'Partnership',
    icon: '🤝',
    readTime: '3 min read',
    published: true,
    created_at: '2025-01-18',
  },
  {
    id: 'w2',
    date: 'Jan 12, 2025',
    title: 'Record-Breaking Year: 1,000+ Donors in 2024',
    excerpt: 'Richmond Hope Hub crossed a major milestone in 2024, with over 1,000 individual donors contributing to student welfare programs.',
    full: 'The 2024 donor milestone represents a 40% increase from 2023, when we had 714 individual donors. Key growth drivers include: expanded social media outreach (particularly Facebook and WhatsApp groups), the launch of the monthly recurring donor program, increased alumni engagement through the Hope Hub app, and strong word-of-mouth from satisfied donors. Our donor base now spans 15 countries, with significant communities in Sri Lanka, Australia, UK, Canada, and the USA.',
    category: 'Milestone',
    icon: '🎯',
    readTime: '4 min read',
    published: true,
    created_at: '2025-01-12',
  },
  {
    id: 'w3',
    date: 'Jan 08, 2025',
    title: 'New Counseling Center Opens at Richmond College',
    excerpt: 'Funded by Hope Hub donors, a dedicated counseling room has been set up at Richmond College to provide mental health support.',
    full: 'The new counseling center, located in Block C of Richmond College, features two private consultation rooms, a group therapy space, and a resource library. Funded entirely by Hope Hub donors at a cost of LKR 850,000, the center is staffed by two qualified counselors who visit three days a week. Services include individual counseling, peer support groups, exam stress management workshops, and career guidance. The center aims to serve 50+ students per month.',
    category: 'Impact',
    icon: '💚',
    readTime: '3 min read',
    published: true,
    created_at: '2025-01-08',
  },
  {
    id: 'w4',
    date: 'Dec 30, 2024',
    title: 'Alumni Spotlight: Dr. Kasun Perera\'s Journey from Richmond to Harvard',
    excerpt: 'Richmond alumnus Dr. Kasun Perera, now a researcher at Harvard Medical School, credits the Hope Hub scholarship program.',
    full: 'Dr. Kasun Perera (Richmond College Class of 2010) is now a leading researcher in infectious diseases at Harvard Medical School. In a recent interview, he credited the Hope Hub scholarship he received in 2008 for covering his A/L tuition fees and university entrance exam preparation. "Without Hope Hub, I would have had to drop out and work to support my family," he said. Dr. Perera has pledged to establish an annual scholarship fund of LKR 500,000 to support current Richmond students pursuing medical careers.',
    category: 'Story',
    icon: '⭐',
    readTime: '5 min read',
    published: true,
    created_at: '2024-12-30',
  },
  {
    id: 'w5',
    date: 'Dec 22, 2024',
    title: '2024 Impact Report: 500 Students Supported',
    excerpt: 'Our annual report reveals that 500+ students received direct support through Hope Hub programs in 2024.',
    full: 'The comprehensive 2024 Impact Report shows: 500+ students received direct support across 7 categories (uniforms, books, nutrition, health, career, sports, emergency relief), LKR 5.2 million was raised and disbursed, 1,000+ donors contributed, 45 families received flood relief assistance, 12 community events were organized, and 95% of supported students reported improved academic performance. The full report includes individual program breakdowns, financial transparency data, and beneficiary testimonials.',
    category: 'Report',
    icon: '📈',
    readTime: '6 min read',
    published: true,
    created_at: '2024-12-22',
  },
];

const defaultDonations: DonationCategory[] = [
  { id: 'd1', title: 'Student Essentials', icon: '🎒', description: 'School bags, stationery, calculators, and other daily necessities for students who can\'t afford them', goal: 500000, raised: 325000, color: '#e02040', urgency: 'High', published: true, created_at: '2025-01-01' },
  { id: 'd2', title: 'Clothing', icon: '👕', description: 'School uniforms, sports kits, and casual clothing for students in need across all age groups', goal: 400000, raised: 180000, color: '#0090d0', urgency: 'High', published: true, created_at: '2025-01-01' },
  { id: 'd3', title: 'Clubs & Societies', icon: '🎭', description: 'Equipment and materials for debate, science, drama, and other enrichment clubs at Richmond College', goal: 200000, raised: 95000, color: '#8b5cf6', urgency: 'Medium', published: true, created_at: '2025-01-01' },
  { id: 'd4', title: 'Sports', icon: '🏏', description: 'Cricket gear, rugby equipment, athletics supplies, and sports uniforms for school teams', goal: 300000, raised: 175000, color: '#f59e0b', urgency: 'Medium', published: true, created_at: '2025-01-01' },
  { id: 'd5', title: 'Nutrition', icon: '🍎', description: 'Meal sponsorships, healthy snacks, and nutrition programs for undernourished students', goal: 450000, raised: 290000, color: '#00a050', urgency: 'Critical', published: true, created_at: '2025-01-01' },
  { id: 'd6', title: 'Educational & Career', icon: '📚', description: 'Textbooks, tuition support, exam fees, and career counseling resources for senior students', goal: 350000, raised: 210000, color: '#0090d0', urgency: 'High', published: true, created_at: '2025-01-01' },
  { id: 'd7', title: 'Counseling', icon: '💬', description: 'Mental health support, peer counseling programs, and wellbeing workshops for students', goal: 250000, raised: 120000, color: '#dc2626', urgency: 'Medium', published: true, created_at: '2025-01-01' },
];

// ─── Storage Helpers ──────────────────────────────────────

const STORAGE_KEY = 'hope-hub-content';

function loadLocalState(): ContentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const state: ContentState = JSON.parse(raw);
      if (state.donations) {
        state.donations = state.donations.map(d => {
          const { comingSoon, ...rest } = d as any;
          return rest;
        });
      }
      return state;
    }
  } catch { /* ignore */ }
  return { notices: defaultNotices, events: defaultEvents, news: defaultNews, donations: defaultDonations, careerResources: [] };
}

function saveLocalState(state: ContentState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

// ─── Supabase Sync ────────────────────────────────────────

/** Map Supabase row to local Notice (snake_case → camelCase for photos) */
function rowToNotice(r: any): Notice {
  return {
    id: r.id, date: r.date, title: r.title, excerpt: r.excerpt || '', full: r.full_content || r.full || '',
    tag: r.tag, icon: r.icon, photos: Array.isArray(r.photos) ? r.photos : (r.photos ? JSON.parse(r.photos) : []),
    published: r.published, created_at: r.created_at,
  };
}

function rowToEvent(r: any): EventItem {
  return {
    id: r.id, date: r.date, title: r.title, desc: r.event_desc || r.desc || '', full: r.full_content || r.full || '',
    tag: r.tag, icon: r.icon, stats: r.stats || '',
    photos: Array.isArray(r.photos) ? r.photos : (r.photos ? JSON.parse(r.photos) : []),
    thumbnailIndex: r.thumbnail_index ?? 0, heroIndex: r.hero_index ?? 0,
    videoUrl: r.video_url || undefined, published: r.published, created_at: r.created_at,
  };
}

function rowToNews(r: any): NewsItem {
  return {
    id: r.id, date: r.date, title: r.title, excerpt: r.excerpt || '', full: r.full_content || r.full || '',
    category: r.category, icon: r.icon, readTime: r.read_time || '3 min read',
    published: r.published, created_at: r.created_at,
  };
}

function rowToDonation(r: any): DonationCategory {
  return {
    id: r.id, title: r.title, icon: r.icon, description: r.description || '',
    goal: Number(r.goal) || 0, raised: Number(r.raised) || 0, color: r.color || '#e02040',
    urgency: r.urgency || 'Medium', published: r.published, created_at: r.created_at,
  };
}

function rowToCareerResource(r: any): CareerResource {
  return {
    id: r.id, title: r.title, description: r.description || '', category: r.category || 'general',
    icon: r.icon || '📋', color: r.color || '#3b82f6', image_url: r.image_url || '',
    link_url: r.link_url || '', location: r.location || '', deadline: r.deadline || '',
    contact_info: r.contact_info || '', published: r.published, featured: r.featured || false,
    expired: r.expired || false, created_at: r.created_at,
  };
}

let _supabaseReady = false;

/** Load all content from Supabase. Returns null on failure. */
async function loadFromSupabase(): Promise<ContentState | null> {
  try {
    const sb = getSupabase();
    const [nRes, eRes, nwRes, dRes, crRes] = await Promise.all([
      sb.from('notices').select('*').order('created_at', { ascending: false }),
      sb.from('events').select('*').order('created_at', { ascending: false }),
      sb.from('news').select('*').order('created_at', { ascending: false }),
      sb.from('donation_categories').select('*').order('created_at', { ascending: false }),
      sb.from('career_resources').select('*').order('created_at', { ascending: false }),
    ]);
    if (nRes.error || eRes.error || nwRes.error || dRes.error || crRes.error) {
      console.warn('[ContentStore] Supabase load error:', nRes.error || eRes.error || nwRes.error || dRes.error || crRes.error);
      return null;
    }
    _supabaseReady = true;
    return {
      notices: (nRes.data || []).map(rowToNotice),
      events: (eRes.data || []).map(rowToEvent),
      news: (nwRes.data || []).map(rowToNews),
      donations: (dRes.data || []).map(rowToDonation),
      careerResources: (crRes.data || []).map(rowToCareerResource),
    };
  } catch (err) {
    console.warn('[ContentStore] Supabase unavailable, using localStorage:', err);
    return null;
  }
}

/** Push current local state to Supabase (one-time sync) */
async function seedToSupabase(state: ContentState): Promise<void> {
  try {
    const sb = getSupabaseAdmin();
    // Upsert all items
    if (state.notices.length) {
      await sb.from('notices').upsert(state.notices.map(n => ({
        id: n.id, date: n.date, title: n.title, excerpt: n.excerpt, full_content: n.full,
        tag: n.tag, icon: n.icon, photos: n.photos || [], published: n.published, created_at: n.created_at,
      })));
    }
    if (state.events.length) {
      await sb.from('events').upsert(state.events.map(e => ({
        id: e.id, date: e.date, title: e.title, event_desc: e.desc, full_content: e.full,
        tag: e.tag, icon: e.icon, stats: e.stats, photos: e.photos || [],
        thumbnail_index: e.thumbnailIndex ?? 0, hero_index: e.heroIndex ?? 0,
        video_url: e.videoUrl || null, published: e.published, created_at: e.created_at,
      })));
    }
    if (state.news.length) {
      await sb.from('news').upsert(state.news.map(n => ({
        id: n.id, date: n.date, title: n.title, excerpt: n.excerpt, full_content: n.full,
        category: n.category, icon: n.icon, read_time: n.readTime, published: n.published, created_at: n.created_at,
      })));
    }
    if (state.donations.length) {
      await sb.from('donation_categories').upsert(state.donations.map(d => ({
        id: d.id, title: d.title, icon: d.icon, description: d.description,
        goal: d.goal, raised: d.raised, color: d.color, urgency: d.urgency,
        published: d.published, created_at: d.created_at,
      })));
    }
    if (state.careerResources && state.careerResources.length) {
      await sb.from('career_resources').upsert(state.careerResources.map(cr => ({
        id: cr.id, title: cr.title, description: cr.description, category: cr.category,
        icon: cr.icon, color: cr.color, image_url: cr.image_url, link_url: cr.link_url,
        location: cr.location, deadline: cr.deadline, contact_info: cr.contact_info,
        published: cr.published, featured: cr.featured, created_at: cr.created_at,
      })));
    }
    console.log('[ContentStore] Seeded local data to Supabase');
  } catch (err) {
    console.warn('[ContentStore] Seed to Supabase failed:', err);
  }
}

// ─── Signals ──────────────────────────────────────────────

const _state = createSignal<ContentState>(loadLocalState());

function persist() {
  saveLocalState(_state.peek());
}

// ─── Initialize (async) ──────────────────────────────────

export async function initContentStore(): Promise<void> {
  const supabaseState = await loadFromSupabase();
  if (supabaseState) {
    // Check if Supabase has data; if empty, seed from localStorage
    const hasData = supabaseState.notices.length > 0 || supabaseState.events.length > 0
      || supabaseState.news.length > 0 || supabaseState.donations.length > 0
      || supabaseState.careerResources.length > 0;
    if (hasData) {
      _state.set(supabaseState);
      saveLocalState(supabaseState);
      console.log('[ContentStore] Loaded from Supabase');
    } else {
      // Supabase tables are empty — seed from localStorage
      const local = _state.peek();
      await seedToSupabase(local);
      console.log('[ContentStore] Supabase was empty, seeded from localStorage');
    }
  }
  // else: Supabase unreachable, localStorage is already loaded

  // Cross-tab sync: listen for localStorage changes from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const newState: ContentState = JSON.parse(e.newValue);
        _state.set(newState);
        console.log('[ContentStore] Synced from another tab');
        // Notify the app to re-render
        window.dispatchEvent(new CustomEvent('content-updated'));
      } catch { /* ignore */ }
    }
  });
}

/**
 * Re-fetch latest data from Supabase and update the store.
 * Call this on route changes to keep all pages in sync.
 * Safe to call frequently — no-ops if Supabase is unavailable.
 */
export async function refreshContent(): Promise<void> {
  if (!_supabaseReady) return;
  try {
    const supabaseState = await loadFromSupabase();
    if (supabaseState) {
      _state.set(supabaseState);
      saveLocalState(supabaseState);
    }
  } catch { /* silent — fallback to existing state */ }
}

// ─── Public API ───────────────────────────────────────────

export function getContentState() { return _state; }
export function getNotices() { return _state.peek().notices.filter(n => n.published); }
export function getEvents() { return _state.peek().events.filter(e => e.published); }
export function getNews() { return _state.peek().news.filter(n => n.published); }
export function getDonations() { return _state.peek().donations.filter(d => d.published); }

export function getAllNotices() { return _state.peek().notices; }
export function getAllEvents() { return _state.peek().events; }
export function getAllNews() { return _state.peek().news; }
export function getAllDonations() { return _state.peek().donations; }
export function getCareerResources() { return (_state.peek().careerResources || []).filter(r => r.published); }
export function getAllCareerResources() { return _state.peek().careerResources || []; }
export function getFeaturedCareerResources() { return (_state.peek().careerResources || []).filter(r => r.published && r.featured); }

// ─── Supabase CRUD Helpers ────────────────────────────────

const _sb = () => getSupabase();
/** Admin client bypasses RLS — used for all write operations */
const _sbAdmin = () => getSupabaseAdmin();

async function sbInsert(table: string, row: Record<string, any>): Promise<boolean> {
  if (!_supabaseReady) return false;
  try {
    const { error } = await _sbAdmin().from(table).insert(row);
    if (error) { console.warn(`[SB] insert ${table}:`, error); return false; }
    return true;
  } catch { return false; }
}

async function sbUpdate(table: string, id: string, updates: Record<string, any>): Promise<boolean> {
  if (!_supabaseReady) return false;
  try {
    const { error } = await _sbAdmin().from(table).update(updates).eq('id', id);
    if (error) { console.warn(`[SB] update ${table}:`, error); return false; }
    return true;
  } catch { return false; }
}

async function sbDelete(table: string, id: string): Promise<boolean> {
  if (!_supabaseReady) return false;
  try {
    const { error } = await _sbAdmin().from(table).delete().eq('id', id);
    if (error) { console.warn(`[SB] delete ${table}:`, error); return false; }
    return true;
  } catch { return false; }
}

// ─── CRUD: Notices ────────────────────────────────────────

export async function addNotice(notice: Omit<Notice, 'id' | 'created_at'>) {
  const id = 'n' + Date.now();
  const created_at = new Date().toISOString().split('T')[0];
  const newNotice: Notice = { ...notice, id, created_at };
  // Update local immediately
  const state = _state.peek();
  _state.set({ ...state, notices: [newNotice, ...state.notices] });
  persist();
  // Sync to Supabase
  await sbInsert('notices', {
    id, date: notice.date, title: notice.title, excerpt: notice.excerpt, full_content: notice.full,
    tag: notice.tag, icon: notice.icon, photos: notice.photos || [], published: notice.published, created_at,
  });
}

export async function updateNotice(id: string, updates: Partial<Notice>) {
  const state = _state.peek();
  _state.set({ ...state, notices: state.notices.map(n => n.id === id ? { ...n, ...updates } : n) });
  persist();
  const sbUpdates: Record<string, any> = {};
  if (updates.title !== undefined) sbUpdates.title = updates.title;
  if (updates.excerpt !== undefined) sbUpdates.excerpt = updates.excerpt;
  if (updates.full !== undefined) sbUpdates.full_content = updates.full;
  if (updates.tag !== undefined) sbUpdates.tag = updates.tag;
  if (updates.icon !== undefined) sbUpdates.icon = updates.icon;
  if (updates.date !== undefined) sbUpdates.date = updates.date;
  if (updates.photos !== undefined) sbUpdates.photos = updates.photos;
  if (updates.published !== undefined) sbUpdates.published = updates.published;
  await sbUpdate('notices', id, sbUpdates);
}

export async function deleteNotice(id: string) {
  const state = _state.peek();
  _state.set({ ...state, notices: state.notices.filter(n => n.id !== id) });
  persist();
  await sbDelete('notices', id);
}

// ─── CRUD: Events ─────────────────────────────────────────

export async function addEvent(event: Omit<EventItem, 'id' | 'created_at'>) {
  const id = 'e' + Date.now();
  const created_at = new Date().toISOString().split('T')[0];
  const newEvent: EventItem = { ...event, id, created_at };
  const state = _state.peek();
  _state.set({ ...state, events: [newEvent, ...state.events] });
  persist();
  await sbInsert('events', {
    id, date: event.date, title: event.title, event_desc: event.desc, full_content: event.full,
    tag: event.tag, icon: event.icon, stats: event.stats, photos: event.photos || [],
    thumbnail_index: event.thumbnailIndex ?? 0, hero_index: event.heroIndex ?? 0,
    video_url: event.videoUrl || null, published: event.published, created_at,
  });
}

export async function updateEvent(id: string, updates: Partial<EventItem>) {
  const state = _state.peek();
  _state.set({ ...state, events: state.events.map(e => e.id === id ? { ...e, ...updates } : e) });
  persist();
  const sbUpdates: Record<string, any> = {};
  if (updates.title !== undefined) sbUpdates.title = updates.title;
  if (updates.desc !== undefined) sbUpdates.event_desc = updates.desc;
  if (updates.full !== undefined) sbUpdates.full_content = updates.full;
  if (updates.tag !== undefined) sbUpdates.tag = updates.tag;
  if (updates.icon !== undefined) sbUpdates.icon = updates.icon;
  if (updates.date !== undefined) sbUpdates.date = updates.date;
  if (updates.stats !== undefined) sbUpdates.stats = updates.stats;
  if (updates.photos !== undefined) sbUpdates.photos = updates.photos;
  if (updates.thumbnailIndex !== undefined) sbUpdates.thumbnail_index = updates.thumbnailIndex;
  if (updates.heroIndex !== undefined) sbUpdates.hero_index = updates.heroIndex;
  if (updates.videoUrl !== undefined) sbUpdates.video_url = updates.videoUrl;
  if (updates.published !== undefined) sbUpdates.published = updates.published;
  await sbUpdate('events', id, sbUpdates);
}

export async function deleteEvent(id: string) {
  const state = _state.peek();
  _state.set({ ...state, events: state.events.filter(e => e.id !== id) });
  persist();
  await sbDelete('events', id);
}

// ─── CRUD: News ───────────────────────────────────────────

export async function addNews(news: Omit<NewsItem, 'id' | 'created_at'>) {
  const id = 'w' + Date.now();
  const created_at = new Date().toISOString().split('T')[0];
  const newNews: NewsItem = { ...news, id, created_at };
  const state = _state.peek();
  _state.set({ ...state, news: [newNews, ...state.news] });
  persist();
  await sbInsert('news', {
    id, date: news.date, title: news.title, excerpt: news.excerpt, full_content: news.full,
    category: news.category, icon: news.icon, read_time: news.readTime, published: news.published, created_at,
  });
}

export async function updateNews(id: string, updates: Partial<NewsItem>) {
  const state = _state.peek();
  _state.set({ ...state, news: state.news.map(n => n.id === id ? { ...n, ...updates } : n) });
  persist();
  const sbUpdates: Record<string, any> = {};
  if (updates.title !== undefined) sbUpdates.title = updates.title;
  if (updates.excerpt !== undefined) sbUpdates.excerpt = updates.excerpt;
  if (updates.full !== undefined) sbUpdates.full_content = updates.full;
  if (updates.category !== undefined) sbUpdates.category = updates.category;
  if (updates.icon !== undefined) sbUpdates.icon = updates.icon;
  if (updates.date !== undefined) sbUpdates.date = updates.date;
  if (updates.readTime !== undefined) sbUpdates.read_time = updates.readTime;
  if (updates.published !== undefined) sbUpdates.published = updates.published;
  await sbUpdate('news', id, sbUpdates);
}

export async function deleteNews(id: string) {
  const state = _state.peek();
  _state.set({ ...state, news: state.news.filter(n => n.id !== id) });
  persist();
  await sbDelete('news', id);
}

// ─── CRUD: Donations ──────────────────────────────────────

export async function addDonation(donation: Omit<DonationCategory, 'id' | 'created_at'>) {
  const id = 'd' + Date.now();
  const created_at = new Date().toISOString().split('T')[0];
  const newDonation: DonationCategory = { ...donation, id, created_at };
  const state = _state.peek();
  _state.set({ ...state, donations: [newDonation, ...state.donations] });
  persist();
  await sbInsert('donation_categories', {
    id, title: donation.title, icon: donation.icon, description: donation.description,
    goal: donation.goal, raised: donation.raised, color: donation.color, urgency: donation.urgency,
    published: donation.published, created_at,
  });
}

export async function updateDonation(id: string, updates: Partial<DonationCategory>) {
  const state = _state.peek();
  _state.set({ ...state, donations: state.donations.map(d => d.id === id ? { ...d, ...updates } : d) });
  persist();
  const sbUpdates: Record<string, any> = {};
  if (updates.title !== undefined) sbUpdates.title = updates.title;
  if (updates.icon !== undefined) sbUpdates.icon = updates.icon;
  if (updates.description !== undefined) sbUpdates.description = updates.description;
  if (updates.goal !== undefined) sbUpdates.goal = updates.goal;
  if (updates.raised !== undefined) sbUpdates.raised = updates.raised;
  if (updates.color !== undefined) sbUpdates.color = updates.color;
  if (updates.urgency !== undefined) sbUpdates.urgency = updates.urgency;
  if (updates.published !== undefined) sbUpdates.published = updates.published;
  await sbUpdate('donation_categories', id, sbUpdates);
}

export async function deleteDonation(id: string) {
  const state = _state.peek();
  _state.set({ ...state, donations: state.donations.filter(d => d.id !== id) });
  persist();
  await sbDelete('donation_categories', id);
}

// ─── CRUD: Career Resources ──────────────────────────────

export async function addCareerResource(cr: Omit<CareerResource, 'id' | 'created_at'>) {
  const id = 'cr' + Date.now();
  const created_at = new Date().toISOString().split('T')[0];
  const newCR: CareerResource = { ...cr, id, created_at };
  const state = _state.peek();
  _state.set({ ...state, careerResources: [newCR, ...(state.careerResources || [])] });
  persist();
  await sbInsert('career_resources', {
    id, title: cr.title, description: cr.description, category: cr.category,
    icon: cr.icon, color: cr.color, image_url: cr.image_url, link_url: cr.link_url,
    location: cr.location, deadline: cr.deadline, contact_info: cr.contact_info,
    published: cr.published, featured: cr.featured, expired: cr.expired || false, created_at,
  });
}

export async function updateCareerResource(id: string, updates: Partial<CareerResource>) {
  const state = _state.peek();
  _state.set({ ...state, careerResources: (state.careerResources || []).map(cr => cr.id === id ? { ...cr, ...updates } : cr) });
  persist();
  const sbUpdates: Record<string, any> = {};
  if (updates.title !== undefined) sbUpdates.title = updates.title;
  if (updates.description !== undefined) sbUpdates.description = updates.description;
  if (updates.category !== undefined) sbUpdates.category = updates.category;
  if (updates.icon !== undefined) sbUpdates.icon = updates.icon;
  if (updates.color !== undefined) sbUpdates.color = updates.color;
  if (updates.image_url !== undefined) sbUpdates.image_url = updates.image_url;
  if (updates.link_url !== undefined) sbUpdates.link_url = updates.link_url;
  if (updates.location !== undefined) sbUpdates.location = updates.location;
  if (updates.deadline !== undefined) sbUpdates.deadline = updates.deadline;
  if (updates.contact_info !== undefined) sbUpdates.contact_info = updates.contact_info;
  if (updates.published !== undefined) sbUpdates.published = updates.published;
  if (updates.featured !== undefined) sbUpdates.featured = updates.featured;
  if (updates.expired !== undefined) sbUpdates.expired = updates.expired;
  await sbUpdate('career_resources', id, sbUpdates);
}

export async function deleteCareerResource(id: string) {
  const state = _state.peek();
  _state.set({ ...state, careerResources: (state.careerResources || []).filter(cr => cr.id !== id) });
  persist();
  await sbDelete('career_resources', id);
}

// ─── Donation Transaction CRUD ────────────────────────────

export function getAllTransactions(): DonationTransaction[] { return [..._txState]; }
export function getTransactionsByType(type: 'received' | 'distributed'): DonationTransaction[] {
  return _txState.filter(t => t.type === type);
}
export function getDonationCategories() { return _state.peek().donations; }

export function addTransaction(tx: Omit<DonationTransaction, 'id' | 'created_at'>) {
  const newTx: DonationTransaction = {
    ...tx,
    id: 'tx' + Date.now(),
    status: tx.status || 'confirmed',
    created_at: new Date().toISOString().split('T')[0],
  };
  _txState = [newTx, ..._txState];
  persistTx();
  bumpDonationVersion();
  // Sync to Supabase via edge function
  syncCall('upsert', { table: 'donation_transactions', data: txToRow(newTx) });
}

export function confirmTransaction(id: string) {
  const tx = _txState.find(t => t.id === id);
  if (!tx || tx.status === 'confirmed') return;
  tx.status = 'confirmed';
  persistTx();
  bumpDonationVersion();
  syncCall('update', { table: 'donation_transactions', id, updates: { status: 'confirmed' } });
  if (tx.requestId && tx.lineItems && tx.lineItems.length > 0) {
    contributeToRequestedItems(tx.requestId, tx.lineItems);
  }
}

export function rejectTransaction(id: string) {
  _txState = _txState.filter(t => t.id !== id);
  persistTx();
  bumpDonationVersion();
  syncCall('delete', { table: 'donation_transactions', id });
}

export function getPendingTransactions(): DonationTransaction[] {
  return _txState.filter(t => t.type === 'received' && t.status === 'pending');
}

/** Update per-item fulfillment on a donation request */
export function contributeToRequestedItems(requestId: string, lineItems: { category: string; name: string; qty: number }[]) {
  const req = _reqState.find(r => r.id === requestId);
  if (!req || !req.requestedItems) return;
  for (const li of lineItems) {
    const item = req.requestedItems.find(ri => ri.name.toLowerCase() === li.name.toLowerCase());
    if (item) {
      item.fulfilledQty = Math.min(item.fulfilledQty + li.qty, item.targetQty);
    }
  }
  req.fulfilledQuantity = req.requestedItems.reduce((sum, ri) => sum + ri.fulfilledQty, 0);
  if (req.fulfilledQuantity >= req.targetQuantity || req.raisedAmount >= req.targetAmount) {
    req.status = 'fulfilled';
  }
  persistReq();
  bumpDonationVersion();
  syncCall('upsert', { table: 'donation_requests', data: reqToRow(req) });
}

export function updateTransaction(id: string, updates: Partial<DonationTransaction>) {
  _txState = _txState.map(t => t.id === id ? { ...t, ...updates } : t);
  persistTx();
  bumpDonationVersion();
  const updated = _txState.find(t => t.id === id);
  if (updated) {
    syncCall('upsert', { table: 'donation_transactions', data: txToRow(updated) });
  }
}

export function deleteTransaction(id: string) {
  _txState = _txState.filter(t => t.id !== id);
  persistTx();
  bumpDonationVersion();
  syncCall('delete', { table: 'donation_transactions', id });
}

// ─── Donation Request CRUD ───────────────────────────────

export function getAllRequests(): DonationRequest[] { return [..._reqState]; }
export function getPublishedRequests(): DonationRequest[] { return _reqState.filter(r => r.published); }
export function getOpenRequests(): DonationRequest[] { return _reqState.filter(r => r.published && r.status === 'open'); }
export function getRequestsByCategory(catId: string): DonationRequest[] {
  return _reqState.filter(r => r.categoryId === catId && r.published && r.status === 'open');
}
export function getRequestById(id: string): DonationRequest | undefined {
  return _reqState.find(r => r.id === id);
}

export function addRequest(req: Omit<DonationRequest, 'id' | 'created_at'>) {
  const newReq: DonationRequest = {
    ...req,
    id: 'dr' + Date.now(),
    created_at: new Date().toISOString().split('T')[0],
  };
  _reqState = [newReq, ..._reqState];
  persistReq();
  bumpDonationVersion();
  syncCall('upsert', { table: 'donation_requests', data: reqToRow(newReq) });
}

export function updateRequest(id: string, updates: Partial<DonationRequest>) {
  _reqState = _reqState.map(r => r.id === id ? { ...r, ...updates } : r);
  persistReq();
  bumpDonationVersion();
  const updated = _reqState.find(r => r.id === id);
  if (updated) {
    syncCall('upsert', { table: 'donation_requests', data: reqToRow(updated) });
  }
}

export function deleteRequest(id: string) {
  _reqState = _reqState.filter(r => r.id !== id);
  persistReq();
  bumpDonationVersion();
  syncCall('delete', { table: 'donation_requests', id });
}

export function resetReqStore() {
  _reqState = [...defaultRequests];
  persistReq();
}

/** Update fulfilled amounts when a donation is received for a request */
export function contributeToRequest(requestId: string, amount: number, quantity: number) {
  const req = _reqState.find(r => r.id === requestId);
  if (!req) return;
  req.raisedAmount += amount;
  // Only add to quantity if no requestedItems (fallback for cash-only)
  if (!req.requestedItems || req.requestedItems.length === 0) {
    req.fulfilledQuantity += quantity;
  }
  if (req.fulfilledQuantity >= req.targetQuantity || req.raisedAmount >= req.targetAmount) {
    req.status = 'fulfilled';
  }
  persistReq();
}

// ─── Donation Interest CRUD (Supabase-only) ──────────────

export interface DonationInterest {
  id: string;
  user_id?: string;
  request_id: string;
  request_title: string;
  category_id: string;
  donor_name: string;
  donor_email?: string;
  donor_phone?: string;
  message?: string;
  interest_type: 'general' | 'items' | 'cash' | 'both';
  estimated_amount?: number;
  estimated_items?: string;
  status: 'new' | 'contacted' | 'in_progress' | 'converted' | 'closed';
  admin_response?: string;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}

/** Submit a donation interest (donor → admin) */
export async function submitDonorInterest(interest: {
  request_id: string;
  request_title: string;
  category_id: string;
  donor_name: string;
  donor_email?: string;
  donor_phone?: string;
  message?: string;
  interest_type?: 'general' | 'items' | 'cash' | 'both';
  estimated_amount?: number;
  estimated_items?: string;
}): Promise<boolean> {
  try {
    const sb = getSupabase();
    const user = (await sb.auth.getUser()).data.user;
    const { error } = await sb.from('donation_interests').insert({
      user_id: user?.id || null,
      request_id: interest.request_id,
      request_title: interest.request_title,
      category_id: interest.category_id,
      donor_name: interest.donor_name,
      donor_email: interest.donor_email || null,
      donor_phone: interest.donor_phone || null,
      message: interest.message || null,
      interest_type: interest.interest_type || 'general',
      estimated_amount: interest.estimated_amount || 0,
      estimated_items: interest.estimated_items || null,
      status: 'new',
    });
    if (error) {
      console.warn('[ContentStore] Submit interest error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[ContentStore] Submit interest failed:', err);
    return false;
  }
}

/** Get all donation interests (admin) or user's own interests (donor) */
export async function getDonorInterests(userId?: string): Promise<DonationInterest[]> {
  try {
    const sb = getSupabase();
    let query = sb.from('donation_interests').select('*').order('created_at', { ascending: false });
    // Only filter by user_id if it's a valid UUID (dev accounts may have non-UUID IDs)
    const isUUID = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (isUUID) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error || !data) {
      console.warn('[ContentStore] Get interests error:', error);
      return [];
    }
    return data as DonationInterest[];
  } catch (err) {
    console.warn('[ContentStore] Get interests failed:', err);
    return [];
  }
}

/** Update interest status (admin only) */
export async function updateInterestStatus(
  id: string,
  status: DonationInterest['status'],
  adminResponse?: string,
  adminNotes?: string
): Promise<boolean> {
  try {
    const sb = getSupabaseAdmin();
    const updates: Record<string, any> = { status };
    if (adminResponse !== undefined) updates.admin_response = adminResponse;
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;
    const { error } = await sb.from('donation_interests').update(updates).eq('id', id);
    if (error) {
      console.warn('[ContentStore] Update interest error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[ContentStore] Update interest failed:', err);
    return false;
  }
}

/** Delete an interest */
export async function deleteInterest(id: string): Promise<boolean> {
  try {
    const sb = getSupabaseAdmin();
    const { error } = await sb.from('donation_interests').delete().eq('id', id);
    if (error) {
      console.warn('[ContentStore] Delete interest error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[ContentStore] Delete interest failed:', err);
    return false;
  }
}

// ─── Best C2 Students (Monthly Spotlight) ────────────────

const C2_STUDENTS_KEY = 'hope-hub-c2-students';
const C2_STUDENTS_VERSION_KEY = 'hope-hub-c2-students-version';
const C2_STUDENTS_VERSION = '1.0';

const defaultC2Students: BestC2Student[] = [
  {
    id: 'c2s-2026-07', studentName: 'Kavindu Perera', grade: 'Grade 11',
    achievement: 'Inter-School Debate Champion',
    description: 'Led the Richmond debate team to victory at the Southern Province Inter-School Debate Championship. Demonstrated exceptional critical thinking, public speaking, and leadership throughout the tournament.',
    photoUrl: '', spotlightMonth: 7, spotlightYear: 2026,
    published: true, created_at: '2026-07-01',
  },
  {
    id: 'c2s-2026-06', studentName: 'Tharindu Silva', grade: 'Grade 12',
    achievement: 'Science Olympiad Gold Medalist',
    description: 'Won a gold medal at the National Science Olympiad representing Richmond College. Excelled in physics and mathematics, bringing recognition to the school at the national level.',
    photoUrl: '', spotlightMonth: 6, spotlightYear: 2026,
    published: true, created_at: '2026-06-01',
  },
  {
    id: 'c2s-2026-05', studentName: 'Nethmi Fernando', grade: 'Grade 10',
    achievement: 'Community Service Leader',
    description: 'Organized and led a series of community clean-up drives and literacy programs in Galle. Volunteered over 120 hours and inspired fellow students to participate in civic engagement.',
    photoUrl: '', spotlightMonth: 5, spotlightYear: 2026,
    published: true, created_at: '2026-05-01',
  },
];

let _c2StudentsState: BestC2Student[] = (() => {
  try {
    const raw = localStorage.getItem(C2_STUDENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [...defaultC2Students];
})();

function persistC2Students() { localStorage.setItem(C2_STUDENTS_KEY, JSON.stringify(_c2StudentsState)); }

function initC2StudentsStore() {
  const storedVersion = localStorage.getItem(C2_STUDENTS_VERSION_KEY);
  if (!localStorage.getItem(C2_STUDENTS_KEY) || storedVersion !== C2_STUDENTS_VERSION) {
    _c2StudentsState = [...defaultC2Students];
    persistC2Students();
    localStorage.setItem(C2_STUDENTS_VERSION_KEY, C2_STUDENTS_VERSION);
  }
}
initC2StudentsStore();

/** Row mappers for Supabase ↔ local */
function rowToC2Student(r: any): BestC2Student {
  return {
    id: r.id, studentName: r.student_name, grade: r.grade || '',
    achievement: r.achievement || '', description: r.description || '',
    photoUrl: r.photo_url || '', spotlightMonth: r.spotlight_month,
    spotlightYear: r.spotlight_year, published: r.published ?? true,
    created_at: r.created_at || new Date().toISOString(),
  };
}

function c2StudentToRow(s: BestC2Student) {
  return {
    id: s.id, student_name: s.studentName, grade: s.grade,
    achievement: s.achievement, description: s.description,
    photo_url: s.photoUrl || null, spotlight_month: s.spotlightMonth,
    spotlight_year: s.spotlightYear, published: s.published,
    created_at: s.created_at,
  };
}

/** Data version signal for C2 students */
export const c2StudentsVersion = createSignal<number>(0);
function bumpC2StudentsVersion() { c2StudentsVersion.set(c2StudentsVersion.peek() + 1); }

/** Sync C2 students from Supabase */
async function loadC2StudentsFromSupabase() {
  try {
    const result = await syncCall('get_all', { table: 'best_c2_students' });
    if (Array.isArray(result) && result.length > 0) {
      _c2StudentsState = result.map(rowToC2Student);
      persistC2Students();
      bumpC2StudentsVersion();
    } else if (_c2StudentsState.length > 0) {
      // Seed local data to Supabase
      await syncCall('upsert', { table: 'best_c2_students', data: _c2StudentsState.map(c2StudentToRow) });
    }
  } catch (err) {
    console.warn('[ContentStore] C2 students sync failed, using localStorage:', err);
  }
}
loadC2StudentsFromSupabase();

/** Get all published C2 students sorted by most recent spotlight */
export function getBestC2Students(): BestC2Student[] {
  return [..._c2StudentsState]
    .filter(s => s.published)
    .sort((a, b) => {
      if (a.spotlightYear !== b.spotlightYear) return b.spotlightYear - a.spotlightYear;
      return b.spotlightMonth - a.spotlightMonth;
    });
}

/** Get the current month's spotlight student */
export function getCurrentSpotlightStudent(): BestC2Student | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const match = _c2StudentsState.find(
    s => s.published && s.spotlightMonth === month && s.spotlightYear === year
  );
  if (match) return match;
  // Fallback: most recent published
  return getBestC2Students()[0] || null;
}

/** Get all C2 students (admin) */
export function getAllC2Students(): BestC2Student[] {
  return [..._c2StudentsState];
}

/** Add a C2 student spotlight */
export function addC2Student(student: Omit<BestC2Student, 'id' | 'created_at'>) {
  const newStudent: BestC2Student = {
    ...student,
    id: 'c2s-' + Date.now(),
    created_at: new Date().toISOString(),
  };
  _c2StudentsState = [newStudent, ..._c2StudentsState];
  persistC2Students();
  bumpC2StudentsVersion();
  syncCall('upsert', { table: 'best_c2_students', data: c2StudentToRow(newStudent) });
}

/** Update a C2 student */
export function updateC2Student(id: string, updates: Partial<BestC2Student>) {
  _c2StudentsState = _c2StudentsState.map(s => s.id === id ? { ...s, ...updates } : s);
  persistC2Students();
  bumpC2StudentsVersion();
  const updated = _c2StudentsState.find(s => s.id === id);
  if (updated) syncCall('upsert', { table: 'best_c2_students', data: c2StudentToRow(updated) });
}

/** Delete a C2 student */
export function deleteC2Student(id: string) {
  _c2StudentsState = _c2StudentsState.filter(s => s.id !== id);
  persistC2Students();
  bumpC2StudentsVersion();
  syncCall('delete', { table: 'best_c2_students', id });
}
