CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  user_id       VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id            SERIAL PRIMARY KEY,
  code          VARCHAR(50) NOT NULL,
  title         VARCHAR(255) NOT NULL,
  professor     VARCHAR(100),
  department    VARCHAR(100),
  credits       INTEGER DEFAULT 3,
  schedule      VARCHAR(255),
  classroom     VARCHAR(100),
  capacity      INTEGER      NOT NULL,
  enrolled_count INTEGER     NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS enrollments (
  id         SERIAL PRIMARY KEY,
  user_id    VARCHAR(255) NOT NULL,
  course_id  INTEGER      NOT NULL REFERENCES courses(id),
  created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS request_history (
  request_id   VARCHAR(255) PRIMARY KEY,
  user_id      VARCHAR(255) NOT NULL,
  course_id    INTEGER      NOT NULL,
  status       VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
  message      TEXT,
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Seed data
-- 테스트 계정은 auth.js에서 자동 생성됨 (user_id: 'test', password: '1234')

INSERT INTO courses (code, title, professor, department, credits, schedule, classroom, capacity, enrolled_count) VALUES
  ('CS101', '자료구조', '김민준', '컴퓨터공학과', 3, '월 3교시 / 수 3교시', '공학관 301', 40, 38),
  ('CS102', '알고리즘', '이수진', '컴퓨터공학과', 3, '화 2교시 / 목 2교시', '공학관 302', 35, 30),
  ('CS201', '데이터베이스', '박철수', '컴퓨터공학과', 3, '월 1교시 / 수 1교시', '공학관 303', 30, 25),
  ('CS301', '운영체제', '최영호', '컴퓨터공학과', 3, '화 4교시 / 목 4교시', '공학관 304', 25, 20),
  ('AI201', '머신러닝 기초', '박지훈', '인공지능학과', 3, '월 4교시 / 수 4교시', 'AI관 101', 25, 25),
  ('AI202', '딥러닝', '최영희', '인공지능학과', 3, '화 1교시 / 목 1교시', 'AI관 102', 20, 18),
  ('AI301', '자연어 처리', '김소연', '인공지능학과', 3, '월 2교시 / 수 2교시', 'AI관 103', 22, 15),
  ('MATH101', '선형대수', '정민수', '수학과', 3, '월 1교시 / 수 1교시', '수학관 201', 50, 45),
  ('MATH102', '미적분학', '강희진', '수학과', 3, '화 3교시 / 목 3교시', '수학관 202', 45, 40),
  ('MATH201', '확률론', '이준혁', '수학과', 3, '월 5교시 / 수 5교시', '수학관 203', 35, 28),
  ('PHYS101', '일반물리학', '송민지', '물리학과', 3, '화 1교시 / 목 1교시', '물리관 101', 60, 55),
  ('CHEM101', '일반화학', '유지현', '화학과', 3, '월 2교시 / 수 2교시', '화학관 101', 40, 35)
ON CONFLICT DO NOTHING;
