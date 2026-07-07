/**
 * ═══════════════════════════════════════════════════════════
 *  Profiles Service — User roles & profile management
 *  Roles: admin | teacher | donor
 *  Hybrid: Supabase (when connected) + localStorage fallback
 * ═══════════════════════════════════════════════════════════
 */

import { createSignal, type Signal } from '../vortex/signals';
import { getSupabase, getSupabaseAdmin } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────

export type UserRole = 'admin' | 'teacher' | 'donor';
export type UserStatus = 'active' | 'pending' | 'rejected';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  phone?: string;
  created_at: string;
}

// ─── Signals ──────────────────────────────────────────────

export const currentProfile: Signal<UserProfile | null> = createSignal<UserProfile | null>(null);

// ─── Role Display Config ──────────────────────────────────

export const roleConfig: Record<UserRole, {
  label: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  features: string[];
}> = {
  admin: {
    label: 'Administrator',
    icon: '👑',
    color: '#e02040',
    gradient: 'linear-gradient(135deg, #e02040, #ff6b6b)',
    description: 'Full platform access — manage all content, users, and settings',
    features: ['Manage all content', 'View all users', 'System settings', 'Analytics dashboard'],
  },
  teacher: {
    label: 'Teacher',
    icon: '🎓',
    color: '#0090d0',
    gradient: 'linear-gradient(135deg, #0090d0, #00d4ff)',
    description: 'Manage notices, events, and student resources',
    features: ['Post notices', 'Create events', 'View student info', 'Manage resources'],
  },
  donor: {
    label: 'Donor',
    icon: '💝',
    color: '#00a050',
    gradient: 'linear-gradient(135deg, #00a050, #4ade80)',
    description: 'Support students through donations and track your impact',
    features: ['Browse donations', 'Track contributions', 'View impact reports', 'Community updates'],
  },
};

// ─── Storage Key ──────────────────────────────────────────

const PROFILES_KEY = 'hope-hub-profiles';

// ─── Load / Save Profiles (localStorage) ──────────────────

function loadProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveProfiles(profiles: UserProfile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

// ─── Find Profile by Email ────────────────────────────────

function findByEmail(email: string): UserProfile | undefined {
  return loadProfiles().find(p => p.email.toLowerCase() === email.toLowerCase());
}

function findById(id: string): UserProfile | undefined {
  return loadProfiles().find(p => p.id === id);
}

// ─── Create Profile ──────────────────────────────────────

export function createProfile(
  userId: string,
  email: string,
  fullName: string,
  role: UserRole,
): UserProfile {
  // Donors are auto-approved; teachers & admins need approval
  const status: UserStatus = role === 'donor' ? 'active' : 'pending';

  const profile: UserProfile = {
    id: userId,
    email,
    full_name: fullName,
    role,
    status,
    created_at: new Date().toISOString(),
  };

  // Save to localStorage
  const profiles = loadProfiles();
  const existing = profiles.findIndex(p => p.id === userId);
  if (existing >= 0) {
    profiles[existing] = profile;
  } else {
    profiles.push(profile);
  }
  saveProfiles(profiles);

  // Also try Supabase (fire-and-forget)
  tryUpsertSupabase(profile);

  currentProfile.set(profile);
  return profile;
}

// ─── Get or Create Profile ───────────────────────────────

export function getOrCreateProfile(
  userId: string,
  email: string,
  fullName?: string,
  role?: UserRole,
): UserProfile {
  let profile = findById(userId);
  if (!profile) {
    profile = findByEmail(email);
    if (profile && profile.id !== userId) {
      // Re-key: admin created with local ID, now a real auth user (e.g. Google OAuth) — update the ID
      const oldId = profile.id;
      const profiles = loadProfiles();
      const idx = profiles.findIndex(p => p.id === oldId);
      if (idx >= 0) {
        profiles[idx] = { ...profiles[idx], id: userId };
        saveProfiles(profiles);
        profile = profiles[idx];
      }
      // Re-key password override if it exists (stored by email, so no change needed)
    }
  }
  if (!profile) {
    // New user — create with default donor role
    profile = createProfile(userId, email, fullName || 'User', role || 'donor');
  } else {
    currentProfile.set(profile);
  }
  return profile;
}

// ─── Update Profile ──────────────────────────────────────

export function updateProfile(userId: string, updates: Partial<UserProfile>): void {
  const profiles = loadProfiles();
  const idx = profiles.findIndex(p => p.id === userId);
  if (idx >= 0) {
    profiles[idx] = { ...profiles[idx], ...updates };
    saveProfiles(profiles);
    if (currentProfile.peek()?.id === userId) {
      currentProfile.set(profiles[idx]);
    }
  }
}

// ─── Get All Profiles (Admin) ────────────────────────────

export function getAllProfiles(): UserProfile[] {
  return loadProfiles();
}

// ─── Load Profile on Auth ────────────────────────────────

export async function loadProfileForUser(
  userId: string,
  email: string,
  fullName?: string,
): Promise<UserProfile | null> {
  // Skip Supabase for dev sessions (token starts with 'dev-token-')
  const sessionRaw = localStorage.getItem('hope-hub-dev-session');
  const isDevSession = sessionRaw && sessionRaw.includes('dev-token');

  if (!isDevSession) {
    // Try Supabase first
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .limit(1);

      if (!error && data && data.length > 0) {
        const profile = data[0] as UserProfile;
        // Sync to localStorage
        const profiles = loadProfiles();
        const idx = profiles.findIndex(p => p.id === userId);
        if (idx >= 0) profiles[idx] = profile;
        else profiles.push(profile);
        saveProfiles(profiles);
        currentProfile.set(profile);
        return profile;
      }
    } catch { /* Supabase not available */ }
  }

  // Fallback to localStorage
  let profile = findById(userId) || findByEmail(email);
  if (profile) {
    // If found by email but ID doesn't match the Supabase UUID, re-key it
    if (profile.id !== userId) {
      const profiles = loadProfiles();
      // Remove old entry
      const filtered = profiles.filter(p => p.id !== profile!.id);
      // Re-key with Supabase UUID
      const updated = { ...profile, id: userId };
      filtered.push(updated);
      saveProfiles(filtered);
      profile = updated;
    }
    currentProfile.set(profile);
    // Sync to Supabase if it was missing there (non-dev session)
    if (!isDevSession) { tryUpsertSupabase(profile); }
    return profile;
  }

  // New OAuth user — create as donor (auto-approved)
  const newProfile = createProfile(userId, email, fullName || 'User', 'donor');
  // Ensure profile is created in Supabase too
  if (!isDevSession) { tryUpsertSupabase(newProfile); }
  return newProfile;
}

// ─── Supabase Helpers ────────────────────────────────────

async function tryUpsertSupabase(profile: UserProfile): Promise<void> {
  // Skip Supabase upsert for dev sessions
  const sessionRaw = localStorage.getItem('hope-hub-dev-session');
  if (sessionRaw && sessionRaw.includes('dev-token')) return;

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('profiles').upsert({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      status: profile.status,
      created_at: profile.created_at,
    });
  } catch { /* Supabase not available */ }
}

// ─── Check Role ──────────────────────────────────────────

export function hasRole(role: UserRole): boolean {
  return currentProfile.peek()?.role === role;
}

export function hasAnyRole(...roles: UserRole[]): boolean {
  const userRole = currentProfile.peek()?.role;
  return userRole ? roles.includes(userRole) : false;
}

export function isAdmin(): boolean {
  return hasRole('admin');
}

export function isTeacher(): boolean {
  return hasRole('teacher');
}

export function isDonor(): boolean {
  return hasRole('donor');
}

// ─── Seed Default Admin ──────────────────────────────────

