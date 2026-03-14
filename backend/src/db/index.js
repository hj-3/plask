const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      capacity INT NOT NULL DEFAULT 30,
      enrolled_count INT NOT NULL DEFAULT 0,
      description TEXT,
      instructor VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL,
      course_id INT NOT NULL REFERENCES courses(id),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS request_history (
      request_id VARCHAR(100) PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL,
      course_id INT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
      message TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      processed_at TIMESTAMP
    );
  `);

  // 샘플 강의 데이터
  const existing = await pool.query('SELECT COUNT(*) FROM courses');
  if (parseInt(existing.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO courses (title, capacity, description, instructor) VALUES
      ('클라우드 인프라 기초', 30, 'AWS, GCP, Azure 기반 클라우드 인프라를 이해하고 구축합니다.', '김인프라'),
      ('Kubernetes 실전', 25, 'K8s 클러스터 구성부터 배포 자동화까지 실습합니다.', '이쿠버'),
      ('Redis 캐싱 전략', 20, '대규모 트래픽 처리를 위한 Redis 활용 전략을 학습합니다.', '박레디스'),
      ('CI/CD 파이프라인 구축', 15, 'GitHub Actions 기반의 자동화 배포 시스템을 구축합니다.', '최깃헙'),
      ('PostgreSQL 성능 최적화', 20, '쿼리 최적화와 인덱스 전략으로 DB 성능을 높입니다.', '정포스트');
    `);
  }

  console.log('[DB] 초기화 완료');
};

module.exports = { pool, initDB };
