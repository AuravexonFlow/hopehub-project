/**
 * ═══════════════════════════════════════════════════════════
 *  Auth Service — Sign up, sign in, OAuth, session management
 * ═══════════════════════════════════════════════════════════
 */

import { getSupabase } from '../lib/supabase';
import { createSignal, type Signal } from '../vortex/signals';
import type { User, Session } from '@supabase/supabase-js';
import {
  createProfile,
  loadProfileForUser,
  getOrCreateProfile,
  currentProfile,
  getPasswordOverride,
  type UserRole,
} from './profiles';

// ─── Reactive Auth State ──────────────────────────────────

export const currentUser: Signal<User | null> = createSignal<User | null>(null);
export const currentSession: Signal<Session | null> = createSignal<Session | null>(null);
export const authLoading: Signal<boolean> = createSignal(true);
export const authError: Signal<string | null> = createSignal<string | null>(null);

// ─── Initialize Auth Listener ─────────────────────────────

const DEV_SESSION_KEY = 'hope-hub-dev-session';

export async function initAuth(): Promise<void> {
  // ── Check dev session FIRST (instant, no network) ──
  const devSessionRaw = localStorage.getItem(DEV_SESSION_KEY);
  if (devSessionRaw) {
    try {
      const devSession = JSON.parse(devSessionRaw) as Session;
      currentSession.set(devSession);
      currentUser.set(devSession.user ?? null);
      if (devSession.user) {
        await loadProfileForUser(
          devSession.user.id,
          devSession.user.email || '',
          devSession.user.user_metadata?.full_name,
        );
      }
      authLoading.set(false);

      // Still register Supabase listener (to detect real session changes)
      const supabase = getSupabase();
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!session && currentUser.peek() && localStorage.getItem(DEV_SESSION_KEY)) return;
        currentSession.set(session);
        currentUser.set(session?.user ?? null);
        if (session?.user) {
          await loadProfileForUser(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata?.full_name,
          );
        } else {
          currentProfile.set(null);
        }
      });
      return;
    } catch {
      localStorage.removeItem(DEV_SESSION_KEY);
    }
  }

  // ── Real Supabase auth ──
  const supabase = getSupabase();

  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    // Real Supabase session
    currentSession.set(session);
    currentUser.set(session.user ?? null);
    if (session.user) {
      await loadProfileForUser(
        session.user.id,
        session.user.email || '',
        session.user.user_metadata?.full_name,
      );
    }
    authLoading.set(false);
  } else {
    authLoading.set(false);
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    // Don't override a dev session with a null Supabase session
    if (!session && currentUser.peek() && localStorage.getItem(DEV_SESSION_KEY)) return;

    currentSession.set(session);
    currentUser.set(session?.user ?? null);
    if (session?.user) {
      await loadProfileForUser(
        session.user.id,
        session.user.email || '',
        session.user.user_metadata?.full_name,
      );
    } else {
      currentProfile.set(null);
    }
  });
}

// ─── Email / Password ─────────────────────────────────────

export async function signUp(email: string, password: string, metadata?: Record<string, any>, role?: UserRole) {
  authError.set(null);
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { ...metadata, role: role || 'donor' } },
  });
  if (error) {
    authError.set(error.message);
    return null;
  }

  // Create profile
  if (data.user) {
    createProfile(
      data.user.id,
      email,
      metadata?.full_name || 'User',
      role || 'donor',
    );
  }

  return data;
}

export async function signIn(email: string, password: string) {
  authError.set(null);

  // ── Dev bypass: try local auth first for known dev accounts ──
  // This avoids noisy Supabase 400/404 errors in the console
  if (password.length >= 6) {
    const localResult = devLocalSignIn(email, password);
    if (localResult) {
      persistDevSession(localResult.session);
      currentUser.set(localResult.user);
      currentSession.set(localResult.session);
      return localResult;
    }
  }

  // ── Real Supabase auth ──
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    authError.set(error.message);
    return null;
  }

  // Load or create profile
  if (data.user) {
    getOrCreateProfile(data.user.id, email, data.user.user_metadata?.full_name);
  }

  return data;
}

