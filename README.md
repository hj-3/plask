# 선착순 수강신청 서비스

## 프로젝트 구조

```
/
├── frontend/               # React (Vite) + nginx
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── api.js
│   ├── index.html
│   ├── vite.config.js
│   ├── nginx.conf
│   ├── docker-entrypoint.sh
│   ├── Dockerfile
│   └── package.json
├── backend/                # Node.js (Express) API 서버
│   ├── src/
│   │   ├── index.js
│   │   ├── db.js
│   │   ├── redis.js
│   │   └── routes/
│   │       ├── health.js
│   │       ├── courses.js
│   │       ├── enrollments.js
│   │       └── requests.js
│   ├── Dockerfile
│   └── package.json
├── worker/                 # Redis Queue Consumer
│   ├── src/
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
├── infra/
│   └── postgres/
│       └── init.sql        # Schema + Seed data
├── docker-compose.yml
├── .env.example
└── README.md
```

## 아키텍처

```
Browser
  │
  ▼
Frontend (React / nginx :3000)
  │  /api/* → proxy
  ▼
Backend (Express :3001)
  │  Redis LPUSH
  ▼
Redis Queue (enrollment-queue)
  │  BRPOP
  ▼
Worker (Node.js)
  │  SELECT / INSERT / UPDATE
  ▼
PostgreSQL
```

## 실행 방법

### 1. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 는 참고용이며, Docker Compose는 `docker-compose.yml` 내 `environment` 블록으로 직접 주입합니다.

### 2. Docker Compose 실행

```bash
docker compose up --build
```

| 서비스    | 포트   |
|-----------|--------|
| frontend  | 3000   |
| backend   | 3001   |
| postgres  | 5432   |
| redis     | 6379   |

브라우저에서 `http://localhost:3000` 접속

### 3. 로컬 개발 (Docker 없이)

**PostgreSQL / Redis 는 별도 실행 필요**

```bash
# Backend
cd backend
npm install
DATABASE_URL=postgresql://user:password@localhost:5432/enrollment \
REDIS_HOST=localhost REDIS_PORT=6379 QUEUE_NAME=enrollment-queue PORT=3001 \
node src/index.js

# Worker
cd worker
npm install
DATABASE_URL=postgresql://user:password@localhost:5432/enrollment \
REDIS_HOST=localhost REDIS_PORT=6379 QUEUE_NAME=enrollment-queue \
node src/index.js

# Frontend
cd frontend
npm install
npm run dev   # http://localhost:5173 (Vite dev server with /api proxy)
```

## API 요약

| Method | Path                        | 설명                          |
|--------|-----------------------------|-------------------------------|
| GET    | /health                     | 서버 / DB / Redis 상태 확인   |
| GET    | /courses                    | 강의 목록 조회                |
| POST   | /enrollments                | 수강신청 요청 (Queue 등록)    |
| GET    | /requests/:requestId        | 요청 상태 조회                |

### POST /enrollments

**Request**
```json
{
  "userId": "user123",
  "courseId": 1
}
```

**Response 202**
```json
{
  "requestId": "uuid-v4",
  "status": "PENDING"
}
```

### GET /requests/:requestId

**Response 200**
```json
{
  "requestId": "uuid-v4",
  "userId": "user123",
  "courseId": 1,
  "status": "SUCCESS",
  "message": "수강신청이 완료되었습니다.",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "processedAt": "2025-01-01T00:00:01.000Z"
}
```

상태값: `PENDING` → `SUCCESS` | `FAILED`

## Database 모델

```sql
courses        (id, title, capacity, enrolled_count)
enrollments    (id, user_id, course_id, created_at)
request_history(request_id, user_id, course_id, status, message, created_at, processed_at)
```

## Kubernetes 확장

각 서비스는 Stateless(backend, worker, frontend)하게 설계되어 있어 Deployment replicas 증가로 수평 확장 가능합니다.

```
Ingress (nginx-ingress)
  ├── / → frontend Service (ClusterIP)
  └── /api/ → backend Service (ClusterIP)

backend Deployment  (replicas: N)
worker  Deployment  (replicas: N, Queue Consumer)
postgres StatefulSet
redis    StatefulSet (또는 Redis Sentinel / Cluster)
```

환경변수는 ConfigMap / Secret으로 주입하고, `API_BASE_URL` 은 frontend Pod의 env에 설정합니다.
