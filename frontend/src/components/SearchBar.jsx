/**
 *  SEARCH BAR (fitur pencarian halaman list gunung)
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Cari...' }) {
  return (
    <div className="relative">
      <Search
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest-800/40"
      />
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border-0 bg-white py-3 pl-10 pr-10 text-sm
                   text-forest-800 shadow-sm outline-none ring-1 ring-black/5
                   placeholder:text-forest-800/40 focus:ring-2 focus:ring-forest-300"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Hapus pencarian"
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center
                     justify-center rounded-full bg-forest-100 text-forest-600"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
