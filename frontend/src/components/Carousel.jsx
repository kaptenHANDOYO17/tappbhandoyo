/**
 * ============================================================
 *  CAROUSEL FOTO
 * ------------------------------------------------------------
 *  Menampilkan beberapa foto dalam satu bingkai yang bisa
 *  digeser. Dibuat memakai scroll-snap milik CSS, bukan
 *  pustaka tambahan, supaya:
 *    - gerakannya terasa alami di layar sentuh,
 *    - tetap bisa dipakai lewat keyboard dan tombol panah,
 *    - ukuran bundel aplikasi tidak bertambah.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SafeImage from './SafeImage.jsx';

export default function Carousel({ foto = [], alt = 'Foto pendakian' }) {
  const rel = useRef(null);
  const [aktif, setAktif] = useState(0);

  /* Menentukan foto keberapa yang sedang terlihat saat digeser. */
  const saatDigeser = useCallback(() => {
    const el = rel.current;
    if (!el || !el.clientWidth) return;
    setAktif(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  useEffect(() => {
    const el = rel.current;
    if (!el) return undefined;
    el.addEventListener('scroll', saatDigeser, { passive: true });
    return () => el.removeEventListener('scroll', saatDigeser);
  }, [saatDigeser]);

  const keFoto = (i) => {
    const el = rel.current;
    if (!el) return;
    const tujuan = Math.min(Math.max(i, 0), foto.length - 1);
    el.scrollTo({ left: tujuan * el.clientWidth, behavior: 'smooth' });
    setAktif(tujuan);
  };

  if (!foto.length) return null;
  const banyak = foto.length > 1;

  return (
    <div className="relative">
      <div
        ref={rel}
        tabIndex={0}
        role="group"
        aria-label={`${alt}, ${foto.length} foto`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); keFoto(aktif + 1); }
          if (e.key === 'ArrowLeft')  { e.preventDefault(); keFoto(aktif - 1); }
        }}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth
                   rounded-xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-forest-400
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {foto.map((f, i) => (
          <div key={f.id ?? i} className="w-full shrink-0 snap-center">
            <SafeImage
              src={f.url}
              alt={`${alt} ${i + 1} dari ${foto.length}`}
              className="h-60 w-full bg-forest-100 object-cover"
            />
          </div>
        ))}
      </div>

      {banyak && (
        <>
          {/* Penanda urutan foto */}
          <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5
                          text-[10px] font-semibold text-white">
            {aktif + 1}/{foto.length}
          </div>

          {/* Tombol geser, disembunyikan di ujung masing-masing */}
          {aktif > 0 && (
            <button
              type="button" aria-label="Foto sebelumnya" onClick={() => keFoto(aktif - 1)}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-1.5
                         text-white active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {aktif < foto.length - 1 && (
            <button
              type="button" aria-label="Foto berikutnya" onClick={() => keFoto(aktif + 1)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-1.5
                         text-white active:scale-95"
            >
              <ChevronRight size={16} />
            </button>
          )}

          {/* Titik-titik penunjuk */}
          <div className="mt-2 flex justify-center gap-1.5">
            {foto.map((f, i) => (
              <button
                key={f.id ?? i}
                type="button"
                aria-label={`Lihat foto ${i + 1}`}
                aria-current={i === aktif}
                onClick={() => keFoto(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === aktif ? 'w-4 bg-forest-500' : 'w-1.5 bg-forest-800/20'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
