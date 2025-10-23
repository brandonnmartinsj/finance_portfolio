import axios from 'axios';

class MarketDataService {
  /**
   * Busca cotação de ações brasileiras na API Brapi
   * @param {string} ticker - Código do ativo (ex: PETR4.SA)
   * @returns {Promise<Object|null>} Dados da cotação ou null se não encontrado
   */
  static async getBrazilianStockPrice(ticker) {
    try {
      const brapiToken = process.env.BRAPI_API_KEY || 'demo';
      const response = await axios.get(`https://brapi.dev/api/quote/${ticker}?token=${brapiToken}`);
      if (response.data && response.data.results && response.data.results.length > 0) {
        const stock = response.data.results[0];
        return {
          ticker: stock.symbol,
          price: stock.regularMarketPrice,
          change: stock.regularMarketChangePercent,
          currency: stock.currency,
          source: 'brapi'
        };
      }
      return null;
    } catch (error) {
      console.error(`Erro ao buscar cotação de ${ticker} na Brapi:`, error.message);
      return null;
    }
  }

  /**
   * Busca cotação de ações internacionais no Yahoo Finance
   * @param {string} ticker - Código do ativo (ex: AAPL, GOOGL)
   * @returns {Promise<Object|null>} Dados da cotação ou null se não encontrado
   */
  static async getStockPrice(ticker) {
    try {
      // Usando uma API alternativa gratuita do Yahoo Finance
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`,
        {
          params: {
            interval: '1d',
            range: '1d'
          }
        }
      );

      if (response.data && response.data.chart && response.data.chart.result) {
        const result = response.data.chart.result[0];
        const price = result.meta.regularMarketPrice;
        const previousClose = result.meta.previousClose;
        const change = ((price - previousClose) / previousClose) * 100;

        return {
          ticker: ticker,
          price: price,
          change: change,
          currency: result.meta.currency,
          source: 'yahoo'
        };
      }
      return null;
    } catch (error) {
      console.error(`Erro ao buscar cotação de ${ticker} no Yahoo Finance:`, error.message);
      return null;
    }
  }

  /**
   * Busca cotação de um ativo usando a fonte apropriada
   * Tenta Brapi primeiro para ações brasileiras (.SA), depois Yahoo Finance
   * @param {string} ticker - Código do ativo
   * @returns {Promise<Object|null>} Dados da cotação ou null se não encontrado
   */
  static async getQuote(ticker) {
    // Se terminar com .SA, é ação brasileira
    if (ticker.endsWith('.SA')) {
      const brapiData = await this.getBrazilianStockPrice(ticker);
      if (brapiData) return brapiData;
    }

    // Tenta Yahoo Finance
    return await this.getStockPrice(ticker);
  }

  /**
   * Busca cotações de múltiplos ativos em paralelo
   * @param {string[]} tickers - Array com códigos dos ativos
   * @returns {Promise<Object[]>} Array com cotações (inclui erros quando não encontrado)
   */
  static async getMultipleQuotes(tickers) {
    const promises = tickers.map(ticker => this.getQuote(ticker));
    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        return result.value;
      }
      return {
        ticker: tickers[index],
        error: 'Não foi possível obter cotação',
        price: null
      };
    });
  }

  /**
   * Retorna taxas do Tesouro Direto
   * @todo Integrar com API oficial do Tesouro Direto
   * @returns {Promise<Object[]>} Array com dados dos títulos (mock data)
   */
  static async getTesouroDiretoRates() {
    // Aqui você pode integrar com a API oficial do Tesouro Direto
    // Por enquanto, retornando dados mock
    return [
      { name: 'Tesouro Selic 2029', ticker: 'SELIC-2029', rate: 6.5, price: 1000.00 },
      { name: 'Tesouro IPCA+ 2035', ticker: 'IPCA-2035', rate: 6.2, price: 950.00 },
      { name: 'Tesouro Prefixado 2027', ticker: 'PRE-2027', rate: 10.5, price: 890.00 }
    ];
  }

  /**
   * Busca dados fundamentalistas completos de um ativo
   * Inclui informações da empresa, setor, métricas financeiras
   * @param {string} ticker - Código do ativo
   * @returns {Promise<Object|null>} Dados fundamentalistas ou null se não encontrado
   */
  static async getFundamentalData(ticker) {
    try {
      const brapiToken = process.env.BRAPI_API_KEY || 'demo';

      if (ticker.endsWith('.SA')) {
        const brapiTicker = ticker.replace('.SA', '');
        const response = await axios.get(
          `https://brapi.dev/api/quote/${brapiTicker}`,
          {
            params: {
              token: brapiToken,
              modules: 'summaryProfile'
            }
          }
        );

        if (response.data && response.data.results && response.data.results.length > 0) {
          const data = response.data.results[0];
          return {
            ticker: data.symbol,
            companyInfo: {
              name: data.longName || data.shortName,
              sector: data.summaryProfile?.sector || 'N/A',
              industry: data.summaryProfile?.industry || 'N/A',
              description: data.summaryProfile?.longBusinessSummary || '',
              website: data.summaryProfile?.website || '',
              employees: data.summaryProfile?.fullTimeEmployees || 0,
              address: data.summaryProfile?.address1 || '',
              city: data.summaryProfile?.city || '',
              state: data.summaryProfile?.state || '',
              country: data.summaryProfile?.country || '',
              logoUrl: data.logourl || `https://icons.brapi.dev/icons/${data.symbol}.svg`
            },
            metrics: {
              priceEarnings: data.priceEarnings || null,
              earningsPerShare: data.earningsPerShare || null,
              marketCap: data.marketCap || 0,
              regularMarketPrice: data.regularMarketPrice || 0,
              currency: data.currency || 'BRL'
            },
            source: 'brapi'
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`Erro ao buscar dados fundamentalistas de ${ticker}:`, error.message);
      return null;
    }
  }

