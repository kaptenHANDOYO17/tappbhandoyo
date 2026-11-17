/**
 *  ROUTE: /api/gunung
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

const express = require('express');
const { getAllGunung, getGunungById } = require('../controllers/gunungController');

const router = express.Router();

router.get('/', getAllGunung);
router.get('/:id', getGunungById);

module.exports = router;
