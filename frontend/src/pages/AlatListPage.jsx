/**
 * ============================================================
 *  HALAMAN LIST 2 - KATALOG PERLENGKAPAN PENDAKIAN
 *  Fitur: fetch REST API, filter kategori dinamis, search,
 *         ringkasan total berat, loading & error handling.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Backpack, Weight } from 'lucide-react';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import SearchBar from '../components/SearchBar.jsx';
import AlatCard from '../components/AlatCard.jsx';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineBanner,
} from '../components/StateViews.jsx';

/** Mengubah "2.1 kg" menjadi angka 2.1 untuk dijumlahkan */
function parseBerat(teks) {
  const angka = parseFloat(String(teks).replace(',', '.'));
  return Number.isFinite(angka) ? angka : 0;
}

export default function AlatListPage() {
  const [daftarAlat, setDaftarAlat] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [kategori, setKategori] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cacheInfo, setCacheInfo] = useState(null);

  const ambilData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, fromCache, savedAt } = await api.getAlatList();
      setDaftarAlat(Array.isArray(data) ? data : []);
      setCacheInfo(fromCache ? { savedAt } : null);
    } catch (err) {
      setError(err.message);
      setDaftarAlat([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    ambilData();
  }, [ambilData]);

  // Daftar kategori dibangun otomatis dari data API.
  const daftarKategori = useMemo(() => {
    const unik = [...new Set(daftarAlat.map((item) => item.kategori))];
    return ['Semua', ...unik];
  }, [daftarAlat]);

  const hasilTampil = useMemo(() => {
    const kata = keyword.trim().toLowerCase();

    return daftarAlat.filter((alat) => {
      const cocokKeyword =
        !kata ||
        String(alat.nama).toLowerCase().includes(kata) ||
        String(alat.kategori).toLowerCase().includes(kata);

      const cocokKategori = kategori === 'Semua' || alat.kategori === kategori;

      return cocokKeyword && cocokKategori;
    });
  }, [daftarAlat, keyword, kategori]);

  const totalBerat = useMemo(
    () => hasilTampil.reduce((akumulasi, alat) => akumulasi + parseBerat(alat.berat_ideal), 0),
    [hasilTampil]
  );

  return (
    <>
      <PageHeader
        title="Perlengkapan Gunung"
        subtitle="Katalog alat, berat ideal & tingkat prioritas"
        icon={Backpack}
      >
        <SearchBar
          value={keyword}
          onChange={setKeyword}
          placeholder="Cari nama perlengkapan..."
        />

        {/* FILTER KATEGORI */}
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
          {daftarKategori.map((item) => {
            const aktif = kategori === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setKategori(item)}
                aria-pressed={aktif}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors ${
                  aktif
                    ? 'bg-white text-forest-600'
                    : 'bg-white/15 text-white/85 hover:bg-white/25'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </PageHeader>

      <section className="page-pad">
        {cacheInfo && <OfflineBanner savedAt={cacheInfo.savedAt} />}

        {loading && <LoadingState jumlah={5} />}

        {!loading && error && <ErrorState message={error} onRetry={ambilData} />}

        {!loading && !error && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-medium text-forest-800/55">
                {hasilTampil.length} perlengkapan
              </p>
              <p className="flex items-center gap-1 text-[11px] font-semibold text-forest-500">
                <Weight size={12} />
                Total ± {totalBerat.toFixed(2)} kg
              </p>
            </div>

            {hasilTampil.length === 0 ? (
              <EmptyState
                title="Perlengkapan tidak ditemukan"
                description="Coba kata kunci lain atau pilih kategori yang berbeda."
              />
            ) : (
              <div className="space-y-3">
                {hasilTampil.map((alat) => (
                  <AlatCard key={alat.id} alat={alat} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
