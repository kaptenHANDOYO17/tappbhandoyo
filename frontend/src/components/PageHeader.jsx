/**
 *  HEADER HALAMAN (judul + subjudul, sticky di atas)
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

export default function PageHeader({ title, subtitle, icon: Icon, children }) {
  return (
    <header className="sticky top-0 z-30 bg-forest-600 px-4 pb-4 pt-5 text-white shadow-md">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Icon size={22} strokeWidth={2.2} />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold leading-tight">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-xs text-forest-100/90">{subtitle}</p>
          )}
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}
