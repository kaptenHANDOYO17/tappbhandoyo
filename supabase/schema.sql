-- ============================================================
--  MountTrack - SKEMA DATABASE SUPABASE
--  Handoyo | 21120124120040 | Teknik Komputer
--  Jalankan di: Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

create table if not exists public.gunung (
  id                serial primary key,
  nama              text    not null,
  lokasi            text    not null,
  ketinggian        integer not null,
  jalur_populer     text    not null,
  estimasi_waktu    text    not null,
  harga_tiket       integer not null default 0,
  tingkat_kesulitan text    not null check (tingkat_kesulitan in ('Pemula','Menengah','Sulit')),
  gambar_url        text,
  deskripsi         text    not null,
  created_at        timestamptz not null default now()
);

create table if not exists public.alat (
  id                serial primary key,
  nama              text not null,
  kategori          text not null,
  berat_ideal       text not null,
  prioritas         text not null check (prioritas in ('Wajib','Penting','Opsional')),
  gambar_url        text,
  fungsi            text not null,
  risiko_tanpa_alat text not null,
  created_at        timestamptz not null default now()
);

create index if not exists gunung_kesulitan_idx on public.gunung (tingkat_kesulitan);
create index if not exists alat_kategori_idx    on public.alat (kategori);

-- RLS: katalog publik, hanya boleh dibaca lewat anon key
alter table public.gunung enable row level security;
alter table public.alat   enable row level security;

drop policy if exists "baca publik gunung" on public.gunung;
create policy "baca publik gunung" on public.gunung for select to anon, authenticated using (true);

drop policy if exists "baca publik alat" on public.alat;
create policy "baca publik alat" on public.alat for select to anon, authenticated using (true);

-- Bucket penyimpanan foto gunung (publik, hanya baca)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('foto-gunung', 'foto-gunung', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true;

drop policy if exists "baca publik foto gunung" on storage.objects;
create policy "baca publik foto gunung" on storage.objects
  for select to anon, authenticated using (bucket_id = 'foto-gunung');
