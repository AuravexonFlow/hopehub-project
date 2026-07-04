/**
 * ═══════════════════════════════════════════════════════════
 *  Content Store — Manages site content (Notices, Events, News)
 *  localStorage-backed, ready for Supabase migration
 * ═══════════════════════════════════════════════════════════
 */

import { createSignal } from '../vortex/signals';

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
  lineItems?: { category: string; name: string; qty: number }[];
  created_at: string;
}

interface ContentState {
  notices: Notice[];
  events: EventItem[];
  news: NewsItem[];
  donations: DonationCategory[];
}

// ─── Donation Transactions (separate store) ───────────────

const TX_KEY = 'hope-hub-donation-tx';

const defaultTransactions: DonationTransaction[] = [
  {
    id: 'tx1', type: 'received', contactName: 'Mr. Anura Perera', contactInfo: 'anura@example.com',
    categoryId: 'd1', items: '50 backpacks, 200 notebooks, 100 pencil sets',
    date: 'Jan 15, 2026', amount: 75000, notes: 'Bulk donation for Grade 6-9 students',
    created_at: '2026-01-15',
  },
  {
    id: 'tx2', type: 'received', contactName: 'RC Alumni UK Chapter', contactInfo: '+44 7700 900123',
    categoryId: 'd5', items: '400 kg rice, 100 kg dhal, 80 kg vegetables',
    quantity: '580', date: 'Jan 05, 2026', amount: 45000, notes: 'Monthly nutrition support - January batch',
    created_at: '2026-01-05',
  },
  {
    id: 'tx3', type: 'received', contactName: 'Mrs. Kumari Silva',
    categoryId: 'd2', items: '30 school uniforms (boys), 25 school uniforms (girls)',
    date: 'Feb 10, 2026', amount: 0, notes: 'In-kind donation from local tailor shop',
    created_at: '2026-02-10',
  },
  {
    id: 'tx4', type: 'distributed', contactName: 'Grade 6 - Mr. Bandara class',
    categoryId: 'd1', items: '25 backpacks, 100 notebooks',
    date: 'Jan 20, 2026', notes: 'Distributed on assembly - 25 students benefited',
    created_at: '2026-01-20',
  },
  {
    id: 'tx5', type: 'distributed', contactName: 'School Kitchen - Mrs. Fernando',
    categoryId: 'd5', items: '200 kg rice, 50 kg dhal, 30 kg vegetables',
    date: 'Jan 06, 2026', notes: 'Lunch program - 80 students fed daily',
    created_at: '2026-01-06',
  },
  {
    id: 'tx6', type: 'distributed', contactName: 'Cricket team - 15 players',
    categoryId: 'd4', items: '15 cricket bats, 30 balls, 15 pads, 15 gloves',
    date: 'Feb 01, 2026', notes: 'Annual sports equipment distribution',
    created_at: '2026-02-01',
  },
  {
    id: 'tx7', type: 'received', contactName: 'Old Boys Association - Galle',
    categoryId: 'd4', items: '20 cricket bats, 50 balls, 20 pads, 20 gloves',
    date: 'Jan 28, 2026', amount: 120000, notes: 'Annual OBA sports sponsorship',
    created_at: '2026-01-28',
  },
  {
    id: 'tx8', type: 'received', contactName: 'Dr. Nimal Rajapaksa',
    categoryId: 'd6', items: '200 GCE O/L past paper books, 50 A/L guides',
    date: 'Mar 05, 2026', amount: 0, notes: 'Educational book donation from retired teacher',
    created_at: '2026-03-05',
  },
  {
    id: 'tx9', type: 'distributed', contactName: 'A/L Science students - 20 students',
    categoryId: 'd6', items: '50 GCE O/L past paper books, 20 A/L guides',
    date: 'Mar 10, 2026', notes: 'Library donation for exam preparation',
    created_at: '2026-03-10',
  },
  {
    id: 'tx10', type: 'distributed', contactName: 'Grade 7-9 students - 30 students',
    categoryId: 'd2', items: '15 school uniforms (boys), 15 school uniforms (girls)',
    date: 'Feb 15, 2026', notes: 'Uniforms distributed during school assembly',
    created_at: '2026-02-15',
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

let _txState: DonationTransaction[] = (() => {
  try {
    const raw = localStorage.getItem(TX_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [...defaultTransactions];
})();

function persistTx() { localStorage.setItem(TX_KEY, JSON.stringify(_txState)); }

function initTxStore() {
  if (!localStorage.getItem(TX_KEY)) {
    _txState = [...defaultTransactions];
    persistTx();
  }
}
initTxStore();

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

function loadState(): ContentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const state: ContentState = JSON.parse(raw);
      // Migration: strip comingSoon from donation categories (fully launched)
      if (state.donations) {
        state.donations = state.donations.map(d => {
          const { comingSoon, ...rest } = d as any;
          return rest;
        });
      }
      return state;
    }
  } catch { /* ignore */ }
  return {
    notices: defaultNotices,
    events: defaultEvents,
    news: defaultNews,
    donations: defaultDonations,
  };
}

function saveState(state: ContentState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

// ─── Signals ──────────────────────────────────────────────

const _state = createSignal<ContentState>(loadState());

// Auto-persist on change
function persist() {
  saveState(_state.peek());
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

// ─── CRUD: Notices ────────────────────────────────────────

export function addNotice(notice: Omit<Notice, 'id' | 'created_at'>) {
  const state = _state.peek();
  const newNotice: Notice = {
    ...notice,
    id: 'n' + Date.now(),
    created_at: new Date().toISOString().split('T')[0],
  };
  _state.set({ ...state, notices: [newNotice, ...state.notices] });
  persist();
}

export function updateNotice(id: string, updates: Partial<Notice>) {
  const state = _state.peek();
  _state.set({
    ...state,
    notices: state.notices.map(n => n.id === id ? { ...n, ...updates } : n),
  });
  persist();
}

export function deleteNotice(id: string) {
  const state = _state.peek();
  _state.set({ ...state, notices: state.notices.filter(n => n.id !== id) });
  persist();
}

// ─── CRUD: Events ─────────────────────────────────────────

export function addEvent(event: Omit<EventItem, 'id' | 'created_at'>) {
  const state = _state.peek();
  const newEvent: EventItem = {
    ...event,
    id: 'e' + Date.now(),
    created_at: new Date().toISOString().split('T')[0],
  };
  _state.set({ ...state, events: [newEvent, ...state.events] });
  persist();
}

export function updateEvent(id: string, updates: Partial<EventItem>) {
  const state = _state.peek();
  _state.set({
    ...state,
    events: state.events.map(e => e.id === id ? { ...e, ...updates } : e),
  });
  persist();
}

export function deleteEvent(id: string) {
  const state = _state.peek();
  _state.set({ ...state, events: state.events.filter(e => e.id !== id) });
  persist();
}

// ─── CRUD: News ───────────────────────────────────────────

export function addNews(news: Omit<NewsItem, 'id' | 'created_at'>) {
  const state = _state.peek();
  const newNews: NewsItem = {
    ...news,
    id: 'w' + Date.now(),
    created_at: new Date().toISOString().split('T')[0],
  };
  _state.set({ ...state, news: [newNews, ...state.news] });
  persist();
}

export function updateNews(id: string, updates: Partial<NewsItem>) {
  const state = _state.peek();
  _state.set({
    ...state,
    news: state.news.map(n => n.id === id ? { ...n, ...updates } : n),
  });
  persist();
}

export function deleteNews(id: string) {
  const state = _state.peek();
  _state.set({ ...state, news: state.news.filter(n => n.id !== id) });
  persist();
}

// ─── CRUD: Donations ──────────────────────────────────────

export function addDonation(donation: Omit<DonationCategory, 'id' | 'created_at'>) {
  const state = _state.peek();
  const newDonation: DonationCategory = {
    ...donation,
    id: 'd' + Date.now(),
    created_at: new Date().toISOString().split('T')[0],
  };
  _state.set({ ...state, donations: [newDonation, ...state.donations] });
  persist();
}

export function updateDonation(id: string, updates: Partial<DonationCategory>) {
  const state = _state.peek();
  _state.set({
    ...state,
    donations: state.donations.map(d => d.id === id ? { ...d, ...updates } : d),
  });
  persist();
}

export function deleteDonation(id: string) {
  const state = _state.peek();
  _state.set({ ...state, donations: state.donations.filter(d => d.id !== id) });
  persist();
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
}

export function confirmTransaction(id: string) {
  const tx = _txState.find(t => t.id === id);
  if (!tx || tx.status === 'confirmed') return;
  tx.status = 'confirmed';
  persistTx();
  // Update request fulfillment if linked
  if (tx.requestId && tx.lineItems && tx.lineItems.length > 0) {
    contributeToRequestedItems(tx.requestId, tx.lineItems);
  }
}

export function rejectTransaction(id: string) {
  _txState = _txState.filter(t => t.id !== id);
  persistTx();
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
  // Recalculate totals
  req.fulfilledQuantity = req.requestedItems.reduce((sum, ri) => sum + ri.fulfilledQty, 0);
  if (req.fulfilledQuantity >= req.targetQuantity || req.raisedAmount >= req.targetAmount) {
    req.status = 'fulfilled';
  }
  persistReq();
}

export function updateTransaction(id: string, updates: Partial<DonationTransaction>) {
  _txState = _txState.map(t => t.id === id ? { ...t, ...updates } : t);
  persistTx();
}

export function deleteTransaction(id: string) {
  _txState = _txState.filter(t => t.id !== id);
  persistTx();
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
}

export function updateRequest(id: string, updates: Partial<DonationRequest>) {
  _reqState = _reqState.map(r => r.id === id ? { ...r, ...updates } : r);
  persistReq();
}

export function deleteRequest(id: string) {
  _reqState = _reqState.filter(r => r.id !== id);
  persistReq();
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
