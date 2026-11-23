/**
 *  TOMBOL SIMPAN KE WISHLIST (dipakai di halaman detail gunung)
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/useWishlist.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function WishlistButton({ gunungId }) {
  const { sesi } = useAuth();
  const { idTersimpan, toggle } = useWishlist();
  const navigate = useNavigate();
  const aktif = idTersimpan.includes(Number(gunungId));

  const klik = async () => {
    if (!sesi) { navigate('/masuk', { state: { dari: `/gunung/${gunungId}` } }); return; }
    await toggle(gunungId);
  };

  return (
    <button
      type="button"
      onClick={klik}
      aria-pressed={aktif}
      aria-label={aktif ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
      className={`flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur transition-colors active:scale-95 ${
        aktif ? 'bg-rose-500 text-white' : 'bg-white/20 text-white'
      }`}
    >
      <Heart size={18} fill={aktif ? 'currentColor' : 'none'} />
    </button>
  );
}
