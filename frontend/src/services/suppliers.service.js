import axiosSecure from './axiosInstance/axiosSecure';

export const supplierApi = {
  getAll: async ({ page, limit, search, order, sortBy }) => {
    const res = await axiosSecure.get('/supplier', {
      params: { page, limit, search, order, sortBy },
    });
    return res.data;
  },

  create: async (data) => {
    const res = await axiosSecure.post('/supplier', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosSecure.put(`/supplier/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosSecure.delete(`/supplier/${id}`);
    return res.data;
  },
};
