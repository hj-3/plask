export const StatsCard = ({ totalCourses, filteredCourses }) => {
  return (
    <div className="stats-card" style={{ background: 'var(--white)', border: '1.5px solid var(--gray-200)', borderRadius: '14px', padding: '24px', marginBottom: '24px', display: 'flex', gap: '24px' }}>
      <div className="stat-item">
        <div className="stat-label" style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: '500' }}>전체 강의</div>
        <div className="stat-value" style={{ fontSize: '24px', fontWeight: '700', color: 'var(--gray-800)' }}>{totalCourses}</div>
      </div>
      <div className="stat-item">
        <div className="stat-label" style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: '500' }}>검색 결과</div>
        <div className="stat-value" style={{ fontSize: '24px', fontWeight: '700', color: 'var(--gray-800)' }}>{filteredCourses}</div>
      </div>
    </div>
  );
};