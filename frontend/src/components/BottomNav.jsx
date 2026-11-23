/**
 *  BOTTOM NAVIGATION BAR (5 menu utama)
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { NavLink } from 'react-router-dom';
import { Mountain, Backpack, Heart, ClipboardCheck, UserRound } from 'lucide-react';

const menus = [
  { to: '/gunung',   label: 'Gunung',   icon: Mountain },
  { to: '/alat',     label: 'Alat',     icon: Backpack },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/my-gear',  label: 'My Gear',  icon: ClipboardCheck },
  { to: '/profil',   label: 'Profil',   icon: UserRound },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2
                 border-t border-black/5 bg-white/95 shadow-nav backdrop-blur"
      aria-label="Navigasi utama"
    >
      <div className="flex items-stretch pb-[env(safe-area-inset-bottom)]">
        {menus.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'text-forest-600' : 'text-forest-800/45 hover:text-forest-500'}`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                    isActive ? 'bg-forest-100' : 'bg-transparent'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
                </span>
                <span className="text-[10px] leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
