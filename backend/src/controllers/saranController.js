/**
 *  CONTROLLER SARAN PERLENGKAPAN (AI + cadangan berbasis aturan)
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

const { mintaSaran, geminiAktif, MODEL } = require('../lib/gemini');
const { findAll } = require('../lib/dataService');

/** Menyusun saran tanpa AI, murni dari aturan pendakian. */
function saranAturan({ gunung, belum, persen }) {
  const hasil = [];
  const tinggi = Number(gunung?.ketinggian) || 0;
  const sulit = String(gunung?.tingkat_kesulitan || '').toLowerCase();

  if (persen >= 100) {
    hasil.push('Perlengkapan wajib sudah lengkap. Fokus berikutnya adalah kondisi fisik dan cek cuaca H-1.');
  } else if (persen >= 70) {
    hasil.push('Persiapan sudah cukup baik. Lengkapi sisa perlengkapan wajib sebelum berangkat.');
  } else if (persen >= 40) {
    hasil.push('Persiapan baru separuh jalan. Jangan berangkat sebelum perlengkapan wajib terpenuhi.');
  } else {
    hasil.push('Perlengkapan masih sangat kurang. Menunda pendakian lebih aman daripada memaksakan diri.');
  }

  const wajibBelum = belum.filter((a) => a.prioritas === 'Wajib');
  if (wajibBelum.length) {
    hasil.push(`Yang paling mendesak: ${wajibBelum.map((a) => a.nama).join(', ')}. Semuanya berstatus wajib.`);
  }

  if (tinggi >= 3000) {
    hasil.push('Di atas 3.000 mdpl suhu bisa mendekati nol derajat dan udara menipis. Lapisan hangat dan manajemen air jadi penentu.');
  } else if (tinggi >= 2000) {
    hasil.push('Di ketinggian 2.000-3.000 mdpl suhu malam bisa turun di bawah 10 derajat. Jangan andalkan jaket tipis saja.');
  }

  if (sulit === 'sulit') {
    hasil.push('Jalur ini tergolong sulit. Pertimbangkan membawa trekking pole dan tidak mendaki sendirian.');
  }

  hasil.push('Lapor ke basecamp sebelum naik, dan bawa turun kembali seluruh sampah.');
  return hasil;
}

/** POST /api/saran-gear */
async function getSaranGear(req, res, next) {
  try {
    const { gunung_id, alat_dimiliki } = req.body || {};

    if (!gunung_id) {
      return res.status(400).json({
        success: false,
        message: 'gunung_id wajib diisi',
        data: null,
      });
    }

    const { data: semuaGunung } = await findAll('gunung');
    const { data: semuaAlat } = await findAll('alat');

    const gunung = semuaGunung.find((g) => Number(g.id) === Number(gunung_id));
    if (!gunung) {
      return res.status(404).json({
        success: false,
        message: `Gunung dengan ID ${gunung_id} tidak ditemukan`,
        data: null,
      });
    }

    const punyaId = new Set((alat_dimiliki || []).map(Number));
    const dimiliki = semuaAlat.filter((a) => punyaId.has(Number(a.id)));
    const belum = semuaAlat.filter((a) => !punyaId.has(Number(a.id)));

    // Persentase dihitung dari alat WAJIB saja, karena itu yang
    // menentukan aman tidaknya sebuah pendakian.
    const wajib = semuaAlat.filter((a) => a.prioritas === 'Wajib');
    const wajibPunya = wajib.filter((a) => punyaId.has(Number(a.id)));
    const persen = wajib.length ? Math.round((wajibPunya.length / wajib.length) * 100) : 0;

    const ringkasan = {
      gunung: gunung.nama,
      ketinggian: gunung.ketinggian,
      tingkat_kesulitan: gunung.tingkat_kesulitan,
      total_alat: semuaAlat.length,
      alat_dimiliki: dimiliki.length,
      wajib_total: wajib.length,
      wajib_dimiliki: wajibPunya.length,
      persen_kesiapan: persen,
      belum_dimiliki: belum.map((a) => ({ id: a.id, nama: a.nama, prioritas: a.prioritas })),
    };

    // --- Jalur 1: minta saran ke Gemini ---
    if (geminiAktif()) {
      const prompt = [
        'Kamu adalah pemandu pendakian gunung berpengalaman di Indonesia.',
        'Berikan saran persiapan yang ringkas, praktis, dan mengutamakan keselamatan.',
        '',
        `Gunung tujuan: ${gunung.nama} (${gunung.ketinggian} mdpl, tingkat ${gunung.tingkat_kesulitan}, estimasi ${gunung.estimasi_waktu}, jalur ${gunung.jalur_populer}).`,
        `Perlengkapan yang SUDAH dimiliki: ${dimiliki.map((a) => a.nama).join(', ') || 'belum ada'}.`,
        `Perlengkapan yang BELUM dimiliki: ${belum.map((a) => `${a.nama} (${a.prioritas})`).join(', ') || 'tidak ada'}.`,
        `Kesiapan perlengkapan wajib: ${persen}%.`,
        '',
        'Jawab dalam Bahasa Indonesia, maksimal 5 poin.',
        'Tulis setiap poin di baris baru diawali tanda hubung.',
        'Jangan memakai judul, tabel, atau format tebal.',
        'Sebutkan secara spesifik perlengkapan mana yang paling mendesak dan alasannya.',
      ].join('\n');

      try {
        const teks = await mintaSaran(prompt);
        const poin = teks
          .split('\n')
          .map((b) => b.replace(/^[-*•\d.\s]+/, '').trim())
          .filter((b) => b.length > 3)
          .slice(0, 6);

        return res.status(200).json({
          success: true,
          message: 'Saran berhasil dibuat',
          sumber: 'gemini',
          model: MODEL,
          data: { ...ringkasan, saran: poin.length ? poin : saranAturan({ gunung, belum, persen }) },
        });
      } catch (error) {
        console.warn(`[MountTrack] Gemini gagal (${error.message}), memakai saran berbasis aturan.`);
      }
    }

    // --- Jalur 2: cadangan berbasis aturan ---
    res.status(200).json({
      success: true,
      message: 'Saran berhasil dibuat',
      sumber: geminiAktif() ? 'aturan (Gemini gagal)' : 'aturan (Gemini belum diaktifkan)',
      data: { ...ringkasan, saran: saranAturan({ gunung, belum, persen }) },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSaranGear };
