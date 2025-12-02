import axiosSecure from './axiosInstance/axiosSecure';

export const purchaseApi = {
  getAll: async (params) => {
    const res = await axiosSecure.get('/purchase', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosSecure.get(`/purchase/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await axiosSecure.post('/purchase', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosSecure.put(`/purchase/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosSecure.delete(`/purchase/${id}`);
    return res.data;
  },
};
