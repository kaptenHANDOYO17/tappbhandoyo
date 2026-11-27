/**
 * ============================================================
 *  HALAMAN MY GEAR
 * ------------------------------------------------------------
 *  Pengguna menyusun RENCANA PENDAKIAN lebih dulu:
 *    - gunung tujuan
 *    - gaya  : tektok (pulang hari) atau camp (bermalam)
 *    - berapa malam, dan berapa orang
 *
 *  Rencana itu menentukan perlengkapan mana yang dihitung.
 *  Pendaki tektok tidak perlu tenda, sleeping bag, matras,
 *  kompor, dan nesting, sehingga tidak adil bila ketiadaan
 *  barang-barang itu menurunkan persentase kesiapannya.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Backpack, Check, Mountain, Sparkles, TriangleAlert, RefreshCw, Weight,
  Sun, Tent, Users, Moon, Info, Droplets,
} from 'lucide-react';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import SafeImage from '../components/SafeImage.jsx';
import { PriorityBadge } from '../components/DifficultyBadge.jsx';
import { ErrorState, LoadingState } from '../components/StateViews.jsx';
import { supabase, supabaseSiap } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useRencana } from '../context/useRencana.js';

/** Cincin persentase sederhana memakai SVG. */
function CincinPersen({ persen }) {
  const r = 46;
  const keliling = 2 * Math.PI * r;
  const terisi = (Math.min(Math.max(persen, 0), 100) / 100) * keliling;
  const warna = persen >= 100 ? '#10B981' : persen >= 70 ? '#40916C' : persen >= 40 ? '#F59E0B' : '#F43F5E';

  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90" role="img" aria-label={`Kesiapan ${persen} persen`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="#D6EDE0" strokeWidth="11" />
      <circle
        cx="60" cy="60" r={r} fill="none" stroke={warna} strokeWidth="11" strokeLinecap="round"
        strokeDasharray={`${terisi} ${keliling}`}
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
    </svg>
  );
}

