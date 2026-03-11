require('dotenv').config();

const Redis = require('ioredis');
const { Pool } = require('pg');

const QUEUE_NAME = process.env.QUEUE_NAME || 'enrollment-queue';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  retryStrategy: (times) => Math.min(times * 200, 5000),
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

redis.on('error', (err) => console.error('[Redis Error]', err.message));
pool.on('error',  (err) => console.error('[DB Error]',    err.message));

async function setRequestStatus(db, requestId, status, message) {
  await db.query(
    `UPDATE request_history
     SET status = $1, message = $2, processed_at = NOW()
     WHERE request_id = $3`,
    [status, message, requestId]
  );
}

async function processJob(job) {
  const { requestId, userId, courseId } = job;
  console.log(`[JOB] requestId=${requestId} userId=${userId} courseId=${courseId}`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. 강의 조회 (row lock)
    const courseResult = await client.query(
      `SELECT id, capacity, enrolled_count
       FROM courses
       WHERE id = $1
       FOR UPDATE`,
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      await client.query('ROLLBACK');
      await setRequestStatus(pool, requestId, 'FAILED', '존재하지 않는 강의입니다.');
      console.log(`[FAILED] requestId=${requestId} - course not found`);
      return;
    }

    const course = courseResult.rows[0];

    // 2. 중복 신청 확인
    const dupResult = await client.query(
      `SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2`,
      [userId, courseId]
    );

    if (dupResult.rows.length > 0) {
      await client.query('ROLLBACK');
      await setRequestStatus(pool, requestId, 'FAILED', '이미 신청한 강의입니다.');
      console.log(`[FAILED] requestId=${requestId} - duplicate`);
      return;
    }

    // 3. 정원 초과 확인
    if (course.enrolled_count >= course.capacity) {
      await client.query('ROLLBACK');
      await setRequestStatus(pool, requestId, 'FAILED', '정원이 초과되었습니다.');
      console.log(`[FAILED] requestId=${requestId} - capacity exceeded`);
      return;
    }

    // 4. Enrollment 저장
    await client.query(
      `INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)`,
      [userId, courseId]
    );

    // 5. 수강 인원 증가
    await client.query(
      `UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = $1`,
      [courseId]
    );

    // 6. 성공 상태 업데이트
    await client.query(
      `UPDATE request_history
       SET status = 'SUCCESS', message = '수강신청이 완료되었습니다.', processed_at = NOW()
       WHERE request_id = $1`,
      [requestId]
    );

    await client.query('COMMIT');
    console.log(`[SUCCESS] requestId=${requestId}`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(`[ERROR] requestId=${requestId}`, err.message);
    await setRequestStatus(pool, requestId, 'FAILED', '처리 중 오류가 발생했습니다.');
  } finally {
    client.release();
  }
}

async function run() {
  console.log(`Worker started. Queue: ${QUEUE_NAME}`);

  while (true) {
    try {
      // BRPOP blocks until a job arrives (timeout=0 = block forever)
      const result = await redis.brpop(QUEUE_NAME, 0);
      if (!result) continue;

      const [, raw] = result;
      let job;
      try {
        job = JSON.parse(raw);
      } catch {
        console.error('[PARSE ERROR] invalid job payload:', raw);
        continue;
      }

      await processJob(job);
    } catch (err) {
      console.error('[WORKER LOOP ERROR]', err.message);
      // Brief pause before retrying to avoid tight error loops
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

run().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
