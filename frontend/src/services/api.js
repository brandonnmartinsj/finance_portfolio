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
  getTesouroDireto: () => api.get('/market/tesouro-direto'),
  getFundamentals: (ticker) => api.get(`/market/fundamentals/${ticker}`),
  getHistorical: (ticker, range = '1mo', interval = '1d') =>
    api.get(`/market/historical/${ticker}`, { params: { range, interval } }),
  getDividends: (ticker) => api.get(`/market/dividends/${ticker}`),
  getStatistics: (ticker) => api.get(`/market/statistics/${ticker}`),
  getFundamentusData: (ticker) => api.get(`/market/fundamentus/${ticker}`),
  getFundamentusDividends: (ticker) => api.get(`/market/fundamentus-dividends/${ticker}`)
};

export default api;
