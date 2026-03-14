import { Link } from 'react-router-dom';

export const CourseCard = ({
  id,
  title,
  capacity,
  enrolled_count,
  onEnroll,
  isEnrolling,
  alreadyEnrolled,
}) => {
  const remaining = Math.max(capacity - enrolled_count, 0);
  const isFull = remaining === 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link to={`/courses/${id}`} className="text-lg font-semibold text-slate-900 hover:text-sky-600">
            {title}
          </Link>
          {alreadyEnrolled && (
            <span className="ml-2 rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
              신청 완료
            </span>
          )}
        </div>
        {isFull && !alreadyEnrolled && (
          <span className="rounded-md bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700">
            마감
          </span>
        )}
      </div>

      <div className="mt-3 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>정원</span>
          <span className="font-medium">{capacity}명</span>
        </div>
        <div className="flex items-center justify-between">
          <span>신청</span>
          <span className="font-medium">{enrolled_count}명</span>
        </div>
        <div className="flex items-center justify-between">
          <span>남은 자리</span>
          <span className={`font-medium ${isFull ? 'text-rose-600' : 'text-emerald-600'}`}>
            {isFull ? '0명 (마감)' : `${remaining}명`}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <button
          className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 ${
            isFull || alreadyEnrolled
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-sky-600'
          }`}
          onClick={() => onEnroll?.(id)}
          disabled={isFull || alreadyEnrolled || isEnrolling}
        >
          {alreadyEnrolled
            ? '신청 완료'
            : isFull
            ? '마감'
            : isEnrolling
            ? '요청 중...'
            : '수강신청'}
        </button>
      </div>
    </div>
  );
};
