/**
 *  HALAMAN 404 (fallback route React Router)
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <section className="page-pad flex min-h-[70vh] flex-col items-center justify-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-100 text-forest-500">
        <Compass size={30} />
      </span>
      <h1 className="mt-4 text-lg font-bold text-forest-800">Halaman Tidak Ditemukan</h1>
      <p className="mt-1.5 max-w-[16rem] text-xs leading-relaxed text-forest-800/60">
        Sepertinya kamu tersesat dari jalur utama. Kembali ke daftar gunung untuk
        melanjutkan penjelajahan.
      </p>
      <Link
        to="/gunung"
        className="mt-5 rounded-xl bg-forest-600 px-5 py-3 text-xs font-semibold text-white active:scale-95"
      >
        Kembali ke Jalur Pendakian
      </Link>
    </section>
  );
}
