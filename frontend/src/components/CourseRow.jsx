export const CourseRow = ({ course, isEnrolling, onEnroll }) => {
  const capacity = course.capacity || 0;
  const enrolled = course.enrolled_count || 0;
  const remaining = capacity - enrolled;
  const percentage = capacity > 0 ? (enrolled / capacity) * 100 : 0;

  let barColor = 'var(--success)'; // 초록
  if (remaining <= 0) {
    barColor = 'var(--danger)'; // 빨강
  } else if (remaining <= 5) {
    barColor = 'var(--warning)'; // 주황
  }

  const isFull = remaining <= 0;
  const alreadyEnrolled = course.already_enrolled;

  return (
    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
      <td className="code-cell">{course.code || 'N/A'}</td>
      <td className="title-cell" title={course.title}>{course.title || 'N/A'}</td>
      <td className="professor-cell">{course.professor || 'N/A'}</td>
      <td className="credits-cell">{course.credits || 3}</td>
      <td className="schedule-cell">
        {course.schedule || 'N/A'}<br />
        <small>{course.classroom || 'N/A'}</small>
      </td>
      <td className="capacity-cell">
        <div className="capacity-progress">
          <div className="capacity-bar">
            <div
              className={`capacity-fill ${remaining > 5 ? 'available' : remaining > 0 ? 'warning' : 'full'}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <span className="capacity-text">{enrolled}/{capacity}</span>
        </div>
      </td>
      <td style={{ textAlign: 'center' }}>
        {alreadyEnrolled ? (
          <button className="enroll-btn" style={{ background: 'var(--success)', color: 'white' }} disabled>수강 중</button>
        ) : isFull ? (
          <button className="enroll-btn" style={{ background: 'var(--gray-400)', color: 'white' }} disabled>마감</button>
        ) : (
          <button
            className="enroll-btn"
            style={{ background: 'var(--primary)', color: 'white' }}
            onClick={() => onEnroll(course.id)}
            disabled={isEnrolling}
          >
            {isEnrolling ? '신청 중...' : '신청'}
          </button>
        )}
      </td>
    </tr>
  );
};