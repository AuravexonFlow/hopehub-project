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

  // Save to localStorage — preserve _localModifiedAt if profile already exists
  const profiles = loadProfiles();
  const existingIdx = profiles.findIndex(p => p.id === userId);
  const existingLocalModified = existingIdx >= 0 ? (profiles[existingIdx] as any)._localModifiedAt : undefined;

  const profile: UserProfile = {
    id: userId,
    email,
    full_name: fullName,
    role,
    status: existingIdx >= 0 ? profiles[existingIdx].status : status,
    created_at: existingIdx >= 0 ? profiles[existingIdx].created_at : new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    // Preserve _localModifiedAt from the existing profile
    if (existingLocalModified) {
      (profile as any)._localModifiedAt = existingLocalModified;
    }
    profiles[existingIdx] = profile;
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

/** Set of profile IDs with pending local changes not yet synced to Supabase */
const _pendingSyncIds = new Set<string>();

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
  const profiles = loadProfiles();
  const idx = profiles.findIndex(p => p.id === userId);
  if (idx < 0) return false;
  // Track local modification timestamp so loadAllProfilesFromSupabase() doesn't overwrite it
  profiles[idx] = { ...profiles[idx], ...updates, _localModifiedAt: Date.now() } as any;
  saveProfiles(profiles);
  if (currentProfile.peek()?.id === userId) {
    currentProfile.set(profiles[idx]);
  }
  // Sync to Supabase (fire-and-forget — local save always succeeds)
  _pendingSyncIds.add(userId);
  tryUpsertSupabase(profiles[idx]).then(synced => {
    if (synced) {
      // Clear the pending flag and the local modification timestamp on successful sync
      _pendingSyncIds.delete(userId);
      const current = loadProfiles();
      const i = current.findIndex(p => p.id === userId);
      if (i >= 0) {
        delete (current[i] as any)._localModifiedAt;
        saveProfiles(current);
      }
    } else {
      console.warn(`[profiles] Profile update for ${userId} saved locally but failed to sync to Supabase`);
    }
  });
  return true; // Local save always succeeds
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
  // Try Supabase first (skip if userId is not a valid UUID — e.g. dev accounts)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  if (isUUID) {
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
    // Sync to Supabase if it was missing there (only for valid UUID accounts)
    if (isUUID) {
      tryUpsertSupabase(profile);
    }
    return profile;
  }

  // New OAuth user — create as donor (auto-approved)
  const newProfile = createProfile(userId, email, fullName || 'User', 'donor');
  // Ensure profile is created in Supabase too
  tryUpsertSupabase(newProfile);
  return newProfile;
}

// ─── Supabase Helpers ────────────────────────────────────

async function tryUpsertSupabase(profile: UserProfile): Promise<boolean> {
  // Skip profiles with non-UUID IDs (e.g. local-only default admin)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profile.id)) {
    return false;
  }
  try {
    const supabase = getSupabaseAdmin();
    const profileData = {
      id: profile.id,
      email: profile.email.toLowerCase(),
      full_name: profile.full_name,
      role: profile.role,
      status: profile.status,
      created_at: profile.created_at,
    };

    // Try UPDATE first (most common case — updating an existing profile)
    const { data: updateData, error: updateError, count } = await supabase
      .from('profiles')
      .update(profileData, { count: 'exact' })
      .eq('id', profile.id);

    if (updateError) {
      console.warn('[profiles] Supabase UPDATE failed:', updateError.message, updateError.code);
      // If UPDATE failed, don't try INSERT — it would also fail
      return false;
    }

    // If the UPDATE affected at least one row, we're done
    if (count !== null && count > 0) {
      return true;
    }

    // No rows updated — profile doesn't exist yet, try INSERT
    const { error: insertError } = await supabase
      .from('profiles')
      .insert(profileData);

    if (insertError) {
      // 23505 = unique_violation — race condition: another request created it
      if (insertError.code === '23505') {
        // Retry the UPDATE now that the row exists
        const { error: retryError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', profile.id);
        if (retryError) {
          console.warn('[profiles] Supabase retry UPDATE failed:', retryError.message);
          return false;
        }
        return true;
      }
      console.warn('[profiles] Supabase INSERT failed:', insertError.message, insertError.code);
      return false;
    }

    return true;
  } catch (e) {
    console.warn('[profiles] Supabase not available:', e);
    return false;
  }
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
    // Force status to active for default admin (fire-and-forget is OK here — local-only account)
    const localProfiles = loadProfiles();
    const idx = localProfiles.findIndex(p => p.id === 'admin-default-001');
    if (idx >= 0) {
      localProfiles[idx] = { ...localProfiles[idx], status: 'active' };
      saveProfiles(localProfiles);
    }
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

export async function approveUser(userId: string): Promise<boolean> {
  return updateProfile(userId, { status: 'active' });
}

export async function rejectUser(userId: string): Promise<boolean> {
  return updateProfile(userId, { status: 'rejected' });
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
  return updateProfile(userId, { role: newRole });
}

// ─── Set User Status (any status) ────────────────────────

export async function setUserStatus(userId: string, status: UserStatus): Promise<boolean> {
  return updateProfile(userId, { status });
}

// ─── Delete User ─────────────────────────────────────────

export async function deleteUser(userId: string): Promise<boolean> {
  const profiles = loadProfiles();
  const idx = profiles.findIndex(p => p.id === userId);
  if (idx < 0) return false;
  const profile = profiles[idx];
  profiles.splice(idx, 1);
  saveProfiles(profiles);
  // Also remove any stored password override
  try {
    const pwRaw = localStorage.getItem(PASSWORD_OVERRIDES_KEY);
    if (pwRaw) {
      const overrides = JSON.parse(pwRaw);
      delete overrides[profile.email.toLowerCase()];
      localStorage.setItem(PASSWORD_OVERRIDES_KEY, JSON.stringify(overrides));
    }
  } catch { /* ignore */ }
  // Delete from Supabase
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('profiles').delete().eq('id', userId);
    // Also delete the auth user if it's a real UUID (not a local fake ID)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (isUuid) {
      await supabase.auth.admin.deleteUser(userId);
    }
  } catch (e) {
    console.warn('[profiles] Failed to delete from Supabase:', e);
  }
  return true;
}

