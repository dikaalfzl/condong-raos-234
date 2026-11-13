import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Fungsi untuk memastikan URL hanya berisi https://project-id.supabase.co tanpa path tambahan
function sanitizeSupabaseUrl(urlStr) {
  try {
    const cleaned = urlStr.trim().replace(/^["']|["']$/g, '');
    if (!cleaned) return '';
    const parsed = new URL(cleaned);
    return parsed.origin; // Hanya mengambil https://xxxx.supabase.co
  } catch {
    return '';
  }
}

const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
const supabaseAnonKey = rawKey.trim().replace(/^["']|["']$/g, '');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;