/**
 *  LAYOUT UTAMA (mobile-first, maksimal 480px, rata tengah)
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BottomNav from './BottomNav.jsx';

export default function AppLayout({ children }) {
  const { pathname } = useLocation();

  // Setiap pindah halaman, posisi scroll dikembalikan ke atas
  // agar terasa seperti navigasi aplikasi native.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="app-shell">
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
