/**
 *  KLIEN SUPABASE SISI BROWSER
 *  Dipakai untuk login, wishlist, my gear, dan foto profil.
 *  Kunci yang dipakai adalah "anon key" (kunci publik). Aman
 *  berada di frontend karena setiap tabel dilindungi Row Level
 *  Security, sehingga pengguna hanya bisa menyentuh datanya sendiri.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseSiap = Boolean(URL && KEY);

export const supabase = supabaseSiap
  ? createClient(URL, KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

export default supabase;
