/**
 * ============================================================
 *  HOOK PILIHAN URUTAN
 * ------------------------------------------------------------
 *  Menyimpan pilihan urutan pengguna di localStorage, sehingga
 *  saat halaman dibuka lagi urutannya tetap seperti terakhir
 *  kali dipakai. Disimpan di perangkat, bukan di server, karena
 *  ini soal kenyamanan tampilan dan bukan data pribadi.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { useCallback, useEffect, useState } from 'react';

const AWALAN = 'mounttrack:urutan:';

export function useUrutan(nama, bawaan) {
  const [nilai, setNilai] = useState(() => {
    try {
      const simpanan = localStorage.getItem(AWALAN + nama);
      if (!simpanan) return bawaan;
      const isi = JSON.parse(simpanan);
      // Dicek dulu supaya data simpanan yang rusak tidak membuat
      // halaman gagal dirender.
      if (typeof isi?.kunci === 'string' && (isi.arah === 'naik' || isi.arah === 'turun')) {
        return isi;
      }
      return bawaan;
    } catch {
      return bawaan;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(AWALAN + nama, JSON.stringify(nilai));
    } catch {
      // Mode penyamaran atau kuota penuh: urutan tetap jalan,
      // hanya tidak diingat untuk kunjungan berikutnya.
    }
  }, [nama, nilai]);

  const ubah = useCallback((berikut) => setNilai(berikut), []);

  return [nilai, ubah];
}

export default useUrutan;
