/**
 *  KUMPULAN TAMPILAN STATE: loading, error, kosong, offline
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { AlertTriangle, RefreshCw, SearchX, WifiOff } from 'lucide-react';

/** Skeleton kartu saat data sedang dimuat */
export function LoadingState({ jumlah = 4 }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: jumlah }).map((_, index) => (
        <div key={index} className="skeleton h-28 w-full" />
      ))}
      <p className="pt-1 text-center text-xs text-forest-800/50">Memuat data...</p>
    </div>
  );
}

/** Tampilan error + tombol coba lagi */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl bg-white p-5 text-center shadow-card ring-1 ring-black/5">
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <AlertTriangle size={24} />
      </span>
      <h2 className="text-sm font-bold text-forest-800">Gagal memuat data</h2>
      <p className="mx-auto mt-1.5 max-w-[18rem] text-xs leading-relaxed text-forest-800/65">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-forest-600 px-4 py-2.5
                     text-xs font-semibold text-white active:scale-95"
        >
          <RefreshCw size={14} />
          Coba Lagi
        </button>
      )}
    </div>
  );
}

/** Tampilan ketika hasil pencarian / filter kosong */
export function EmptyState({ title = 'Tidak ada data', description }) {
  return (
    <div className="rounded-2xl bg-white p-6 text-center shadow-card ring-1 ring-black/5">
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-forest-100 text-forest-500">
        <SearchX size={24} />
      </span>
      <h2 className="text-sm font-bold text-forest-800">{title}</h2>
      {description && (
        <p className="mx-auto mt-1.5 max-w-[18rem] text-xs leading-relaxed text-forest-800/65">
          {description}
        </p>
      )}
    </div>
  );
}

/** Banner penanda data berasal dari cache offline */
export function OfflineBanner({ savedAt }) {
  const waktu = savedAt
    ? new Date(savedAt).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  return (
    <div className="mb-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-amber-800 ring-1 ring-amber-200">
      <WifiOff size={16} className="mt-0.5 shrink-0" />
      <p className="text-[11px] leading-relaxed">
        Mode offline — menampilkan data tersimpan
        {waktu ? ` dari ${waktu}` : ''}.
      </p>
    </div>
  );
}

export default LoadingState;
