# MountTrack - Backend REST API

Web service buatan sendiri untuk aplikasi PWA **MountTrack**.

- Nama  : Handoyo
- NIM   : 21120124120040
- Prodi : Teknik Komputer

## Menjalankan

```bash
cd backend
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev
```

Server berjalan di `http://localhost:5000`.

Jika `SUPABASE_URL` pada `.env` dibiarkan kosong, server otomatis
memakai **fallback data array JSON lokal**, sehingga API langsung
bisa dites tanpa setup database.

## Endpoint

| Method | Endpoint           | Keterangan                         |
|--------|--------------------|------------------------------------|
| GET    | `/`                | Dokumentasi ringkas + identitas    |
| GET    | `/api/health`      | Status server & sumber data        |
| GET    | `/api/gunung`      | List semua gunung                  |
| GET    | `/api/gunung/:id`  | Detail satu gunung                 |
| GET    | `/api/alat`        | List semua perlengkapan            |
| GET    | `/api/alat/:id`    | Detail satu perlengkapan           |

Query opsional: `/api/gunung?search=prau`, `/api/gunung?kesulitan=Pemula`,
`/api/alat?kategori=Penerangan`, `/api/alat?search=headlamp`.

## Uji otomatis

```bash
npm run test:api
```
