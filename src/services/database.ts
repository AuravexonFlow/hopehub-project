/**
 * ═══════════════════════════════════════════════════════════
 *  Database Service — CRUD, queries, pagination, search
 * ═══════════════════════════════════════════════════════════
 */

import { getSupabase } from '../lib/supabase';

export interface QueryOptions {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  filters?: Record<string, any>;
  search?: { column: string; query: string };
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Generic CRUD ─────────────────────────────────────────

export async function fetchAll<T>(
  table: string,
  options: QueryOptions = {}
): Promise<PaginatedResult<T>> {
  const supabase = getSupabase();
  const {
    page = 1,
    pageSize = 20,
    orderBy = 'created_at',
    orderDir = 'desc',
    filters,
    search,
  } = options;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from(table).select('*', { count: 'exact' });

  // Apply filters
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && value.startsWith('%')) {
          query = query.ilike(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    }
  }

  // Apply search
  if (search) {
    query = query.ilike(search.column, `%${search.query}%`);
  }

  query = query.order(orderBy, { ascending: orderDir === 'asc' }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []) as T[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function fetchById<T>(table: string, id: string | number): Promise<T | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return data as T;
}

export async function create<T>(table: string, record: Partial<T>): Promise<T> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from(table).insert(record as any).select().single();
  if (error) throw error;
  return data as T;
}

export async function createMany<T>(table: string, records: Partial<T>[]): Promise<T[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from(table).insert(records as any).select();
  if (error) throw error;
  return (data || []) as T[];
}

export async function update<T>(table: string, id: string | number, updates: Partial<T>): Promise<T> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from(table).update(updates as any).eq('id', id).select().single();
  if (error) throw error;
  return data as T;
}

export async function remove(table: string, id: string | number): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function upsert<T>(table: string, record: Partial<T>): Promise<T> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from(table).upsert(record as any).select().single();
  if (error) throw error;
  return data as T;
}

// ─── RPC (Stored Procedures) ──────────────────────────────

export async function callRPC<T>(fn: string, params?: Record<string, any>): Promise<T> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc(fn, params);
  if (error) throw error;
  return data as T;
}

// ─── Storage ──────────────────────────────────────────────

export async function uploadFile(bucket: string, path: string, file: File) {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return data;
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabase = getSupabase();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(bucket: string, paths: string[]) {
  const supabase = getSupabase();
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw error;
}
