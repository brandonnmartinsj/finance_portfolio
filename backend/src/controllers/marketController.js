import MarketDataService from '../services/marketDataService.js';
import FundamentusScraperService from '../services/fundamentusScraperService.js';

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

export const getFundamentals = async (req, res) => {
  try {
    const { ticker } = req.params;
    const fundamentals = await MarketDataService.getFundamentalData(ticker);

    if (!fundamentals) {
      return res.status(404).json({ error: 'Dados fundamentalistas não encontrados' });
    }

    res.json(fundamentals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHistorical = async (req, res) => {
  try {
    const { ticker } = req.params;
    const { range = '1mo', interval = '1d' } = req.query;

    const historical = await MarketDataService.getHistoricalData(ticker, range, interval);

    if (!historical) {
      return res.status(404).json({ error: 'Dados históricos não encontrados' });
    }

    res.json(historical);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDividends = async (req, res) => {
  try {
    const { ticker } = req.params;
    const dividends = await MarketDataService.getDividendHistory(ticker);

    res.json(dividends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStatistics = async (req, res) => {
  try {
    const { ticker } = req.params;
    const statistics = await MarketDataService.getPriceStatistics(ticker);

    if (!statistics) {
      return res.status(404).json({ error: 'Estatísticas não encontradas' });
    }

    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFundamentusData = async (req, res) => {
  try {
    const { ticker } = req.params;
    const data = await FundamentusScraperService.getDetailedData(ticker);

    if (!data) {
      return res.status(404).json({ error: 'Dados do Fundamentus não encontrados' });
    }

    res.json(data);
  } catch (error) {
    console.error(`Error fetching Fundamentus data for ${req.params.ticker}:`, error.message);
    res.status(500).json({
      error: error.message,
      ticker: req.params.ticker,
      source: 'fundamentus'
    });
  }
};
