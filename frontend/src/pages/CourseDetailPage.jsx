import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { getCourse, enroll } from '../api/enrollment';
import { LoadingSpinner, CapacityBar } from '../components/common';
import { EnrollmentStatusModal } from '../components/enrollment/StatusModal';

const EnrollButton = ({ course, onEnroll, loading }) => {
  if (course.already_enrolled) {
    return <button className="btn-success" disabled>수강신청 완료</button>;
  }
  if (course.is_full) {
    return <button className="btn-disabled" disabled>정원 마감</button>;
  }
  return (
    <button className="btn-primary" onClick={onEnroll} disabled={loading}>
      {loading ? '처리 중...' : '수강신청'}
    </button>
  );
};

export const CourseDetailPage = () => {
  const { id } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await getCourse(id, userId);
      setCourse(res.data);
    } catch {
      setError('강의 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id, userId]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      setError('');
      const res = await enroll(userId, parseInt(id));
      setRequestId(res.request_id);
      setShowModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    fetchCourse(); // 상태 반영을 위해 강의 정보 재조회
  };

  if (loading) return <LoadingSpinner text="강의 정보 불러오는 중..." />;
  if (!course) return <div className="error-msg">{error || '강의를 찾을 수 없습니다.'}</div>;

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate('/courses')}>
        ← 목록으로
      </button>

      <div className="detail-card">
        <div className="detail-header">
          <h1 className="detail-title">{course.title}</h1>
          <p className="detail-instructor">{course.instructor} 교수</p>
        </div>

        <p className="detail-desc">{course.description}</p>

        <div className="detail-meta">
          <div className="meta-item">
            <span className="meta-label">정원</span>
            <span className="meta-value">{course.capacity}명</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">신청 현황</span>
            <span className="meta-value">{course.enrolled_count}명</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">잔여</span>
            <span className={`meta-value ${course.is_full ? 'text-red' : 'text-green'}`}>
              {course.is_full ? '마감' : `${course.remaining}자리`}
            </span>
          </div>
        </div>

        <CapacityBar capacity={course.capacity} enrolledCount={course.enrolled_count} />

        {error && <p className="error-msg">{error}</p>}

        <div className="detail-actions">
          <EnrollButton course={course} onEnroll={handleEnroll} loading={enrolling} />
        </div>
      </div>

      {showModal && (
        <EnrollmentStatusModal requestId={requestId} onClose={handleModalClose} />
      )}
    </div>
  );
};
