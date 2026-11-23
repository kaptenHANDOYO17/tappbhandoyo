/**
 *  HALAMAN MASUK & DAFTAR
 *  Satu halaman untuk dua mode, ditukar lewat tombol di bawah.
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Eye, EyeOff, LogIn, Mountain, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { masuk, daftar, supabaseSiap } = useAuth();
  const navigate = useNavigate();
  const lokasi = useLocation();
  const tujuan = lokasi.state?.dari || '/profil';

  const [modeDaftar, setModeDaftar] = useState(false);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [sandi, setSandi] = useState('');
  const [lihatSandi, setLihatSandi] = useState(false);
  const [proses, setProses] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const kirim = async (e) => {
    e.preventDefault();
    setError(''); setInfo(''); setProses(true);
    try {
      if (modeDaftar) {
        const { perluKonfirmasi } = await daftar(email.trim(), sandi, nama.trim());
        if (perluKonfirmasi) {
          setInfo('Akun dibuat. Konfirmasi email masih aktif di Supabase, jadi cek kotak masuk email dulu, lalu kembali ke sini untuk masuk.');
          setModeDaftar(false);
        } else {
          navigate(tujuan, { replace: true });
        }
      } else {
        await masuk(email.trim(), sandi);
        navigate(tujuan, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProses(false);
    }
  };

  const gayaInput =
    'w-full rounded-xl border-0 bg-white px-3.5 py-3 text-sm text-forest-800 shadow-sm ' +
    'ring-1 ring-black/5 outline-none placeholder:text-forest-800/40 focus:ring-2 focus:ring-forest-300';

  return (
    <>
      <header className="bg-forest-600 px-5 pb-8 pt-10 text-center text-white">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
          <Mountain size={28} />
        </span>
        <h1 className="mt-3 text-xl font-bold">MountTrack</h1>
        <p className="mt-1 text-xs text-forest-100/90">
          {modeDaftar ? 'Buat akun untuk menyimpan wishlist dan perlengkapanmu' : 'Masuk untuk melanjutkan persiapan pendakian'}
        </p>
      </header>

      <section className="page-pad -mt-4">
        <form onSubmit={kirim} className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
          {!supabaseSiap && (
            <div className="mb-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-amber-800 ring-1 ring-amber-200">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                Supabase belum diatur. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di berkas .env frontend.
              </p>
            </div>
          )}

          {modeDaftar && (
            <label className="mb-3 block">
              <span className="mb-1.5 block text-[11px] font-semibold text-forest-800/60">Nama panggilan</span>
              <input className={gayaInput} value={nama} onChange={(e) => setNama(e.target.value)}
                     placeholder="Handoyo" required minLength={2} />
            </label>
          )}

          <label className="mb-3 block">
            <span className="mb-1.5 block text-[11px] font-semibold text-forest-800/60">Email</span>
            <input className={gayaInput} type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                   placeholder="nama@email.com" required autoComplete="email" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold text-forest-800/60">Kata sandi</span>
            <div className="relative">
              <input className={gayaInput + ' pr-11'} type={lihatSandi ? 'text' : 'password'}
                     value={sandi} onChange={(e) => setSandi(e.target.value)}
                     placeholder="minimal 6 karakter" required minLength={6}
                     autoComplete={modeDaftar ? 'new-password' : 'current-password'} />
              <button type="button" onClick={() => setLihatSandi((v) => !v)}
                      aria-label={lihatSandi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-forest-800/45">
                {lihatSandi ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {error && <p className="mt-3 rounded-lg bg-rose-50 p-2.5 text-[11px] leading-relaxed text-rose-700">{error}</p>}
          {info && <p className="mt-3 rounded-lg bg-emerald-50 p-2.5 text-[11px] leading-relaxed text-emerald-800">{info}</p>}

          <button type="submit" disabled={proses}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-600 py-3
                             text-xs font-semibold text-white active:scale-[0.98] disabled:opacity-60">
            {modeDaftar ? <UserPlus size={15} /> : <LogIn size={15} />}
            {proses ? 'Memproses...' : modeDaftar ? 'Daftar Sekarang' : 'Masuk'}
          </button>
        </form>

        <button type="button"
                onClick={() => { setModeDaftar((v) => !v); setError(''); setInfo(''); }}
                className="mt-4 w-full text-center text-[12px] text-forest-800/70">
          {modeDaftar ? 'Sudah punya akun? ' : 'Belum punya akun? '}
          <span className="font-bold text-forest-600">{modeDaftar ? 'Masuk di sini' : 'Daftar di sini'}</span>
        </button>
      </section>
    </>
  );
}