  /**
   * Busca dados históricos de preço para gráficos
   * @param {string} ticker - Código do ativo
   * @param {string} range - Período (ex: '1mo', '3mo', '1y')
   * @param {string} interval - Intervalo (ex: '1d', '1wk')
   * @returns {Promise<Object|null>} Dados históricos OHLC ou null se não encontrado
   */
  static async getHistoricalData(ticker, range = '1mo', interval = '1d') {
    try {
      const brapiToken = process.env.BRAPI_API_KEY || 'demo';

      if (ticker.endsWith('.SA')) {
        // Brapi usa ticker sem o .SA
        const brapiTicker = ticker.replace('.SA', '');
        const response = await axios.get(
          `https://brapi.dev/api/quote/${brapiTicker}`,
          {
            params: {
              token: brapiToken,
              range,
              interval
            }
          }
        );

        if (response.data && response.data.results && response.data.results.length > 0) {
          const data = response.data.results[0];
          return {
            ticker: data.symbol,
            range: data.usedRange || range,
            interval: data.usedInterval || interval,
            currency: data.currency,
            data: data.historicalDataPrice || [],
            validRanges: data.validRanges || [],
            validIntervals: data.validIntervals || [],
            source: 'brapi'
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`Erro ao buscar dados históricos de ${ticker}:`, error.message);
      return null;
    }
  }

  /**
   * Retorna histórico de dividendos de um ativo
   * @todo Integrar com fonte real de dividendos (ex: Fundamentus)
   * @param {string} ticker - Código do ativo
   * @returns {Promise<Object>} Objeto com histórico de dividendos (mock data)
   */
  static async getDividendHistory(ticker) {
    try {
      // Nota: A API Brapi não disponibiliza dados de dividendos publicamente
      // Este endpoint retorna dados mockados para demonstração
      // Em produção, integrar com fonte de dados de dividendos (ex: Fundamentus)

      // Dados mockados para demonstração
      const mockDividends = {
        'PETR4.SA': [
          { date: '2024-09-15', value: 1.25, type: 'JCP' },
          { date: '2024-06-15', value: 1.10, type: 'DIVIDENDO' },
          { date: '2024-03-15', value: 1.15, type: 'JCP' },
          { date: '2023-12-15', value: 1.30, type: 'DIVIDENDO' },
          { date: '2023-09-15', value: 1.20, type: 'JCP' }
        ],
        'VALE3.SA': [
          { date: '2024-09-01', value: 2.50, type: 'DIVIDENDO' },
          { date: '2024-06-01', value: 2.30, type: 'DIVIDENDO' },
          { date: '2024-03-01', value: 2.40, type: 'DIVIDENDO' },
          { date: '2023-12-01', value: 2.60, type: 'DIVIDENDO' }
        ]
      };

      return {
        ticker,
        dividends: mockDividends[ticker] || [],
        source: 'mock',
        note: 'Dados de demonstração. Integrar com fonte real de dividendos.'
      };
    } catch (error) {
      console.error(`Erro ao buscar dividendos de ${ticker}:`, error.message);
      return { ticker, dividends: [], source: 'error' };
    }
  }

  /**
   * Busca estatísticas de preço de um ativo
   * Inclui máxima/mínima 52 semanas, volume, variação
   * @param {string} ticker - Código do ativo
   * @returns {Promise<Object|null>} Estatísticas de preço ou null se não encontrado
   */
  static async getPriceStatistics(ticker) {
    try {
      const brapiToken = process.env.BRAPI_API_KEY || 'demo';

      if (ticker.endsWith('.SA')) {
        const brapiTicker = ticker.replace('.SA', '');
        const response = await axios.get(
          `https://brapi.dev/api/quote/${brapiTicker}`,
          {
            params: {
              token: brapiToken
            }
          }
        );

        if (response.data && response.data.results && response.data.results.length > 0) {
          const data = response.data.results[0];
          return {
            ticker: data.symbol,
            currentPrice: data.regularMarketPrice || 0,
            currency: data.currency || 'BRL',
            fiftyTwoWeek: {
              high: data.fiftyTwoWeekHigh || 0,
              low: data.fiftyTwoWeekLow || 0,
              range: data.fiftyTwoWeekRange || ''
            },
            regularMarket: {
              dayHigh: data.regularMarketDayHigh || 0,
              dayLow: data.regularMarketDayLow || 0,
              dayRange: data.regularMarketDayRange || '',
              change: data.regularMarketChange || 0,
              changePercent: data.regularMarketChangePercent || 0,
              volume: data.regularMarketVolume || 0,
              previousClose: data.regularMarketPreviousClose || 0,
              open: data.regularMarketOpen || 0
            },
            source: 'brapi'
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`Erro ao buscar estatísticas de ${ticker}:`, error.message);
      return null;
    }
  }
}

export default MarketDataService;
