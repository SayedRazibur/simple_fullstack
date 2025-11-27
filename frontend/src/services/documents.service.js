import axiosSecure from './axiosInstance/axiosSecure';
import { clientApi } from './clients.service';

// Document API following the same pattern as clients.service.js
export const documentApi = {
  getAll: async ({ page, limit, search, order, sortBy, date }) => {
    const params = { page, limit, search, order, sortBy };
    if (date) {
      params.date = date;
    }
    const res = await axiosSecure.get('/document', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosSecure.get(`/document/${id}`);
    return res.data;
  },

  create: async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);

    // Handle single file or array of files
    if (Array.isArray(data.files)) {
      data.files.forEach((file) => {
        formData.append('files', file);
      });
    } else if (data.file) {
      formData.append('files', data.file);
    }

    const res = await axiosSecure.post('/document', formData);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosSecure.put(`/document/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosSecure.delete(`/document/${id}`);
    return res.data;
  },

  sendToClients: async ({ documentId, clientIds }) => {
    const res = await axiosSecure.post('/document/send-to-clients', {
      documentId,
      clientIds,
    });
    return res.data;
  },
};
