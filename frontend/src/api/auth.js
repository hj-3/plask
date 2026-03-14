import { api } from './axios';

export const login = async (userId, password) => {
  const res = await api.post('/auth/login', { userId, password });
  return res.data || res;
};

export const register = async (userId, password) => {
  const res = await api.post('/auth/register', { userId, password });
  return res.data || res;
};
