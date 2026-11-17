/**
 * ============================================================
 *  DATA SERVICE (REPOSITORY LAYER)
 * ------------------------------------------------------------
 *  Satu-satunya pintu akses data untuk controller.
 *  Mencoba Supabase lebih dulu; bila tidak aktif ATAU query
 *  gagal, otomatis jatuh ke data array JSON lokal.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

const { supabase, isSupabaseEnabled, tableNames } = require('./supabase');
const gunungFallback = require('../data/gunung');
const alatFallback = require('../data/alat');

const fallbackStore = {
  gunung: gunungFallback,
  alat: alatFallback,
};

/**
 * Batas waktu query Supabase (milidetik).
 * Tanpa batas ini, Supabase yang lambat / tidak terjangkau membuat
 * seluruh request API menggantung sampai timeout bawaan jaringan
 * (pernah terukur ~7 detik). Dengan batas ini, server cepat
 * berpindah ke fallback data lokal sehingga API tetap responsif.
 */
const QUERY_TIMEOUT_MS = Number(process.env.SUPABASE_TIMEOUT_MS || 4000);

/** Menjalankan query Supabase dengan batas waktu di atas. */
function denganBatasWaktu(builder) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS);

  return builder
    .abortSignal(controller.signal)
    .then((hasil) => {
      clearTimeout(timer);
      return hasil;
    })
    .catch((error) => {
      clearTimeout(timer);
      if (error.name === 'AbortError') {
        throw new Error(`Supabase tidak merespons dalam ${QUERY_TIMEOUT_MS} ms`);
      }
      throw error;
    });
}

/**
 * Ambil seluruh baris dari sebuah resource.
 * @param {'gunung'|'alat'} resource
 * @returns {Promise<{data: Array, source: 'supabase'|'fallback'}>}
 */
async function findAll(resource) {
  if (isSupabaseEnabled) {
    try {
      const { data, error } = await denganBatasWaktu(
        supabase.from(tableNames[resource]).select('*').order('id', { ascending: true })
      );

      if (error) throw error;
      if (Array.isArray(data) && data.length > 0) {
        return { data, source: 'supabase' };
      }
      console.warn(
        `[MountTrack] Tabel "${tableNames[resource]}" kosong, memakai fallback data lokal.`
      );
    } catch (error) {
      console.warn(
        `[MountTrack] Query Supabase gagal (${error.message}), memakai fallback data lokal.`
      );
    }
  }

  return { data: fallbackStore[resource], source: 'fallback' };
}

/**
 * Ambil satu baris berdasarkan ID.
 * @param {'gunung'|'alat'} resource
 * @param {number} id
 * @returns {Promise<{data: object|null, source: 'supabase'|'fallback'}>}
 */
async function findById(resource, id) {
  if (isSupabaseEnabled) {
    try {
      const { data, error } = await denganBatasWaktu(
        supabase.from(tableNames[resource]).select('*').eq('id', id).maybeSingle()
      );

      if (error) throw error;
      if (data) return { data, source: 'supabase' };
    } catch (error) {
      console.warn(
        `[MountTrack] Query detail Supabase gagal (${error.message}), memakai fallback data lokal.`
      );
    }
  }

  const found = fallbackStore[resource].find((item) => Number(item.id) === Number(id));
  return { data: found || null, source: 'fallback' };
}

module.exports = { findAll, findById };
