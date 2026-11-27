/**
 * ============================================================
 *  HOOK RENCANA PENDAKIAN
 * ------------------------------------------------------------
 *  Menyimpan rencana pendakian pengguna:
 *    - gunung tujuan
 *    - gaya  : 'tektok' (pulang hari) atau 'camp' (bermalam)
 *    - lama_malam  : jumlah malam bila bermalam
 *    - jumlah_orang: untuk menghitung kebutuhan air dan logistik
 *
 *  Rencana disimpan di Supabase (satu baris per pengguna) agar
 *  tetap ada saat dibuka dari perangkat lain. Bila Supabase
 *  belum siap atau pengguna belum masuk, rencana tetap bisa
 *  dipakai sementara di memori.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase, supabaseSiap } from '../lib/supabase.js';
import { useAuth } from './AuthContext.jsx';

const BAWAAN = { gunungId: '', gaya: 'tektok', lamaMalam: 0, jumlahOrang: 1 };

export function useRencana() {
  const { user } = useAuth();
  const [rencana, setRencana] = useState(BAWAAN);
  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);

  const muat = useCallback(async () => {
    if (!supabaseSiap || !user) { setRencana(BAWAAN); setMemuat(false); return; }
    setMemuat(true);
    const { data } = await supabase
      .from('rencana_pendakian')
      .select('gunung_id, gaya, lama_malam, jumlah_orang')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setRencana({
        gunungId: data.gunung_id ? String(data.gunung_id) : '',
        gaya: data.gaya === 'camp' ? 'camp' : 'tektok',
        lamaMalam: Number(data.lama_malam) || 0,
        jumlahOrang: Number(data.jumlah_orang) || 1,
      });
    } else {
      setRencana(BAWAAN);
    }
    setMemuat(false);
  }, [user]);

  useEffect(() => { muat(); }, [muat]);

  /**
   * Memperbarui sebagian isi rencana lalu menyimpannya.
   * Layar diperbarui lebih dulu supaya terasa responsif.
   */
  const ubah = useCallback(async (perubahan) => {
    const berikut = { ...rencana, ...perubahan };

    // Tektok tidak punya malam. Dijaga di sini supaya nilainya
    // tidak pernah janggal saat dikirim ke backend.
    if (berikut.gaya === 'tektok') berikut.lamaMalam = 0;
    if (berikut.gaya === 'camp' && berikut.lamaMalam < 1) berikut.lamaMalam = 1;

    setRencana(berikut);

    if (!supabaseSiap || !user) return berikut;

    setMenyimpan(true);
    await supabase.from('rencana_pendakian').upsert(
      {
        user_id: user.id,
        gunung_id: berikut.gunungId ? Number(berikut.gunungId) : null,
        gaya: berikut.gaya,
        lama_malam: berikut.lamaMalam,
        jumlah_orang: berikut.jumlahOrang,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    setMenyimpan(false);
    return berikut;
  }, [rencana, user]);

  /** Jumlah hari perjalanan: tektok = 1 hari, camp = malam + 1. */
  const totalHari = rencana.gaya === 'camp' ? rencana.lamaMalam + 1 : 1;

  return { rencana, totalHari, memuat, menyimpan, ubah, muatUlang: muat };
}

export default useRencana;
