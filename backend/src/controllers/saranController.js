/**
 * ============================================================
 *  CONTROLLER SARAN PERLENGKAPAN (AI + cadangan berbasis aturan)
 * ------------------------------------------------------------
 *  Saran disesuaikan dengan RENCANA PENDAKIAN:
 *    - gaya 'tektok' : naik dan turun di hari yang sama, maka
 *      perlengkapan bermalam (tenda, sleeping bag, kompor,
 *      nesting, matras) tidak ikut dihitung.
 *    - gaya 'camp'   : bermalam, seluruh perlengkapan dihitung,
 *      dan jumlah malam memengaruhi kebutuhan air serta logistik.
 *
 *  Handoyo | 21120124120040 | Teknik Komputer
 * ============================================================
 */

const { mintaSaran, geminiAktif, MODEL } = require('../lib/gemini');
const { findAll } = require('../lib/dataService');

/** Perlengkapan yang relevan untuk gaya pendakian tertentu. */
function alatRelevan(semuaAlat, gaya) {
  if (gaya === 'camp') return semuaAlat;
  // Tektok: buang perlengkapan yang hanya dipakai saat bermalam.
  return semuaAlat.filter((a) => (a.konteks || 'semua') !== 'camp');
}

/** Menyusun saran tanpa AI, murni dari aturan pendakian. */
function saranAturan({ gunung, belum, persen, rencana }) {
  const hasil = [];
  const tinggi = Number(gunung?.ketinggian) || 0;
  const sulit = String(gunung?.tingkat_kesulitan || '').toLowerCase();
  const { gaya, lamaMalam, jumlahOrang } = rencana;

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

  if (gaya === 'tektok') {
    hasil.push(
      `Karena kamu memilih tektok, perlengkapan bermalam tidak dihitung. Sebagai gantinya berangkatlah paling lambat dini hari, dan pastikan sudah turun sebelum gelap agar tidak terjebak di jalur tanpa tenda.`
    );
  } else {
    const hariTotal = lamaMalam + 1;
    const airLiter = (2 * hariTotal * jumlahOrang).toFixed(1);
    hasil.push(
      `Rencana bermalam ${lamaMalam} malam untuk ${jumlahOrang} orang berarti sekitar ${hariTotal} hari perjalanan. Siapkan minimal ${airLiter} liter air dan logistik makan ${hariTotal * 2} kali, di luar cadangan satu hari.`
    );
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
    const { gunung_id, alat_dimiliki, gaya, lama_malam, jumlah_orang } = req.body || {};

    if (!gunung_id) {
      return res.status(400).json({
        success: false,
        message: 'gunung_id wajib diisi',
        data: null,
      });
    }

    // Nilai dari klien selalu dinormalkan: jangan pernah percaya
    // begitu saja pada isi request body.
    const gayaBersih = gaya === 'camp' ? 'camp' : 'tektok';
    const rencana = {
      gaya: gayaBersih,
      // Tektok menurut definisinya tidak bermalam, jadi lama_malam
      // dipaksa nol berapa pun yang dikirim klien.
      lamaMalam: gayaBersih === 'camp'
        ? Math.min(Math.max(Number(lama_malam) || 1, 1), 6)
        : 0,
      jumlahOrang: Math.min(Math.max(Number(jumlah_orang) || 1, 1), 20),
    };

    const { data: semuaGunung } = await findAll('gunung');
    const { data: semuaAlatMentah } = await findAll('alat');

    const gunung = semuaGunung.find((g) => Number(g.id) === Number(gunung_id));
    if (!gunung) {
      return res.status(404).json({
        success: false,
        message: `Gunung dengan ID ${gunung_id} tidak ditemukan`,
        data: null,
      });
    }

    // Hanya perlengkapan yang relevan dengan gaya pendakian.
    const semuaAlat = alatRelevan(semuaAlatMentah, rencana.gaya);

    const punyaId = new Set((alat_dimiliki || []).map(Number));
    const dimiliki = semuaAlat.filter((a) => punyaId.has(Number(a.id)));
    const belum = semuaAlat.filter((a) => !punyaId.has(Number(a.id)));

    // Persentase dihitung dari alat WAJIB yang relevan saja.
    const wajib = semuaAlat.filter((a) => a.prioritas === 'Wajib');
    const wajibPunya = wajib.filter((a) => punyaId.has(Number(a.id)));
    const persen = wajib.length ? Math.round((wajibPunya.length / wajib.length) * 100) : 0;

    const ringkasan = {
      gunung: gunung.nama,
      ketinggian: gunung.ketinggian,
      tingkat_kesulitan: gunung.tingkat_kesulitan,
      rencana: {
        gaya: rencana.gaya,
        lama_malam: rencana.lamaMalam,
        jumlah_orang: rencana.jumlahOrang,
      },
      total_alat: semuaAlat.length,
      alat_dimiliki: dimiliki.length,
      wajib_total: wajib.length,
      wajib_dimiliki: wajibPunya.length,
      persen_kesiapan: persen,
      belum_dimiliki: belum.map((a) => ({ id: a.id, nama: a.nama, prioritas: a.prioritas })),
    };

    // --- Jalur 1: minta saran ke Gemini ---
    if (geminiAktif()) {
      const barisRencana =
        rencana.gaya === 'camp'
          ? `Gaya pendakian: bermalam (camp) selama ${rencana.lamaMalam} malam, jumlah pendaki ${rencana.jumlahOrang} orang.`
          : `Gaya pendakian: tektok, naik dan turun pada hari yang sama tanpa bermalam, jumlah pendaki ${rencana.jumlahOrang} orang.`;

      const prompt = [
        'Kamu adalah pemandu pendakian gunung berpengalaman di Indonesia.',
        'Berikan saran persiapan yang ringkas, praktis, dan mengutamakan keselamatan.',
        '',
        `Gunung tujuan: ${gunung.nama} (${gunung.ketinggian} mdpl, tingkat ${gunung.tingkat_kesulitan}, estimasi ${gunung.estimasi_waktu}, jalur ${gunung.jalur_populer}).`,
        barisRencana,
        `Perlengkapan yang SUDAH dimiliki: ${dimiliki.map((a) => a.nama).join(', ') || 'belum ada'}.`,
        `Perlengkapan yang BELUM dimiliki: ${belum.map((a) => `${a.nama} (${a.prioritas})`).join(', ') || 'tidak ada'}.`,
        `Kesiapan perlengkapan wajib: ${persen}%.`,
        '',
        'Jawab dalam Bahasa Indonesia, maksimal 5 poin.',
        'Tulis setiap poin di baris baru diawali tanda hubung.',
        'Jangan memakai judul, tabel, atau format tebal.',
        'Sebutkan secara spesifik perlengkapan mana yang paling mendesak dan alasannya.',
        'Sesuaikan saran dengan gaya pendakian yang dipilih.',
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
          data: {
            ...ringkasan,
            saran: poin.length ? poin : saranAturan({ gunung, belum, persen, rencana }),
          },
        });
      } catch (error) {
        // Alasan kegagalan ikut dikirim supaya tidak lagi jadi kotak hitam
        // saat aplikasi sudah berjalan di produksi. Tidak pernah memuat kunci API.
        console.warn(`[MountTrack] Gemini gagal (${error.message}), memakai saran berbasis aturan.`);
        return res.status(200).json({
          success: true,
          message: 'Saran berhasil dibuat',
          sumber: 'aturan (Gemini gagal)',
          alasan: error.alasan || error.message,
          data: { ...ringkasan, saran: saranAturan({ gunung, belum, persen, rencana }) },
        });
      }
    }

    // --- Jalur 2: cadangan berbasis aturan ---
    res.status(200).json({
      success: true,
      message: 'Saran berhasil dibuat',
      sumber: 'aturan (Gemini belum diaktifkan)',
      alasan: 'GEMINI_API_KEY belum diatur di environment server',
      data: { ...ringkasan, saran: saranAturan({ gunung, belum, persen, rencana }) },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSaranGear, alatRelevan, saranAturan };
