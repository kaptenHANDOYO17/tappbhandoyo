/**
 *  SAFE IMAGE
 *  Gambar dengan placeholder SVG otomatis bila URL gagal dimuat
 *  (misalnya ketika perangkat sedang offline).
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function SafeImage({ src, alt, className = '' }) {
  const [gagal, setGagal] = useState(false);

  if (!src || gagal) {
    return (
      <div
        className={`flex items-center justify-center bg-forest-100 text-forest-500 ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageOff size={28} strokeWidth={1.8} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setGagal(true)}
      className={className}
    />
  );
}
