import axiosSecure from './axiosInstance/axiosSecure';

export const refillApi = {
  create: (data) => axiosSecure.post('/refill', data),
  update: (id, data) => axiosSecure.put(`/refill/${id}`, data),
  delete: (id) => axiosSecure.delete(`/refill/${id}`),
};
