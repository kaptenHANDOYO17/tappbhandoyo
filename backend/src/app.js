/**
 * ============================================================
 *  MountTrack REST API - EXPRESS APP
 * ------------------------------------------------------------
 *  Sistem Informasi Jalur Pendakian dan Katalog Perlengkapan
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

const express = require('express');
const cors = require('cors');

const gunungRoutes = require('./routes/gunungRoutes');
const alatRoutes = require('./routes/alatRoutes');
const { dataSourceMode } = require('./lib/supabase');

const app = express();

/* ---------------------- MIDDLEWARE ---------------------- */

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Izinkan request tanpa origin (Postman/cURL) dan semua origin
      // bila CORS_ORIGIN tidak diisi (mode pengembangan).
      if (!origin || allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, true); // tetap diizinkan agar demo PWA tidak terblokir
    },
    methods: ['GET', 'OPTIONS'],
    credentials: false,
  })
);

app.use(express.json());

// Logger sederhana
app.use((req, res, next) => {
  const waktu = new Date().toISOString();
  console.log(`[${waktu}] ${req.method} ${req.originalUrl}`);
  next();
});

/* ------------------------ ROUTES ------------------------ */

// Root - dokumentasi ringkas
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    aplikasi: 'MountTrack REST API',
    deskripsi: 'Sistem Informasi Jalur Pendakian dan Katalog Perlengkapan Gunung',
    pembuat: {
      nama: 'Handoyo',
      nim: '21120124120040',
      program_studi: 'Teknik Komputer',
    },
    sumber_data: dataSourceMode,
    endpoints: [
      'GET /api/gunung',
      'GET /api/gunung/:id',
      'GET /api/alat',
      'GET /api/alat/:id',
      'GET /api/health',
    ],
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    sumber_data: dataSourceMode,
    waktu_server: new Date().toISOString(),
  });
});

app.use('/api/gunung', gunungRoutes);
app.use('/api/alat', alatRoutes);

/* -------------------- ERROR HANDLING -------------------- */

// 404 - route tidak dikenal
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
    data: null,
  });
});

// 500 - error handler terpusat
app.use((err, req, res, next) => {
  console.error('[MountTrack] Terjadi error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
    data: null,
  });
});

module.exports = app;
