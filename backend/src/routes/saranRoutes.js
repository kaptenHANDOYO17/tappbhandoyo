/**
 *  ROUTE: /api/saran-gear
 *  Handoyo | 21120124120040 | Teknik Komputer
 */

const express = require('express');
const { getSaranGear } = require('../controllers/saranController');

const router = express.Router();

router.post('/', getSaranGear);

module.exports = router;
