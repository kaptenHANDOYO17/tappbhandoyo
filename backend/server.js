/**
 * ============================================================
 *  ENTRY POINT SERVER - MountTrack REST API
 * ------------------------------------------------------------
 *  Jalankan dengan: npm run dev   (atau npm start)
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

require('dotenv').config();

const app = require('./src/app');
const { dataSourceMode } = require('./src/lib/supabase');

const PORT = process.env.PORT || 5000;

// Di Vercel (serverless) module langsung diekspor tanpa listen().
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('');
    console.log('==============================================');
    console.log('   MountTrack REST API berhasil dijalankan');
    console.log('==============================================');
    console.log(`   URL        : http://localhost:${PORT}`);
    console.log(`   Sumber data: ${dataSourceMode.toUpperCase()}`);
    if (dataSourceMode === 'fallback') {
      console.log('   Catatan    : SUPABASE_URL belum diisi,');
      console.log('                server memakai data lokal.');
    }
    console.log('----------------------------------------------');
    console.log(`   GET http://localhost:${PORT}/api/gunung`);
    console.log(`   GET http://localhost:${PORT}/api/gunung/1`);
    console.log(`   GET http://localhost:${PORT}/api/alat`);
    console.log(`   GET http://localhost:${PORT}/api/alat/1`);
    console.log('==============================================');
    console.log('');
  });
}

module.exports = app;
