import axiosSecure from './axiosInstance/axiosSecure';

export const productApi = {
  getAll: async ({ page, limit, search, order, sortBy, supplierId }) => {
    const res = await axiosSecure.get('/product', {
      params: { page, limit, search, order, sortBy, supplierId },
    });
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosSecure.get(`/product/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await axiosSecure.post('/product', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosSecure.put(`/product/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosSecure.delete(`/product/${id}`);
    return res.data;
  },
};