export function ensureDefaultAdmin(): void {
  const profiles = loadProfiles();
  if (!profiles.some(p => p.role === 'admin')) {
    // Create a default admin account — always active
    createProfile(
      'admin-default-001',
      'admin@hopehub.lk',
      'Hope Hub Admin',
      'admin',
    );
    // Force status to active for default admin
    updateProfile('admin-default-001', { status: 'active' });
  }
}

// ─── Status Helpers ──────────────────────────────────────

export function isProfileActive(profile: UserProfile | null): boolean {
  return profile?.status === 'active';
}

export function isProfilePending(profile: UserProfile | null): boolean {
  return profile?.status === 'pending';
}

export function isProfileRejected(profile: UserProfile | null): boolean {
  return profile?.status === 'rejected';
}

// ─── Approval Functions ──────────────────────────────────

export function approveUser(userId: string): void {
  updateProfile(userId, { status: 'active' });
}

export function rejectUser(userId: string): void {
  updateProfile(userId, { status: 'rejected' });
}

export function updateUserRole(userId: string, newRole: UserRole): void {
  updateProfile(userId, { role: newRole });
}

// ─── Set User Status (any status) ────────────────────────

export function setUserStatus(userId: string, status: UserStatus): void {
  updateProfile(userId, { status });
}

// ─── Delete User ─────────────────────────────────────────

export function deleteUser(userId: string): boolean {
  const profiles = loadProfiles();
  const idx = profiles.findIndex(p => p.id === userId);
  if (idx < 0) return false;
  profiles.splice(idx, 1);
  saveProfiles(profiles);
  // Also remove any stored password override
  try {
    const pwRaw = localStorage.getItem('hope-hub-password-overrides');
    if (pwRaw) {
      const overrides = JSON.parse(pwRaw);
      const profile = findById(userId);
      if (profile) delete overrides[profile.email.toLowerCase()];
      localStorage.setItem('hope-hub-password-overrides', JSON.stringify(overrides));
    }
  } catch { /* ignore */ }
  return true;
}

// ─── Change User Password (admin) ────────────────────────

const PASSWORD_OVERRIDES_KEY = 'hope-hub-password-overrides';

export function changeUserPassword(userId: string, newPassword: string): boolean {
  const profile = findById(userId);
  if (!profile) return false;
  try {
    const raw = localStorage.getItem(PASSWORD_OVERRIDES_KEY);
    const overrides: Record<string, string> = raw ? JSON.parse(raw) : {};
    overrides[profile.email.toLowerCase()] = newPassword;
    localStorage.setItem(PASSWORD_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch { return false; }
  return true;
}

// ─── Check Password Override (used by auth) ──────────────

export function getPasswordOverride(email: string): string | null {
  try {
    const raw = localStorage.getItem(PASSWORD_OVERRIDES_KEY);
    if (!raw) return null;
    const overrides: Record<string, string> = JSON.parse(raw);
    return overrides[email.toLowerCase()] || null;
  } catch { return null; }
}

export function getPendingProfiles(): UserProfile[] {
  return loadProfiles().filter(p => p.status === 'pending');
}

export function getAllProfilesWithStatus(): UserProfile[] {
  return loadProfiles();
}

/** Load all profiles from Supabase and merge into localStorage cache */
export async function loadAllProfilesFromSupabase(): Promise<UserProfile[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && data && data.length > 0) {
      const remote = data as UserProfile[];
      // Merge: keep local-only profiles, update with remote data
      const local = loadProfiles();
      const merged = new Map<string, UserProfile>();
      for (const p of local) merged.set(p.id, p);
      for (const p of remote) merged.set(p.id, { ...merged.get(p.id), ...p });
      const result = Array.from(merged.values());
      saveProfiles(result);
      return result;
    }
  } catch { /* Supabase not available */ }
  return loadProfiles();
}

// Initialize default admin on load
ensureDefaultAdmin();
