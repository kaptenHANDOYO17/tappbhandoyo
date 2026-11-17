/**
 * ============================================================
 *  HALAMAN DETAIL 2 - RINCIAN PERLENGKAPAN
 *  Menampilkan fungsi alat, berat ideal, kategori, prioritas,
 *  dan peringatan risiko bila alat tidak dibawa + tombol Back.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertOctagon, CheckCircle2, Tag, Weight, Wrench } from 'lucide-react';
import api from '../api/client.js';
import SafeImage from '../components/SafeImage.jsx';
import BackButton from '../components/BackButton.jsx';
import { PriorityBadge } from '../components/DifficultyBadge.jsx';
import { ErrorState, LoadingState, OfflineBanner } from '../components/StateViews.jsx';

export default function AlatDetailPage() {
  const { id } = useParams();
  const [alat, setAlat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cacheInfo, setCacheInfo] = useState(null);

  const ambilDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, fromCache, savedAt } = await api.getAlatDetail(id);
      setAlat(data);
      setCacheInfo(fromCache ? { savedAt } : null);
    } catch (err) {
      setError(err.message);
      setAlat(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    ambilDetail();
  }, [ambilDetail]);

  if (loading) {
    return (
      <section className="page-pad pt-5">
        <LoadingState jumlah={3} />
      </section>
    );
  }

  if (error || !alat) {
    return (
      <section className="page-pad pt-5">
        <div className="mb-4 inline-block rounded-xl bg-forest-600 p-0.5">
          <BackButton fallback="/alat" label="Kembali" />
        </div>
        <ErrorState
          message={error || 'Data perlengkapan tidak tersedia.'}
          onRetry={ambilDetail}
        />
      </section>
    );
  }

  return (
    <>
      {/* HEADER DETAIL */}
      <header className="bg-forest-600 px-4 pb-5 pt-4 text-white">
        <BackButton fallback="/alat" label="Kembali" />

        <div className="mt-4 flex items-center gap-3.5">
          <SafeImage
            src={alat.gambar_url}
            alt={alat.nama}
            className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-white/25"
          />
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight">{alat.nama}</h1>
            <p className="mt-1 flex items-center gap-1 text-xs text-forest-100/90">
              <Tag size={12} />
              {alat.kategori}
            </p>
            <div className="mt-2">
              <PriorityBadge level={alat.prioritas} />
            </div>
          </div>
        </div>
      </header>

      <section className="page-pad">
        {cacheInfo && <OfflineBanner savedAt={cacheInfo.savedAt} />}

        {/* BERAT IDEAL & PRIORITAS */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-forest-800/45">
              <Weight size={12} />
              Berat Ideal
            </p>
            <p className="mt-1.5 text-sm font-bold text-forest-800">{alat.berat_ideal}</p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-forest-800/45">
              <CheckCircle2 size={12} />
              Prioritas
            </p>
            <p className="mt-1.5 text-sm font-bold text-forest-800">{alat.prioritas}</p>
          </div>
        </div>

        {/* FUNGSI ALAT */}
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-forest-800">
            <Wrench size={16} className="text-forest-500" />
            Fungsi Perlengkapan
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-forest-800/75">
            {alat.fungsi}
          </p>
        </div>

        {/* PERINGATAN RISIKO */}
        <div className="mt-3 rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
          <h2 className="flex items-center gap-2 text-sm font-bold text-rose-700">
            <AlertOctagon size={16} />
            Risiko Jika Tidak Dibawa
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-rose-900/80">
            {alat.risiko_tanpa_alat}
          </p>
        </div>
      </section>
    </>
  );
}
