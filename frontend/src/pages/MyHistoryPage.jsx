import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { getMyHistory } from '../api/enrollment';
import { LoadingSpinner, StatusBadge } from '../components/common';

export const MyHistoryPage = () => {
  const { userId } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyHistory(userId);
        setHistory(res.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  const filtered = filter === 'ALL'
    ? history
    : history.filter((h) => h.status === filter);

  if (loading) return <LoadingSpinner text="신청 이력 불러오는 중..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">신청 이력</h1>
      </div>

      <div className="filter-tabs">
        {['ALL', 'PENDING', 'SUCCESS', 'FAILED'].map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? '전체' : f === 'PENDING' ? '대기' : f === 'SUCCESS' ? '완료' : '실패'}
            <span className="filter-count">
              {f === 'ALL' ? history.length : history.filter((h) => h.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>신청 이력이 없습니다.</p>
          <Link to="/courses" className="btn-primary">강의 둘러보기</Link>
        </div>
      ) : (
        <div className="list">
          {filtered.map((h) => (
            <div key={h.request_id} className="list-item">
              <div className="list-item-info">
                <Link to={`/courses/${h.course_id}`} className="list-item-title">
                  {h.title}
                </Link>
                {h.message && (
                  <p className="list-item-sub">{h.message}</p>
                )}
                <p className="list-item-date">
                  신청: {new Date(h.created_at).toLocaleString('ko-KR')}
                  {h.processed_at && (
                    <> · 처리: {new Date(h.processed_at).toLocaleString('ko-KR')}</>
                  )}
                </p>
              </div>
              <StatusBadge status={h.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
