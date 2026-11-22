# MountTrack

**Sistem Informasi Jalur Pendakian dan Katalog Perlengkapan Gunung**
Tugas Akhir Praktikum Pemrograman Perangkat Bergerak (PPB)

| | |
|---|---|
| **Nama** | Handoyo |
| **NIM** | 21120124120040 |
| **Program Studi** | Teknik Komputer |
| **Arsitektur** | Progressive Web App (React + Vite) + REST API (Express.js) |

---

## 1. Ringkasan Teknologi

**Backend (`backend/`)**
Node.js · Express.js · CORS · dotenv · @supabase/supabase-js
*(dilengkapi fallback data array JSON lokal — server langsung jalan walau Supabase belum diisi)*

**Frontend (`frontend/`)**
React 18 · Vite · React Router DOM v6 · Tailwind CSS · Lucide React · vite-plugin-pwa

---

## 2. Prasyarat

- **Node.js versi 18 atau lebih baru** → cek dengan `node -v`
- npm (otomatis terpasang bersama Node.js)
- Browser modern (Chrome / Edge) untuk menguji fitur PWA

---

## 3. Cara Menjalankan (Langkah demi Langkah)

Aplikasi terdiri dari **dua server** yang harus jalan bersamaan.
Buka **dua jendela terminal** terpisah.

### Terminal 1 — Backend (REST API)

```bash
cd mounttrack-ta/backend
npm install
npm run dev
```

Tampil di terminal:

```
   MountTrack REST API berhasil dijalankan
   URL        : http://localhost:5000
   Sumber data: FALLBACK
```

> Biarkan terminal ini tetap terbuka.

### Terminal 2 — Frontend (PWA)

```bash
cd mounttrack-ta/frontend
npm install
npm run dev
```

Tampil di terminal:

```
  ➜  Local:   http://localhost:5173/
```

**Buka `http://localhost:5173` di browser.** Aplikasi siap digunakan.

> File `.env` untuk backend dan frontend **sudah disertakan** dan siap pakai.
> Jika hilang, salin ulang dari `.env.example`
> (`cp .env.example .env`, Windows: `copy .env.example .env`).

### Alternatif: perintah ringkas dari folder root

```bash
cd mounttrack-ta
npm run install:all      # install dependency backend + frontend sekaligus
npm run dev:backend      # terminal 1
npm run dev:frontend     # terminal 2
```

---

## 4. Menguji REST API

### Lewat browser / Postman

| Method | URL | Keterangan |
|--------|-----|------------|
| GET | `http://localhost:5000/api/gunung` | List semua gunung (5 data) |
| GET | `http://localhost:5000/api/gunung/1` | Detail gunung ID 1 |
| GET | `http://localhost:5000/api/alat` | List perlengkapan (8 data) |
| GET | `http://localhost:5000/api/alat/1` | Detail perlengkapan ID 1 |
| GET | `http://localhost:5000/api/health` | Status server & sumber data |

Query tambahan (opsional):
`/api/gunung?search=prau` · `/api/gunung?kesulitan=Pemula` · `/api/alat?kategori=Penerangan`

Contoh respons:

```json
{
  "success": true,
  "message": "Daftar gunung berhasil diambil",
  "source": "fallback",
  "total": 5,
  "data": [ { "id": 1, "nama": "Gunung Prau", "...": "..." } ]
}
```

### Uji otomatis (16 pemeriksaan)

```bash
cd backend
npm run test:api
```

Script ini menyalakan server di port acak, memanggil seluruh endpoint,
memeriksa status code dan kelengkapan field, lalu mematikannya kembali.

---

## 5. Menguji Fitur PWA (Install ke HP / Desktop)

Service worker **hanya aktif pada mode produksi**, jadi lakukan build dulu:

```bash
cd frontend
npm run build
npm run preview        # buka http://localhost:4173
```

Lalu di Chrome:

1. Buka `http://localhost:4173`
2. Tekan **F12 → tab Application**
   - **Manifest** → nama "MountTrack", theme color `#1B4332`, ikon 192/512 px
   - **Service Workers** → status *activated and is running*
3. Klik ikon **Install** (⊕) di address bar untuk memasang aplikasi
4. Uji offline: **Application → Service Workers → centang Offline**, lalu refresh.
   Aplikasi tetap terbuka dan data terakhir tetap tampil.

**Membuka dari HP (satu jaringan WiFi):**
jalankan `npm run preview -- --host`, lalu buka alamat `Network:` yang muncul dari browser HP.
Di Chrome Android pilih menu **⋮ → Add to Home screen**.

---

## 6. Deploy ke Vercel

**Push ke GitHub cukup SEKALI.** Satu repository berisi folder `backend/` dan
`frontend/` sekaligus (struktur monorepo seperti paket ini).

