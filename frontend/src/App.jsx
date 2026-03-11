import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getCourses, postEnrollment, getRequest } from './api';

const STATUS_COLOR = {
  PENDING: '#f59e0b',
  SUCCESS: '#10b981',
  FAILED:  '#ef4444',
};

const POLL_INTERVAL_MS = 1500;
const POLL_MAX_ATTEMPTS = 20;

export default function App() {
  const [userId, setUserId]     = useState('');
  const [courses, setCourses]   = useState([]);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // Map: courseId -> { requestId, status, message, attempts }
  const [requests, setRequests] = useState({});
  const pollingRefs             = useRef({});

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      setError('강의 목록을 불러오지 못했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Stop polling for a courseId
  const stopPolling = useCallback((courseId) => {
    if (pollingRefs.current[courseId]) {
      clearInterval(pollingRefs.current[courseId]);
      delete pollingRefs.current[courseId];
    }
  }, []);

  // Start polling for a specific courseId / requestId
  const startPolling = useCallback((courseId, requestId) => {
    stopPolling(courseId);
    let attempts = 0;

    const intervalId = setInterval(async () => {
      attempts += 1;
      try {
        const data = await getRequest(requestId);
        setRequests((prev) => ({
          ...prev,
          [courseId]: { ...prev[courseId], status: data.status, message: data.message },
        }));

        if (data.status === 'SUCCESS' || data.status === 'FAILED') {
          stopPolling(courseId);
          // Refresh courses to show updated enrolledCount
          fetchCourses();
        }
      } catch {
        // ignore transient fetch errors during polling
      }

      if (attempts >= POLL_MAX_ATTEMPTS) {
        stopPolling(courseId);
        setRequests((prev) => ({
          ...prev,
          [courseId]: { ...prev[courseId], status: 'FAILED', message: '응답 시간 초과' },
        }));
      }
    }, POLL_INTERVAL_MS);

    pollingRefs.current[courseId] = intervalId;
  }, [stopPolling, fetchCourses]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(pollingRefs.current).forEach(clearInterval);
    };
  }, []);

  const handleEnroll = useCallback(async (courseId) => {
    if (!userId.trim()) {
      alert('userId를 입력하세요.');
      return;
    }

    // Prevent re-submit while PENDING
    const existing = requests[courseId];
    if (existing?.status === 'PENDING') return;

    try {
      const { requestId, status } = await postEnrollment(userId.trim(), courseId);
      setRequests((prev) => ({
        ...prev,
        [courseId]: { requestId, status, message: '' },
      }));
      startPolling(courseId, requestId);
    } catch (err) {
      alert('신청 실패: ' + err.message);
    }
  }, [userId, requests, startPolling]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>선착순 수강신청</h1>

      <div style={styles.userIdRow}>
        <label style={styles.label} htmlFor="userId">User ID</label>
        <input
          id="userId"
          style={styles.input}
          type="text"
          placeholder="user123"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button style={styles.refreshBtn} onClick={fetchCourses}>
          새로고침
        </button>
      </div>

      {error && <p style={styles.errorText}>{error}</p>}

      {loading && <p style={styles.info}>강의 목록 로딩 중...</p>}

      <div style={styles.courseGrid}>
        {courses.map((course) => {
          const req = requests[course.id];
          const isFull = course.enrolledCount >= course.capacity;
          const isPending = req?.status === 'PENDING';

          return (
            <div key={course.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.courseTitle}>{course.title}</span>
                <span style={{ ...styles.badge, background: isFull ? '#ef4444' : '#10b981' }}>
                  {isFull ? '마감' : '신청가능'}
                </span>
              </div>

              <p style={styles.capacity}>
                정원: {course.enrolledCount} / {course.capacity}
              </p>

              <div style={styles.progressBarBg}>
                <div
                  style={{
                    ...styles.progressBarFill,
                    width: `${Math.min((course.enrolledCount / course.capacity) * 100, 100)}%`,
                    background: isFull ? '#ef4444' : '#3b82f6',
                  }}
                />
              </div>

              <button
                style={{
                  ...styles.enrollBtn,
                  background: isPending ? '#94a3b8' : isFull ? '#cbd5e1' : '#3b82f6',
                  cursor: isPending || isFull ? 'not-allowed' : 'pointer',
                }}
                onClick={() => handleEnroll(course.id)}
                disabled={isPending}
              >
                {isPending ? '처리 중...' : '수강신청'}
              </button>

              {req && (
                <div style={{ ...styles.statusBox, borderColor: STATUS_COLOR[req.status] }}>
                  <span style={{ color: STATUS_COLOR[req.status], fontWeight: 700 }}>
                    {req.status}
                  </span>
                  {req.message && (
                    <span style={styles.statusMessage}> — {req.message}</span>
                  )}
                  <p style={styles.requestId}>requestId: {req.requestId}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 860,
    margin: '0 auto',
    padding: '32px 16px',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 24,
    color: '#1e293b',
  },
  userIdRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  label: {
    fontWeight: 600,
    color: '#475569',
    whiteSpace: 'nowrap',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    fontSize: 15,
    flex: 1,
    maxWidth: 300,
    outline: 'none',
  },
  refreshBtn: {
    padding: '8px 16px',
    background: '#64748b',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
  },
  info: {
    color: '#64748b',
    marginBottom: 16,
  },
  courseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#1e293b',
  },
  badge: {
    fontSize: 12,
    color: '#fff',
    padding: '3px 10px',
    borderRadius: 999,
    fontWeight: 600,
  },
  capacity: {
    fontSize: 14,
    color: '#64748b',
  },
  progressBarBg: {
    background: '#e2e8f0',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    transition: 'width 0.4s ease',
  },
  enrollBtn: {
    padding: '10px 0',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    transition: 'background 0.2s',
  },
  statusBox: {
    border: '1.5px solid',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 13,
    background: '#f8fafc',
  },
  statusMessage: {
    color: '#475569',
  },
  requestId: {
    marginTop: 4,
    fontSize: 11,
    color: '#94a3b8',
    wordBreak: 'break-all',
  },
};
