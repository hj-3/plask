import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/authStore';

export const Header = () => {
  const { userId, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/courses', label: '강의 목록' },
    { to: '/my/enrollments', label: '내 수강내역' },
    { to: '/my/history', label: '신청 이력' },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/courses" className="logo">PLASK</Link>
        <nav className="nav">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${location.pathname.startsWith(to) ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-user">
          <span className="user-id">{userId}</span>
          <button onClick={logout} className="btn-logout">로그아웃</button>
        </div>
      </div>
    </header>
  );
};

export const StatusBadge = ({ status }) => {
  const map = {
    PENDING: { label: '대기 중', cls: 'badge-pending' },
    SUCCESS: { label: '신청 완료', cls: 'badge-success' },
    FAILED:  { label: '신청 실패', cls: 'badge-failed' },
  };
  const { label, cls } = map[status] || { label: status, cls: '' };
  return <span className={`badge ${cls}`}>{label}</span>;
};

export const LoadingSpinner = ({ text = '로딩 중...' }) => (
  <div className="spinner-wrap">
    <div className="spinner" />
    <p className="spinner-text">{text}</p>
  </div>
);

export const CapacityBar = ({ capacity, enrolledCount }) => {
  const pct = Math.min((enrolledCount / capacity) * 100, 100);
  const isFull = pct >= 100;
  return (
    <div className="capacity-wrap">
      <div className="capacity-bar">
        <div
          className={`capacity-fill ${isFull ? 'full' : pct >= 80 ? 'warn' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="capacity-text">
        {isFull ? '마감' : `${enrolledCount} / ${capacity}명`}
      </span>
    </div>
  );
};
