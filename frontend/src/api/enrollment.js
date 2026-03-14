import { api } from './client';

export const getCourses = (userId) =>
  api.get(`/courses${userId ? `?user_id=${userId}` : ''}`);

export const getCourse = (id, userId) =>
  api.get(`/courses/${id}${userId ? `?user_id=${userId}` : ''}`);

export const enroll = (userId, courseId) =>
  api.post('/enrollments', { user_id: userId, course_id: courseId });

export const getEnrollmentStatus = (requestId) =>
  api.get(`/enroll/status/${requestId}`);

export const getRequestStatus = (requestId) =>
  api.get(`/requests/${requestId}`);

export const cancelEnroll = (userId, courseId) =>
  api.delete(`/enrollments/${courseId}`, { user_id: userId });

export const getMyEnrollments = (userId) =>
  api.get(`/my/enrollments?user_id=${userId}`);

export const getMyHistory = (userId) =>
  api.get(`/my/history?user_id=${userId}`);
