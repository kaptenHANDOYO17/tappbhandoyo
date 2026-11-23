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

-- ============================================================
--  BAGIAN 2: FITUR PENGGUNA (profil, wishlist, my gear)
--  Dijalankan setelah bagian di atas.
-- ============================================================

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nama        text not null default 'Pendaki Baru',
  nim         text,
  prodi       text,
  bio         text,
  asal_kota   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.wishlist (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  gunung_id  integer not null references public.gunung(id) on delete cascade,
  catatan    text,
  created_at timestamptz not null default now(),
  unique (user_id, gunung_id)
);

create table if not exists public.user_gear (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  alat_id    integer not null references public.alat(id) on delete cascade,
  dimiliki   boolean not null default true,
  catatan    text,
  created_at timestamptz not null default now(),
  unique (user_id, alat_id)
);

create index if not exists wishlist_user_idx  on public.wishlist (user_id);
create index if not exists user_gear_user_idx on public.user_gear (user_id);

alter table public.profiles  enable row level security;
alter table public.wishlist  enable row level security;
alter table public.user_gear enable row level security;

drop policy if exists "profil sendiri - baca"  on public.profiles;
drop policy if exists "profil sendiri - tulis" on public.profiles;
drop policy if exists "profil sendiri - ubah"  on public.profiles;
create policy "profil sendiri - baca"  on public.profiles for select using (auth.uid() = id);
create policy "profil sendiri - tulis" on public.profiles for insert with check (auth.uid() = id);
create policy "profil sendiri - ubah"  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "wishlist sendiri" on public.wishlist;
create policy "wishlist sendiri" on public.wishlist for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "gear sendiri" on public.user_gear;
create policy "gear sendiri" on public.user_gear for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Profil otomatis dibuat saat pengguna mendaftar
create or replace function public.buat_profil_baru()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nama)
  values (new.id, coalesce(new.raw_user_meta_data->>'nama', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.buat_profil_baru();

-- Bucket foto profil
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatar', 'avatar', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true;

drop policy if exists "avatar baca publik"    on storage.objects;
drop policy if exists "avatar unggah sendiri" on storage.objects;
drop policy if exists "avatar ubah sendiri"   on storage.objects;
create policy "avatar baca publik" on storage.objects for select using (bucket_id = 'avatar');
create policy "avatar unggah sendiri" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatar' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar ubah sendiri" on storage.objects for update to authenticated
  using (bucket_id = 'avatar' and (storage.foldername(name))[1] = auth.uid()::text);
