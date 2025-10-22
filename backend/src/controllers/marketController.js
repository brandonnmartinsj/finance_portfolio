import MarketDataService from '../services/marketDataService.js';

export const getQuote = async (req, res) => {
  try {
    const { ticker } = req.params;
    const quote = await MarketDataService.getQuote(ticker);

    if (!quote) {
      return res.status(404).json({ error: 'Cotação não encontrada' });
    }

    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMultipleQuotes = async (req, res) => {
  try {
    const { tickers } = req.body;

    if (!Array.isArray(tickers)) {
      return res.status(400).json({ error: 'Tickers deve ser um array' });
    }

    const quotes = await MarketDataService.getMultipleQuotes(tickers);
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTesouroDireto = async (req, res) => {
  try {
    const rates = await MarketDataService.getTesouroDiretoRates();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
