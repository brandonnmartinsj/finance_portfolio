import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Transações
export const transactionService = {
  getAll: () => api.get('/transactions'),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getSummary: () => api.get('/transactions/summary')
};

// Mercado
export const marketService = {
  getQuote: (ticker) => api.get(`/market/quote/${ticker}`),
  getMultipleQuotes: (tickers) => api.post('/market/quotes', { tickers }),
  getTesouroDireto: () => api.get('/market/tesouro-direto')
};

export default api;
