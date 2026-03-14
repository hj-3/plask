import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { login as loginApi } from '../api/auth';

export const LoginPage = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim() || !password) return;

    try {
      const res = await loginApi(userId.trim(), password);
      login(userId.trim(), res.token);
      navigate('/courses');
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-logo">PLASK</h1>
        <p className="login-sub">선착순 수강신청 시스템</p>
        <form onSubmit={handleSubmit} className="login-form">
        <label className="form-label">학번 / 사용자 ID</label>
        <input
          className="form-input"
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="예) student_001"
          autoFocus
        />

        <label className="form-label">비밀번호</label>
        <input
          className="form-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 입력하세요"
        />

        {error && <div className="error-msg">{error}</div>}

        <button
          type="submit"
          className="btn-primary login-btn"
          disabled={!userId.trim() || !password}
        >
          입장하기
        </button>
      </form>
    </div>
  </div>
  );
};
