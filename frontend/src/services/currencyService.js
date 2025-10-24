import api from './api';

export const currencyService = {
  getExchangeRate: (from = 'USD', to = 'BRL') =>
    api.get('/currency/exchange-rate', { params: { from, to } }),

  convertCurrency: (amount, from = 'USD', to = 'BRL') =>
    api.post('/currency/convert', { amount, from, to })
};
