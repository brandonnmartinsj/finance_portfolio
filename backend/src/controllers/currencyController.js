import currencyService from '../services/currencyService.js';

export const getExchangeRate = async (req, res) => {
  try {
    const { from = 'USD', to = 'BRL' } = req.query;

    const rate = await currencyService.getExchangeRate(from, to);

    res.json(rate);
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    res.status(500).json({ error: error.message });
  }
};

export const convertCurrency = async (req, res) => {
  try {
    const { amount, from = 'USD', to = 'BRL' } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const rate = await currencyService.getExchangeRate(from, to);
    const converted = currencyService.convertCurrency(parseFloat(amount), rate.rate);

    res.json({
      originalAmount: parseFloat(amount),
      originalCurrency: from,
      convertedAmount: converted,
      targetCurrency: to,
      exchangeRate: rate.rate,
      timestamp: rate.timestamp
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    res.status(500).json({ error: error.message });
  }
};
