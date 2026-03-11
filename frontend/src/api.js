// Runtime env takes priority (injected by docker-entrypoint.sh via /env-config.js)
// Falls back to Vite build-time env, then defaults to '/api' (nginx proxy)
const API_BASE_URL =
  (typeof window !== 'undefined' && window._env_?.API_BASE_URL) ||
  import.meta.env.VITE_API_BASE_URL ||
  '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data;
}

export function getCourses() {
  return request('/courses');
}

export function postEnrollment(userId, courseId) {
  return request('/enrollments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, courseId }),
  });
}

export function getRequest(requestId) {
  return request(`/requests/${requestId}`);
}
