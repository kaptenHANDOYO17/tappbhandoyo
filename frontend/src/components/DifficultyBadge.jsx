/**
 *  BADGE TINGKAT KESULITAN & BADGE PRIORITAS ALAT
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { Signal, SignalHigh, SignalMedium } from 'lucide-react';

const styleKesulitan = {
  pemula: {
    label: 'Pemula',
    className: 'bg-emerald-100 text-emerald-700',
    icon: SignalMedium,
  },
  menengah: {
    label: 'Menengah',
    className: 'bg-amber-100 text-amber-700',
    icon: SignalHigh,
  },
  sulit: {
    label: 'Sulit',
    className: 'bg-rose-100 text-rose-700',
    icon: Signal,
  },
};

export function DifficultyBadge({ level }) {
  const key = String(level || '').toLowerCase();
  const config = styleKesulitan[key] || {
    label: level || 'Tidak diketahui',
    className: 'bg-slate-100 text-slate-600',
    icon: Signal,
  };
  const Icon = config.icon;

  return (
    <span className={`chip ${config.className}`}>
      <Icon size={12} strokeWidth={2.6} />
      {config.label}
    </span>
  );
}

const stylePrioritas = {
  wajib: 'bg-rose-100 text-rose-700',
  penting: 'bg-amber-100 text-amber-700',
  opsional: 'bg-sky-100 text-sky-700',
};

export function PriorityBadge({ level }) {
  const key = String(level || '').toLowerCase();
  const className = stylePrioritas[key] || 'bg-slate-100 text-slate-600';
  return <span className={`chip ${className}`}>{level || 'Umum'}</span>;
}

export default DifficultyBadge;
