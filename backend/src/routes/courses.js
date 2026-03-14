const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/courses - 강의 목록
router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;

    const query = user_id
      ? `SELECT c.*,
           (c.capacity - c.enrolled_count) AS remaining,
           (c.enrolled_count >= c.capacity) AS is_full,
           EXISTS(
             SELECT 1 FROM enrollments e
             WHERE e.course_id = c.id AND e.user_id = $1
           ) AS already_enrolled
         FROM courses c ORDER BY c.id`
      : `SELECT c.*,
           (c.capacity - c.enrolled_count) AS remaining,
           (c.enrolled_count >= c.capacity) AS is_full,
           false AS already_enrolled
         FROM courses c ORDER BY c.id`;

    const values = user_id ? [user_id] : [];
    const result = await pool.query(query, values);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// GET /api/courses/:id - 강의 상세
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;

    const query = user_id
      ? `SELECT c.*,
           (c.capacity - c.enrolled_count) AS remaining,
           (c.enrolled_count >= c.capacity) AS is_full,
           EXISTS(
             SELECT 1 FROM enrollments e
             WHERE e.course_id = c.id AND e.user_id = $2
           ) AS already_enrolled
         FROM courses c WHERE c.id = $1`
      : `SELECT c.*,
           (c.capacity - c.enrolled_count) AS remaining,
           (c.enrolled_count >= c.capacity) AS is_full,
           false AS already_enrolled
         FROM courses c WHERE c.id = $1`;

    const values = user_id ? [id, user_id] : [id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: '강의를 찾을 수 없습니다' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

module.exports = router;
