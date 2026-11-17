/**
 *  KARTU GUNUNG (dipakai di GunungListPage)
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { Link } from 'react-router-dom';
import { ChevronRight, Clock, MapPin, TrendingUp } from 'lucide-react';
import SafeImage from './SafeImage.jsx';
import { DifficultyBadge } from './DifficultyBadge.jsx';

export default function GunungCard({ gunung }) {
  return (
    <Link to={`/gunung/${gunung.id}`} className="card block animate-fade-up">
      <div className="flex gap-3">
        <SafeImage
          src={gunung.gambar_url}
          alt={gunung.nama}
          className="h-[118px] w-[108px] shrink-0 object-cover"
        />

        <div className="flex min-w-0 flex-1 flex-col justify-between py-2.5 pr-2.5">
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h2 className="truncate text-sm font-bold text-forest-800">
                {gunung.nama}
              </h2>
              <ChevronRight size={16} className="mt-0.5 shrink-0 text-forest-800/30" />
            </div>

            <p className="mt-1 flex items-center gap-1 text-[11px] text-forest-800/60">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{gunung.lokasi}</span>
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-forest-500">
              <TrendingUp size={11} />
              {Number(gunung.ketinggian).toLocaleString('id-ID')} mdpl
            </span>
            <span className="flex items-center gap-1 text-[11px] text-forest-800/60">
              <Clock size={11} />
              {gunung.estimasi_waktu}
            </span>
            <DifficultyBadge level={gunung.tingkat_kesulitan} />
          </div>
        </div>
      </div>
    </Link>
  );
}
