/**
 * ============================================================
 *  HALAMAN MY GEAR
 *  Pengguna mencentang perlengkapan yang sudah dimiliki, lalu
 *  memilih gunung tujuan. Aplikasi menghitung persentase
 *  kesiapan (dari alat berstatus WAJIB) dan meminta saran
 *  persiapan ke backend, yang meneruskannya ke Gemini.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Backpack, Check, Mountain, Sparkles, TriangleAlert, RefreshCw, Weight,
} from 'lucide-react';
import api from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { PriorityBadge } from '../components/DifficultyBadge.jsx';
import { ErrorState, LoadingState } from '../components/StateViews.jsx';
import { supabase, supabaseSiap } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';

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

  const [semuaAlat, setSemuaAlat] = useState([]);
  const [semuaGunung, setSemuaGunung] = useState([]);
  const [punya, setPunya] = useState([]);          // array id alat
  const [gunungId, setGunungId] = useState('');
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState('');

  const [saran, setSaran] = useState(null);
  const [sumberSaran, setSumberSaran] = useState('');
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
    setSaran(null); // saran lama tidak berlaku lagi

    if (!supabaseSiap || !user) return;
    if (sudah) {
      await supabase.from('user_gear').delete().eq('user_id', user.id).eq('alat_id', id);
    } else {
      await supabase.from('user_gear')
        .upsert({ user_id: user.id, alat_id: id, dimiliki: true }, { onConflict: 'user_id,alat_id' });
    }
  };

  /* ------------------ perhitungan angka ------------------- */
  const { wajib, wajibPunya, persen, belum, beratPunya } = useMemo(() => {
    const w = semuaAlat.filter((a) => a.prioritas === 'Wajib');
    const wp = w.filter((a) => punya.includes(Number(a.id)));
    const bl = semuaAlat.filter((a) => !punya.includes(Number(a.id)));
    const berat = semuaAlat
      .filter((a) => punya.includes(Number(a.id)))
      .reduce((t, a) => t + (parseFloat(String(a.berat_ideal).replace(',', '.')) || 0), 0);
    return {
      wajib: w, wajibPunya: wp, belum: bl, beratPunya: berat,
      persen: w.length ? Math.round((wp.length / w.length) * 100) : 0,
    };
  }, [semuaAlat, punya]);

  const gunungTerpilih = semuaGunung.find((g) => String(g.id) === String(gunungId));

  /* --------------------- meminta saran -------------------- */
  const mintaSaran = async () => {
    if (!gunungId) { setErrorSaran('Pilih gunung tujuan dulu.'); return; }
    setMemintaSaran(true); setErrorSaran(''); setSaran(null);
    try {
      const { data, sumber } = await api.postSaranGear(Number(gunungId), punya);
      setSaran(data); setSumberSaran(sumber);
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
        {/* ---------- RINGKASAN KESIAPAN ---------- */}
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
                Persentase dihitung dari perlengkapan berstatus <strong>Wajib</strong>, karena itu yang menentukan keselamatan.
              </p>
              <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-forest-500">
                <Weight size={12} />
                Total bawaan ± {beratPunya.toFixed(2)} kg
              </p>
            </div>
          </div>

          {persen < 100 && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-amber-800 ring-1 ring-amber-200">
              <TriangleAlert size={15} className="mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                Masih ada {wajib.length - wajibPunya.length} perlengkapan wajib yang belum dimiliki.
              </p>
            </div>
          )}
        </div>

        {/* ---------- PILIH GUNUNG + MINTA SARAN ---------- */}
        <div className="mt-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-forest-800">
            <Mountain size={16} className="text-forest-500" />
            Rencana pendakian
          </h2>

          <select
            value={gunungId}
            onChange={(e) => { setGunungId(e.target.value); setSaran(null); setErrorSaran(''); }}
            aria-label="Pilih gunung tujuan"
            className="mt-2.5 w-full rounded-xl border-0 bg-sand px-3.5 py-3 text-sm text-forest-800
                       shadow-sm ring-1 ring-black/5 outline-none focus:ring-2 focus:ring-forest-300"
          >
            <option value="">-- Pilih gunung tujuan --</option>
            {semuaGunung.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nama} ({Number(g.ketinggian).toLocaleString('id-ID')} mdpl, {g.tingkat_kesulitan})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={mintaSaran}
            disabled={memintaSaran}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-600 py-3
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
              <p className="mt-2.5 text-[10px] italic text-forest-800/45">
                Sumber saran: {sumberSaran}
              </p>
            </div>
          )}
        </div>

        {/* ---------- DAFTAR CENTANG PERLENGKAPAN ---------- */}
        <h2 className="mb-2 mt-5 text-sm font-bold text-forest-800">
          Centang yang sudah kamu punya
        </h2>
        <div className="space-y-2">
          {semuaAlat.map((a) => {
            const dimiliki = punya.includes(Number(a.id));
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAlat(a.id)}
                aria-pressed={dimiliki}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left ring-1 transition-colors active:scale-[0.99] ${
                  dimiliki ? 'bg-forest-100/70 ring-forest-300' : 'bg-white ring-black/5'
                }`}
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ${
                  dimiliki ? 'bg-forest-500 text-white ring-forest-500' : 'bg-white ring-forest-800/20'
                }`}>
                  {dimiliki && <Check size={14} strokeWidth={3} />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-forest-800">{a.nama}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-forest-800/55">
                    {a.kategori} · {a.berat_ideal}
                  </span>
                </span>

                <PriorityBadge level={a.prioritas} />
              </button>
            );
          })}
        </div>

        {belum.length > 0 && (
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
            <h3 className="text-xs font-bold text-forest-800">Belum dimiliki ({belum.length})</h3>
            <p className="mt-1.5 text-[11px] leading-relaxed text-forest-800/60">
              {belum.map((a) => a.nama).join(', ')}.
            </p>
          </div>
        )}

        {gunungTerpilih && (
          <p className="mt-4 text-center text-[11px] text-forest-800/45">
            Target saat ini: {gunungTerpilih.nama} · {gunungTerpilih.estimasi_waktu}
          </p>
        )}
      </section>
    </>
  );
}
