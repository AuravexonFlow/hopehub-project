/**
 * ═══════════════════════════════════════════════════════════
 *  Supabase Client — Singleton connection manager
 * ═══════════════════════════════════════════════════════════
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || '';

let supabaseInstance: SupabaseClient | null = null;
let adminInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        headers: {
          'x-client-info': `hope-hub/vortex-1.0.0`,
        },
      },
    });
  }
  return supabaseInstance;
}

/**
 * Admin Supabase client — uses service role key to bypass RLS.
 * Used for admin CRUD operations when the user session has fake/dev tokens
 * that can't pass Supabase RLS policies.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!adminInstance) {
    if (!SUPABASE_SERVICE_KEY) {
      console.warn('[supabase] ⚠️ VITE_SUPABASE_SERVICE_KEY is not set! Admin operations will use the anon key and may be blocked by RLS.');
    }
    adminInstance = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        storageKey: 'sb-admin-auth-token',
      },
    });
  }
  return adminInstance;
}

export { SupabaseClient };
