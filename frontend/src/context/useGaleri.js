/**
 * ============================================================
 *  HOOK GALERI PENDAKIAN
 * ------------------------------------------------------------
 *  Satu postingan = satu momen pendakian, berisi:
 *    - judul dan cerita
 *    - gunung terkait serta tanggal pendakian
 *    - beberapa foto yang ditampilkan sebagai carousel
 *
 *  Foto diunggah ke Supabase Storage bucket 'galeri' dengan
 *  folder per pengguna (<user_id>/...), sesuai policy yang
 *  hanya mengizinkan seseorang menulis di foldernya sendiri.
 *
 *  Penghapusan postingan memakai SOFT DELETE (dihapus_pada),
 *  sama seperti wishlist, agar kenangan tidak hilang karena
 *  satu ketukan yang tidak sengaja.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase, supabaseSiap } from '../lib/supabase.js';
import { useAuth } from './AuthContext.jsx';
import { kecilkanGambar } from '../lib/gambar.js';

export const MAKS_FOTO = 8;

export function useGaleri() {
  const { user } = useAuth();
  const [postingan, setPostingan] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState('');

  const muat = useCallback(async () => {
    if (!supabaseSiap || !user) { setPostingan([]); setMemuat(false); return; }
    setMemuat(true); setError('');

    const { data, error: err } = await supabase
      .from('galeri_post')
      .select('id, judul, cerita, gunung_id, tanggal_pendakian, created_at, galeri_foto(id, url, urutan)')
      .eq('user_id', user.id)
      .is('dihapus_pada', null)
      .order('created_at', { ascending: false });

    if (err) { setError(err.message); setMemuat(false); return; }

    setPostingan(
      (data || []).map((p) => ({
        ...p,
        foto: (p.galeri_foto || []).sort((a, b) => a.urutan - b.urutan),
      }))
    );
    setMemuat(false);
  }, [user]);

  useEffect(() => { muat(); }, [muat]);

  /**
   * Membuat postingan baru beserta foto-fotonya.
   * @param {{judul:string, cerita:string, gunungId:string, tanggal:string}} isi
   * @param {File[]} berkas  daftar foto yang dipilih pengguna
   * @param {(n:number,total:number)=>void} onProgres
   */
  const tambah = useCallback(async (isi, berkas, onProgres) => {
    if (!supabaseSiap || !user) return { error: 'Perlu masuk dulu.' };
    if (!isi.judul?.trim()) return { error: 'Judul momen belum diisi.' };
    if (!berkas?.length) return { error: 'Pilih minimal satu foto.' };

    const daftar = Array.from(berkas).slice(0, MAKS_FOTO);

    // 1) Buat baris postingan lebih dulu supaya punya id untuk foto.
    const { data: post, error: errPost } = await supabase
      .from('galeri_post')
      .insert({
        user_id: user.id,
        judul: isi.judul.trim(),
        cerita: isi.cerita?.trim() || null,
        gunung_id: isi.gunungId ? Number(isi.gunungId) : null,
        tanggal_pendakian: isi.tanggal || null,
      })
      .select('id')
      .single();

    if (errPost) return { error: errPost.message };

    // 2) Unggah tiap foto, lalu catat URL-nya.
    const barisFoto = [];
    try {
      for (let i = 0; i < daftar.length; i += 1) {
        onProgres?.(i + 1, daftar.length);
        const blob = await kecilkanGambar(daftar[i], 1280, 0.82);
        const path = `${user.id}/${post.id}/${Date.now()}-${i}.jpg`;

        const { error: errUnggah } = await supabase.storage
          .from('galeri')
          .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
        if (errUnggah) throw new Error(errUnggah.message);

        const { data: pub } = supabase.storage.from('galeri').getPublicUrl(path);
        barisFoto.push({ post_id: post.id, url: pub.publicUrl, urutan: i });
      }

      const { error: errFoto } = await supabase.from('galeri_foto').insert(barisFoto);
      if (errFoto) throw new Error(errFoto.message);
    } catch (e) {
      // Postingan tanpa foto tidak ada gunanya: dibatalkan supaya
      // tidak meninggalkan baris kosong di database.
      await supabase.from('galeri_post').delete().eq('id', post.id);
      return { error: e.message };
    }

    await muat();
    return { berhasil: true };
  }, [user, muat]);

  /** Mengubah judul, cerita, gunung, atau tanggal sebuah postingan. */
  const ubah = useCallback(async (postId, isi) => {
    if (!supabaseSiap || !user) return { error: 'Perlu masuk dulu.' };
    const { error: err } = await supabase
      .from('galeri_post')
      .update({
        judul: isi.judul?.trim(),
        cerita: isi.cerita?.trim() || null,
        gunung_id: isi.gunungId ? Number(isi.gunungId) : null,
        tanggal_pendakian: isi.tanggal || null,
      })
      .eq('id', postId).eq('user_id', user.id);
    if (err) return { error: err.message };
    await muat();
    return { berhasil: true };
  }, [user, muat]);

  /** Soft delete: postingan disembunyikan, foto tetap tersimpan. */
  const hapus = useCallback(async (postId) => {
    if (!supabaseSiap || !user) return { error: 'Perlu masuk dulu.' };
    setPostingan((lama) => lama.filter((p) => p.id !== postId));
    const { error: err } = await supabase
      .from('galeri_post')
      .update({ dihapus_pada: new Date().toISOString() })
      .eq('id', postId).eq('user_id', user.id);
    if (err) { await muat(); return { error: err.message }; }
    return { berhasil: true };
  }, [user, muat]);

  /** Membatalkan penghapusan. */
  const pulihkan = useCallback(async (postId) => {
    if (!supabaseSiap || !user) return { error: 'Perlu masuk dulu.' };
    const { error: err } = await supabase
      .from('galeri_post')
      .update({ dihapus_pada: null })
      .eq('id', postId).eq('user_id', user.id);
    if (err) return { error: err.message };
    await muat();
    return { berhasil: true };
  }, [user, muat]);

  return { postingan, memuat, error, tambah, ubah, hapus, pulihkan, muatUlang: muat };
}

export default useGaleri;
