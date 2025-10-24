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

/**
 * Serviço para analytics e métricas do portfólio
 */
export const analyticsService = {
  /**
   * Retorna evolução patrimonial ao longo do tempo
   * @returns {Promise} Promise com array de dados históricos
   */
  getPortfolioEvolution: () => api.get('/analytics/portfolio-evolution'),

  /**
   * Retorna distribuição do portfólio por ativo
   * @returns {Promise} Promise com distribuição por ticker
   */
  getAssetDistribution: () => api.get('/analytics/asset-distribution'),

  /**
   * Retorna distribuição por tipo de ativo
   * @returns {Promise} Promise com distribuição por tipo
   */
  getAssetTypeDistribution: () => api.get('/analytics/asset-type-distribution'),

  /**
   * Retorna performance de cada ativo (top gainers/losers)
   * @returns {Promise} Promise com performance individual
   */
  getTopPerformers: () => api.get('/analytics/top-performers'),

  /**
   * Retorna métricas consolidadas do portfólio
   * @returns {Promise} Promise com métricas (total investido, valor atual, etc)
   */
  getPortfolioMetrics: () => api.get('/analytics/portfolio-metrics')
};

/**
 * Serviço para gerenciamento de dividendos
 */
export const dividendService = {
  /**
   * Retorna todos os dividendos
   * @returns {Promise} Promise com array de dividendos
   */
  getAll: () => api.get('/dividends'),

  /**
   * Retorna resumo de dividendos agrupados por ticker
   * @returns {Promise} Promise com resumo por ticker
   */
  getSummary: () => api.get('/dividends/summary'),

  /**
   * Retorna dividendos mensais
   * @param {number} year - Ano para filtrar (opcional)
   * @returns {Promise} Promise com totais mensais
   */
  getMonthly: (year) => api.get('/dividends/monthly', { params: { year } }),

  /**
   * Retorna dividendos anuais
   * @returns {Promise} Promise com totais anuais
   */
  getYearly: () => api.get('/dividends/yearly'),

  /**
   * Sincroniza dividendos a partir das transações
   * @returns {Promise} Promise com resultado da sincronização
   */
  sync: () => api.post('/dividends/sync'),

  /**
   * Cria um novo dividendo
   * @param {Object} data - Dados do dividendo
   * @returns {Promise} Promise com o dividendo criado
   */
  create: (data) => api.post('/dividends', data),

  /**
   * Atualiza um dividendo existente
   * @param {number} id - ID do dividendo
   * @param {Object} data - Novos dados do dividendo
   * @returns {Promise} Promise com o dividendo atualizado
   */
  update: (id, data) => api.put(`/dividends/${id}`, data),

  /**
   * Remove um dividendo
   * @param {number} id - ID do dividendo
   * @returns {Promise} Promise vazia
   */
  delete: (id) => api.delete(`/dividends/${id}`)
};

/**
 * Serviço para gerenciamento de metas de investimento
 */
export const goalsService = {
  /**
   * Retorna todas as metas do usuário
   * @returns {Promise} Promise com array de metas
   */
  getAll: () => api.get('/goals'),

  /**
   * Retorna apenas metas ativas
   * @returns {Promise} Promise com array de metas ativas
   */
  getActive: () => api.get('/goals/active'),

  /**
   * Retorna uma meta específica
   * @param {number} id - ID da meta
   * @returns {Promise} Promise com dados da meta
   */
  getById: (id) => api.get(`/goals/${id}`),

  /**
   * Cria uma nova meta
   * @param {Object} data - Dados da meta (title, type, target_amount, etc)
   * @returns {Promise} Promise com a meta criada
   */
  create: (data) => api.post('/goals', data),

  /**
   * Atualiza uma meta existente
   * @param {number} id - ID da meta
   * @param {Object} data - Novos dados da meta
   * @returns {Promise} Promise com a meta atualizada
   */
  update: (id, data) => api.put(`/goals/${id}`, data),

  /**
   * Remove uma meta
   * @param {number} id - ID da meta
   * @returns {Promise} Promise vazia
   */
  delete: (id) => api.delete(`/goals/${id}`),

  /**
   * Atualiza o progresso de uma meta
   * @param {number} id - ID da meta
   * @param {number} currentAmount - Valor atual
   * @returns {Promise} Promise com a meta atualizada
   */
  updateProgress: (id, currentAmount) => api.patch(`/goals/${id}/progress`, { current_amount: currentAmount })
};

export default api;
