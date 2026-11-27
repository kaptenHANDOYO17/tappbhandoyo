/**
 * ============================================================
 *  KLIEN GEMINI (SISI SERVER SAJA)
 * ------------------------------------------------------------
 *  PENTING soal keamanan:
 *  Kunci API dibaca dari process.env.GEMINI_API_KEY dan TIDAK
 *  PERNAH dikirim ke browser. Frontend hanya memanggil endpoint
 *  milik kita sendiri (/api/saran-gear); server inilah yang
 *  menghubungi Google.
 *
 *  CATATAN PENTING soal pemilihan model (hasil pengujian nyata
 *  terhadap API Google pada 27 November 2026):
 *
 *    gemini-3.8-flash        -> 63.787 ms  (finishReason MAX_TOKENS)
 *    gemini-flash-latest     -> 84.268 ms  (finishReason MAX_TOKENS)
 *    gemini-3.5-flash-lite   ->  1.359 ms  (finishReason STOP)
 *    gemini-flash-lite-latest->  1.507 ms  (finishReason STOP)
 *    gemini-3.1-flash-lite   ->  1.942 ms  (finishReason STOP)
 *
 *  Model generasi "flash" terbaru melakukan penalaran panjang
 *  sebelum menjawab. Dua akibatnya:
 *    1. Lambat sekali (puluhan detik) sehingga melebihi batas
 *       waktu fungsi serverless Vercel.
 *    2. Token penalaran ikut memakan jatah maxOutputTokens,
 *       sehingga jawaban terpotong (MAX_TOKENS) walau HTTP 200.
 *
 *  Karena itu bawaan kita memakai model "flash-lite" yang
 *  menjawab lengkap dalam hitungan detik. Nama model tetap bisa
 *  ditimpa lewat GEMINI_MODEL (dipisah koma, dicoba berurutan)
 *  bila suatu saat Google memensiunkan salah satunya.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

// Dicoba berurutan dari kiri. Semuanya sudah diuji cepat dan lengkap.
const DAFTAR_MODEL_BAWAAN =
  'gemini-3.5-flash-lite,gemini-flash-lite-latest,gemini-3.1-flash-lite';

// 15 detik: cukup longgar untuk cold start Vercel, masih jauh di
// bawah batas durasi fungsi. Model lite biasanya selesai < 3 detik.
const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 15000);

// Harus lega. Kalau terlalu kecil, jawaban terpotong di tengah.
const MAX_TOKEN_KELUARAN = Number(process.env.GEMINI_MAX_TOKENS || 2000);

const kunci = () => (process.env.GEMINI_API_KEY || '').trim();
const geminiAktif = () => kunci().length > 0;

/** Daftar model yang akan dicoba berurutan. */
function daftarModel() {
  return (process.env.GEMINI_MODEL || DAFTAR_MODEL_BAWAAN)
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
}

const MODEL = daftarModel()[0];

/** Satu kali panggilan ke Google. */
async function panggil(model, prompt, headerAuth) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...headerAuth },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: MAX_TOKEN_KELUARAN,
        },
      }),
    });

    const teks = await res.text();

    if (!res.ok) {
      const err = new Error(`model ${model} ditolak (HTTP ${res.status})`);
      err.status = res.status;
      err.detail = teks.slice(0, 200);
      throw err;
    }

    const json = JSON.parse(teks);
    const kandidat = json?.candidates?.[0];
    const isi = kandidat?.content?.parts?.map((p) => p.text).join('') || '';

    // Jawaban terpotong karena jatah token habis: anggap gagal
    // supaya model berikutnya dicoba, bukan menampilkan kalimat
    // yang putus di tengah kepada pengguna.
    if (kandidat?.finishReason === 'MAX_TOKENS' && isi.trim().length < 120) {
      throw new Error(
        `model ${model} kehabisan token sebelum menjawab (finishReason MAX_TOKENS)`
      );
    }

    if (!isi.trim()) throw new Error(`model ${model} membalas kosong`);
    return isi.trim();
  } catch (error) {
    if (error.name === 'AbortError') {
      const e = new Error(`model ${model} tidak menjawab dalam ${TIMEOUT_MS} ms`);
      e.status = 408;
      throw e;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Meminta saran ke Gemini.
 * Mencoba tiap model berurutan; kalau satu model pensiun (404),
 * kelebihan beban (503), atau terlalu lambat, lanjut ke model
 * berikutnya. Gaya autentikasi dicoba dua macam karena format
 * kunci Google berbeda-beda.
 *
 * Melempar Error dengan properti .alasan yang aman ditampilkan
 * (tidak pernah memuat kunci API).
 */
async function mintaSaran(prompt) {
  if (!kunci()) {
    const e = new Error('GEMINI_API_KEY belum diisi di environment server');
    e.alasan = 'kunci API belum diatur';
    throw e;
  }

  const model = daftarModel();
  const jejak = [];
  let terakhir = null;

  for (const m of model) {
    try {
      return await panggil(m, prompt, { 'x-goog-api-key': kunci() });
    } catch (error) {
      terakhir = error;
      // Salah gaya autentikasi, bukan salah model: coba Bearer.
      if (error.status === 401 || error.status === 403) {
        try {
          return await panggil(m, prompt, { Authorization: `Bearer ${kunci()}` });
        } catch (e2) {
          terakhir = e2;
        }
      }
      jejak.push(terakhir.message);
      console.warn(`[MountTrack] ${terakhir.message}. Mencoba model berikutnya.`);
    }
  }

  const e = terakhir || new Error('Semua model Gemini gagal dihubungi');
  e.alasan = jejak.join(' | ');
  throw e;
}

module.exports = {
  mintaSaran,
  geminiAktif,
  MODEL,
  daftarModel,
  TIMEOUT_MS,
  MAX_TOKEN_KELUARAN,
};
