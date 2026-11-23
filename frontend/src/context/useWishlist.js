/**
 *  HOOK WISHLIST
 *  Mengambil daftar gunung impian milik pengguna dari Supabase,
 *  lalu dicocokkan dengan data gunung dari REST API.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase, supabaseSiap } from '../lib/supabase.js';
import { useAuth } from './AuthContext.jsx';

export function useWishlist() {
  const { user } = useAuth();
  const [idTersimpan, setIdTersimpan] = useState([]);
  const [memuat, setMemuat] = useState(true);

  const muat = useCallback(async () => {
    if (!supabaseSiap || !user) { setIdTersimpan([]); setMemuat(false); return; }
    setMemuat(true);
    const { data } = await supabase.from('wishlist').select('gunung_id').eq('user_id', user.id);
    setIdTersimpan((data || []).map((r) => Number(r.gunung_id)));
    setMemuat(false);
  }, [user]);

  useEffect(() => { muat(); }, [muat]);

  /** Menambah atau menghapus satu gunung dari wishlist. */
  const toggle = useCallback(async (gunungId) => {
    if (!supabaseSiap || !user) return { perluMasuk: true };
    const id = Number(gunungId);
    const sudahAda = idTersimpan.includes(id);

    // Diperbarui di layar lebih dulu supaya terasa responsif.
    setIdTersimpan((lama) => (sudahAda ? lama.filter((x) => x !== id) : [...lama, id]));

    const { error } = sudahAda
      ? await supabase.from('wishlist').delete().eq('user_id', user.id).eq('gunung_id', id)
      : await supabase.from('wishlist').insert({ user_id: user.id, gunung_id: id });

    if (error) { await muat(); return { error: error.message }; }
    return { sudahAda: !sudahAda };
  }, [user, idTersimpan, muat]);

  return { idTersimpan, memuat, toggle, muatUlang: muat };
}

export default useWishlist;