export default function MyGearPage() {
  const { user } = useAuth();
  const { rencana, totalHari, ubah: ubahRencana } = useRencana();

  const [semuaAlat, setSemuaAlat] = useState([]);
  const [semuaGunung, setSemuaGunung] = useState([]);
  const [punya, setPunya] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState('');

  const [saran, setSaran] = useState(null);
  const [sumberSaran, setSumberSaran] = useState('');
  const [alasanSaran, setAlasanSaran] = useState('');
  const [memintaSaran, setMemintaSaran] = useState(false);
  const [errorSaran, setErrorSaran] = useState('');

  /* ------------------- memuat data awal ------------------- */
  const muat = useCallback(async () => {
    setMemuat(true); setError('');
    try {
      const [alatRes, gunungRes] = await Promise.all([api.getAlatList(), api.getGunungList()]);
      setSemuaAlat(Array.isArray(alatRes.data) ? alatRes.data : []);
      setSemuaGunung(Array.isArray(gunungRes.data) ? gunungRes.data : []);

      if (supabaseSiap && user) {
        const { data } = await supabase
          .from('user_gear').select('alat_id').eq('user_id', user.id).eq('dimiliki', true);
        setPunya((data || []).map((r) => Number(r.alat_id)));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setMemuat(false);
    }
  }, [user]);

  useEffect(() => { muat(); }, [muat]);

  /* --------------- mencentang / membatalkan --------------- */
  const toggleAlat = async (alatId) => {
    const id = Number(alatId);
    const sudah = punya.includes(id);
    setPunya((lama) => (sudah ? lama.filter((x) => x !== id) : [...lama, id]));
    setSaran(null);

    if (!supabaseSiap || !user) return;
    if (sudah) {
      await supabase.from('user_gear').delete().eq('user_id', user.id).eq('alat_id', id);
    } else {
      await supabase.from('user_gear')
        .upsert({ user_id: user.id, alat_id: id, dimiliki: true }, { onConflict: 'user_id,alat_id' });
    }
  };

  /* ------------------ perhitungan angka ------------------- */
  const {
    alatRelevan, wajib, wajibPunya, persen, belumWajib, beratPunya, alatCamp,
  } = useMemo(() => {
    const campOnly = semuaAlat.filter((a) => (a.konteks || 'semua') === 'camp');
    const relevan = rencana.gaya === 'camp'
      ? semuaAlat
      : semuaAlat.filter((a) => (a.konteks || 'semua') !== 'camp');

    const w = relevan.filter((a) => a.prioritas === 'Wajib');
    const wp = w.filter((a) => punya.includes(Number(a.id)));
    const bw = w.filter((a) => !punya.includes(Number(a.id)));
    const berat = relevan
      .filter((a) => punya.includes(Number(a.id)))
      .reduce((t, a) => t + (parseFloat(String(a.berat_ideal).replace(',', '.')) || 0), 0);

    return {
      alatRelevan: relevan, alatCamp: campOnly,
      wajib: w, wajibPunya: wp, belumWajib: bw, beratPunya: berat,
      persen: w.length ? Math.round((wp.length / w.length) * 100) : 0,
    };
  }, [semuaAlat, punya, rencana.gaya]);

  /* Perlengkapan dikelompokkan per kategori agar daftar panjang tetap terbaca. */
  const perKategori = useMemo(() => {
    const peta = new Map();
    alatRelevan.forEach((a) => {
      const k = a.kategori || 'Lainnya';
      if (!peta.has(k)) peta.set(k, []);
      peta.get(k).push(a);
    });
    return Array.from(peta.entries());
  }, [alatRelevan]);

  const gunungTerpilih = semuaGunung.find((g) => String(g.id) === String(rencana.gunungId));
  const airLiter = (2 * totalHari * rencana.jumlahOrang).toFixed(1);

  /* --------------------- meminta saran -------------------- */
  const mintaSaran = async () => {
    if (!rencana.gunungId) { setErrorSaran('Pilih gunung tujuan dulu.'); return; }
    setMemintaSaran(true); setErrorSaran(''); setSaran(null); setAlasanSaran('');
    try {
      const { data, sumber, alasan } = await api.postSaranGear(
        Number(rencana.gunungId), punya, rencana
      );
      setSaran(data); setSumberSaran(sumber); setAlasanSaran(alasan || '');
    } catch (err) {
      setErrorSaran(err.message);
    } finally {
      setMemintaSaran(false);
    }
  };

  if (memuat) return <section className="page-pad pt-6"><LoadingState jumlah={4} /></section>;
  if (error) return <section className="page-pad pt-6"><ErrorState message={error} onRetry={muat} /></section>;

  return (
    <>
      <PageHeader title="My Gear" subtitle="Cek kesiapan perlengkapanmu" icon={Backpack} />

      <section className="page-pad">
        {/* ================= RINGKASAN KESIAPAN ================= */}
        <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <CincinPersen persen={persen} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-forest-800">{persen}%</span>
                <span className="text-[9px] font-semibold uppercase tracking-wide text-forest-800/45">siap</span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-forest-800">
                {wajibPunya.length} dari {wajib.length} alat wajib
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-forest-800/60">
                Dihitung dari perlengkapan <strong>Wajib</strong> untuk gaya{' '}
                <strong>{rencana.gaya === 'camp' ? 'bermalam' : 'tektok'}</strong>.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="flex items-center gap-1 text-[11px] font-semibold text-forest-500">
                  <Weight size={12} /> ± {beratPunya.toFixed(2)} kg
                </p>
                <p className="flex items-center gap-1 text-[11px] font-semibold text-sky-600">
                  <Droplets size={12} /> ± {airLiter} L air
                </p>
              </div>
            </div>
          </div>

          {persen < 100 && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-amber-800 ring-1 ring-amber-200">
              <TriangleAlert size={15} className="mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                Masih ada {belumWajib.length} perlengkapan wajib yang belum dimiliki:{' '}
                {belumWajib.map((a) => a.nama).join(', ')}.
              </p>
            </div>
          )}

          {rencana.gaya === 'tektok' && alatCamp.length > 0 && (
            <div className="mt-2 flex items-start gap-2 rounded-xl bg-sky-50 p-3 text-sky-900 ring-1 ring-sky-200">
              <Info size={15} className="mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                {alatCamp.length} perlengkapan bermalam disembunyikan karena kamu memilih tektok.
                Ganti ke Bermalam bila berencana menginap.
              </p>
            </div>
          )}
        </div>

        {/* ================= RENCANA PENDAKIAN ================= */}
        <div className="mt-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-forest-800">
            <Mountain size={16} className="text-forest-500" />
            Rencana pendakian
          </h2>

          {/* gunung tujuan */}
          <label className="mt-3 block text-[11px] font-semibold text-forest-800/70" htmlFor="gunung-tujuan">
            Gunung tujuan
          </label>
          <select
            id="gunung-tujuan"
            value={rencana.gunungId}
            onChange={(e) => { ubahRencana({ gunungId: e.target.value }); setSaran(null); setErrorSaran(''); }}
            className="mt-1 w-full rounded-xl border-0 bg-sand px-3.5 py-3 text-sm text-forest-800
                       shadow-sm ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-forest-300"
          >
            <option value="">-- Pilih gunung tujuan --</option>
            {semuaGunung.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nama} ({Number(g.ketinggian).toLocaleString('id-ID')} mdpl, {g.tingkat_kesulitan})
              </option>
            ))}
          </select>

          {/* gaya pendakian */}
          <p className="mt-3.5 text-[11px] font-semibold text-forest-800/70">Gaya pendakian</p>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {[
              { id: 'tektok', label: 'Tektok', ket: 'Naik turun sehari', icon: Sun },
              { id: 'camp',   label: 'Bermalam', ket: 'Menginap di gunung', icon: Tent },
            ].map((g) => {
              const Ikon = g.icon;
              const aktif = rencana.gaya === g.id;
              return (
                <button
                  key={g.id} type="button"
                  onClick={() => { ubahRencana({ gaya: g.id }); setSaran(null); }}
                  aria-pressed={aktif}
                  className={`rounded-xl p-3 text-left ring-1 transition-colors active:scale-[0.98] ${
                    aktif ? 'bg-forest-600 text-white ring-forest-600' : 'bg-sand text-forest-800 ring-black/5'
                  }`}
                >
                  <Ikon size={17} className={aktif ? 'text-white' : 'text-forest-500'} />
                  <span className="mt-1.5 block text-[12px] font-bold">{g.label}</span>
                  <span className={`block text-[10px] ${aktif ? 'text-white/70' : 'text-forest-800/50'}`}>
                    {g.ket}
                  </span>
                </button>
              );
            })}
          </div>

          {/* berapa malam, hanya untuk camp */}
          {rencana.gaya === 'camp' && (
            <>
              <p className="mt-3.5 flex items-center gap-1.5 text-[11px] font-semibold text-forest-800/70">
                <Moon size={12} /> Berapa malam?
              </p>
              <div className="mt-1.5 flex gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n} type="button"
                    onClick={() => { ubahRencana({ lamaMalam: n }); setSaran(null); }}
                    aria-pressed={rencana.lamaMalam === n}
                    aria-label={`${n} malam`}
                    className={`h-9 flex-1 rounded-lg text-[12px] font-bold transition-colors ${
                      rencana.lamaMalam === n
                        ? 'bg-forest-600 text-white'
                        : 'bg-sand text-forest-800/60 ring-1 ring-black/5'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-forest-800/45">
                {rencana.lamaMalam} malam berarti sekitar {totalHari} hari perjalanan.
              </p>
            </>
          )}

          {/* jumlah orang */}
          <p className="mt-3.5 flex items-center gap-1.5 text-[11px] font-semibold text-forest-800/70">
            <Users size={12} /> Jumlah pendaki
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button" aria-label="Kurangi jumlah pendaki"
              onClick={() => { ubahRencana({ jumlahOrang: Math.max(1, rencana.jumlahOrang - 1) }); setSaran(null); }}
              className="h-9 w-9 rounded-lg bg-sand text-sm font-bold text-forest-800 ring-1 ring-black/5 active:scale-95"
            >
              −
            </button>
            <span className="min-w-[3.5rem] text-center text-sm font-bold text-forest-800">
              {rencana.jumlahOrang} orang
            </span>
            <button
              type="button" aria-label="Tambah jumlah pendaki"
              onClick={() => { ubahRencana({ jumlahOrang: Math.min(20, rencana.jumlahOrang + 1) }); setSaran(null); }}
              className="h-9 w-9 rounded-lg bg-sand text-sm font-bold text-forest-800 ring-1 ring-black/5 active:scale-95"
            >
              +
            </button>
          </div>

          <button
            type="button" onClick={mintaSaran} disabled={memintaSaran}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-600 py-3
                       text-xs font-semibold text-white active:scale-[0.98] disabled:opacity-60"
          >
            {memintaSaran ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {memintaSaran ? 'Menganalisis persiapanmu...' : 'Minta Saran Persiapan'}
          </button>

          {errorSaran && (
            <p className="mt-2.5 rounded-lg bg-rose-50 p-2.5 text-[11px] leading-relaxed text-rose-700">{errorSaran}</p>
          )}

          {saran && (
            <div className="mt-3 rounded-xl bg-forest-100/60 p-3.5 ring-1 ring-forest-200">
              <p className="text-[11px] font-bold text-forest-600">
                Saran untuk {saran.gunung} — kesiapan {saran.persen_kesiapan}%
              </p>
              <ul className="mt-2 space-y-2">
                {saran.saran.map((s, i) => (
                  <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-forest-800/80">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-forest-500" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2.5 text-[10px] italic text-forest-800/45">Sumber saran: {sumberSaran}</p>
              {alasanSaran && (
                <p className="mt-1 text-[10px] leading-relaxed text-forest-800/40">
                  Keterangan teknis: {alasanSaran}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ================= DAFTAR PERLENGKAPAN ================= */}
        <div className="mb-2 mt-5 flex items-end justify-between">
          <h2 className="text-sm font-bold text-forest-800">Centang yang sudah kamu punya</h2>
          <span className="text-[11px] font-semibold text-forest-800/45">
            {punya.filter((id) => alatRelevan.some((a) => Number(a.id) === id)).length}/{alatRelevan.length}
          </span>
        </div>

        <div className="space-y-4">
          {perKategori.map(([kategori, daftar]) => (
            <div key={kategori}>
              <h3 className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-forest-800/40">
                {kategori}
              </h3>
              <div className="space-y-2">
                {daftar.map((a) => {
                  const dimiliki = punya.includes(Number(a.id));
                  return (
                    <button
                      key={a.id} type="button" onClick={() => toggleAlat(a.id)} aria-pressed={dimiliki}
                      className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left ring-1
                                  transition-colors active:scale-[0.99] ${
                        dimiliki ? 'bg-forest-100/70 ring-forest-300' : 'bg-white ring-black/5'
                      }`}
                    >
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ${
                        dimiliki ? 'bg-forest-500 text-white ring-forest-500' : 'bg-white ring-forest-800/20'
                      }`}>
                        {dimiliki && <Check size={14} strokeWidth={3} />}
                      </span>

                      <SafeImage
                        src={a.gambar_url} alt={a.nama}
                        className={`h-12 w-12 shrink-0 rounded-lg object-cover ${dimiliki ? '' : 'opacity-80'}`}
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-forest-800">{a.nama}</span>
                        <span className="mt-0.5 block truncate text-[11px] text-forest-800/55">
                          {a.berat_ideal}
                          {(a.konteks || 'semua') === 'camp' && ' · hanya untuk bermalam'}
                        </span>
                      </span>

                      <PriorityBadge level={a.prioritas} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {gunungTerpilih && (
          <p className="mt-5 text-center text-[11px] text-forest-800/45">
            Target saat ini: {gunungTerpilih.nama} · {gunungTerpilih.estimasi_waktu} ·{' '}
            {rencana.gaya === 'camp' ? `${rencana.lamaMalam} malam` : 'tektok'} · {rencana.jumlahOrang} orang
          </p>
        )}
      </section>
    </>
  );
}
