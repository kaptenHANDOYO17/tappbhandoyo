/**
 * ============================================================
 *  HALAMAN WISHLIST
 * ------------------------------------------------------------
 *  Daftar gunung yang ingin didaki, tersimpan per pengguna di
 *  Supabase sehingga tetap ada walau ganti perangkat.
 *
 *  Penghapusan memakai SOFT DELETE: baris tidak langsung dibuang
 *  dari database, melainkan ditandai waktu hapusnya. Dampaknya
 *  untuk pengguna:
 *    - ada tombol "Batalkan" tepat setelah menghapus,
 *    - ada tab Tempat Sampah untuk memulihkan kapan saja,
 *    - pembuangan permanen harus dilakukan secara sadar.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Mountain, TrendingUp, Trash2, Undo2, RotateCcw, Trash,
} from 'lucide-react';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import SafeImage from '../components/SafeImage.jsx';
import { DifficultyBadge } from '../components/DifficultyBadge.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews.jsx';
import { useWishlist } from '../context/useWishlist.js';

export default function WishlistPage() {
  const {
    idTersimpan, idTerhapus, memuat: memuatWishlist,
    hapus, pulihkan, hapusPermanen, kosongkanSampah,
  } = useWishlist();

  const [semuaGunung, setSemuaGunung] = useState([]);
  const [memuatGunung, setMemuatGunung] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('aktif');          // aktif | sampah
  const [baruDihapus, setBaruDihapus] = useState(null);
  const [konfirmasiKosongkan, setKonfirmasiKosongkan] = useState(false);

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
  const daftarSampah = useMemo(
    () => semuaGunung.filter((g) => idTerhapus.includes(Number(g.id))),
    [semuaGunung, idTerhapus]
  );

  const totalKetinggian = useMemo(
    () => daftar.reduce((a, g) => a + (Number(g.ketinggian) || 0), 0),
    [daftar]
  );

  const memuat = memuatWishlist || memuatGunung;

  const hapusGunung = async (g) => {
    await hapus(g.id);
    setBaruDihapus(g);
    // Tawaran membatalkan muncul sebentar saja, lalu menghilang sendiri.
    setTimeout(() => setBaruDihapus((s) => (s?.id === g.id ? null : s)), 8000);
  };

  /** Satu baris gunung, dipakai di tab aktif maupun tab sampah. */
  const BarisGunung = ({ g, mode }) => (
    <div className={`card animate-fade-up ${mode === 'sampah' ? 'opacity-75' : ''}`}>
      <div className="flex gap-3">
        <Link to={`/gunung/${g.id}`} className="shrink-0">
          <SafeImage
            src={g.gambar_url} alt={g.nama}
            className={`h-[112px] w-[100px] object-cover ${mode === 'sampah' ? 'grayscale' : ''}`}
          />
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

            {mode === 'aktif' ? (
              <button
                type="button" onClick={() => hapusGunung(g)}
                aria-label={`Hapus ${g.nama} dari wishlist`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50
                           text-rose-600 active:scale-95"
              >
                <Trash2 size={14} />
              </button>
            ) : (
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button" onClick={() => pulihkan(g.id)}
                  aria-label={`Pulihkan ${g.nama}`}
                  className="flex h-8 items-center gap-1 rounded-lg bg-forest-100 px-2
                             text-[11px] font-semibold text-forest-700 active:scale-95"
                >
                  <RotateCcw size={13} /> Pulihkan
                </button>
                <button
                  type="button" onClick={() => hapusPermanen(g.id)}
                  aria-label={`Hapus ${g.nama} selamanya`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50
                             text-rose-600 active:scale-95"
                >
                  <Trash size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader title="Wishlist Pendakian" subtitle="Gunung yang ingin kamu daki" icon={Heart} />

      <section className="page-pad">
        {/* ---------- TAB ---------- */}
        <div className="mb-3 flex gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/5">
          {[
            { id: 'aktif',  label: `Daftar (${daftar.length})` },
            { id: 'sampah', label: `Terhapus (${daftarSampah.length})` },
          ].map((t) => (
            <button
              key={t.id} type="button" onClick={() => setTab(t.id)}
              aria-current={tab === t.id}
              className={`flex-1 rounded-lg py-2 text-[11px] font-semibold transition-colors ${
                tab === t.id ? 'bg-forest-600 text-white' : 'text-forest-800/55'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ---------- TAWARAN BATALKAN ---------- */}
        {baruDihapus && tab === 'aktif' && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-forest-800 p-3 text-white">
            <p className="min-w-0 flex-1 truncate text-[11px]">
              {baruDihapus.nama} dipindahkan ke Terhapus.
            </p>
            <button
              type="button"
              onClick={async () => { await pulihkan(baruDihapus.id); setBaruDihapus(null); }}
              className="flex shrink-0 items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5
                         text-[11px] font-semibold active:scale-95"
            >
              <Undo2 size={13} /> Batalkan
            </button>
          </div>
        )}

        {memuat && <LoadingState jumlah={3} />}
        {!memuat && error && <ErrorState message={error} onRetry={ambil} />}

        {/* ---------- TAB DAFTAR AKTIF ---------- */}
        {!memuat && !error && tab === 'aktif' && (
          daftar.length === 0 ? (
            <EmptyState
              title="Wishlist masih kosong"
              description="Buka halaman Gunung, pilih salah satu, lalu tekan ikon hati di pojok kanan atas untuk menyimpannya ke sini."
            />
          ) : (
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
                {daftar.map((g) => <BarisGunung key={g.id} g={g} mode="aktif" />)}
              </div>

              <p className="mt-4 text-center text-[11px] text-forest-800/45">
                Mau cek kesiapan perlengkapan untuk gunung-gunung ini? Buka menu My Gear.
              </p>
            </>
          )
        )}

        {/* ---------- TAB TEMPAT SAMPAH ---------- */}
        {!memuat && !error && tab === 'sampah' && (
          daftarSampah.length === 0 ? (
            <EmptyState
              title="Tidak ada yang terhapus"
              description="Gunung yang kamu hapus dari wishlist akan singgah di sini dulu, jadi masih bisa dipulihkan kalau ternyata berubah pikiran."
            />
          ) : (
            <>
              <p className="mb-3 rounded-xl bg-forest-100/60 p-3 text-[11px] leading-relaxed text-forest-800/70 ring-1 ring-forest-200">
                Gunung di bawah ini sudah tidak muncul di daftar utama, tetapi datanya masih tersimpan.
                Tekan Pulihkan untuk mengembalikannya.
              </p>

              <div className="space-y-3">
                {daftarSampah.map((g) => <BarisGunung key={g.id} g={g} mode="sampah" />)}
              </div>

              {!konfirmasiKosongkan ? (
                <button
                  type="button" onClick={() => setKonfirmasiKosongkan(true)}
                  className="mt-4 w-full rounded-xl bg-white py-3 text-[11px] font-semibold text-rose-600
                             shadow-sm ring-1 ring-rose-200 active:scale-[0.98]"
                >
                  Kosongkan Tempat Sampah
                </button>
              ) : (
                <div className="mt-4 rounded-xl bg-rose-50 p-3.5 ring-1 ring-rose-200">
                  <p className="text-[11px] leading-relaxed text-rose-800">
                    {daftarSampah.length} gunung akan dibuang permanen dari database. Tindakan ini tidak bisa dibatalkan.
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="button" onClick={() => setKonfirmasiKosongkan(false)}
                      className="flex-1 rounded-lg bg-white py-2 text-[11px] font-semibold text-forest-800
                                 ring-1 ring-black/5 active:scale-95"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={async () => { await kosongkanSampah(); setKonfirmasiKosongkan(false); }}
                      className="flex-1 rounded-lg bg-rose-600 py-2 text-[11px] font-semibold text-white active:scale-95"
                    >
                      Ya, buang permanen
                    </button>
                  </div>
                </div>
              )}
            </>
          )
        )}
      </section>
    </>
  );
}
