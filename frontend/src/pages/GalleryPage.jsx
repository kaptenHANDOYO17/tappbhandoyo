/**
 * ============================================================
 *  HALAMAN MY GALLERY
 * ------------------------------------------------------------
 *  Tempat pendaki mengabadikan momen pendakiannya. Satu
 *  postingan bisa memuat beberapa foto yang ditampilkan sebagai
 *  carousel, ditambah judul, cerita, gunung, dan tanggal.
 *
 *  Penghapusan memakai soft delete dan disertai tombol
 *  "Batalkan", supaya kenangan tidak hilang karena salah tekan.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Images, Plus, X, Trash2, CalendarDays, Mountain, Undo2, ImagePlus, RefreshCw,
} from 'lucide-react';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import Carousel from '../components/Carousel.jsx';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews.jsx';
import { useGaleri, MAKS_FOTO } from '../context/useGaleri.js';

const KOSONG = { judul: '', cerita: '', gunungId: '', tanggal: '' };

function tanggalIndo(nilai) {
  if (!nilai) return '';
  return new Date(nilai).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function GalleryPage() {
  const { postingan, memuat, error, tambah, hapus, pulihkan, muatUlang } = useGaleri();

  const [bukaForm, setBukaForm] = useState(false);
  const [form, setForm] = useState(KOSONG);
  const [berkas, setBerkas] = useState([]);
  const [pratinjau, setPratinjau] = useState([]);
  const [proses, setProses] = useState('');
  const [pesanForm, setPesanForm] = useState('');
  const [baruDihapus, setBaruDihapus] = useState(null);
  const [daftarGunung, setDaftarGunung] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    api.getGunungList()
      .then((r) => setDaftarGunung(Array.isArray(r.data) ? r.data : []))
      .catch(() => setDaftarGunung([]));
  }, []);

  // URL pratinjau dibuat lokal, dan dilepas lagi saat tidak dipakai
  // supaya tidak membebani memori browser.
  useEffect(() => {
    const urls = berkas.map((f) => URL.createObjectURL(f));
    setPratinjau(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [berkas]);

  const namaGunung = useMemo(() => {
    const peta = {};
    daftarGunung.forEach((g) => { peta[String(g.id)] = g.nama; });
    return peta;
  }, [daftarGunung]);

  const pilihBerkas = (e) => {
    const dipilih = Array.from(e.target.files || []).slice(0, MAKS_FOTO);
    setBerkas(dipilih);
    setPesanForm('');
  };

  const buangSatu = (i) => setBerkas((lama) => lama.filter((_, idx) => idx !== i));

  const tutupForm = () => {
    setBukaForm(false); setForm(KOSONG); setBerkas([]); setPesanForm(''); setProses('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const simpan = async (e) => {
    e.preventDefault();
    setPesanForm(''); setProses('Menyiapkan foto...');
    const hasil = await tambah(form, berkas, (n, total) =>
      setProses(`Mengunggah foto ${n} dari ${total}...`));
    setProses('');
    if (hasil.error) { setPesanForm(hasil.error); return; }
    tutupForm();
  };

  const hapusPost = async (p) => {
    await hapus(p.id);
    setBaruDihapus(p);
    // Tawaran membatalkan hanya muncul sebentar, lalu hilang sendiri.
    setTimeout(() => setBaruDihapus((s) => (s?.id === p.id ? null : s)), 8000);
  };

  return (
    <>
      <PageHeader title="My Gallery" subtitle="Abadikan momen pendakianmu" icon={Images} />

      <section className="page-pad">
        {/* ---------- TOMBOL TAMBAH ---------- */}
        {!bukaForm && (
          <button
            type="button"
            onClick={() => setBukaForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest-600 py-3
                       text-xs font-semibold text-white active:scale-[0.98]"
          >
            <Plus size={16} /> Tambah Momen Pendakian
          </button>
        )}

        {/* ---------- FORM POSTINGAN BARU ---------- */}
        {bukaForm && (
          <form onSubmit={simpan} className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-forest-800">Momen baru</h2>
              <button type="button" onClick={tutupForm} aria-label="Tutup form"
                      className="rounded-lg p-1 text-forest-800/50 active:scale-95">
                <X size={18} />
              </button>
            </div>

            <label className="mt-3 block text-[11px] font-semibold text-forest-800/70" htmlFor="judul">
              Judul momen
            </label>
            <input
              id="judul" required maxLength={80} value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              placeholder="Sunrise pertama di Prau"
              className="mt-1 w-full rounded-xl border-0 bg-sand px-3.5 py-2.5 text-sm text-forest-800
                         shadow-sm ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-forest-300"
            />

            <label className="mt-3 block text-[11px] font-semibold text-forest-800/70" htmlFor="cerita">
              Cerita <span className="font-normal text-forest-800/40">(boleh dikosongkan)</span>
            </label>
            <textarea
              id="cerita" rows={4} maxLength={1200} value={form.cerita}
              onChange={(e) => setForm({ ...form, cerita: e.target.value })}
              placeholder="Berangkat jam 2 pagi dari basecamp Patak Banteng, sempat kehabisan napas di pos 2..."
              className="mt-1 w-full resize-y rounded-xl border-0 bg-sand px-3.5 py-2.5 text-sm leading-relaxed
                         text-forest-800 shadow-sm ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-forest-300"
            />

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-forest-800/70" htmlFor="gunung">Gunung</label>
                <select
                  id="gunung" value={form.gunungId}
                  onChange={(e) => setForm({ ...form, gunungId: e.target.value })}
                  className="mt-1 w-full rounded-xl border-0 bg-sand px-3 py-2.5 text-[12px] text-forest-800
                             shadow-sm ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-forest-300"
                >
                  <option value="">-- pilih --</option>
                  {daftarGunung.map((g) => <option key={g.id} value={g.id}>{g.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-forest-800/70" htmlFor="tanggal">Tanggal</label>
                <input
                  id="tanggal" type="date" value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                  className="mt-1 w-full rounded-xl border-0 bg-sand px-3 py-2.5 text-[12px] text-forest-800
                             shadow-sm ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-forest-300"
                />
              </div>
            </div>

            {/* pilih foto */}
            <label className="mt-3 block text-[11px] font-semibold text-forest-800/70" htmlFor="foto">
              Foto <span className="font-normal text-forest-800/40">(maksimal {MAKS_FOTO}, bisa pilih sekaligus)</span>
            </label>
            <input
              id="foto" ref={inputRef} type="file" accept="image/*" multiple onChange={pilihBerkas}
              className="mt-1 w-full rounded-xl bg-sand p-2.5 text-[11px] text-forest-800/70
                         file:mr-2 file:rounded-lg file:border-0 file:bg-forest-600 file:px-3 file:py-1.5
                         file:text-[11px] file:font-semibold file:text-white"
            />

            {pratinjau.length > 0 && (
              <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
                {pratinjau.map((u, i) => (
                  <div key={u} className="relative shrink-0">
                    <img src={u} alt={`Pratinjau ${i + 1}`}
                         className="h-16 w-16 rounded-lg object-cover ring-1 ring-black/10" />
                    <button
                      type="button" onClick={() => buangSatu(i)} aria-label={`Buang foto ${i + 1}`}
                      className="absolute -right-1 -top-1 rounded-full bg-rose-500 p-0.5 text-white"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {pesanForm && (
              <p className="mt-2.5 rounded-lg bg-rose-50 p-2.5 text-[11px] leading-relaxed text-rose-700">
                {pesanForm}
              </p>
            )}

            <button
              type="submit" disabled={Boolean(proses)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-600 py-3
                         text-xs font-semibold text-white active:scale-[0.98] disabled:opacity-60"
            >
              {proses ? <RefreshCw size={15} className="animate-spin" /> : <ImagePlus size={15} />}
              {proses || 'Simpan Momen'}
            </button>
          </form>
        )}

        {/* ---------- TAWARAN BATALKAN HAPUS ---------- */}
        {baruDihapus && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-forest-800 p-3 text-white">
            <p className="min-w-0 flex-1 truncate text-[11px]">
              &ldquo;{baruDihapus.judul}&rdquo; dipindahkan ke terhapus.
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

        {/* ---------- DAFTAR POSTINGAN ---------- */}
        <div className="mt-4">
          {memuat && <LoadingState jumlah={2} />}
          {!memuat && error && <ErrorState message={error} onRetry={muatUlang} />}

          {!memuat && !error && postingan.length === 0 && (
            <EmptyState
              title="Galerimu masih kosong"
              description="Setiap pendakian punya satu momen yang pantas diingat. Simpan foto dan ceritanya di sini, supaya tidak tenggelam di galeri ponsel."
            />
          )}

          <div className="space-y-4">
            {postingan.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5">
                <Carousel foto={p.foto} alt={p.judul} />

                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="min-w-0 flex-1 text-sm font-bold leading-snug text-forest-800">{p.judul}</h3>
                    <button
                      type="button" onClick={() => hapusPost(p)} aria-label={`Hapus momen ${p.judul}`}
                      className="shrink-0 rounded-lg p-1.5 text-forest-800/35 active:scale-95 hover:text-rose-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {(p.gunung_id || p.tanggal_pendakian) && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-forest-800/55">
                      {p.gunung_id && namaGunung[String(p.gunung_id)] && (
                        <span className="flex items-center gap-1">
                          <Mountain size={12} /> {namaGunung[String(p.gunung_id)]}
                        </span>
                      )}
                      {p.tanggal_pendakian && (
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} /> {tanggalIndo(p.tanggal_pendakian)}
                        </span>
                      )}
                    </div>
                  )}

                  {p.cerita && (
                    <p className="mt-2 whitespace-pre-line text-[12px] leading-relaxed text-forest-800/75">
                      {p.cerita}
                    </p>
                  )}

                  <p className="mt-2.5 text-[10px] text-forest-800/35">
                    {p.foto.length} foto · disimpan {tanggalIndo(p.created_at)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