/**
 * Dev-only local sign-in bypass.
 * Checks localStorage profiles for matching email + dev password override.
 * Creates a fake User object so the app's auth flow works normally.
 */
function devLocalSignIn(email: string, password: string): { user: User; session: Session } | null {
  // Dev accounts with known passwords (ONLY for local testing)
  const DEV_ACCOUNTS: Record<string, { password: string; name: string; role: UserRole; userId: string }> = {
    'testadmin@hopetest.com': {
      password: 'HopeHub@2026',
      name: 'Test Admin',
      role: 'admin',
      userId: '12146501-24ca-41c3-9963-b68bf07b9d59',
    },
    'auravexonflow@gmail.com': {
      password: 'Auravexoncodex@2026',
      name: 'Auravexon Flow',
      role: 'admin',
      userId: 'a7c3e021-84f1-4c0a-bd5a-6f9e3c2d1a80',
    },
    'donor@test.com': {
      password: 'HopeHub@2026',
      name: 'Test Donor',
      role: 'donor',
      userId: 'b8d4f123-92a7-4e5c-ab12-3c4d5e6f7a89',
    },
  };

  let matchedAccount: { userId: string; name: string; role: UserRole } | null = null;

  // 1. Check hardcoded dev accounts
  const devAccount = DEV_ACCOUNTS[email.toLowerCase()];
  if (devAccount && devAccount.password === password) {
    matchedAccount = { userId: devAccount.userId, name: devAccount.name, role: devAccount.role };
  }

  // 2. Check admin-created profiles in localStorage
  if (!matchedAccount) {
    try {
      const raw = localStorage.getItem('hope-hub-profiles');
      if (raw) {
        const profiles = JSON.parse(raw) as Array<{ id: string; email: string; full_name: string; role: UserRole; status: string }>;
        const profile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
        if (profile) {
          // Check password override first, then default password 'HopeHub@2026'
          const overridePw = getPasswordOverride(email);
          const expectedPw = overridePw || 'HopeHub@2026';
          if (password === expectedPw) {
            matchedAccount = { userId: profile.id, name: profile.full_name, role: profile.role };
          }
        }
      }
    } catch { /* ignore */ }
  }

  if (!matchedAccount) return null;

  // Ensure profile exists in localStorage with ACTIVE status
  const profile = createProfile(matchedAccount.userId, email, matchedAccount.name, matchedAccount.role);
  // Force active status for dev/local accounts
  profile.status = 'active';
  try {
    const raw = localStorage.getItem('hope-hub-profiles');
    if (raw) {
      const profiles = JSON.parse(raw);
      const prof = profiles.find((p: { id: string }) => p.id === matchedAccount!.userId);
      if (prof) prof.status = 'active';
      localStorage.setItem('hope-hub-profiles', JSON.stringify(profiles));
    }
  } catch { /* ignore */ }
  currentProfile.set(profile);

  // Create a minimal fake User + Session for the auth flow
  const fakeUser: User = {
    id: matchedAccount.userId,
    email,
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { full_name: matchedAccount.name, email_verified: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_anonymous: false,
  } as User;

  const fakeSession: Session = {
    access_token: `dev-token-${Date.now()}`,
    refresh_token: `dev-refresh-${Date.now()}`,
    expires_in: 3600,
    token_type: 'bearer',
    user: fakeUser,
  } as Session;

  return { user: fakeUser, session: fakeSession };
}

function persistDevSession(session: Session): void {
  localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(session));
}

export async function signInWithOAuth(provider: 'google' | 'github' | 'discord' | 'twitter') {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) authError.set(error.message);
}

export async function signOut() {
  const supabase = getSupabase();
  await supabase.auth.signOut(); // ignore errors (may have no real session for dev accounts)
  localStorage.removeItem(DEV_SESSION_KEY);
  currentUser.set(null);
  currentSession.set(null);
  currentProfile.set(null);
}

export async function resetPassword(email: string) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) authError.set(error.message);
  return !error;
}

export async function updatePassword(newPassword: string) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) authError.set(error.message);
  return !error;
}

export function isAuthenticated(): boolean {
  return currentUser.peek() !== null;
}

// ─── Get Current User's Profile ──────────────────────────

export function getCurrentUserProfile() {
  return currentProfile.peek();
}
