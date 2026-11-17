/**
 *  TOMBOL BACK (halaman detail)
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ fallback = '/gunung', label = 'Kembali' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    // Jika halaman dibuka langsung lewat URL (tidak ada histori),
    // arahkan ke halaman list sebagai fallback.
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2
                 text-xs font-semibold text-white backdrop-blur active:scale-95"
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}
