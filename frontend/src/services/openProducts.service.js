import axiosSecure from './axiosInstance/axiosSecure';

export const openProductApi = {
  getAll: (params) => axiosSecure.get('/open-product', { params }),
  getById: (id) => axiosSecure.get(`/open-product/${id}`),
  create: (data) => axiosSecure.post('/open-product', data),
  update: (id, data) => axiosSecure.put(`/open-product/${id}`, data),
  delete: (id) => axiosSecure.delete(`/open-product/${id}`),
};
