/**
 * ============================================================
 *  API CLIENT (fetch + error handling + cache localStorage)
 * ------------------------------------------------------------
 *  - Semua request ke REST API backend lewat satu pintu ini.
 *  - Respons sukses disimpan ke localStorage, sehingga saat
 *    offline aplikasi masih bisa menampilkan data terakhir
 *    (data persistence sesuai materi modul PWA).
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

const CACHE_PREFIX = 'mounttrack:cache:';
const REQUEST_TIMEOUT = 10000; // 10 detik

/* --------------------------- CACHE --------------------------- */

function simpanCache(key, payload) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ savedAt: Date.now(), payload })
    );
  } catch (error) {
    // Kuota localStorage penuh / mode private: diabaikan saja.
  }
}

function bacaCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

/* ------------------------ CORE REQUEST ----------------------- */

/**
 * Melakukan GET request dengan timeout, error handling,
 * dan fallback ke cache localStorage bila jaringan gagal.
 *
 * @param {string} path contoh: '/api/gunung'
 * @returns {Promise<{data: any, fromCache: boolean, savedAt: number|null}>}
 */
async function request(path) {
  const url = `${BASE_URL}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const pesan =
        response.status === 404
          ? 'Data yang kamu cari tidak ditemukan di server.'
          : `Server merespons dengan status ${response.status}.`;
      const error = new Error(pesan);
      error.status = response.status;
      throw error;
    }

    const json = await response.json();
    const payload = json?.data ?? json;

    simpanCache(path, payload);
    return { data: payload, fromCache: false, savedAt: null };
  } catch (error) {
    // Error 404 dari server tidak perlu ditimpa data cache.
    if (error.status !== 404) {
      const cached = bacaCache(path);
      if (cached) {
        return { data: cached.payload, fromCache: true, savedAt: cached.savedAt };
      }
    }

    if (error.name === 'AbortError') {
      throw new Error(
        'Permintaan ke server terlalu lama (timeout). Periksa koneksi atau pastikan backend berjalan.'
      );
    }

    if (error.status) throw error;

    throw new Error(
      `Tidak dapat terhubung ke server API (${BASE_URL}). Pastikan backend sudah dijalankan dengan "npm run dev".`
    );
  } finally {
    clearTimeout(timer);
  }
}

/* -------------------------- ENDPOINTS ------------------------ */


/**
 * Meminta saran persiapan ke backend (yang meneruskan ke Gemini).
 * Dibuat POST karena mengirim daftar alat yang dimiliki.
 * Kunci Gemini TIDAK ada di sini; semuanya ditangani server.
 */
async function postSaranGear(gunungId, alatDimiliki) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(`${BASE_URL}/api/saran-gear`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ gunung_id: gunungId, alat_dimiliki: alatDimiliki }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || `Server merespons status ${res.status}.`);
    }
    return { data: json.data, sumber: json.sumber };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Permintaan saran terlalu lama. Coba lagi sebentar.');
    }
    throw new Error(
      error.message?.includes('fetch')
        ? `Tidak dapat terhubung ke server API (${BASE_URL}).`
        : error.message
    );
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  baseUrl: BASE_URL,
  getGunungList: () => request('/api/gunung'),
  getGunungDetail: (id) => request(`/api/gunung/${id}`),
  getAlatList: () => request('/api/alat'),
  getAlatDetail: (id) => request(`/api/alat/${id}`),
  postSaranGear,
};

export default api;
