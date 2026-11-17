/**
 *  CONTROLLER GUNUNG
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

const { findAll, findById } = require('../lib/dataService');

/** GET /api/gunung */
async function getAllGunung(req, res, next) {
  try {
    const { data, source } = await findAll('gunung');
    const { search, kesulitan } = req.query;

    let result = [...data];

    if (search) {
      const keyword = String(search).toLowerCase();
      result = result.filter(
        (item) =>
          String(item.nama).toLowerCase().includes(keyword) ||
          String(item.lokasi).toLowerCase().includes(keyword)
      );
    }

    if (kesulitan) {
      const level = String(kesulitan).toLowerCase();
      result = result.filter(
        (item) => String(item.tingkat_kesulitan).toLowerCase() === level
      );
    }

    res.status(200).json({
      success: true,
      message: 'Daftar gunung berhasil diambil',
      source,
      total: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/** GET /api/gunung/:id */
async function getGunungById(req, res, next) {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Parameter ID harus berupa angka',
        data: null,
      });
    }

    const { data, source } = await findById('gunung', Number(id));

    if (!data) {
      return res.status(404).json({
        success: false,
        message: `Gunung dengan ID ${id} tidak ditemukan`,
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Detail gunung berhasil diambil',
      source,
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllGunung, getGunungById };