Yang dilakukan dua kali adalah **membuat Project di Vercel**, bukan push-nya.
Alasannya: satu Project Vercel hanya menghasilkan **satu jenis output**.
Backend berjalan sebagai *serverless function* Node.js, sedangkan frontend
adalah *static site* hasil `vite build`. Build command dan output directory-nya
berbeda, jadi keduanya tidak bisa ditampung satu Project.

Vercel memang mendukung pola ini: satu repository boleh dipakai oleh beberapa
Project, masing-masing dibedakan lewat pengaturan **Root Directory**.
Setelah itu, setiap `git push` akan **otomatis men-deploy ulang keduanya** —
Anda tidak perlu push dua kali selamanya.

### Langkah 0 — Push sekali saja

```bash
cd mounttrack-ta
git init
git add .
git commit -m "MountTrack - Tugas Akhir Praktikum PPB"
git branch -M main
git remote add origin https://github.com/USERNAME/mounttrack-ta.git
git push -u origin main
```

### Langkah 1 — Project untuk Backend

1. Vercel → **Add New → Project → Import** repository `mounttrack-ta`.
2. **Root Directory** → klik *Edit* → pilih folder **`backend`**.
3. Beri nama project, misal `mounttrack-api`, lalu **Deploy**.
   File `backend/vercel.json` sudah mengatur routing serverless-nya.
4. Catat URL hasilnya, misal `https://mounttrack-api.vercel.app`.
5. Uji: buka `https://mounttrack-api.vercel.app/api/gunung`.

### Langkah 2 — Project untuk Frontend

1. Vercel → **Add New → Project → Import** **repository yang sama**.
2. **Root Directory** → pilih folder **`frontend`**.
3. **Framework Preset**: Vite · **Build Command**: `npm run build` · **Output**: `dist`
4. **Environment Variables**, tambahkan sebelum Deploy:

   | Name | Value |
   |------|-------|
   | `VITE_API_BASE_URL` | `https://mounttrack-api.vercel.app` |

5. Klik **Deploy**. Jika variabel baru ditambahkan setelah deploy pertama,
   lakukan **Redeploy** agar nilainya ikut ter-build.

`frontend/vercel.json` sudah menangani SPA routing React Router, sehingga
halaman seperti `/gunung/3` **tidak 404** ketika di-refresh.

### Catatan: bisakah benar-benar jadi satu Project?

Bisa, dengan cara mengubah backend menjadi *serverless function* di dalam
project frontend (folder `api/`), sehingga frontend dan API berbagi satu domain
dan `VITE_API_BASE_URL` tidak diperlukan lagi.

Konsekuensinya: perintah `npm run dev` untuk backend yang terpisah menjadi
hilang, padahal pemisahan frontend–backend justru yang ingin ditunjukkan pada
praktikum ini. Karena itu paket ini memakai dua Project — satu repo, dua
Project, satu kali push.

---

## 7. Database Supabase (SUDAH DIBUATKAN DAN TERISI)

Project Supabase sudah dibuat, tabelnya sudah jadi, dan datanya sudah terisi.
Tidak perlu setup dari nol.

| | |
|---|---|
| **Nama project** | `mounttrack` |
| **Region** | Singapore (`ap-southeast-1`) |
| **Project URL** | `https://kquucgissbdkwdwgarjk.supabase.co` |
| **Isi tabel `gunung`** | 10 baris |
| **Isi tabel `alat`** | 8 baris |
| **Bucket Storage** | `foto-gunung` (publik, siap diisi foto) |

Kredensialnya sudah tertulis di `backend/.env`, jadi backend lokal langsung
tersambung. Nilai `SUPABASE_ANON_KEY` aman dipakai di sisi klien karena
Row Level Security sudah dinyalakan dan **hanya mengizinkan SELECT**.

### Kalau suatu saat perlu membuat ulang databasenya

Dua berkas SQL sudah disiapkan — tinggal paste, sekali jalan, tidak satu per satu:

1. Buka Supabase Dashboard → **SQL Editor** → **New query**
2. Paste isi `supabase/schema.sql` → **Run** (membuat tabel, RLS, bucket)
3. Paste isi `supabase/seed.sql` → **Run** (mengisi 10 gunung + 8 alat sekaligus)

### Mekanisme fallback dan batas waktunya

Backend selalu mencoba Supabase lebih dulu. Bila Supabase kosong, error,
**atau tidak merespons dalam `SUPABASE_TIMEOUT_MS` (default 4000 ms)**,
server otomatis memakai data lokal di `backend/src/data/`.

