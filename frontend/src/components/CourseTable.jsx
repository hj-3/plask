import { CourseRow } from './CourseRow';

export const CourseTable = ({ courses, enrollingCourseId, onEnroll }) => {
  return (
    <div className="course-table-container" style={{ overflowX: 'auto' }}>
      <table className="course-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--white)', borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        <thead>
          <tr>
            <th>코드</th>
            <th>강의명</th>
            <th>교수</th>
            <th style={{ textAlign: 'center' }}>학점</th>
            <th>시간 / 강의실</th>
            <th style={{ textAlign: 'center' }}>정원 현황</th>
            <th style={{ textAlign: 'center' }}>신청</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              isEnrolling={enrollingCourseId === course.id}
              onEnroll={onEnroll}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};