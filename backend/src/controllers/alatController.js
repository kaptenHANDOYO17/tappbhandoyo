/**
 *  CONTROLLER PERLENGKAPAN (ALAT)
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

const { findAll, findById } = require('../lib/dataService');

/** GET /api/alat */
async function getAllAlat(req, res, next) {
  try {
    const { data, source } = await findAll('alat');
    const { search, kategori } = req.query;

    let result = [...data];

    if (search) {
      const keyword = String(search).toLowerCase();
      result = result.filter((item) =>
        String(item.nama).toLowerCase().includes(keyword)
      );
    }

    if (kategori && String(kategori).toLowerCase() !== 'semua') {
      const target = String(kategori).toLowerCase();
      result = result.filter(
        (item) => String(item.kategori).toLowerCase() === target
      );
    }

    res.status(200).json({
      success: true,
      message: 'Daftar perlengkapan berhasil diambil',
      source,
      total: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/** GET /api/alat/:id */
async function getAlatById(req, res, next) {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Parameter ID harus berupa angka',
        data: null,
      });
    }

    const { data, source } = await findById('alat', Number(id));

    if (!data) {
      return res.status(404).json({
        success: false,
        message: `Perlengkapan dengan ID ${id} tidak ditemukan`,
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Detail perlengkapan berhasil diambil',
      source,
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllAlat, getAlatById };
