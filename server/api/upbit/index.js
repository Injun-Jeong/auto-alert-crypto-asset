const express = require('express');
const upbit = require('./upbit.ctrl');
const router = express.Router();

// 코인 시세 조회
router.get('/:ticker', upbit.getPrice);

module.exports = router;