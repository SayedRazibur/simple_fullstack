import axiosSecure from './axiosInstance/axiosSecure';

export const taskApi = {
  getAll: async ({
    limit,
    cursor,
    search,
    order,
    sortBy,
    entityId,
    productId,
    orderId,
    documentId,
    day,
    date,
  }) => {
    const res = await axiosSecure.get('/task', {
      params: {
        limit,
        cursor,
        search,
        order,
        sortBy,
        entityId,
        productId,
        orderId,
        documentId,
        day,
        date,
      },
    });
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosSecure.get(`/task/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await axiosSecure.post('/task', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosSecure.put(`/task/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosSecure.delete(`/task/${id}`);
    return res.data;
  },
};
