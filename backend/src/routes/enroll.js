const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db');
const { redis, QUEUE_NAME } = require('../db/redis');

// POST /api/enroll - 수강신청 요청
router.post('/', async (req, res) => {
  const user_id = req.user?.userId || req.body.user_id;
  const { course_id } = req.body;

  if (!user_id || !course_id) {
    return res.status(400).json({ success: false, message: 'user_id, course_id는 필수입니다' });
  }

  try {
    // 강의 존재 여부 확인
    const courseResult = await pool.query('SELECT * FROM courses WHERE id = $1', [course_id]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: '강의를 찾을 수 없습니다' });
    }

    // 이미 신청했는지 확인
    const existingEnroll = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [user_id, course_id]
    );
    if (existingEnroll.rows.length > 0) {
      return res.status(409).json({ success: false, message: '이미 수강신청한 강의입니다' });
    }

    // 이미 처리 중인 요청 확인
    const pendingResult = await pool.query(
      `SELECT request_id FROM request_history
       WHERE user_id = $1 AND course_id = $2 AND status = 'PENDING'`,
      [user_id, course_id]
    );
    if (pendingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: '이미 처리 중인 신청이 있습니다',
        request_id: pendingResult.rows[0].request_id,
      });
    }

    const request_id = uuidv4();

    // request_history에 PENDING 상태로 저장
    await pool.query(
      `INSERT INTO request_history (request_id, user_id, course_id, status)
       VALUES ($1, $2, $3, 'PENDING')`,
      [request_id, user_id, course_id]
    );

    // Redis Queue에 적재
    await redis.lpush(QUEUE_NAME, JSON.stringify({ request_id, user_id, course_id }));

    console.log(`[ENROLL REQUEST] user=${user_id} course=${course_id} request_id=${request_id}`);

    // 현재 대기 순번 계산
    const queueLength = await redis.llen(QUEUE_NAME);

    res.status(202).json({
      success: true,
      message: '수강신청이 대기열에 등록되었습니다',
      request_id,
      queue_position: queueLength,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// GET /api/enroll/status/:request_id - 신청 상태 폴링
router.get('/status/:request_id', async (req, res) => {
  try {
    const { request_id } = req.params;
    const result = await pool.query(
      `SELECT request_id, user_id, course_id, status, message, created_at, processed_at
       FROM request_history WHERE request_id = $1`,
      [request_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: '요청을 찾을 수 없습니다' });
    }

    const row = result.rows[0];

    // 요청한 사용자만 상태를 조회할 수 있도록 제한
    if (req.user?.userId && row.user_id !== req.user.userId) {
      return res.status(403).json({ success: false, message: '권한이 없습니다' });
    }

    // PENDING이면 현재 대기 순번도 반환
    let queue_position = null;
    if (row.status === 'PENDING') {
      const pos = await redis.lpos(QUEUE_NAME, JSON.stringify({
        request_id,
        user_id: row.user_id,
        course_id: row.course_id,
      }));
      queue_position = pos !== null ? pos + 1 : null;
    }

    res.json({ success: true, data: { ...row, queue_position } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// DELETE /api/enroll/:course_id - 수강신청 취소
router.delete('/:course_id', async (req, res) => {
  const { course_id } = req.params;
  const user_id = req.user?.userId || req.body.user_id;

  if (!user_id) {
    return res.status(400).json({ success: false, message: 'user_id는 필수입니다' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const deleted = await client.query(
      'DELETE FROM enrollments WHERE user_id = $1 AND course_id = $2 RETURNING id',
      [user_id, course_id]
    );

    if (deleted.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: '수강신청 내역이 없습니다' });
    }

    await client.query(
      'UPDATE courses SET enrolled_count = enrolled_count - 1 WHERE id = $1',
      [course_id]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: '수강신청이 취소되었습니다' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: '서버 오류' });
  } finally {
    client.release();
  }
});

module.exports = router;
