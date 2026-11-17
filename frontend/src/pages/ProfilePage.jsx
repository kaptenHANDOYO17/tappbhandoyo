/**
 * ============================================================
 *  HALAMAN PROFILE / ABOUT
 *  Menampilkan identitas mahasiswa dan penjelasan tentang
 *  PWA MountTrack beserta status instalasi & koneksi.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { useEffect, useState } from 'react';
import {
  BadgeCheck,
  Backpack,
  Database,
  GraduationCap,
  IdCard,
  Mountain,
  Server,
  Smartphone,
  UserRound,
  Wifi,
  WifiOff,
} from 'lucide-react';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';

const PROFIL = {
  nama: import.meta.env.VITE_AUTHOR_NAME || 'Handoyo',
  nim: import.meta.env.VITE_AUTHOR_NIM || '21120124120040',
  prodi: import.meta.env.VITE_AUTHOR_PRODI || 'Teknik Komputer',
};

const FITUR_PWA = [
  {
    icon: Smartphone,
    judul: 'Installable',
    detail:
      'Aplikasi dapat dipasang ke home screen lewat web app manifest sehingga berjalan standalone tanpa address bar browser.',
  },
  {
    icon: WifiOff,
    judul: 'Offline Capable',
    detail:
      'Service worker hasil vite-plugin-pwa melakukan precaching aset dan strategi NetworkFirst untuk respons REST API.',
  },
  {
    icon: Server,
    judul: 'REST API Sendiri',
    detail:
      'Data gunung dan perlengkapan dilayani web service Express.js buatan sendiri dengan empat endpoint utama.',
  },
  {
    icon: Database,
    judul: 'Data Persistence',
    detail:
      'Respons API disimpan di localStorage, sehingga data terakhir tetap tampil ketika perangkat kehilangan koneksi.',
  },
];

export default function ProfilePage() {
  const [online, setOnline] = useState(navigator.onLine);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const keOnline = () => setOnline(true);
    const keOffline = () => setOnline(false);

    window.addEventListener('online', keOnline);
    window.addEventListener('offline', keOffline);

    setStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
    );

    return () => {
      window.removeEventListener('online', keOnline);
      window.removeEventListener('offline', keOffline);
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Profil"
        subtitle="Identitas pembuat & tentang aplikasi"
        icon={UserRound}
      />

      <section className="page-pad">
        {/* KARTU IDENTITAS MAHASISWA */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5">
          <div className="bg-forest-600 px-5 pb-10 pt-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20">
              <UserRound size={38} className="text-white" strokeWidth={1.8} />
            </div>
          </div>

          <div className="-mt-6 px-5 pb-5 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-black/5">
              <BadgeCheck size={13} className="text-forest-500" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-forest-600">
                Tugas Akhir Praktikum PPB
              </span>
            </div>

            <h2 className="mt-3 text-xl font-bold text-forest-800">{PROFIL.nama}</h2>

            <div className="mt-4 space-y-2.5 text-left">
              <div className="flex items-center gap-3 rounded-xl bg-sand px-3.5 py-3">
                <IdCard size={17} className="shrink-0 text-forest-500" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-forest-800/45">
                    NIM
                  </p>
                  <p className="text-sm font-bold text-forest-800">{PROFIL.nim}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-sand px-3.5 py-3">
                <GraduationCap size={17} className="shrink-0 text-forest-500" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-forest-800/45">
                    Program Studi
                  </p>
                  <p className="text-sm font-bold text-forest-800">{PROFIL.prodi}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TENTANG APLIKASI */}
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-forest-800">
            <Mountain size={16} className="text-forest-500" />
            Tentang MountTrack
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-forest-800/75">
            <strong>MountTrack</strong> adalah Progressive Web App yang menyajikan
            informasi jalur pendakian gunung di Indonesia sekaligus katalog
            perlengkapan yang perlu dipersiapkan sebelum mendaki. Aplikasi dibangun
            menggunakan React 18 dan Vite, dengan Tailwind CSS untuk antarmuka
            mobile-first serta React Router DOM v6 sebagai pengatur navigasi
            Single Page Application.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-forest-800/75">
            Seluruh data diambil dari REST API buatan sendiri berbasis Express.js.
            Menu <strong>Gunung</strong> menampilkan daftar dan detail jalur
            pendakian, sedangkan menu <strong>Alat</strong> menampilkan fungsi,
            berat ideal, serta risiko apabila sebuah perlengkapan tidak dibawa.
          </p>
        </div>

        {/* FITUR PWA */}
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
                  <p className="mt-0.5 text-[12px] leading-relaxed text-forest-800/70">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STATUS TEKNIS */}
        <div className="mt-4 rounded-2xl bg-forest-100/70 p-4 ring-1 ring-forest-200">
          <h2 className="text-xs font-bold text-forest-600">Status Aplikasi</h2>

          <dl className="mt-2.5 space-y-2 text-[12px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-forest-700/70">Koneksi jaringan</dt>
              <dd
                className={`flex items-center gap-1.5 font-bold ${
                  online ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {online ? <Wifi size={13} /> : <WifiOff size={13} />}
                {online ? 'Online' : 'Offline'}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3">
              <dt className="text-forest-700/70">Mode tampilan</dt>
              <dd className="font-bold text-forest-700">
                {standalone ? 'Standalone (terinstal)' : 'Tab browser'}
              </dd>
            </div>

            <div className="flex items-start justify-between gap-3">
              <dt className="shrink-0 text-forest-700/70">Base URL API</dt>
              <dd className="break-all text-right font-mono text-[10px] font-semibold text-forest-700">
                {api.baseUrl}
              </dd>
            </div>
          </dl>
        </div>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-forest-800/45">
          MountTrack v1.0.0 — Praktikum Pemrograman Perangkat Bergerak
          <br />
          {PROFIL.nama} · {PROFIL.nim} · {PROFIL.prodi}
        </p>
      </section>
    </>
  );
}
