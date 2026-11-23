/**
 *  PENJAGA HALAMAN
 *  Halaman Wishlist dan My Gear hanya untuk pengguna yang sudah
 *  masuk. Halaman Gunung dan Alat tetap bebas dibuka siapa saja.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { Link, useLocation } from 'react-router-dom';
import { LogIn, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingState } from './StateViews.jsx';

export default function RequireAuth({ children, judul = 'Halaman ini perlu masuk dulu', pesan }) {
  const { sesi, memuat } = useAuth();
  const lokasi = useLocation();

  if (memuat) {
    return <section className="page-pad pt-6"><LoadingState jumlah={3} /></section>;
  }

  if (!sesi) {
    return (
      <section className="page-pad flex min-h-[70vh] flex-col items-center justify-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-500">
          <Lock size={28} />
        </span>
        <h1 className="mt-4 text-base font-bold text-forest-800">{judul}</h1>
        <p className="mt-2 max-w-[17rem] text-xs leading-relaxed text-forest-800/60">
          {pesan || 'Masuk atau daftar dulu supaya datamu tersimpan dan bisa dibuka lagi kapan saja.'}
        </p>
        <Link
          to="/masuk"
          state={{ dari: lokasi.pathname }}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest-600 px-5 py-3 text-xs font-semibold text-white active:scale-95"
        >
          <LogIn size={15} />
          Masuk atau Daftar
        </Link>
      </section>
    );
  }

  return children;
}
