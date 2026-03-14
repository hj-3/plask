import { useState } from 'react';

export const CourseFilter = ({
  searchQuery,
  setSearchQuery,
  departmentFilter,
  setDepartmentFilter,
  statusFilter,
  setStatusFilter
}) => {
  const departments = ['전체', '컴퓨터공학과', '인공지능학과', '수학과', '물리학과', '화학과'];
  const statuses = ['전체', '여석 있음', '마감 임박', '마감'];

  return (
    <div className="filter-section" style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div className="search-input" style={{ flex: 1, minWidth: '200px' }}>
        <input
          type="text"
          placeholder="강의명, 교수명, 코드로 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ width: '100%' }}
        />
      </div>
      <div className="filter-select">
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="form-input"
          style={{ minWidth: '120px' }}
        >
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>
      <div className="filter-select">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input"
          style={{ minWidth: '120px' }}
        >
          {statuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
    </div>
  );
};