/**
 * ============================================================
 *  UTILITAS GAMBAR
 * ------------------------------------------------------------
 *  Memperkecil gambar di dalam browser sebelum diunggah.
 *  Tujuannya dua: hemat kuota pengguna, dan hemat ruang
 *  penyimpanan Supabase. Foto kamera ponsel bisa 4-8 MB,
 *  setelah diperkecil biasanya tinggal 100-300 KB tanpa
 *  perbedaan yang terlihat di layar ponsel.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

/**
 * @param {File} file     berkas dari input type=file
 * @param {number} maksimal  sisi terpanjang hasil akhir (piksel)
 * @param {number} mutu   0..1, makin kecil makin ringan
 * @returns {Promise<Blob>} blob JPEG siap unggah
 */
export function kecilkanGambar(file, maksimal = 1280, mutu = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !String(file.type).startsWith('image/')) {
      reject(new Error('Berkas itu bukan gambar.'));
      return;
    }

    const pembaca = new FileReader();
    pembaca.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    pembaca.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Berkas itu bukan gambar yang valid.'));
      img.onload = () => {
        const skala = Math.min(1, maksimal / Math.max(img.width, img.height));
        const kanvas = document.createElement('canvas');
        kanvas.width = Math.round(img.width * skala);
        kanvas.height = Math.round(img.height * skala);
        kanvas.getContext('2d').drawImage(img, 0, 0, kanvas.width, kanvas.height);
        kanvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Gagal memproses gambar.'))),
          'image/jpeg',
          mutu
        );
      };
      img.src = pembaca.result;
    };
    pembaca.readAsDataURL(file);
  });
}

export default kecilkanGambar;
