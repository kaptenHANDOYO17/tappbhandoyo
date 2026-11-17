/**
 *  ROUTE: /api/alat
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

const express = require('express');
const { getAllAlat, getAlatById } = require('../controllers/alatController');

const router = express.Router();

router.get('/', getAllAlat);
router.get('/:id', getAlatById);

module.exports = router;
