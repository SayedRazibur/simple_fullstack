import axiosSecure from './axiosInstance/axiosSecure';

export const clientApi = {
  getAll: async ({ page, limit, search, order, sortBy }) => {
    const res = await axiosSecure.get('/client', {
      params: { page, limit, search, order, sortBy },
    });
    return res.data;
  },

  create: async (data) => {
    const res = await axiosSecure.post('/client', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosSecure.put(`/client/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosSecure.delete(`/client/${id}`);
    return res.data;
  },
};
