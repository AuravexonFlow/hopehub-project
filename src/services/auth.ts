/**
 * ═══════════════════════════════════════════════════════════
 *  Auth Service — Sign up, sign in, OAuth, session management
 * ═══════════════════════════════════════════════════════════
 */

import { getSupabase } from '../lib/supabase';
import { createSignal, type Signal } from '../vortex/signals';
import type { User, Session } from '@supabase/supabase-js';

// ─── Reactive Auth State ──────────────────────────────────

export const currentUser: Signal<User | null> = createSignal<User | null>(null);
export const currentSession: Signal<Session | null> = createSignal<Session | null>(null);
export const authLoading: Signal<boolean> = createSignal(true);
export const authError: Signal<string | null> = createSignal<string | null>(null);

// ─── Initialize Auth Listener ─────────────────────────────

export async function initAuth(): Promise<void> {
  const supabase = getSupabase();

  const { data: { session } } = await supabase.auth.getSession();
  currentSession.set(session);
  currentUser.set(session?.user ?? null);
  authLoading.set(false);

  supabase.auth.onAuthStateChange((_event, session) => {
    currentSession.set(session);
    currentUser.set(session?.user ?? null);
  });
}

// ─── Email / Password ─────────────────────────────────────

export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  authError.set(null);
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  if (error) {
    authError.set(error.message);
    return null;
  }
  return data;
}

export async function signIn(email: string, password: string) {
  authError.set(null);
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    authError.set(error.message);
    return null;
  }
  return data;
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
  const { error } = await supabase.auth.signOut();
  if (error) authError.set(error.message);
  else {
    currentUser.set(null);
    currentSession.set(null);
  }
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
