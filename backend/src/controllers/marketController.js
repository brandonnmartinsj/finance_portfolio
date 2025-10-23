import MarketDataService from '../services/marketDataService.js';
import FundamentusScraperService from '../services/fundamentusScraperService.js';

/**
 * Retorna cotação atual de um ativo
 * @param {Object} req - Express request object
 * @param {Object} req.params - Parâmetros da URL
 * @param {string} req.params.ticker - Código do ativo
 * @param {Object} res - Express response object
 * @returns {Object} JSON com dados de cotação ou erro 404
 */
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

/**
 * Retorna cotações de múltiplos ativos em uma única requisição
 * @param {Object} req - Express request object
 * @param {Object} req.body - Corpo da requisição
 * @param {string[]} req.body.tickers - Array com códigos dos ativos
 * @param {Object} res - Express response object
 * @returns {Object} JSON com array de cotações
 */
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

/**
 * Retorna taxas e preços atuais do Tesouro Direto
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON com dados do Tesouro Direto
 */
export const getTesouroDireto = async (req, res) => {
  try {
    const rates = await MarketDataService.getTesouroDiretoRates();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retorna dados fundamentalistas de um ativo
 * @param {Object} req - Express request object
 * @param {Object} req.params - Parâmetros da URL
 * @param {string} req.params.ticker - Código do ativo
 * @param {Object} res - Express response object
 * @returns {Object} JSON com dados fundamentalistas ou erro 404
 */
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

/**
 * Retorna dados históricos de preço (OHLC) para gráficos
 * @param {Object} req - Express request object
 * @param {Object} req.params - Parâmetros da URL
 * @param {string} req.params.ticker - Código do ativo
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.range - Período (ex: '1mo', '3mo', '1y')
 * @param {string} req.query.interval - Intervalo (ex: '1d', '1wk')
 * @param {Object} res - Express response object
 * @returns {Object} JSON com dados históricos ou erro 404
 */
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

/**
 * Retorna histórico de dividendos e proventos de um ativo
 * @param {Object} req - Express request object
 * @param {Object} req.params - Parâmetros da URL
 * @param {string} req.params.ticker - Código do ativo
 * @param {Object} res - Express response object
 * @returns {Object} JSON com histórico de dividendos
 */
export const getDividends = async (req, res) => {
  try {
    const { ticker } = req.params;
    const dividends = await MarketDataService.getDividendHistory(ticker);

    res.json(dividends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retorna estatísticas de preço de um ativo
 * Inclui máxima/mínima 52 semanas, volume, variação diária
 * @param {Object} req - Express request object
 * @param {Object} req.params - Parâmetros da URL
 * @param {string} req.params.ticker - Código do ativo
 * @param {Object} res - Express response object
 * @returns {Object} JSON com estatísticas de preço ou erro 404
 */
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

/**
 * Retorna dados completos do Fundamentus (scraping)
 * Inclui indicadores fundamentalistas e informações da empresa
 * @param {Object} req - Express request object
 * @param {Object} req.params - Parâmetros da URL
 * @param {string} req.params.ticker - Código do ativo
 * @param {Object} res - Express response object
 * @returns {Object} JSON com dados do Fundamentus ou erro 404
 */
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

/**
 * Retorna histórico completo de dividendos do Fundamentus
 * @param {Object} req - Express request object
 * @param {Object} req.params - Parâmetros da URL
 * @param {string} req.params.ticker - Código do ativo
 * @param {Object} res - Express response object
 * @returns {Object} JSON com histórico de dividendos do Fundamentus ou erro 404
 */
export const getFundamentusDividends = async (req, res) => {
  try {
    const { ticker } = req.params;
    const data = await FundamentusScraperService.getDividendsData(ticker);

    if (!data) {
      return res.status(404).json({ error: 'Dados de dividendos não encontrados' });
    }

    res.json(data);
  } catch (error) {
    console.error(`Error fetching dividends for ${req.params.ticker}:`, error.message);
    res.status(500).json({
      error: error.message,
      ticker: req.params.ticker,
      source: 'fundamentus'
    });
  }
};
