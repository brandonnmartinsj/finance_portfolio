import api from './api.js';

export const layoutService = {
  getAll: () => api.get('/dashboard-layouts'),

  getActive: () => api.get('/dashboard-layouts/active'),

  getById: (id) => api.get(`/dashboard-layouts/${id}`),

  create: (data) => api.post('/dashboard-layouts', data),

  update: (id, data) => api.put(`/dashboard-layouts/${id}`, data),

  setActive: (id) => api.patch(`/dashboard-layouts/${id}/activate`),

  delete: (id) => api.delete(`/dashboard-layouts/${id}`)
};
