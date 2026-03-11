CREATE TABLE IF NOT EXISTS courses (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
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
INSERT INTO courses (title, capacity, enrolled_count) VALUES
  ('알고리즘 기초', 30, 0),
  ('데이터베이스 설계', 20, 0),
  ('클라우드 인프라 입문', 10, 0)
ON CONFLICT DO NOTHING;
