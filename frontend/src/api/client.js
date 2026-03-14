import { api as axiosApi } from './axios';

export const api = {
  get: (path) => axiosApi.get(path).then((res) => res.data),
  post: (path, body) => axiosApi.post(path, body).then((res) => res.data),
  delete: (path, body) => axiosApi.delete(path, { data: body }).then((res) => res.data),
};
