const { Router } = require('express');
const pool = require('../db');
const redis = require('../redis');

const router = Router();

router.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    await redis.ping();
    res.json({ status: 'ok', db: 'ok', redis: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