Batas waktu ini penting: tanpa itu, Supabase yang sedang down membuat seluruh
request API menggantung sampai timeout jaringan (terukur ~7 detik saat diuji).
Isi dan ID data lokal dibuat sama persis dengan isi tabel Supabase, sehingga
`/api/gunung/3` menunjuk gunung yang sama di kedua sumber.

Field `source` pada setiap respons API memberitahu data berasal dari mana:
`"source": "supabase"` atau `"source": "fallback"`.

---

## 8. Struktur Folder

```
mounttrack-ta/
├── package.json                  # skrip bantu (install:all, dev:backend, dev:frontend)
├── README.md
├── .gitignore
│
├── supabase/
│   ├── schema.sql                # tabel + RLS + bucket storage
│   └── seed.sql                  # 10 gunung + 8 alat, sekali jalan
│
├── backend/
│   ├── package.json
│   ├── server.js                 # entry point, app.listen()
│   ├── vercel.json               # konfigurasi serverless Vercel
│   ├── .env                      # siap pakai (PORT, CORS, Supabase kosong)
│   ├── .env.example
│   ├── .gitignore
│   ├── README.md
│   ├── scripts/
│   │   └── smoke-test.js         # uji otomatis 4 endpoint utama
│   └── src/
│       ├── app.js                # konfigurasi Express, CORS, error handler
│       ├── controllers/
│       │   ├── gunungController.js
│       │   └── alatController.js
│       ├── routes/
│       │   ├── gunungRoutes.js
│       │   └── alatRoutes.js
│       ├── lib/
│       │   ├── supabase.js       # client Supabase + deteksi mode fallback
│       │   └── dataService.js    # repository: Supabase -> fallback lokal
│       └── data/
│           ├── gunung.js         # 5 data gunung
│           └── alat.js           # 8 data perlengkapan
│
└── frontend/
    ├── package.json
    ├── vite.config.js            # konfigurasi vite-plugin-pwa (manifest + workbox)
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── vercel.json               # rewrite SPA React Router
    ├── .env                      # siap pakai (VITE_API_BASE_URL)
    ├── .env.example
    ├── .gitignore
    ├── public/
    │   ├── favicon.svg
    │   ├── masked-icon.svg
    │   ├── apple-touch-icon.png
    │   ├── favicon-32x32.png
    │   ├── pwa-192x192.png
    │   ├── pwa-512x512.png
    │   ├── pwa-maskable-512x512.png
    │   ├── robots.txt
    │   └── images/               # ilustrasi gunung & alat (ikut di-cache offline)
    │       ├── gunung-prau.svg
    │       ├── gunung-sindoro.svg
    │       ├── gunung-sumbing.svg
    │       ├── gunung-bismo.svg
    │       ├── gunung-pakuwaja.svg
    │       ├── gunung-ungaran.svg
    │       ├── gunung-andong.svg
    │       ├── gunung-kerinci.svg
    │       ├── gunung-telomoyo.svg
    │       ├── gunung-merbabu.svg
    │       ├── alat-tas-carrier.svg
    │       ├── alat-sleeping-bag.svg
    │       ├── alat-sepatu-tracking.svg
    │       ├── alat-headlamp.svg
    │       ├── alat-jaket-windproof.svg
    │       ├── alat-matras.svg
    │       ├── alat-trekking-pole.svg
    │       └── alat-kompor-portable.svg
    └── src/
        ├── main.jsx              # entry React + BrowserRouter
        ├── App.jsx               # definisi seluruh route
        ├── index.css             # Tailwind + style container 480px
        ├── api/
        │   └── client.js         # fetch + timeout + cache localStorage
        ├── components/
        │   ├── AppLayout.jsx     # shell mobile max-w-480px
        │   ├── BottomNav.jsx     # bottom navigation 3 menu
        │   ├── PageHeader.jsx
        │   ├── SearchBar.jsx
        │   ├── DifficultyBadge.jsx
        │   ├── GunungCard.jsx
        │   ├── AlatCard.jsx
        │   ├── SafeImage.jsx
        │   ├── BackButton.jsx
        │   └── StateViews.jsx    # loading / error / empty / offline
        └── pages/
            ├── GunungListPage.jsx    # Halaman List 1
            ├── GunungDetailPage.jsx  # Halaman Detail 1
            ├── AlatListPage.jsx      # Halaman List 2
            ├── AlatDetailPage.jsx    # Halaman Detail 2
            ├── ProfilePage.jsx       # Halaman Profile
            └── NotFoundPage.jsx      # fallback 404
```

---

## 9. Pemetaan Ketentuan Tugas

