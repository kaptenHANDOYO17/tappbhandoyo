/**
 * ============================================================
 *  HOOK WISHLIST (dengan SOFT DELETE)
 * ------------------------------------------------------------
 *  Menghapus gunung dari wishlist TIDAK membuang barisnya dari
 *  database. Kolom `dihapus_pada` diisi waktu penghapusan,
 *  sehingga:
 *    - daftar utama hanya menampilkan baris yang masih aktif,
 *    - pengguna bisa membatalkan penghapusan (undo),
 *    - isi Tempat Sampah bisa dipulihkan kapan saja,
 *    - catatan yang pernah ditulis tidak ikut hilang.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase, supabaseSiap } from '../lib/supabase.js';
import { useAuth } from './AuthContext.jsx';

export function useWishlist() {
  const { user } = useAuth();
  const [idTersimpan, setIdTersimpan] = useState([]);   // masih aktif
  const [idTerhapus, setIdTerhapus] = useState([]);     // ada di tempat sampah
  const [memuat, setMemuat] = useState(true);

  const muat = useCallback(async () => {
    if (!supabaseSiap || !user) {
      setIdTersimpan([]); setIdTerhapus([]); setMemuat(false);
      return;
    }
    setMemuat(true);
    const { data } = await supabase
      .from('wishlist')
      .select('gunung_id, dihapus_pada')
      .eq('user_id', user.id);

    const baris = data || [];
    setIdTersimpan(baris.filter((r) => !r.dihapus_pada).map((r) => Number(r.gunung_id)));
    setIdTerhapus(baris.filter((r) => r.dihapus_pada).map((r) => Number(r.gunung_id)));
    setMemuat(false);
  }, [user]);

  useEffect(() => { muat(); }, [muat]);

  /** Menandai satu gunung sebagai terhapus (masih bisa dipulihkan). */
  const hapus = useCallback(async (gunungId) => {
    if (!supabaseSiap || !user) return { perluMasuk: true };
    const id = Number(gunungId);

    setIdTersimpan((lama) => lama.filter((x) => x !== id));
    setIdTerhapus((lama) => (lama.includes(id) ? lama : [...lama, id]));

    const { error } = await supabase
      .from('wishlist')
      .update({ dihapus_pada: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('gunung_id', id);

    if (error) { await muat(); return { error: error.message }; }
    return { terhapus: true };
  }, [user, muat]);

  /** Mengembalikan gunung dari tempat sampah ke daftar aktif. */
  const pulihkan = useCallback(async (gunungId) => {
    if (!supabaseSiap || !user) return { perluMasuk: true };
    const id = Number(gunungId);

    setIdTerhapus((lama) => lama.filter((x) => x !== id));
    setIdTersimpan((lama) => (lama.includes(id) ? lama : [...lama, id]));

    const { error } = await supabase
      .from('wishlist')
      .update({ dihapus_pada: null })
      .eq('user_id', user.id)
      .eq('gunung_id', id);

    if (error) { await muat(); return { error: error.message }; }
    return { dipulihkan: true };
  }, [user, muat]);

  /** Benar-benar membuang satu baris dari database. Tidak bisa dibatalkan. */
  const hapusPermanen = useCallback(async (gunungId) => {
    if (!supabaseSiap || !user) return { perluMasuk: true };
    const id = Number(gunungId);
    setIdTerhapus((lama) => lama.filter((x) => x !== id));

    const { error } = await supabase
      .from('wishlist').delete()
      .eq('user_id', user.id).eq('gunung_id', id);

    if (error) { await muat(); return { error: error.message }; }
    return { permanen: true };
  }, [user, muat]);

  /** Mengosongkan seluruh tempat sampah. Tidak bisa dibatalkan. */
  const kosongkanSampah = useCallback(async () => {
    if (!supabaseSiap || !user) return { perluMasuk: true };
    setIdTerhapus([]);
    const { error } = await supabase
      .from('wishlist').delete()
      .eq('user_id', user.id).not('dihapus_pada', 'is', null);
    if (error) { await muat(); return { error: error.message }; }
    return { dikosongkan: true };
  }, [user, muat]);

  /**
   * Tombol hati: menambah bila belum ada, menghapus (soft) bila
   * sudah ada. Baris yang pernah dihapus cukup dipulihkan, jadi
   * tidak pernah terjadi duplikat untuk gunung yang sama.
   */
  const toggle = useCallback(async (gunungId) => {
    if (!supabaseSiap || !user) return { perluMasuk: true };
    const id = Number(gunungId);

    if (idTersimpan.includes(id)) {
      const hasil = await hapus(id);
      return { ...hasil, sudahAda: false };
    }

    if (idTerhapus.includes(id)) {
      const hasil = await pulihkan(id);
      return { ...hasil, sudahAda: true };
    }

    setIdTersimpan((lama) => [...lama, id]);
    const { error } = await supabase
      .from('wishlist')
      .insert({ user_id: user.id, gunung_id: id });

    if (error) { await muat(); return { error: error.message }; }
    return { sudahAda: true };
  }, [user, idTersimpan, idTerhapus, hapus, pulihkan, muat]);

  return {
    idTersimpan, idTerhapus, memuat,
    toggle, hapus, pulihkan, hapusPermanen, kosongkanSampah,
    muatUlang: muat,
  };
}

export default useWishlist;
