import { useState, useEffect, useRef } from 'react';
import { getEnrollmentStatus } from '../api/enrollment';

const POLL_INTERVAL = 2000;   // 2초마다 확인
const MAX_POLL_TIME = 30000;  // 최대 30초

export const useEnrollmentStatus = (requestId) => {
  const [status, setStatus] = useState('PENDING');
  const [message, setMessage] = useState('처리 중입니다...');
  const [queuePosition, setQueuePosition] = useState(null);
  const [isTimeout, setIsTimeout] = useState(false);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!requestId) return;

    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(async () => {
      // 30초 타임아웃
      if (Date.now() - startTimeRef.current > MAX_POLL_TIME) {
        clearInterval(intervalRef.current);
        setIsTimeout(true);
        return;
      }

      try {
        const res = await getEnrollmentStatus(requestId);
        const { status: s, message: m, queue_position } = res.data;

        setStatus(s);
        setMessage(m || '처리 중입니다...');
        setQueuePosition(queue_position);

        if (s !== 'PENDING') {
          clearInterval(intervalRef.current);
        }
      } catch {
        clearInterval(intervalRef.current);
        setStatus('FAILED');
        setMessage('상태를 확인할 수 없습니다');
      }
    }, POLL_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, [requestId]);

  return { status, message, queuePosition, isTimeout };
};
