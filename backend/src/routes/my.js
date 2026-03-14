const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/my/enrollments?user_id= - 내 수강 내역
router.get('/enrollments', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ success: false, message: 'user_id 필요' });

  try {
    const result = await pool.query(
      `SELECT e.id, e.created_at, c.id AS course_id, c.title, c.instructor, c.description
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = $1
       ORDER BY e.created_at DESC`,
      [user_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// GET /api/my/history?user_id= - 신청 이력 전체
router.get('/history', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ success: false, message: 'user_id 필요' });

  try {
    const result = await pool.query(
      `SELECT rh.request_id, rh.status, rh.message, rh.created_at, rh.processed_at,
              c.id AS course_id, c.title
       FROM request_history rh
       JOIN courses c ON rh.course_id = c.id
       WHERE rh.user_id = $1
       ORDER BY rh.created_at DESC`,
      [user_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

module.exports = router;
