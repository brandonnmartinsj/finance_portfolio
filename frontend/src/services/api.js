import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Serviço para gerenciamento de transações
 */
export const transactionService = {
  /**
   * Retorna todas as transações
   * @returns {Promise} Promise com array de transações
   */
  getAll: () => api.get('/transactions'),

  /**
   * Retorna uma transação específica
   * @param {number} id - ID da transação
   * @returns {Promise} Promise com dados da transação
   */
  getById: (id) => api.get(`/transactions/${id}`),

  /**
   * Cria uma nova transação
   * @param {Object} data - Dados da transação (ticker, quantity, price, etc)
   * @returns {Promise} Promise com a transação criada
   */
  create: (data) => api.post('/transactions', data),

  /**
   * Atualiza uma transação existente
   * @param {number} id - ID da transação
   * @param {Object} data - Novos dados da transação
   * @returns {Promise} Promise com a transação atualizada
   */
  update: (id, data) => api.put(`/transactions/${id}`, data),

  /**
   * Remove uma transação
   * @param {number} id - ID da transação
   * @returns {Promise} Promise vazia
   */
  delete: (id) => api.delete(`/transactions/${id}`),

  /**
   * Retorna resumo consolidado do portfolio
   * @returns {Promise} Promise com resumo (posições, totais)
   */
  getSummary: () => api.get('/transactions/summary')
};

/**
 * Serviço para dados de mercado e cotações
 */
export const marketService = {
  /**
   * Retorna cotação atual de um ativo
   * @param {string} ticker - Código do ativo
   * @returns {Promise} Promise com dados de cotação
   */
  getQuote: (ticker) => api.get(`/market/quote/${ticker}`),

  /**
   * Retorna cotações de múltiplos ativos
   * @param {string[]} tickers - Array com códigos dos ativos
   * @returns {Promise} Promise com array de cotações
   */
  getMultipleQuotes: (tickers) => api.post('/market/quotes', { tickers }),

  /**
   * Retorna taxas do Tesouro Direto
   * @returns {Promise} Promise com dados dos títulos públicos
   */
  getTesouroDireto: () => api.get('/market/tesouro-direto'),

  /**
   * Retorna dados fundamentalistas de um ativo
   * @param {string} ticker - Código do ativo
   * @returns {Promise} Promise com dados fundamentalistas
   */
  getFundamentals: (ticker) => api.get(`/market/fundamentals/${ticker}`),

  /**
   * Retorna dados históricos de preço
   * @param {string} ticker - Código do ativo
   * @param {string} range - Período (ex: '1mo', '3mo', '1y')
   * @param {string} interval - Intervalo (ex: '1d', '1wk')
   * @returns {Promise} Promise com dados históricos OHLC
   */
  getHistorical: (ticker, range = '1mo', interval = '1d') =>
    api.get(`/market/historical/${ticker}`, { params: { range, interval } }),

  /**
   * Retorna histórico de dividendos
   * @param {string} ticker - Código do ativo
   * @returns {Promise} Promise com histórico de dividendos
   */
  getDividends: (ticker) => api.get(`/market/dividends/${ticker}`),

  /**
   * Retorna estatísticas de preço
   * @param {string} ticker - Código do ativo
   * @returns {Promise} Promise com estatísticas (52w high/low, volume, etc)
   */
  getStatistics: (ticker) => api.get(`/market/statistics/${ticker}`),

  /**
   * Retorna dados do Fundamentus (scraping)
   * @param {string} ticker - Código do ativo
   * @returns {Promise} Promise com dados completos do Fundamentus
   */
  getFundamentusData: (ticker) => api.get(`/market/fundamentus/${ticker}`),

  /**
   * Retorna histórico de dividendos do Fundamentus
   * @param {string} ticker - Código do ativo
   * @returns {Promise} Promise com histórico completo de dividendos
   */
  getFundamentusDividends: (ticker) => api.get(`/market/fundamentus-dividends/${ticker}`)
};

export default api;