// ─── Change User Password (admin) ────────────────────────

const PASSWORD_OVERRIDES_KEY = 'hope-hub-password-overrides';

export async function changeUserPassword(userId: string, newPassword: string): Promise<boolean> {
  const profiles = loadProfiles();
  const profile = profiles.find(p => p.id === userId);
  if (!profile) {
    console.warn(`[profiles] changeUserPassword: profile not found for userId=${userId}`);
    return false;
  }
  // Store password override locally (keyed by email so it works across ID changes)
  try {
    const raw = localStorage.getItem(PASSWORD_OVERRIDES_KEY);
    const overrides: Record<string, string> = raw ? JSON.parse(raw) : {};
    overrides[profile.email.toLowerCase()] = newPassword;
    localStorage.setItem(PASSWORD_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    console.warn('[profiles] changeUserPassword: failed to save password override to localStorage');
    return false;
  }
  // Also update Supabase Auth password (only for real auth users with UUID IDs)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  if (isUuid) {
    try {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
      if (error) {
        console.warn('[profiles] Failed to update Supabase auth password:', error.message);
        // Local override still works for dev sign-in, so don't return false
      }
    } catch (e) {
      console.warn('[profiles] Supabase auth password update failed:', e);
    }
  }
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
    // Try RPC function first (bypasses PostgREST schema cache)
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_profiles');
    let remote: UserProfile[] | null = null;
    if (!rpcError && rpcData && rpcData.length > 0) {
      remote = rpcData as UserProfile[];
    } else {
      // Fallback to direct table query
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data && data.length > 0) {
        remote = data as UserProfile[];
      }
    }

    // Also fetch auth users to find any without a profile (orphaned auth accounts)
    try {
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      if (authUsers?.users && authUsers.users.length > 0) {
        const profileEmails = new Set((remote || []).map(p => p.email.toLowerCase()));
        const profileIds = new Set((remote || []).map(p => p.id));
        const orphaned = authUsers.users.filter(
          u => !profileIds.has(u.id) && !profileEmails.has((u.email || '').toLowerCase())
        );
        if (orphaned.length > 0) {
          console.warn(`[profiles] Found ${orphaned.length} auth user(s) without a profile — auto-creating`);
          const created: UserProfile[] = [];
          for (const u of orphaned) {
            const newProfile: UserProfile = {
              id: u.id,
              email: (u.email || '').toLowerCase(),
              full_name: u.user_metadata?.full_name || u.user_metadata?.name || 'User',
              role: 'donor',
              status: 'active',
              created_at: u.created_at || new Date().toISOString(),
            };
            // Insert into Supabase profiles table using safe upsert
            const success = await tryUpsertSupabase(newProfile);
            if (success) created.push(newProfile);
            else console.warn(`[profiles] Failed to create profile for ${u.email}`);
          }
          if (!remote) remote = [];
          remote.push(...created);
        }
      }
    } catch (authErr) {
      console.warn('[profiles] Could not check auth users:', authErr);
    }

    if (remote) {
      // Merge: remote is baseline, but preserve locally modified profiles
      const local = loadProfiles();
      const remoteIds = new Set(remote.map(p => p.id));
      const remoteEmails = new Set(remote.map(p => p.email.toLowerCase()));
      const localById = new Map<string, UserProfile>();
      for (const p of local) localById.set(p.id, p);
      const merged = new Map<string, UserProfile>();

      for (const p of remote) {
        const localP = localById.get(p.id);
        if (localP && (localP as any)._localModifiedAt) {
          // Local profile was modified — check if it's newer than the remote version
          const localTime = (localP as any)._localModifiedAt as number;
          const remoteTime = (p as any).updated_at ? new Date((p as any).updated_at).getTime() : 0;
          if (localTime > remoteTime) {
            // Local change is more recent — prefer local and re-try Supabase sync
            merged.set(p.id, localP);
            _pendingSyncIds.add(p.id);
            tryUpsertSupabase(localP).then(synced => {
              if (synced) {
                _pendingSyncIds.delete(p.id);
                // Clear _localModifiedAt after successful sync
                const current = loadProfiles();
                const i = current.findIndex(pr => pr.id === p.id);
                if (i >= 0) {
                  delete (current[i] as any)._localModifiedAt;
                  saveProfiles(current);
                }
              }
            });
            continue;
          }
        }
        // Remote is up-to-date (or local wasn't modified) — use remote
        merged.set(p.id, p);
      }

      // Add local-only profiles that don't exist in remote (by ID or email)
      for (const p of local) {
        if (!remoteIds.has(p.id) && !remoteEmails.has(p.email.toLowerCase())) {
          merged.set(p.id, p);
        }
      }

      const result = Array.from(merged.values());
      saveProfiles(result);
      return result;
    }
  } catch (e) { console.warn('[profiles] Supabase load failed:', e); }
  return loadProfiles();
}

// Initialize default admin on load
ensureDefaultAdmin();
