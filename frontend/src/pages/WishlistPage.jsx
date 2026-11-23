/**
 * ============================================================
 *  HALAMAN WISHLIST
 *  Daftar gunung yang ingin didaki, tersimpan per pengguna
 *  di Supabase sehingga tetap ada walau ganti perangkat.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mountain, TrendingUp, Trash2 } from 'lucide-react';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import SafeImage from '../components/SafeImage.jsx';
import { DifficultyBadge } from '../components/DifficultyBadge.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews.jsx';
import { useWishlist } from '../context/useWishlist.js';

export default function WishlistPage() {
  const { idTersimpan, memuat: memuatWishlist, toggle } = useWishlist();
  const [semuaGunung, setSemuaGunung] = useState([]);
  const [memuatGunung, setMemuatGunung] = useState(true);
  const [error, setError] = useState('');

  const ambil = useCallback(async () => {
    setMemuatGunung(true); setError('');
    try {
      const { data } = await api.getGunungList();
      setSemuaGunung(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setMemuatGunung(false);
    }
  }, []);

  useEffect(() => { ambil(); }, [ambil]);

  const daftar = useMemo(
    () => semuaGunung.filter((g) => idTersimpan.includes(Number(g.id))),
    [semuaGunung, idTersimpan]
  );

  const totalKetinggian = useMemo(
    () => daftar.reduce((a, g) => a + (Number(g.ketinggian) || 0), 0),
    [daftar]
  );

  const memuat = memuatWishlist || memuatGunung;

  return (
    <>
      <PageHeader
        title="Wishlist Pendakian"
        subtitle="Gunung yang ingin kamu daki"
        icon={Heart}
      />

      <section className="page-pad">
        {memuat && <LoadingState jumlah={3} />}
        {!memuat && error && <ErrorState message={error} onRetry={ambil} />}

        {!memuat && !error && daftar.length === 0 && (
          <EmptyState
            title="Wishlist masih kosong"
            description="Buka halaman Gunung, pilih salah satu, lalu tekan ikon hati di pojok kanan atas untuk menyimpannya ke sini."
          />
        )}

        {!memuat && !error && daftar.length > 0 && (
          <>
            <div className="mb-3 flex items-center justify-between rounded-xl bg-white px-3.5 py-3 shadow-sm ring-1 ring-black/5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-forest-800/45">Total impian</p>
                <p className="text-sm font-bold text-forest-800">{daftar.length} gunung</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-forest-800/45">Akumulasi</p>
                <p className="flex items-center gap-1 text-sm font-bold text-forest-500">
                  <TrendingUp size={13} />
                  {totalKetinggian.toLocaleString('id-ID')} mdpl
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {daftar.map((g) => (
                <div key={g.id} className="card animate-fade-up">
                  <div className="flex gap-3">
                    <Link to={`/gunung/${g.id}`} className="shrink-0">
                      <SafeImage src={g.gambar_url} alt={g.nama} className="h-[112px] w-[100px] object-cover" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col justify-between py-2.5 pr-2.5">
                      <Link to={`/gunung/${g.id}`} className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-forest-800">{g.nama}</h2>
                        <p className="mt-0.5 truncate text-[11px] text-forest-800/60">{g.lokasi}</p>
                      </Link>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-forest-500">
                            <Mountain size={11} />
                            {Number(g.ketinggian).toLocaleString('id-ID')} mdpl
                          </span>
                          <DifficultyBadge level={g.tingkat_kesulitan} />
                        </div>
                        <button
                          type="button"
                          onClick={() => toggle(g.id)}
                          aria-label={`Hapus ${g.nama} dari wishlist`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 active:scale-95"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-center text-[11px] text-forest-800/45">
              Mau cek kesiapan perlengkapan untuk gunung-gunung ini? Buka menu My Gear.
            </p>
          </>
        )}
      </section>
    </>
  );
}
