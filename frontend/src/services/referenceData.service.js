import axiosSecure from './axiosInstance/axiosSecure';

export const referenceDataApi = {
  getAll: async ({ search, model }) => {
    const res = await axiosSecure.get(`/${model}`, {
      params: { search },
    });
    return res.data;
  },

  getOne: async (id, model) => {
    const res = await axiosSecure.put(`/${model}/${id}`, data);
    return res.data;
  },

  create: async (data, model) => {
    const res = await axiosSecure.post(`/${model}`, data);
    return res.data;
  },

  update: async (id, data, model) => {
    const res = await axiosSecure.patch(`/${model}/${id}`, data);
    return res.data;
  },

  delete: async (id, model) => {
    const res = await axiosSecure.delete(`/${model}/${id}`);
    return res.data;
  },
};
