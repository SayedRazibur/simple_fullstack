import axiosSecure from './axiosInstance/axiosSecure';

export const reminderApi = {
  getAll: async ({
    limit = 15,
    search,
    order,
    sortBy,
    cursor,
    entityId,
    documentId,
  }) => {
    const params = {
      limit,
      search,
      order,
      sortBy,
      cursor,
      entityId,
      documentId,
    };

    Object.keys(params).forEach((key) => {
      if (
        params[key] === undefined ||
        params[key] === null ||
        params[key] === ''
      ) {
        delete params[key];
      }
    });

    const res = await axiosSecure.get('/reminder', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosSecure.get(`/reminder/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await axiosSecure.post('/reminder', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosSecure.put(`/reminder/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosSecure.delete(`/reminder/${id}`);
    return res.data;
  },
};