| Ketentuan | Implementasi |
|-----------|--------------|
| Web service buatan sendiri | `backend/` berbasis Express.js |
| `GET /api/gunung` | `routes/gunungRoutes.js` → 5 data gunung |
| `GET /api/gunung/:id` | Detail + validasi ID + respons 404 |
| `GET /api/alat` | `routes/alatRoutes.js` → 8 data perlengkapan |
| `GET /api/alat/:id` | Detail + validasi ID + respons 404 |
| Fallback tanpa Supabase | `lib/supabase.js` + `lib/dataService.js` |
| Tampilan mobile-first 480px | `.app-shell` pada `src/index.css` |
| Bottom Navigation 3 menu | `components/BottomNav.jsx` |
| Halaman List 1 + search + badge | `pages/GunungListPage.jsx` |
| Halaman Detail 1 + tombol Back | `pages/GunungDetailPage.jsx` |
| Halaman List 2 + filter kategori | `pages/AlatListPage.jsx` |
| Halaman Detail 2 + peringatan risiko | `pages/AlatDetailPage.jsx` |
| Halaman Profile | `pages/ProfilePage.jsx` |
| Konfigurasi PWA | `vite.config.js` (registerType `autoUpdate`) |
| Ikon PWA tersedia | `public/pwa-192x192.png`, `pwa-512x512.png`, dll. |
| `vercel.json` backend & frontend | tersedia di kedua folder |

---

## 10. Troubleshooting

| Masalah | Penyebab & Solusi |
|---------|-------------------|
| Halaman menampilkan "Gagal memuat data" | Backend belum jalan. Jalankan `npm run dev` di folder `backend`. |
| `EADDRINUSE: port 5000` | Port terpakai aplikasi lain. Ubah `PORT=5001` di `backend/.env`, lalu samakan `VITE_API_BASE_URL` di `frontend/.env`. |
| Perubahan `.env` tidak terbaca | Vite membaca `.env` saat start. Hentikan server (Ctrl+C) lalu jalankan `npm run dev` lagi. |
| Service worker tidak muncul | Service worker hanya aktif pada hasil `npm run build` + `npm run preview`, bukan pada `npm run dev`. |
| Aplikasi lama masih tampil setelah update | Application → Storage → **Clear site data**, lalu refresh. |
| Refresh `/gunung/3` jadi 404 setelah deploy | Pastikan `frontend/vercel.json` ikut ter-push dan Root Directory di Vercel benar. |
| `npm install` gagal | Pastikan Node.js ≥ 18 (`node -v`), lalu hapus `node_modules` dan `package-lock.json`, ulangi. |

---

## 11. Status Pengujian

Seluruh kode pada paket ini sudah dijalankan dan diuji, bukan sekadar ditulis:

- `npm run test:api` → **16 pemeriksaan lulus, 0 gagal**
  (4 endpoint utama, validasi 400, 404, query search & filter)
- `npm run build` → **berhasil**, service worker + `manifest.webmanifest` dihasilkan,
  38 entri precache (termasuk seluruh gambar, sehingga tetap tampil offline)
- Uji end-to-end dengan browser headless → **39 pemeriksaan lulus, 0 gagal, tanpa error console**
  (navigasi 5 halaman, search, filter kesulitan, filter kategori, tombol Back,
  deep link `/alat/4` di-refresh tidak 404, lebar container terukur ≤ 480 px,
  service worker aktif, serta **mode offline** tetap menampilkan data dari cache)

### Bug yang ditemukan dan diperbaiki saat pengujian

Saat `SUPABASE_URL` diisi tetapi Supabase tidak dapat dihubungi, setiap request API
menggantung **±7 detik** sebelum jatuh ke fallback — fallback-nya benar, tetapi tidak
dibatasi waktu. Ditambahkan `SUPABASE_TIMEOUT_MS` (default 4000 ms) pada
`backend/src/lib/dataService.js`. Hasil pengukuran sesudah perbaikan:

| Kondisi | Waktu respons `/api/gunung` | Sumber data |
|---|---|---|
| Sebelum perbaikan | ± 7,0 detik | fallback |
| Sesudah (default 4000 ms) | 4,01 detik | fallback |
| Sesudah (`SUPABASE_TIMEOUT_MS=1200`) | 1,21 detik | fallback |

Saat Supabase normal, respons tetap langsung dari Supabase tanpa penundaan.

---

## 12. Langkah yang Tersisa

### a. Membuat repository GitHub, lalu push


```bash
cd mounttrack-ta
git init
git add .
git commit -m "MountTrack - Tugas Akhir Praktikum PPB"
git branch -M main
git remote add origin https://github.com/kaptenHANDOYO17/mounttrack-ta.git
git push -u origin main
```

`.gitignore` sudah menahan `node_modules/`, `dist/`, dan `.env`, jadi aman.

### b. Deploy ke Vercel


---

© 2026 Handoyo · 21120124120040 · Teknik Komputer
