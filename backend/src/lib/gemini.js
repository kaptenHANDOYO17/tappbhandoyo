/**
 * ============================================================
 *  KLIEN GEMINI (SISI SERVER SAJA)
 * ------------------------------------------------------------
 *  PENTING soal keamanan:
 *  Kunci API dibaca dari process.env.GEMINI_API_KEY dan TIDAK
 *  PERNAH dikirim ke browser. Frontend hanya memanggil
 *  endpoint milik kita sendiri (/api/saran-gear), lalu server
 *  inilah yang menghubungi Google. Kalau kunci ditaruh di
 *  frontend (VITE_...), isinya ikut terbundel ke JavaScript
 *  dan bisa dibaca siapa pun lewat DevTools.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 8000);

function kunci() {
  return (process.env.GEMINI_API_KEY || '').trim();
}

const geminiAktif = () => kunci().length > 0;

/**
 * Memanggil Gemini satu kali dengan header tertentu.
 * Dipisah supaya bisa dicoba dua gaya autentikasi:
 * - x-goog-api-key  : untuk API key biasa (AIza...)
 * - Authorization   : untuk token bergaya OAuth (AQ...)
 */
async function panggil(prompt, headerAuth) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
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
      const err = new Error(`Gemini menolak (HTTP ${res.status})`);
      err.status = res.status;
      err.detail = teks.slice(0, 300);
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
 * Meminta saran ke Gemini. Mencoba dua gaya autentikasi
 * karena format kunci Google berbeda-beda.
 * @returns {Promise<string>} teks saran
 */
async function mintaSaran(prompt) {
  const k = kunci();
  if (!k) throw new Error('GEMINI_API_KEY belum diisi');

  try {
    return await panggil(prompt, { 'x-goog-api-key': k });
  } catch (error) {
    // 401/403 berarti gaya autentikasinya salah, bukan promptnya.
    if (error.status === 401 || error.status === 403) {
      return await panggil(prompt, { Authorization: `Bearer ${k}` });
    }
    throw error;
  }
}

module.exports = { mintaSaran, geminiAktif, MODEL };
