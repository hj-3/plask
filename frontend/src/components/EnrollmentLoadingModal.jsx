import { useEffect } from 'react';

export const EnrollmentLoadingModal = ({ isOpen, courseTitle, status, onClose }) => {
  const steps = [
    { key: 'sending', label: '요청 전송', icon: '✓' },
    { key: 'queued', label: '대기열 진입', icon: '✓' },
    { key: 'checking', label: '좌석 확인 중', icon: '4' }, // 아이콘은 나중에
    { key: 'completed', label: '처리 완료', icon: '✓' }
  ];

  const getCurrentStepIndex = () => {
    const index = steps.findIndex(step => step.key === status);
    return index >= 0 ? index : 0;
  };

  useEffect(() => {
    if (status === 'completed') {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // 2초 후 자동 닫기
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 300 }}>
      <div className="modal" style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div className="modal-title" style={{ marginBottom: '20px' }}>
          좌석을 확보하는 중입니다
        </div>
        <div className="modal-subtitle" style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '24px' }}>
          {courseTitle} 수강신청 처리 중
        </div>

        <div className="enrollment-steps" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {steps.map((step, index) => {
            const isCompleted = index <= getCurrentStepIndex();
            const isCurrent = index === getCurrentStepIndex();
            return (
              <div
                key={step.key}
                className={`step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: isCompleted ? 'var(--gray-50)' : 'var(--white)',
                  border: `1px solid ${isCompleted ? 'var(--success)' : 'var(--gray-200)'}`
                }}
              >
                <div
                  className="step-icon"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isCompleted ? 'var(--success)' : 'var(--gray-200)',
                    color: 'var(--white)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {isCompleted ? step.icon : ''}
                </div>
                <div className="step-label" style={{ fontSize: '14px', color: isCompleted ? 'var(--gray-800)' : 'var(--gray-400)' }}>
                  {step.label}
                </div>
                {isCurrent && status !== 'completed' && (
                  <div className="pulse-ring" style={{ marginLeft: 'auto' }}></div>
                )}
              </div>
            );
          })}
        </div>

        {status === 'completed' && (
          <div className="modal-message" style={{ color: 'var(--success)', fontWeight: '600' }}>
            수강신청이 완료되었습니다!
          </div>
        )}
      </div>
    </div>
  );
};