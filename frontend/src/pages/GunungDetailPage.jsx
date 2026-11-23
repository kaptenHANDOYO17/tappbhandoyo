/**
 * ============================================================
 *  HALAMAN DETAIL 1 - RINCIAN GUNUNG
 *  Fitur: fetch detail by ID, tombol Back, grid informasi,
 *         format rupiah, error & loading handling.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Clock,
  Footprints,
  Mountain,
  MapPin,
  Ticket,
  TrendingUp,
} from 'lucide-react';
import api from '../api/client.js';
import SafeImage from '../components/SafeImage.jsx';
import BackButton from '../components/BackButton.jsx';
import WishlistButton from '../components/WishlistButton.jsx';
import { DifficultyBadge } from '../components/DifficultyBadge.jsx';
import { ErrorState, LoadingState, OfflineBanner } from '../components/StateViews.jsx';

function formatRupiah(angka) {
  const nilai = Number(angka);
  if (!Number.isFinite(nilai)) return '-';
  if (nilai === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(nilai);
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-forest-800/45">
        <Icon size={12} />
        {label}
      </p>
      <p className="mt-1.5 text-sm font-bold leading-snug text-forest-800">{value}</p>
    </div>
  );
}

export default function GunungDetailPage() {
  const { id } = useParams();
  const [gunung, setGunung] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cacheInfo, setCacheInfo] = useState(null);

  const ambilDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, fromCache, savedAt } = await api.getGunungDetail(id);
      setGunung(data);
      setCacheInfo(fromCache ? { savedAt } : null);
    } catch (err) {
      setError(err.message);
      setGunung(null);
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

  if (error || !gunung) {
    return (
      <section className="page-pad pt-5">
        <div className="mb-4">
          <BackButton
            fallback="/gunung"
            label="Kembali"
          />
        </div>
        <ErrorState
          message={error || 'Data gunung tidak tersedia.'}
          onRetry={ambilDetail}
        />
      </section>
    );
  }

  return (
    <>
      {/* HERO IMAGE + TOMBOL BACK */}
      <div className="relative">
        <SafeImage
          src={gunung.gambar_url}
          alt={gunung.nama}
          className="h-56 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-800/85 via-forest-800/20 to-transparent" />

        <div className="absolute left-4 right-4 top-4 flex items-start justify-between">
          <BackButton fallback="/gunung" label="Kembali" />
          <WishlistButton gunungId={gunung.id} />
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <DifficultyBadge level={gunung.tingkat_kesulitan} />
          <h1 className="mt-2 text-xl font-bold leading-tight">{gunung.nama}</h1>
          <p className="mt-1 flex items-center gap-1 text-xs text-white/85">
            <MapPin size={12} />
            {gunung.lokasi}
          </p>
        </div>
      </div>

      <section className="page-pad">
        {cacheInfo && <OfflineBanner savedAt={cacheInfo.savedAt} />}

        {/* GRID INFORMASI UTAMA */}
        <div className="grid grid-cols-2 gap-2.5">
          <InfoBox
            icon={TrendingUp}
            label="Ketinggian"
            value={`${Number(gunung.ketinggian).toLocaleString('id-ID')} mdpl`}
          />
          <InfoBox icon={Clock} label="Estimasi Waktu" value={gunung.estimasi_waktu} />
          <InfoBox icon={Footprints} label="Jalur Populer" value={gunung.jalur_populer} />
          <InfoBox
            icon={Ticket}
            label="Harga Tiket"
            value={formatRupiah(gunung.harga_tiket)}
          />
        </div>

        {/* DESKRIPSI */}
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-forest-800">
            <Mountain size={16} className="text-forest-500" />
            Tentang Gunung Ini
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-forest-800/75">
            {gunung.deskripsi}
          </p>
        </div>

        {/* CATATAN KESELAMATAN */}
        <div className="mt-3 rounded-2xl bg-forest-100/70 p-4 ring-1 ring-forest-200">
          <h3 className="text-xs font-bold text-forest-600">Catatan Keselamatan</h3>
          <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-forest-700/85">
            <li>• Lapor dan daftar resmi di basecamp sebelum memulai pendakian.</li>
            <li>• Cek prakiraan cuaca serta status jalur terbaru dari pengelola.</li>
            <li>• Bawa perlengkapan wajib sesuai katalog pada menu Alat.</li>
            <li>• Jangan mendaki sendiri dan bawa turun kembali seluruh sampah.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
