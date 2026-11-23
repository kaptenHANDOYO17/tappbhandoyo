/**
 *  KONTEKS AUTENTIKASI
 *  Menyimpan sesi login dan profil pengguna agar bisa dipakai
 *  di seluruh halaman tanpa mengoper props berlapis-lapis.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, supabaseSiap } from '../lib/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesi, setSesi] = useState(null);
  const [profil, setProfil] = useState(null);
  const [memuat, setMemuat] = useState(true);

  const ambilProfil = useCallback(async (userId) => {
    if (!supabaseSiap || !userId) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setProfil(data || null);
    return data;
  }, []);

  useEffect(() => {
    if (!supabaseSiap) { setMemuat(false); return; }

    supabase.auth.getSession().then(({ data }) => {
      setSesi(data.session);
      if (data.session?.user) ambilProfil(data.session.user.id);
      setMemuat(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSesi(s);
      if (s?.user) ambilProfil(s.user.id);
      else setProfil(null);
    });

    return () => sub.subscription.unsubscribe();
  }, [ambilProfil]);

  /** Daftar akun baru. */
  const daftar = useCallback(async (email, password, nama) => {
    if (!supabaseSiap) throw new Error('Supabase belum dikonfigurasi di file .env');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nama } },
    });
    if (error) throw new Error(terjemahkan(error.message));
    // Bila konfirmasi email masih aktif di Supabase, sesi akan kosong.
    return { perluKonfirmasi: !data.session };
  }, []);

  /** Masuk dengan email dan kata sandi. */
  const masuk = useCallback(async (email, password) => {
    if (!supabaseSiap) throw new Error('Supabase belum dikonfigurasi di file .env');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(terjemahkan(error.message));
  }, []);

  const keluar = useCallback(async () => {
    if (supabaseSiap) await supabase.auth.signOut();
    setProfil(null);
  }, []);

  const nilai = useMemo(() => ({
    sesi, profil, memuat, supabaseSiap,
    user: sesi?.user || null,
    masuk, daftar, keluar,
    muatUlangProfil: () => ambilProfil(sesi?.user?.id),
    setProfil,
  }), [sesi, profil, memuat, masuk, daftar, keluar, ambilProfil]);

  return <AuthContext.Provider value={nilai}>{children}</AuthContext.Provider>;
}

/** Mengubah pesan error bawaan Supabase menjadi Bahasa Indonesia. */
function terjemahkan(pesan = '') {
  const p = pesan.toLowerCase();
  if (p.includes('invalid login')) return 'Email atau kata sandi salah.';
  if (p.includes('already registered')) return 'Email ini sudah terdaftar. Silakan masuk.';
  if (p.includes('password should be')) return 'Kata sandi minimal 6 karakter.';
  if (p.includes('unable to validate email')) return 'Format email tidak valid.';
  if (p.includes('email rate limit')) return 'Terlalu sering mencoba. Tunggu sebentar lalu ulangi.';
  return pesan;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
};

export default AuthContext;
