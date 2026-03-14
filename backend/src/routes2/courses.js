const { Router } = require('express');
const pool = require('../db');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         title,
         capacity,
         enrolled_count AS "enrolledCount"
       FROM courses
       ORDER BY id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[GET /courses]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
