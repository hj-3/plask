import { useEnrollmentStatus } from '../../hooks/useEnrollmentStatus';
import { StatusBadge } from '../common';

export const EnrollmentStatusModal = ({ requestId, onClose }) => {
  const { status, message, queuePosition, isTimeout } = useEnrollmentStatus(requestId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">수강신청 처리 중</h2>

        <div className="modal-status">
          <StatusBadge status={status} />
        </div>

        {status === 'PENDING' && !isTimeout && (
          <div className="modal-pending">
            <div className="pulse-ring" />
            <p className="modal-message">큐에서 처리 중입니다...</p>
            {queuePosition && (
              <p className="queue-position">현재 대기 순번: <strong>{queuePosition}번째</strong></p>
            )}
          </div>
        )}

        {isTimeout && (
          <div className="modal-timeout">
            <p>처리가 지연되고 있습니다.</p>
            <p>
              <strong>신청 이력</strong> 페이지에서 결과를 확인해주세요.
            </p>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="modal-success">
            <div className="success-icon">✓</div>
            <p className="modal-message">{message}</p>
          </div>
        )}

        {status === 'FAILED' && (
          <div className="modal-failed">
            <p className="modal-message">{message}</p>
          </div>
        )}

        {(status !== 'PENDING' || isTimeout) && (
          <button className="btn-primary modal-close-btn" onClick={onClose}>
            확인
          </button>
        )}
      </div>
    </div>
  );
};
