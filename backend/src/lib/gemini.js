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
 *  Soal nama model:
 *  Google rutin memensiunkan model lama. Pernah terjadi: model
 *  gemini-2.0-flash dijawab 404 "no longer available". Karena
 *  itu GEMINI_MODEL boleh diisi beberapa nama sekaligus,
 *  dipisah koma, dan akan dicoba berurutan sampai ada yang
 *  berhasil. Jadi saat satu model pensiun, aplikasi tidak mati.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

const DAFTAR_MODEL_BAWAAN = 'gemini-3.8-flash,gemini-flash-latest';
const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 8000);

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
        generationConfig: { temperature: 0.7, maxOutputTokens: 700 },
      }),
    });

    const teks = await res.text();
    if (!res.ok) {
      const err = new Error(`Gemini menolak model ${model} (HTTP ${res.status})`);
      err.status = res.status;
      err.detail = teks.slice(0, 200);
      throw err;
    }

    const json = JSON.parse(teks);
    const isi = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    if (!isi.trim()) throw new Error('Gemini membalas kosong');
    return isi.trim();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Meminta saran ke Gemini.
 * Mencoba tiap model berurutan; kalau satu model pensiun (404)
 * atau sedang kelebihan beban (503), lanjut ke model berikutnya.
 * Gaya autentikasi juga dicoba dua macam karena format kunci
 * Google berbeda-beda.
 */
async function mintaSaran(prompt) {
  if (!kunci()) throw new Error('GEMINI_API_KEY belum diisi');

  const model = daftarModel();
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
      console.warn(`[MountTrack] Model ${m} gagal: ${error.message}. Mencoba model berikutnya.`);
    }
  }

  throw terakhir || new Error('Semua model Gemini gagal dihubungi');
}

module.exports = { mintaSaran, geminiAktif, MODEL, daftarModel };
