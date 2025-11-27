import axiosSecure from './axiosInstance/axiosSecure';

export const orderApi = {
  getAll: async ({ page, limit, pickupId, orderTypeId, serviceId, clientId, search, date }) => {
    const res = await axiosSecure.get('/order', {
      params: { page, limit, pickupId, orderTypeId, serviceId, clientId, search, date },
    });
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosSecure.get(`/order/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await axiosSecure.post('/order', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosSecure.put(`/order/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosSecure.delete(`/order/${id}`);
    return res.data;
  },
};
