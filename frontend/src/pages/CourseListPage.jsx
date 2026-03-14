import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../store/authStore';
import { getCourses, enroll, getRequestStatus } from '../api/enrollment';
import { LoadingSpinner } from '../components/common';
import { CourseTable } from '../components/CourseTable';
import { CourseFilter } from '../components/CourseFilter';
import { StatsCard } from '../components/StatsCard';
import { EnrollmentLoadingModal } from '../components/EnrollmentLoadingModal';
import { toast } from '../ui/toast';

export const CourseListPage = () => {
  const { userId } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null); // 'sending', 'queued', 'checking', 'completed', 'failed'
  const [enrollingCourseTitle, setEnrollingCourseTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');

  const pollingRef = useRef(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await getCourses(userId);
      const fetchedData = res?.data || res || [];
      const courseList = Array.isArray(fetchedData) ? fetchedData : [];
      setCourses(courseList);
      setFilteredCourses(courseList);
    } catch (err) {
      console.error('데이터 로딩 실패:', err);
      setError('강의 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const handleEnroll = async (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    setEnrollingCourseId(courseId);
    setEnrollingCourseTitle(course.title);
    setEnrollmentStatus('sending');

    try {
      const { requestId, status } = await enroll(userId, courseId);
      setEnrollmentStatus('queued');

      if (status === 'PENDING') {
        stopPolling();
        pollingRef.current = setInterval(async () => {
          try {
            const result = await getRequestStatus(requestId);
            if (result.status === 'SUCCESS') {
              setEnrollmentStatus('checking');
              setTimeout(() => {
                setEnrollmentStatus('completed');
                stopPolling();
                toast.success('수강신청이 완료되었습니다!');
                fetchCourses();
                setEnrollingCourseId(null);
                setEnrollmentStatus(null);
                setEnrollingCourseTitle('');
              }, 1000); // 좌석 확인 중 잠시 표시
            } else if (result.status === 'FAILED') {
              stopPolling();
              setEnrollmentStatus('failed');
              toast.error(`수강신청 실패: ${result.message}`);
              setEnrollingCourseId(null);
              setEnrollmentStatus(null);
              setEnrollingCourseTitle('');
            }
          } catch (err) {
            console.error('폴링 중 오류:', err);
          }
        }, 2000);
      } else {
        setEnrollingCourseId(null);
        setEnrollmentStatus(null);
        setEnrollingCourseTitle('');
      }
    } catch (error) {
      console.error('수강신청 요청 실패:', error);
      console.error('에러 상세:', error.response?.data || error.message);
      toast.error('요청 중 오류가 발생했습니다.');
      setEnrollingCourseId(null);
      setEnrollmentStatus(null);
      setEnrollingCourseTitle('');
    }
  };

  const applyFilters = () => {
    let filtered = courses;

    // 검색 필터
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.professor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 학과 필터
    if (departmentFilter !== '전체') {
      filtered = filtered.filter(course => course.department === departmentFilter);
    }

    // 상태 필터
    if (statusFilter !== '전체') {
      filtered = filtered.filter(course => {
        const capacity = course.capacity || 0;
        const enrolled = course.enrolled_count || 0;
        const remaining = capacity - enrolled;
        if (statusFilter === '여석 있음') return remaining > 0;
        if (statusFilter === '마감 임박') return remaining > 0 && remaining <= 5;
        if (statusFilter === '마감') return remaining <= 0;
        return true;
      });
    }

    setFilteredCourses(filtered);
  };

  useEffect(() => {
    fetchCourses();
    return () => {
      stopPolling();
    };
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [courses, searchQuery, departmentFilter, statusFilter]);

  if (loading) return <LoadingSpinner text="강의 목록 불러오는 중..." />;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">강의 목록</h1>
        <button className="btn-outline" onClick={fetchCourses}>새로고침</button>
      </div>

      <CourseFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <StatsCard totalCourses={courses.length} filteredCourses={filteredCourses.length} />

      <CourseTable
        courses={filteredCourses}
        enrollingCourseId={enrollingCourseId}
        onEnroll={handleEnroll}
      />

      <EnrollmentLoadingModal
        isOpen={!!enrollingCourseId}
        courseTitle={enrollingCourseTitle}
        status={enrollmentStatus}
        onClose={() => {
          setEnrollingCourseId(null);
          setEnrollmentStatus(null);
          setEnrollingCourseTitle('');
        }}
      />

      {filteredCourses.length === 0 && (
        <p className="text-muted-foreground text-center py-10 w-full">
          검색 결과가 없습니다.
        </p>
      )}
    </div>
  );
};