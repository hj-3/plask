const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/requests/:requestId - 상태 조회
router.get('/:requestId', async (req, res) => {
  const { requestId } = req.params;

  try {
    const result = await pool.query(
      `SELECT
         request_id   AS "requestId",
         user_id      AS "userId",
         course_id    AS "courseId",
         status,
         message,
         created_at   AS "createdAt",
         processed_at AS "processedAt"
       FROM request_history
       WHERE request_id = $1`,
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const item = result.rows[0];

    // 요청자 본인만 조회 가능
    if (req.user?.userId && item.userId !== req.user.userId) {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    res.json(item);
  } catch (err) {
    console.error('[GET /requests/:requestId]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
