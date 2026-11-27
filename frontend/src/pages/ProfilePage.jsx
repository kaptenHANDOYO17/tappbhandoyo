/**
 * ============================================================
 *  HALAMAN PROFIL
 *  Dua lapis isi:
 *  1. Akun pengguna  - foto profil yang bisa diunggah sendiri
 *                      dan data diri yang bisa diubah.
 *  2. Tentang aplikasi + identitas pembuat (ketentuan tugas).
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck, Backpack, Camera, Database, GraduationCap, IdCard, Images, LogIn, LogOut,
  ChevronRight,
  Mountain, Pencil, Save, Server, Smartphone, UserRound, Wifi, WifiOff, X,
} from 'lucide-react';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase, supabaseSiap } from '../lib/supabase.js';

const PEMBUAT = {
  nama: import.meta.env.VITE_AUTHOR_NAME || 'Handoyo',
  nim: import.meta.env.VITE_AUTHOR_NIM || '21120124120040',
  prodi: import.meta.env.VITE_AUTHOR_PRODI || 'Teknik Komputer',
};

const FITUR_PWA = [
  { icon: Smartphone, judul: 'Installable', detail: 'Dapat dipasang ke layar utama lewat web app manifest sehingga berjalan standalone tanpa address bar.' },
  { icon: WifiOff, judul: 'Offline Capable', detail: 'Service worker menyimpan seluruh aset dan foto, serta memakai strategi NetworkFirst untuk respons REST API.' },
  { icon: Server, judul: 'REST API Sendiri', detail: 'Data dilayani web service Express.js buatan sendiri, termasuk endpoint saran perlengkapan berbasis AI.' },
  { icon: Database, judul: 'Data Tersimpan', detail: 'Wishlist, perlengkapan, dan foto profil tersimpan di Supabase dan dijaga Row Level Security.' },
];

/** Memperkecil gambar di browser supaya unggahan ringan. */
function kecilkanGambar(file, maksimal = 600) {
  return new Promise((resolve, reject) => {
    const pembaca = new FileReader();
    pembaca.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    pembaca.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Berkas itu bukan gambar yang valid.'));
      img.onload = () => {
        const skala = Math.min(1, maksimal / Math.max(img.width, img.height));
        const kanvas = document.createElement('canvas');
        kanvas.width = Math.round(img.width * skala);
        kanvas.height = Math.round(img.height * skala);
        kanvas.getContext('2d').drawImage(img, 0, 0, kanvas.width, kanvas.height);
        kanvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Gagal memproses gambar.'))), 'image/jpeg', 0.85);
      };
      img.src = pembaca.result;
    };
    pembaca.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const { sesi, user, profil, keluar, muatUlangProfil } = useAuth();

  const [online, setOnline] = useState(navigator.onLine);
  const [standalone, setStandalone] = useState(false);
  const [mode, setMode] = useState('lihat');     // lihat | ubah
  const [form, setForm] = useState({ nama: '', nim: '', prodi: '', asal_kota: '', bio: '' });
  const [proses, setProses] = useState(false);
  const [pesan, setPesan] = useState('');
  const [error, setError] = useState('');
  const [unggah, setUnggah] = useState(false);
  const inputFoto = useRef(null);

  useEffect(() => {
    const naik = () => setOnline(true);
    const turun = () => setOnline(false);
    window.addEventListener('online', naik);
    window.addEventListener('offline', turun);
    setStandalone(
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    );
    return () => { window.removeEventListener('online', naik); window.removeEventListener('offline', turun); };
  }, []);

  useEffect(() => {
    if (profil) {
      setForm({
        nama: profil.nama || '', nim: profil.nim || '', prodi: profil.prodi || '',
        asal_kota: profil.asal_kota || '', bio: profil.bio || '',
      });
    }
  }, [profil]);

  /* ---------------------- simpan profil --------------------- */
  const simpan = async (e) => {
    e.preventDefault();
    setProses(true); setError(''); setPesan('');
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (err) throw new Error(err.message);
      await muatUlangProfil();
      setMode('lihat');
      setPesan('Profil berhasil disimpan.');
    } catch (err) {
      setError(err.message);
    } finally {
      setProses(false);
    }
  };

  /* --------------------- unggah foto profil ----------------- */
  const pilihFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUnggah(true); setError(''); setPesan('');
    try {
      const blob = await kecilkanGambar(file);
      const path = `${user.id}/avatar.jpg`;

      const { error: errUnggah } = await supabase.storage
        .from('avatar')
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '0' });
      if (errUnggah) throw new Error(errUnggah.message);

      const { data: pub } = supabase.storage.from('avatar').getPublicUrl(path);
      // Ditambah penanda waktu supaya browser tidak menampilkan foto lama dari cache.
      const url = `${pub.publicUrl}?v=${Date.now()}`;

      const { error: errSimpan } = await supabase
        .from('profiles').update({ avatar_url: url, updated_at: new Date().toISOString() }).eq('id', user.id);
      if (errSimpan) throw new Error(errSimpan.message);

      await muatUlangProfil();
      setPesan('Foto profil berhasil diperbarui.');
    } catch (err) {
      setError(`Gagal mengunggah foto: ${err.message}`);
    } finally {
      setUnggah(false);
      if (inputFoto.current) inputFoto.current.value = '';
    }
  };

  const gayaInput =
    'w-full rounded-xl border-0 bg-sand px-3.5 py-2.5 text-sm text-forest-800 shadow-sm ' +
    'ring-1 ring-black/5 outline-none placeholder:text-forest-800/35 focus:ring-2 focus:ring-forest-300';

  return (
    <>
      <PageHeader title="Profil" subtitle="Akun, identitas pembuat, dan info aplikasi" icon={UserRound} />

      <section className="page-pad">
        {/* ================= KARTU AKUN PENGGUNA ================= */}
        {sesi ? (
          <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5">
            <div className="bg-forest-600 px-5 pb-12 pt-6 text-center">
              <div className="relative mx-auto h-24 w-24">
                {profil?.avatar_url ? (
                  <img src={profil.avatar_url} alt="Foto profil"
                       className="h-24 w-24 rounded-full object-cover ring-4 ring-white/25" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20">
                    <UserRound size={42} className="text-white" strokeWidth={1.8} />
                  </div>
                )}

                <button type="button" onClick={() => inputFoto.current?.click()} disabled={unggah}
                        aria-label="Ganti foto profil"
                        className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full
                                   bg-white text-forest-600 shadow-md ring-2 ring-forest-600 active:scale-95 disabled:opacity-60">
                  <Camera size={16} />
                </button>
                <input ref={inputFoto} type="file" accept="image/*" onChange={pilihFoto} className="hidden" />
              </div>
              {unggah && <p className="mt-2 text-[11px] text-forest-100">Mengunggah foto...</p>}
            </div>

            <div className="-mt-8 px-5 pb-5">
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                {pesan && <p className="mb-3 rounded-lg bg-emerald-50 p-2.5 text-[11px] text-emerald-800">{pesan}</p>}
                {error && <p className="mb-3 rounded-lg bg-rose-50 p-2.5 text-[11px] text-rose-700">{error}</p>}

                {mode === 'lihat' ? (
                  <>
                    <h2 className="text-center text-lg font-bold text-forest-800">{profil?.nama || 'Pendaki'}</h2>
                    <p className="mt-0.5 text-center text-[11px] text-forest-800/55">{user?.email}</p>
                    {profil?.bio && (
                      <p className="mt-2 text-center text-[12px] leading-relaxed text-forest-800/70">{profil.bio}</p>
                    )}

                    <dl className="mt-3 space-y-2 text-[12px]">
                      {[['NIM', profil?.nim], ['Program Studi', profil?.prodi], ['Asal Kota', profil?.asal_kota]]
                        .filter(([, v]) => v)
                        .map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-3 rounded-lg bg-sand px-3 py-2">
                            <dt className="text-forest-800/55">{k}</dt>
                            <dd className="font-semibold text-forest-800">{v}</dd>
                          </div>
                        ))}
                    </dl>

                    {/* Pintu masuk ke galeri momen pendakian */}
                    <Link
                      to="/galeri"
                      className="mt-4 flex items-center gap-3 rounded-xl bg-forest-100/70 p-3
                                 ring-1 ring-forest-200 active:scale-[0.98]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
                                       bg-forest-600 text-white">
                        <Images size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-bold text-forest-800">My Gallery</span>
                        <span className="block text-[11px] leading-snug text-forest-800/60">
                          Simpan foto dan cerita tiap pendakianmu di satu tempat
                        </span>
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-forest-800/35" />
                    </Link>

                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => setMode('ubah')}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-forest-600 py-2.5
                                         text-xs font-semibold text-white active:scale-95">
                        <Pencil size={14} /> Edit Profil
                      </button>
                      <button type="button" onClick={keluar}
                              className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2.5
                                         text-xs font-semibold text-rose-600 active:scale-95">
                        <LogOut size={14} /> Keluar
                      </button>
                    </div>
                  </>
                ) : (
                  <form onSubmit={simpan}>
                    {[
                      ['nama', 'Nama', 'Nama panggilanmu'],
                      ['nim', 'NIM', 'Opsional'],
                      ['prodi', 'Program Studi', 'Opsional'],
                      ['asal_kota', 'Asal Kota', 'Opsional'],
                    ].map(([key, label, ph]) => (
                      <label key={key} className="mb-2.5 block">
                        <span className="mb-1 block text-[11px] font-semibold text-forest-800/60">{label}</span>
                        <input className={gayaInput} value={form[key]} placeholder={ph}
                               onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                               required={key === 'nama'} />
                      </label>
                    ))}
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-semibold text-forest-800/60">Bio singkat</span>
                      <textarea className={gayaInput} rows={3} value={form.bio}
                                placeholder="Contoh: Suka sunrise di sabana."
                                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
                    </label>

                    <div className="mt-3 flex gap-2">
                      <button type="submit" disabled={proses}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-forest-600 py-2.5
                                         text-xs font-semibold text-white active:scale-95 disabled:opacity-60">
                        <Save size={14} /> {proses ? 'Menyimpan...' : 'Simpan'}
                      </button>
                      <button type="button" onClick={() => { setMode('lihat'); setError(''); }}
                              className="flex items-center justify-center gap-1.5 rounded-xl bg-forest-100 px-4 py-2.5
                                         text-xs font-semibold text-forest-700 active:scale-95">
                        <X size={14} /> Batal
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-5 text-center shadow-card ring-1 ring-black/5">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 text-forest-500">
              <UserRound size={26} />
            </span>
            <h2 className="mt-3 text-sm font-bold text-forest-800">Belum masuk</h2>
            <p className="mx-auto mt-1.5 max-w-[17rem] text-[11px] leading-relaxed text-forest-800/60">
              Masuk untuk mengunggah foto profil, menyimpan wishlist gunung, dan mencatat perlengkapanmu.
            </p>
            <Link to="/masuk"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-forest-600 px-5 py-2.5
                             text-xs font-semibold text-white active:scale-95">
              <LogIn size={14} /> Masuk atau Daftar
            </Link>
          </div>
        )}

        {/* ============ IDENTITAS PEMBUAT (ketentuan tugas) ============ */}
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1">
            <BadgeCheck size={13} className="text-forest-500" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-forest-600">
              Tugas Akhir Praktikum PPB
            </span>
          </div>

          <h2 className="mt-3 text-base font-bold text-forest-800">{PEMBUAT.nama}</h2>

          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-3 rounded-xl bg-sand px-3.5 py-2.5">
              <IdCard size={16} className="shrink-0 text-forest-500" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-forest-800/45">NIM</p>
                <p className="text-sm font-bold text-forest-800">{PEMBUAT.nim}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-sand px-3.5 py-2.5">
              <GraduationCap size={16} className="shrink-0 text-forest-500" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-forest-800/45">Program Studi</p>
                <p className="text-sm font-bold text-forest-800">{PEMBUAT.prodi}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= TENTANG APLIKASI ================= */}
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-forest-800">
            <Mountain size={16} className="text-forest-500" />
            Tentang MountTrack
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-forest-800/75">
            <strong>MountTrack</strong> adalah Progressive Web App yang menyajikan informasi jalur
            pendakian gunung di Indonesia sekaligus katalog perlengkapan. Dibangun dengan React 18,
            Vite, Tailwind CSS, dan React Router DOM v6, dengan data dari REST API Express.js buatan
            sendiri yang terhubung ke Supabase.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-forest-800/75">
            Menu <strong>Wishlist</strong> menyimpan gunung yang ingin didaki, sedangkan
            <strong> My Gear</strong> menghitung persentase kesiapan perlengkapan dan memberi saran
            persiapan yang dibangkitkan AI.
          </p>
        </div>

        {/* ================= IMPLEMENTASI PWA ================= */}
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-forest-800">
            <Backpack size={16} className="text-forest-500" />
            Implementasi PWA
          </h2>
          <div className="mt-3 space-y-3">
            {FITUR_PWA.map(({ icon: Icon, judul, detail }) => (
              <div key={judul} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest-100 text-forest-600">
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-forest-800">{judul}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-forest-800/70">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= STATUS TEKNIS ================= */}
        <div className="mt-4 rounded-2xl bg-forest-100/70 p-4 ring-1 ring-forest-200">
          <h2 className="text-xs font-bold text-forest-600">Status Aplikasi</h2>
          <dl className="mt-2.5 space-y-2 text-[12px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-forest-700/70">Koneksi jaringan</dt>
              <dd className={`flex items-center gap-1.5 font-bold ${online ? 'text-emerald-700' : 'text-rose-700'}`}>
                {online ? <Wifi size={13} /> : <WifiOff size={13} />}
                {online ? 'Online' : 'Offline'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-forest-700/70">Mode tampilan</dt>
              <dd className="font-bold text-forest-700">{standalone ? 'Standalone (terinstal)' : 'Tab browser'}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-forest-700/70">Status akun</dt>
              <dd className="font-bold text-forest-700">{sesi ? 'Sudah masuk' : 'Belum masuk'}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-forest-700/70">Supabase</dt>
              <dd className="font-bold text-forest-700">{supabaseSiap ? 'Terkonfigurasi' : 'Belum diatur'}</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="shrink-0 text-forest-700/70">Base URL API</dt>
              <dd className="break-all text-right font-mono text-[10px] font-semibold text-forest-700">{api.baseUrl}</dd>
            </div>
          </dl>
        </div>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-forest-800/45">
          MountTrack v2.0 — Praktikum Pemrograman Perangkat Bergerak
          <br />
          {PEMBUAT.nama} · {PEMBUAT.nim} · {PEMBUAT.prodi}
        </p>
      </section>
    </>
  );
}
