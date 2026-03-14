import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { getMyEnrollments, cancelEnroll } from '../api/enrollment';
import { LoadingSpinner } from '../components/common';

export const MyEnrollmentsPage = () => {
  const { userId } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);
  const [error, setError] = useState('');

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const res = await getMyEnrollments(userId);
      setEnrollments(res.data);
    } catch {
      setError('수강 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [userId]);

  const handleCancel = async (courseId, title) => {
    if (!confirm(`"${title}" 수강신청을 취소하시겠습니까?`)) return;
    try {
      setCancelingId(courseId);
      await cancelEnroll(userId, courseId);
      setEnrollments((prev) => prev.filter((e) => e.course_id !== courseId));
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="수강 내역 불러오는 중..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">내 수강 내역</h1>
        <span className="page-count">총 {enrollments.length}개</span>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {enrollments.length === 0 ? (
        <div className="empty-state">
          <p>수강신청한 강의가 없습니다.</p>
          <Link to="/courses" className="btn-primary">강의 둘러보기</Link>
        </div>
      ) : (
        <div className="list">
          {enrollments.map((e) => (
            <div key={e.id} className="list-item">
              <div className="list-item-info">
                <Link to={`/courses/${e.course_id}`} className="list-item-title">
                  {e.title}
                </Link>
                <p className="list-item-sub">{e.instructor} 교수</p>
                <p className="list-item-date">
                  신청일: {new Date(e.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <button
                className="btn-danger"
                onClick={() => handleCancel(e.course_id, e.title)}
                disabled={cancelingId === e.course_id}
              >
                {cancelingId === e.course_id ? '취소 중...' : '수강 취소'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
