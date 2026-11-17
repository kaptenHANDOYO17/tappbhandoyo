/**
 *  KARTU PERLENGKAPAN (dipakai di AlatListPage)
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { Link } from 'react-router-dom';
import { ChevronRight, Tag, Weight } from 'lucide-react';
import SafeImage from './SafeImage.jsx';
import { PriorityBadge } from './DifficultyBadge.jsx';

export default function AlatCard({ alat }) {
  return (
    <Link to={`/alat/${alat.id}`} className="card block animate-fade-up">
      <div className="flex items-center gap-3 p-3">
        <SafeImage
          src={alat.gambar_url}
          alt={alat.nama}
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="truncate text-sm font-bold text-forest-800">{alat.nama}</h2>
            <ChevronRight size={16} className="mt-0.5 shrink-0 text-forest-800/30" />
          </div>

          <p className="mt-1 flex items-center gap-1 text-[11px] text-forest-800/60">
            <Tag size={11} className="shrink-0" />
            <span className="truncate">{alat.kategori}</span>
          </p>

          <div className="mt-2 flex items-center gap-2">
            <PriorityBadge level={alat.prioritas} />
            <span className="flex items-center gap-1 text-[11px] text-forest-800/60">
              <Weight size={11} />
              {alat.berat_ideal}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
