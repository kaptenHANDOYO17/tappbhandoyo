/**
 * ============================================================
 *  HALAMAN LIST 1 - DAFTAR GUNUNG
 *  Fitur: fetch REST API, search bar, filter tingkat kesulitan,
 *         badge kesulitan, loading & error handling.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Mountain } from 'lucide-react';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import SearchBar from '../components/SearchBar.jsx';
import GunungCard from '../components/GunungCard.jsx';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineBanner,
} from '../components/StateViews.jsx';

const FILTER_KESULITAN = ['Semua', 'Pemula', 'Menengah', 'Sulit'];

export default function GunungListPage() {
  const [daftarGunung, setDaftarGunung] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [kesulitan, setKesulitan] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cacheInfo, setCacheInfo] = useState(null);

  const ambilData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, fromCache, savedAt } = await api.getGunungList();
      setDaftarGunung(Array.isArray(data) ? data : []);
      setCacheInfo(fromCache ? { savedAt } : null);
    } catch (err) {
      setError(err.message);
      setDaftarGunung([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    ambilData();
  }, [ambilData]);

  // Pencarian + filter dijalankan di sisi client agar terasa instan.
  const hasilTampil = useMemo(() => {
    const kata = keyword.trim().toLowerCase();

    return daftarGunung.filter((gunung) => {
      const cocokKeyword =
        !kata ||
        String(gunung.nama).toLowerCase().includes(kata) ||
        String(gunung.lokasi).toLowerCase().includes(kata);

      const cocokKesulitan =
        kesulitan === 'Semua' ||
        String(gunung.tingkat_kesulitan).toLowerCase() === kesulitan.toLowerCase();

      return cocokKeyword && cocokKesulitan;
    });
  }, [daftarGunung, keyword, kesulitan]);

  return (
    <>
      <PageHeader
        title="Jalur Pendakian"
        subtitle="Informasi gunung & jalur populer di Indonesia"
        icon={Mountain}
      >
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          placeholder="Cari nama gunung atau lokasi..."
        />

        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
          {FILTER_KESULITAN.map((level) => {
            const aktif = kesulitan === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setKesulitan(level)}
                aria-pressed={aktif}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors ${
                  aktif
                    ? 'bg-white text-forest-600'
                    : 'bg-white/15 text-white/85 hover:bg-white/25'
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </PageHeader>

      <section className="page-pad">
        {cacheInfo && <OfflineBanner savedAt={cacheInfo.savedAt} />}

        {loading && <LoadingState jumlah={4} />}

        {!loading && error && <ErrorState message={error} onRetry={ambilData} />}

        {!loading && !error && (
          <>
            <p className="mb-3 text-[11px] font-medium text-forest-800/55">
              Menampilkan {hasilTampil.length} dari {daftarGunung.length} gunung
            </p>

            {hasilTampil.length === 0 ? (
              <EmptyState
                title="Gunung tidak ditemukan"
                description="Coba ubah kata kunci pencarian atau pilih filter tingkat kesulitan yang lain."
              />
            ) : (
              <div className="space-y-3">
                {hasilTampil.map((gunung) => (
                  <GunungCard key={gunung.id} gunung={gunung} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
