import axiosSecure from './axiosInstance/axiosSecure';

export const siteApi = {
  getAll: (params) => axiosSecure.get('/site', { params }),
  getById: (id) => axiosSecure.get(`/site/${id}`),
  create: (data) => axiosSecure.post('/site', data),
  update: (id, data) => axiosSecure.put(`/site/${id}`, data),
  delete: (id) => axiosSecure.delete(`/site/${id}`),
};
