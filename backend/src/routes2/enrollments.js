const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const redis = require('../redis');

const router = Router();

router.post('/', async (req, res) => {
  const { userId, courseId } = req.body;

  if (!userId || !courseId) {
    return res.status(400).json({ error: 'userId and courseId are required' });
  }

  if (typeof userId !== 'string' || userId.trim() === '') {
    return res.status(400).json({ error: 'userId must be a non-empty string' });
  }

  const parsedCourseId = parseInt(courseId, 10);
  if (isNaN(parsedCourseId)) {
    return res.status(400).json({ error: 'courseId must be a number' });
  }

  const requestId = uuidv4();
  const QUEUE_NAME = process.env.QUEUE_NAME || 'enrollment-queue';

  try {
    await pool.query(
      `INSERT INTO request_history (request_id, user_id, course_id, status)
       VALUES ($1, $2, $3, 'PENDING')`,
      [requestId, userId.trim(), parsedCourseId]
    );

    await redis.lpush(
      QUEUE_NAME,
      JSON.stringify({ requestId, userId: userId.trim(), courseId: parsedCourseId })
    );

    res.status(202).json({ requestId, status: 'PENDING' });
  } catch (err) {
    console.error('[POST /enrollments]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
