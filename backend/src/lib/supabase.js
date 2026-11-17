/**
 * ============================================================
 *  KONEKSI SUPABASE + MEKANISME FALLBACK
 * ------------------------------------------------------------
 *  Logika:
 *  1. Jika SUPABASE_URL dan SUPABASE_ANON_KEY terisi di .env
 *     -> buat client Supabase, mode = "supabase".
 *  2. Jika salah satu kosong / tidak valid
 *     -> client = null, mode = "fallback" (array JSON lokal).
 *
 *  Dengan cara ini server SELALU bisa dijalankan tanpa error,
 *  walaupun database belum disiapkan.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();

/** URL dianggap valid hanya jika berupa http(s) yang benar */
function isValidUrl(value) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

const isSupabaseEnabled = isValidUrl(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 0;

let supabase = null;

if (isSupabaseEnabled) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  } catch (error) {
    console.error('[MountTrack] Gagal membuat client Supabase:', error.message);
    supabase = null;
  }
}

const dataSourceMode = supabase ? 'supabase' : 'fallback';

const tableNames = {
  gunung: process.env.SUPABASE_TABLE_GUNUNG || 'gunung',
  alat: process.env.SUPABASE_TABLE_ALAT || 'alat',
};

module.exports = {
  supabase,
  isSupabaseEnabled: Boolean(supabase),
  dataSourceMode,
  tableNames,
};
