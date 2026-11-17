/**
 * ============================================================
 *  SMOKE TEST OTOMATIS UNTUK 4 ENDPOINT UTAMA
 * ------------------------------------------------------------
 *  Cara pakai (server TIDAK perlu dijalankan terpisah):
 *      npm run test:api
 *
 *  Script ini menyalakan server di port acak, memanggil semua
 *  endpoint, memeriksa status code + struktur field, lalu
 *  mematikan server kembali.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

require('dotenv').config();

const app = require('../src/app');

const FIELD_GUNUNG = [
  'id', 'nama', 'lokasi', 'ketinggian', 'jalur_populer',
  'estimasi_waktu', 'harga_tiket', 'tingkat_kesulitan',
  'gambar_url', 'deskripsi',
];

const FIELD_ALAT = [
  'id', 'nama', 'kategori', 'berat_ideal', 'prioritas',
  'gambar_url', 'fungsi', 'risiko_tanpa_alat',
];

let lulus = 0;
let gagal = 0;

function cek(label, kondisi, detail = '') {
  if (kondisi) {
    lulus += 1;
    console.log(`  PASS  ${label}`);
  } else {
    gagal += 1;
    console.log(`  FAIL  ${label} ${detail}`);
  }
}

async function main() {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  console.log(`\nMenguji MountTrack API di ${base}\n`);

  try {
    // 1. GET /api/gunung
    let res = await fetch(`${base}/api/gunung`);
    let json = await res.json();
    cek('GET /api/gunung -> status 200', res.status === 200, `(dapat ${res.status})`);
    cek('GET /api/gunung -> minimal 5 data', json.data.length >= 5, `(dapat ${json.data.length})`);
    cek(
      'GET /api/gunung -> field lengkap',
      json.data.every((d) => FIELD_GUNUNG.every((f) => f in d))
    );

    // 2. GET /api/gunung/:id
    res = await fetch(`${base}/api/gunung/1`);
    json = await res.json();
    cek('GET /api/gunung/1 -> status 200', res.status === 200, `(dapat ${res.status})`);
    cek('GET /api/gunung/1 -> id = 1', Number(json.data.id) === 1);

    res = await fetch(`${base}/api/gunung/9999`);
    cek('GET /api/gunung/9999 -> status 404', res.status === 404, `(dapat ${res.status})`);

    // 3. GET /api/alat
    res = await fetch(`${base}/api/alat`);
    json = await res.json();
    cek('GET /api/alat -> status 200', res.status === 200, `(dapat ${res.status})`);
    cek('GET /api/alat -> minimal 5 data', json.data.length >= 5, `(dapat ${json.data.length})`);
    cek(
      'GET /api/alat -> field lengkap',
      json.data.every((d) => FIELD_ALAT.every((f) => f in d))
    );

    // 4. GET /api/alat/:id
    res = await fetch(`${base}/api/alat/2`);
    json = await res.json();
    cek('GET /api/alat/2 -> status 200', res.status === 200, `(dapat ${res.status})`);
    cek('GET /api/alat/2 -> id = 2', Number(json.data.id) === 2);

    res = await fetch(`${base}/api/alat/abc`);
    cek('GET /api/alat/abc -> status 400', res.status === 400, `(dapat ${res.status})`);

    // Ekstra: query search & filter kategori
    res = await fetch(`${base}/api/gunung?search=prau`);
    json = await res.json();
    cek('GET /api/gunung?search=prau -> 1 hasil', json.data.length === 1, `(dapat ${json.data.length})`);

    res = await fetch(`${base}/api/alat?kategori=Penerangan`);
    json = await res.json();
    cek('GET /api/alat?kategori=Penerangan -> ada hasil', json.data.length >= 1);

    // Health check
    res = await fetch(`${base}/api/health`);
    cek('GET /api/health -> status 200', res.status === 200);

    // 404 handler
    res = await fetch(`${base}/api/tidak-ada`);
    cek('GET /api/tidak-ada -> status 404', res.status === 404, `(dapat ${res.status})`);
  } finally {
    server.close();
  }

  console.log(`\nHasil: ${lulus} lulus, ${gagal} gagal\n`);
  process.exit(gagal === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('Smoke test error:', error);
  process.exit(1);
});
