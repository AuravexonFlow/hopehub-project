/**
 * ═══════════════════════════════════════════════════════════
 *  Realtime Service — Live subscriptions & presence
 * ═══════════════════════════════════════════════════════════
 */

import { getSupabase } from '../lib/supabase';
import { createSignal, type Signal } from '../vortex/signals';
import type { RealtimeChannel } from '@supabase/supabase-js';

const activeChannels = new Map<string, RealtimeChannel>();

export interface RealtimeEvent<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  errors: string[] | null;
}

// ─── Subscribe to Table Changes ───────────────────────────

export function subscribeToTable<T>(
  table: string,
  callback: (event: RealtimeEvent<T>) => void,
  filter?: string
): () => void {
  const supabase = getSupabase();
  const channelName = `table:${table}:${filter || '*'}`;

  // Clean existing
  if (activeChannels.has(channelName)) {
    activeChannels.get(channelName)?.unsubscribe();
  }

  let channel = supabase
    .channel(channelName)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table,
      filter,
    } as any, (payload: any) => {
      callback({
        eventType: payload.eventType,
        new: payload.new,
        old: payload.old,
        errors: payload.errors,
      });
    })
    .subscribe();

  activeChannels.set(channelName, channel);

  return () => {
    channel.unsubscribe();
    activeChannels.delete(channelName);
  };
}

// ─── Presence ─────────────────────────────────────────────

export interface PresenceState {
  user_id: string;
  username: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy';
  last_seen: string;
}

export function joinPresence(room: string, state: PresenceState): {
  onJoin: (fn: (id: string, state: PresenceState) => void) => void;
  onLeave: (fn: (id: string, state: PresenceState) => void) => void;
  leave: () => void;
} {
  const supabase = getSupabase();
  const joinCallbacks: ((id: string, state: PresenceState) => void)[] = [];
  const leaveCallbacks: ((id: string, state: PresenceState) => void)[] = [];

  const channel = supabase.channel(room);

  channel
    .on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      // Handle sync
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
      joinCallbacks.forEach((cb) => cb(key, newPresences[0]));
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
      leaveCallbacks.forEach((cb) => cb(key, leftPresences[0]));
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(state);
      }
    });

  activeChannels.set(`presence:${room}`, channel);

  return {
    onJoin: (fn) => joinCallbacks.push(fn),
    onLeave: (fn) => leaveCallbacks.push(fn),
    leave: () => {
      channel.unsubscribe();
      activeChannels.delete(`presence:${room}`);
    },
  };
}

// ─── Broadcast ────────────────────────────────────────────

export function createBroadcast(room: string): {
  send: (event: string, payload: any) => void;
  on: (event: string, callback: (payload: any) => void) => void;
  close: () => void;
} {
  const supabase = getSupabase();
  const listeners = new Map<string, ((payload: any) => void)[]>();

  const channel = supabase.channel(room);

  channel
    .on('broadcast', { event: '*' }, (msg: any) => {
      const callbacks = listeners.get(msg.event) || [];
      callbacks.forEach((cb) => cb(msg.payload));
    })
    .subscribe();

  activeChannels.set(`broadcast:${room}`, channel);

  return {
    send: (event: string, payload: any) => {
      channel.send({ type: 'broadcast', event, payload });
    },
    on: (event: string, callback: (payload: any) => void) => {
      const existing = listeners.get(event) || [];
      listeners.set(event, [...existing, callback]);
    },
    close: () => {
      channel.unsubscribe();
      activeChannels.delete(`broadcast:${room}`);
    },
  };
}

// ─── Cleanup All ──────────────────────────────────────────

export function cleanupAllChannels(): void {
  activeChannels.forEach((ch) => ch.unsubscribe());
  activeChannels.clear();
}
