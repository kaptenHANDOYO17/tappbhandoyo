/**
 * ============================================================
 *  BARIS PENGURUT (SORT BAR)
 * ------------------------------------------------------------
 *  Satu baris berisi pilihan dasar pengurutan dan satu tombol
 *  untuk membalik arahnya.
 *
 *  Label arah sengaja ditulis spesifik per pilihan, misalnya
 *  "Terendah dulu" dan bukan sekadar "Naik", karena istilah
 *  naik/turun membingungkan saat dipakai untuk prioritas
 *  perlengkapan maupun ketinggian gunung.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { ArrowDownNarrowWide, ArrowUpNarrowWide, ArrowUpDown } from 'lucide-react';

export default function SortBar({ opsi, nilai, onChange, label = 'Urutkan' }) {
  const aktif = opsi.find((o) => o.id === nilai.kunci) || opsi[0];
  const naik = nilai.arah !== 'turun';
  const Ikon = naik ? ArrowUpNarrowWide : ArrowDownNarrowWide;

  return (
    <div className="mb-3 rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-1.5">
        <ArrowUpDown size={13} className="shrink-0 text-forest-800/40" />
        <span className="shrink-0 text-[11px] font-semibold text-forest-800/55">{label}</span>

        {/* Pilihan dasar pengurutan */}
        <div className="no-scrollbar flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
          {opsi.map((o) => {
            const dipilih = o.id === aktif.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onChange({ kunci: o.id, arah: nilai.arah })}
                aria-pressed={dipilih}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  dipilih
                    ? 'bg-forest-600 text-white'
                    : 'bg-sand text-forest-800/60 ring-1 ring-black/5'
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tombol pembalik arah */}
      <button
        type="button"
        onClick={() => onChange({ kunci: aktif.id, arah: naik ? 'turun' : 'naik' })}
        aria-label={`Ubah urutan menjadi ${naik ? aktif.turun : aktif.naik}`}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-forest-100/70 py-2
                   text-[11px] font-semibold text-forest-700 ring-1 ring-forest-200 active:scale-[0.98]"
      >
        <Ikon size={14} />
        {naik ? aktif.naik : aktif.turun}
      </button>
    </div>
  );
}
