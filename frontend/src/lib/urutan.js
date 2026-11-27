/**
 * ============================================================
 *  LOGIKA PENGURUTAN DAFTAR
 * ------------------------------------------------------------
 *  Dipakai bersama oleh halaman Gunung dan halaman Perlengkapan
 *  supaya aturan urutannya hanya ditulis di satu tempat.
 *
 *  Catatan soal prioritas perlengkapan:
 *  "Wajib" harus datang lebih dulu daripada "Penting", dan
 *  "Penting" lebih dulu daripada "Opsional". Urutan itu tidak
 *  bisa diperoleh dari urutan abjad, jadi tiap tingkat diberi
 *  angka bobot sendiri.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

/** Makin kecil angkanya, makin wajib perlengkapan itu dibawa. */
export const BOBOT_PRIORITAS = { Wajib: 1, Penting: 2, Opsional: 3 };

/** Makin kecil angkanya, makin ringan tingkat kesulitannya. */
export const BOBOT_KESULITAN = { Pemula: 1, Menengah: 2, Sulit: 3 };

/** Mengubah "2.1 kg" menjadi angka 2.1 agar bisa dibandingkan. */
export function keAngkaBerat(teks) {
  const angka = parseFloat(String(teks).replace(',', '.'));
  return Number.isFinite(angka) ? angka : 0;
}

/**
 * Mengambil nilai yang dipakai untuk membandingkan dua baris.
 * Mengembalikan angka untuk field numerik, atau teks untuk nama.
 */
export function nilaiUrut(item, kunci) {
  switch (kunci) {
    case 'ketinggian':
      return Number(item.ketinggian) || 0;
    case 'harga':
      return Number(item.harga_tiket) || 0;
    case 'kesulitan':
      return BOBOT_KESULITAN[item.tingkat_kesulitan] ?? 99;
    case 'prioritas':
      return BOBOT_PRIORITAS[item.prioritas] ?? 99;
    case 'berat':
      return keAngkaBerat(item.berat_ideal);
    case 'nama':
      return String(item.nama || '').toLowerCase();
    default:
      return 0;
  }
}

/**
 * Mengurutkan salinan daftar. Daftar aslinya tidak diubah.
 *
 * @param {Array}  daftar
 * @param {string} kunci  'ketinggian' | 'prioritas' | 'berat' | 'nama' | ...
 * @param {'naik'|'turun'} arah
 * @returns {Array} daftar baru yang sudah terurut
 */
export function urutkan(daftar, kunci, arah = 'naik') {
  const faktor = arah === 'turun' ? -1 : 1;

  return [...daftar].sort((a, b) => {
    const x = nilaiUrut(a, kunci);
    const y = nilaiUrut(b, kunci);

    let beda;
    if (typeof x === 'string' || typeof y === 'string') {
      // localeCompare dipakai supaya huruf beraksen tetap urut benar.
      beda = String(x).localeCompare(String(y), 'id');
    } else {
      beda = x - y;
    }

    // Bila nilainya sama persis, nama dipakai sebagai penentu
    // supaya urutannya tidak berubah-ubah setiap kali dirender.
    if (beda === 0) {
      return String(a.nama || '').localeCompare(String(b.nama || ''), 'id');
    }
    return beda * faktor;
  });
}

export default urutkan;
