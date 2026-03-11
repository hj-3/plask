const { Router } = require('express');
const pool = require('../db');

const router = Router();

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

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[GET /requests/:requestId]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
